import os
import torch
import numpy as np

from configs.config import Config
from data.dataset import get_dataloaders
from data.class_mappings import BREED_NAMES
from models.multitask_model import MultiTaskResNet
from utils.metrics import compute_segmentation_metrics, compute_classification_metrics
from utils.visualization import save_segmentation_comparisons, save_confusion_matrix

@torch.no_grad()
def evaluate_test_set():
    cfg = Config()
    os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)
    checkpoint_path = os.path.join(cfg.CHECKPOINT_DIR, f"best_model_{cfg.BACKBONE}.pth")

    print(f"[*] เริ่มต้นประเมินผลบน Unseen Test Set โดยใช้โมเดล: {checkpoint_path}")

    _, _, test_loader = get_dataloaders(cfg)
    model = MultiTaskResNet(cfg).to(cfg.DEVICE)

    checkpoint = torch.load(checkpoint_path, map_location=cfg.DEVICE, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    all_pred_masks, all_target_masks = [], []
    all_pred_breeds, all_target_breeds = [], []
    all_pred_species, all_target_species = [], []

    sample_images, sample_gt_masks, sample_pred_masks, sample_breeds = [], [], [], []

    for batch in test_loader:
        images = batch["image"].to(cfg.DEVICE, non_blocking=True)
        masks = batch["mask"].to(cfg.DEVICE, non_blocking=True)
        breeds = batch["breed"].to(cfg.DEVICE, non_blocking=True)
        species = batch["species"].to(cfg.DEVICE, non_blocking=True)

        preds = model(images)

        pred_seg = torch.argmax(preds["seg_logits"], dim=1).cpu().numpy()
        gt_seg = masks.cpu().numpy()
        all_pred_masks.append(pred_seg)
        all_target_masks.append(gt_seg)

        pred_breed = torch.argmax(preds["breed_logits"], dim=1).cpu().numpy()
        all_pred_breeds.extend(pred_breed.tolist())
        all_target_breeds.extend(breeds.cpu().numpy().tolist())

        pred_spec = torch.argmax(preds["species_logits"], dim=1).cpu().numpy()
        all_pred_species.extend(pred_spec.tolist())
        all_target_species.extend(species.cpu().numpy().tolist())

        # เก็บตัวอย่าง 5 ภาพแรกสำหรับสร้างไฟล์ test_seg_example_1..5.png
        if len(sample_images) < 5:
            for i in range(min(5 - len(sample_images), images.size(0))):
                sample_images.append(images[i].cpu().numpy())
                sample_gt_masks.append(gt_seg[i])
                sample_pred_masks.append(pred_seg[i])
                sample_breeds.append(BREED_NAMES[breeds[i].item()])

    seg_metrics = compute_segmentation_metrics(np.concatenate(all_pred_masks), np.concatenate(all_target_masks))
    breed_metrics = compute_classification_metrics(all_target_breeds, all_pred_breeds)
    species_metrics = compute_classification_metrics(all_target_species, all_pred_species)

    print("\n" + "="*55)
    print("         รายงานผลการทดสอบบน UNSEEN TEST SET")
    print("="*55)
    print("1. Task: Image Segmentation")
    print(f"   - Mean IoU (mIoU)  : {seg_metrics['mIoU']:.4f}")
    print(f"   - Mean Dice Score  : {seg_metrics['mean_dice']:.4f}")
    print("2. Task: 37-Breed Classification")
    print(f"   - Accuracy         : {breed_metrics['accuracy']:.4f}")
    print(f"   - Macro F1-score   : {breed_metrics['f1_macro']:.4f}")
    print(f"   - Macro Precision  : {breed_metrics['precision_macro']:.4f}")
    print(f"   - Macro Recall     : {breed_metrics['recall_macro']:.4f}")
    print("3. Task: Cat vs Dog Binary Classification")
    print(f"   - Accuracy         : {species_metrics['accuracy']:.4f}")
    print(f"   - Macro F1-score   : {species_metrics['f1_macro']:.4f}")
    print("="*55)

    # บันทึกไฟล์ภาพทั้ง 7 ไฟล์ลงโฟลเดอร์ outputs/
    save_segmentation_comparisons(
        sample_images, sample_gt_masks, sample_pred_masks, sample_breeds, cfg.OUTPUT_DIR, num_samples=5
    )
    save_confusion_matrix(
        breed_metrics["confusion_matrix"],
        BREED_NAMES,
        "37-Breed Confusion Matrix (Unseen Test Set)",
        os.path.join(cfg.OUTPUT_DIR, "breed_confusion_matrix.png"),
        figsize=(15, 13),
        annot=False
    )
    save_confusion_matrix(
        species_metrics["confusion_matrix"],
        ["Cat", "Dog"],
        "Species Confusion Matrix (Cat vs Dog)",
        os.path.join(cfg.OUTPUT_DIR, "species_confusion_matrix.png"),
        figsize=(6, 5),
        annot=True
    )
    print(f"[+] บันทึกภาพ test_seg_example_1..5.png และ Confusion Matrix ลงใน: {cfg.OUTPUT_DIR} เรียบร้อยแล้ว")

if __name__ == "__main__":
    evaluate_test_set()