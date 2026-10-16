import os
import argparse
import torch
import torch.nn as nn

from configs.config import Config
from models.multitask_model import MultiTaskResNet


class ExportWrapper(nn.Module):
    """ONNX ไม่รองรับ output แบบ dict จึงห่อให้คืนค่าเป็น tuple ตามลำดับ seg, breed, species"""
    def __init__(self, model: nn.Module):
        super().__init__()
        self.model = model

    def forward(self, x: torch.Tensor):
        out = self.model(x)
        return out["seg_logits"], out["breed_logits"], out["species_logits"]


def export(checkpoint_path: str, output_path: str, opset: int = 17):
    cfg = Config()
    cfg.DEVICE = "cpu"
    cfg.PRETRAINED = False  # น้ำหนักทั้งหมดมาจาก checkpoint ไม่ต้องดาวน์โหลด ImageNet

    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"ไม่พบ checkpoint: {checkpoint_path}")

    model = MultiTaskResNet(cfg)
    checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    wrapper = ExportWrapper(model).eval()
    dummy = torch.randn(1, 3, cfg.IMAGE_SIZE, cfg.IMAGE_SIZE)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    torch.onnx.export(
        wrapper,
        dummy,
        output_path,
        input_names=["image"],
        output_names=["seg_logits", "breed_logits", "species_logits"],
        dynamic_axes={
            "image": {0: "batch"},
            "seg_logits": {0: "batch"},
            "breed_logits": {0: "batch"},
            "species_logits": {0: "batch"},
        },
        opset_version=opset,
        do_constant_folding=True,
        dynamo=False,
    )

    # ตรวจว่าผลจาก ONNX Runtime ตรงกับ PyTorch (ถ้าติดตั้ง onnxruntime ไว้)
    try:
        import numpy as np
        import onnxruntime as ort

        session = ort.InferenceSession(output_path, providers=["CPUExecutionProvider"])
        onnx_out = session.run(None, {"image": dummy.numpy()})
        with torch.no_grad():
            torch_out = wrapper(dummy)
        for name, a, b in zip(["seg", "breed", "species"], onnx_out, torch_out):
            print(f"[check] {name:8s} max |diff| = {np.abs(a - b.numpy()).max():.2e}")
    except ImportError:
        print("[!] ไม่พบ onnxruntime ข้ามขั้นตอนตรวจสอบผล (pip install onnxruntime)")

    size_mb = os.path.getsize(output_path) / 1024 ** 2
    print(f"[+] บันทึกโมเดล ONNX ที่ {output_path} ({size_mb:.1f} MB) · epoch {checkpoint.get('epoch', 'N/A')}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export the multi-task model to ONNX for the web demo")
    parser.add_argument("--checkpoint", default="./checkpoints/best_model_resnet50.pth")
    parser.add_argument("--output", default="./web/model/pet_multitask.onnx")
    parser.add_argument("--opset", type=int, default=17)
    args = parser.parse_args()
    export(args.checkpoint, args.output, args.opset)
