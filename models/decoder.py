import torch
import torch.nn as nn
import torch.nn.functional as F

class ConvBlock(nn.Module):
    """Standard Double Convolution (Conv -> BN -> ReLU x2)"""
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.block(x)

class DecoderBlock(nn.Module):
    """Upsampling Block พร้อม Skip Connection Concat"""
    def __init__(self, in_channels: int, skip_channels: int, out_channels: int):
        super().__init__()
        self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)
        self.conv = ConvBlock((in_channels // 2) + skip_channels, out_channels)

    def forward(self, x: torch.Tensor, skip: torch.Tensor = None) -> torch.Tensor:
        x = self.up(x)
        if skip is not None:
            # ตรวจสอบขนาด spatial dimension ป้องกัน rounding mismatch
            if x.shape[2:] != skip.shape[2:]:
                x = F.interpolate(x, size=skip.shape[2:], mode='bilinear', align_corners=True)
            x = torch.cat([x, skip], dim=1)
        return self.conv(x)

class UNetDecoder(nn.Module):
    """ประกอบ Decoder Blocks ทั้งหมดเข้าด้วยกันเพื่อสร้าง Mask"""
    def __init__(self, encoder_channels: list, num_classes: int):
        super().__init__()
        c1, c2, c3, c4, c5 = encoder_channels

        self.dec4 = DecoderBlock(c5, c4, 512)
        self.dec3 = DecoderBlock(512, c3, 256)
        self.dec2 = DecoderBlock(256, c2, 128)
        self.dec1 = DecoderBlock(128, c1, 64)

        # ขยายกลับสู่ความละเอียดต้นฉบับ (224x224)
        self.final_up = nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2)
        self.final_conv = nn.Sequential(
            ConvBlock(32, 32),
            nn.Conv2d(32, num_classes, kernel_size=1)
        )

    def forward(self, features: list) -> torch.Tensor:
        c1, c2, c3, c4, c5 = features
        d4 = self.dec4(c5, c4)
        d3 = self.dec3(d4, c3)
        d2 = self.dec2(d3, c2)
        d1 = self.dec1(d2, c1)
        up_final = self.final_up(d1)
        return self.final_conv(up_final)