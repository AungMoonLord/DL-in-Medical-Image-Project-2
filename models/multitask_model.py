import torch
import torch.nn as nn
from configs.config import Config
from models.backbone import ResNetBackbone
from models.decoder import UNetDecoder

class MultiTaskResNet(nn.Module):
    """
    โมเดล Multi-Task รวม:
    - Shared Backbone: ResNetBackbone (backbone.py)
    - Segmentation Decoder: UNetDecoder (decoder.py)
    - Classification Heads: Breed Head (37 คลาส) และ Species Head (2 คลาส)
    """
    def __init__(self, cfg: Config):
        super().__init__()
        
        # 1. โหลด Shared Backbone
        self.backbone = ResNetBackbone(name=cfg.BACKBONE, pretrained=cfg.PRETRAINED)
        bottleneck_channels = self.backbone.channels[4]  # C5 channel depth

        # 2. โหลด Segmentation Decoder
        self.decoder = UNetDecoder(
            encoder_channels=self.backbone.channels,
            num_classes=cfg.NUM_CLASSES_SEG
        )

        # 3. สร้าง Classification Heads (ต่อจาก Bottleneck Feature C5)
        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.dropout = nn.Dropout(p=0.3)

        self.breed_head = nn.Sequential(
            nn.Linear(bottleneck_channels, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.2),
            nn.Linear(512, cfg.NUM_CLASSES_BREED)
        )

        self.species_head = nn.Sequential(
            nn.Linear(bottleneck_channels, 128),
            nn.ReLU(inplace=True),
            nn.Linear(128, cfg.NUM_CLASSES_SPECIES)
        )

    def forward(self, x: torch.Tensor) -> dict:
        # 1. สกัด Multi-scale Features จาก Backbone
        features = self.backbone(x)
        c5 = features[4]

        # 2. ทำนาย Segmentation Mask
        seg_logits = self.decoder(features)

        # 3. ทำนาย Classifications
        pooled = self.global_pool(c5)
        flattened = torch.flatten(pooled, 1)
        feat = self.dropout(flattened)

        breed_logits = self.breed_head(feat)
        species_logits = self.species_head(feat)

        return {
            "seg_logits": seg_logits,
            "breed_logits": breed_logits,
            "species_logits": species_logits
        }