import os
import argparse
import torch
import numpy as np
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

from configs.config import Config
from data.dataset import get_dataloaders
from models.multitask_model import MultiTaskResNet
from utils.losses import MultiTaskLoss
from utils.metrics import compute_segmentation_metrics, compute_classification_metrics

def train_one_epoch(model, dataloader, criterion, optimizer, cfg):
    model.train()
    running_loss = 0.0

    for batch in dataloader:
        images = batch["image"].to(cfg.DEVICE, non_blocking=True)
        masks = batch["mask"].to(cfg.DEVICE, non_blocking=True)
        breeds = batch["breed"].to(cfg.DEVICE, non_blocking=True)
        species = batch["species"].to(cfg.DEVICE, non_blocking=True)

        optimizer.zero_grad(set_to_none=True)

        with torch.autocast(device_type="cuda", dtype=torch.bfloat16, enabled=(cfg.DEVICE == "cuda")):
            preds = model(images)
            targets = {"mask": masks, "breed": breeds, "species": species}
            loss_dict = criterion(preds, targets)
            loss = loss_dict["total_loss"]

        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    return running_loss / len(dataloader)

@torch.no_grad()
def validate(model, dataloader, criterion, cfg):
    model.eval()
    running_loss = 0.0
    all_pred_masks, all_target_masks = [], []
    all_pred_breeds, all_target_breeds = [], []
    all_pred_species, all_target_species = [], []

    for batch in dataloader:
        images = batch["image"].to(cfg.DEVICE, non_blocking=True)
        masks = batch["mask"].to(cfg.DEVICE, non_blocking=True)
        breeds = batch["breed"].to(cfg.DEVICE, non_blocking=True)
        species = batch["species"].to(cfg.DEVICE, non_blocking=True)

        with torch.autocast(device_type="cuda", dtype=torch.bfloat16, enabled=(cfg.DEVICE == "cuda")):
            preds = model(images)
            targets = {"mask": masks, "breed": breeds, "species": species}
            loss_dict = criterion(preds, targets)
            running_loss += loss_dict["total_loss"].item()

        pred_seg = torch.argmax(preds["seg_logits"], dim=1).cpu().numpy()
        all_pred_masks.append(pred_seg)
        all_target_masks.append(masks.cpu().numpy())

        pred_breed = torch.argmax(preds["breed_logits"], dim=1).cpu().numpy()
        all_pred_breeds.extend(pred_breed.tolist())
        all_target_breeds.extend(breeds.cpu().numpy().tolist())

        pred_spec = torch.argmax(preds["species_logits"], dim=1).cpu().numpy()
        all_pred_species.extend(pred_spec.tolist())
        all_target_species.extend(species.cpu().numpy().tolist())

    val_loss = running_loss / len(dataloader)
    seg_metrics = compute_segmentation_metrics(np.concatenate(all_pred_masks), np.concatenate(all_target_masks))
    breed_metrics = compute_classification_metrics(all_target_breeds, all_pred_breeds)
    species_metrics = compute_classification_metrics(all_target_species, all_pred_species)

    return val_loss, seg_metrics, breed_metrics, species_metrics

def main():
    parser = argparse.ArgumentParser(description="Train Multi-task Pet Model")
    parser.add_argument("--w_seg", type=float, default=None, help="Weight for segmentation loss")
    parser.add_argument("--w_breed", type=float, default=None, help="Weight for breed classification loss")
    parser.add_argument("--save_name", type=str, default=None, help="Custom checkpoint filename")
    args = parser.parse_args()

    cfg = Config()
    if args.w_seg is not None:
        cfg.WEIGHT_SEG = args.w_seg
    if args.w_breed is not None:
        cfg.WEIGHT_BREED = args.w_breed

    os.makedirs(cfg.CHECKPOINT_DIR, exist_ok=True)

    if cfg.DEVICE == "cuda":
        torch.backends.cudnn.benchmark = True
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True

    # กำหนดชื่อไฟล์ Checkpoint อัตโนมัติ
    if args.save_name:
        ckpt_filename = args.save_name
    elif cfg.WEIGHT_SEG == 1.0 and cfg.WEIGHT_BREED == 1.0:
        ckpt_filename = f"best_model_{cfg.BACKBONE}.pth"
    else:
        ckpt_filename = f"best_model_{cfg.BACKBONE}_seg{cfg.WEIGHT_SEG}_cls{cfg.WEIGHT_BREED}.pth"

    checkpoint_path = os.path.join(cfg.CHECKPOINT_DIR, ckpt_filename)
    print(f"[*] เริ่มการเทรนบน: {cfg.DEVICE} | λ_seg={cfg.WEIGHT_SEG}, λ_breed={cfg.WEIGHT_BREED}")
    print(f"[*] ไฟล์โมเดลจะถูกบันทึกที่: {checkpoint_path}")

    train_loader, val_loader, _ = get_dataloaders(cfg)
    model = MultiTaskResNet(cfg).to(cfg.DEVICE)

    criterion = MultiTaskLoss(cfg)
    optimizer = AdamW(model.parameters(), lr=cfg.LEARNING_RATE, weight_decay=cfg.WEIGHT_DECAY)
    scheduler = CosineAnnealingLR(optimizer, T_max=cfg.EPOCHS, eta_min=1e-6)

    best_combined_score = 0.0

    for epoch in range(1, cfg.EPOCHS + 1):
        train_loss = train_one_epoch(model, train_loader, criterion, optimizer, cfg)
        val_loss, seg_metrics, breed_metrics, species_metrics = validate(model, val_loader, criterion, cfg)
        scheduler.step()

        combined_score = (seg_metrics["mIoU"] + breed_metrics["f1_macro"]) / 2.0

        print(f"\n--- Epoch {epoch}/{cfg.EPOCHS} ---")
        print(f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
        print(f"[Segmentation] mIoU: {seg_metrics['mIoU']:.4f} | Mean Dice: {seg_metrics['mean_dice']:.4f}")
        print(f"[Breed Cls]    F1-Macro: {breed_metrics['f1_macro']:.4f} | Acc: {breed_metrics['accuracy']:.4f}")
        print(f"[Species Cls]  F1-Macro: {species_metrics['f1_macro']:.4f} | Acc: {species_metrics['accuracy']:.4f}")

        if combined_score > best_combined_score:
            best_combined_score = combined_score
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "best_score": best_combined_score,
                "config": cfg
            }, checkpoint_path)
            print(f">>> [SAVED] บันทึกโมเดลรอบใหม่: Score = {best_combined_score:.4f} -> {checkpoint_path}")

if __name__ == "__main__":
    main()
    