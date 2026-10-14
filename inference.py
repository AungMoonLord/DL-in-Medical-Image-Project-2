import sys
import torch
from PIL import Image
import torchvision.transforms.functional as TF
import matplotlib.pyplot as plt
import numpy as np

from configs.config import Config
from models.multitask_model import MultiTaskResNet
from data.class_mappings import BREED_NAMES

def predict_single_image(image_path: str):
    cfg = Config()
    checkpoint_path = f"{cfg.CHECKPOINT_DIR}/best_model_{cfg.BACKBONE}.pth"

    # โหลดโมเดล
    model = MultiTaskResNet(cfg).to(cfg.DEVICE)
    checkpoint = torch.load(checkpoint_path, map_location=cfg.DEVICE, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    # จัดเตรียมภาพ
    raw_img = Image.open(image_path).convert("RGB")
    resized_img = TF.resize(raw_img, (cfg.IMAGE_SIZE, cfg.IMAGE_SIZE), interpolation=TF.InterpolationMode.BILINEAR)
    tensor_img = TF.to_tensor(resized_img)
    normalized_img = TF.normalize(tensor_img, mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]).unsqueeze(0).to(cfg.DEVICE)

    with torch.no_grad():
        preds = model(normalized_img)

        # ผลลัพธ์
        seg_mask = torch.argmax(preds["seg_logits"], dim=1).squeeze(0).cpu().numpy()
        breed_probs = torch.softmax(preds["breed_logits"], dim=1)
        species_probs = torch.softmax(preds["species_logits"], dim=1)

        breed_id = torch.argmax(breed_probs, dim=1).item()
        breed_conf = breed_probs[0, breed_id].item() * 100

        species_id = torch.argmax(species_probs, dim=1).item()
        species_name = "Cat" if species_id == 0 else "Dog"
        species_conf = species_probs[0, species_id].item() * 100

    print(f"\nผลการทำนาย:")
    print(f"- ประเภท: {species_name} (ความมั่นใจ {species_conf:.2f}%)")
    print(f"- สายพันธุ์: {BREED_NAMES[breed_id]} (ความมั่นใจ {breed_conf:.2f}%)")

    # แสดงภาพและ Mask
    fig, ax = plt.subplots(1, 2, figsize=(10, 5))
    ax[0].imshow(resized_img)
    ax[0].set_title("Input Image")
    ax[0].axis("off")

    ax[1].imshow(seg_mask, cmap="viridis", vmin=0, vmax=2)
    ax[1].set_title(f"Predicted: {BREED_NAMES[breed_id]} ({species_name})")
    ax[1].axis("off")
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        predict_single_image(sys.argv[1])
    else:
        print("ตัวอย่างการใช้งาน: python inference.py <path_to_image.jpg>")