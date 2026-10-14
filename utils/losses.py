import torch
import torch.nn as nn
import torch.nn.functional as F
from configs.config import Config

class MulticlassDiceLoss(nn.Module):
    """คำนวณ Dice Loss รองรับ Multi-class Segmentation (Background, Pet, Boundary)"""
    def __init__(self, smooth: float = 1e-6):
        super().__init__()
        self.smooth = smooth

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        # logits: [B, C, H, W], targets: [B, H, W]
        num_classes = logits.shape[1]
        probs = F.softmax(logits, dim=1)
        
        # แปลง targets เป็น One-hot encoding: [B, C, H, W]
        targets_one_hot = F.one_hot(targets, num_classes=num_classes).permute(0, 3, 1, 2).float()
        
        # ผลรวมมิติ Spatial (H, W)
        dims = (0, 2, 3)
        intersection = torch.sum(probs * targets_one_hot, dim=dims)
        cardinality = torch.sum(probs + targets_one_hot, dim=dims)
        
        dice_score = (2.0 * intersection + self.smooth) / (cardinality + self.smooth)
        # คำนวณ Dice Loss เฉลี่ยทุกคลาส
        return 1.0 - torch.mean(dice_score)

class MultiTaskLoss(nn.Module):
    """รวม Loss ทุกงานเข้าด้วยกันตามค่าน้ำหนักที่กำหนดใน Config"""
    def __init__(self, cfg: Config):
        super().__init__()
        self.cfg = cfg
        self.seg_ce = nn.CrossEntropyLoss()
        self.seg_dice = MulticlassDiceLoss()
        self.breed_ce = nn.CrossEntropyLoss(label_smoothing=cfg.LABEL_SMOOTHING)
        self.species_ce = nn.CrossEntropyLoss()

    def forward(self, preds: dict, targets: dict) -> dict:
        # 1. Segmentation Loss: ผสมระหว่าง Cross-Entropy และ Dice Loss
        loss_seg_ce = self.seg_ce(preds["seg_logits"], targets["mask"])
        loss_seg_dice = self.seg_dice(preds["seg_logits"], targets["mask"])
        loss_seg = loss_seg_ce + loss_seg_dice

        # 2. Classification Losses
        loss_breed = self.breed_ce(preds["breed_logits"], targets["breed"])
        loss_species = self.species_ce(preds["species_logits"], targets["species"])

        # 3. รวม Weighted Multi-task Loss
        total_loss = (
            self.cfg.WEIGHT_SEG * loss_seg +
            self.cfg.WEIGHT_BREED * loss_breed +
            self.cfg.WEIGHT_SPECIES * loss_species
        )

        return {
            "total_loss": total_loss,
            "seg_loss": loss_seg,
            "breed_loss": loss_breed,
            "species_loss": loss_species
        }
