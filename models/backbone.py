import torch
import torch.nn as nn
import torchvision.models as models

class ResNetBackbone(nn.Module):
    """
    Shared Feature Extractor สกัด Spatial Features ที่ระดับ Resolution ต่างๆ
    C1: H/2, C2: H/4, C3: H/8, C4: H/16, C5: H/32
    """
    def __init__(self, name: str = "resnet50", pretrained: bool = True):
        super().__init__()
        self.name = name

        if name == "resnet50":
            weights = models.ResNet50_Weights.DEFAULT if pretrained else None
            resnet = models.resnet50(weights=weights)
            self.channels = [64, 256, 512, 1024, 2048]
        elif name == "resnet34":
            weights = models.ResNet34_Weights.DEFAULT if pretrained else None
            resnet = models.resnet34(weights=weights)
            self.channels = [64, 64, 128, 256, 512]
        else:
            raise ValueError(f"Backbone '{name}' ไม่รองรับในระบบ (รองรับ: resnet34, resnet50)")

        # แยก Stages ของ ResNet เพื่อดึง Skip Connections
        self.init_conv = nn.Sequential(resnet.conv1, resnet.bn1, resnet.relu)  # C1
        self.maxpool = resnet.maxpool
        self.layer1 = resnet.layer1  # C2
        self.layer2 = resnet.layer2  # C3
        self.layer3 = resnet.layer3  # C4
        self.layer4 = resnet.layer4  # C5 (Bottleneck)

    def forward(self, x: torch.Tensor):
        c1 = self.init_conv(x)
        x_pool = self.maxpool(c1)
        c2 = self.layer1(x_pool)
        c3 = self.layer2(c2)
        c4 = self.layer3(c3)
        c5 = self.layer4(c4)
        
        # ส่งออก Feature Maps ทุกระดับความละเอียด
        return [c1, c2, c3, c4, c5]