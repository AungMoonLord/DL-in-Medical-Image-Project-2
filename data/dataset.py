import os
import random
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision.datasets import OxfordIIITPet
import torchvision.transforms as T
import torchvision.transforms.functional as TF
from PIL import Image
from sklearn.model_selection import StratifiedShuffleSplit

from configs.config import Config
from data.class_mappings import get_species_id

class SynchronizedTransform:
    """ทำ Augmentation ให้ Image และ Mask มีทิศทางและตำแหน่งตรงกันเสมอ"""
    def __init__(self, image_size: int, is_train: bool = True):
        self.image_size = (image_size, image_size)
        self.is_train = is_train
        # สร้าง ColorJitter เตรียมไว้ล่วงหน้าเพื่อลด CPU Overhead
        if self.is_train:
            self.color_jitter = T.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15)

    def __call__(self, image: Image.Image, mask: Image.Image):
        # 1. ปรับขนาดภาพให้เท่ากันทั้งภาพและ Mask
        image = TF.resize(image, self.image_size, interpolation=TF.InterpolationMode.BILINEAR)
        mask = TF.resize(mask, self.image_size, interpolation=TF.InterpolationMode.NEAREST)

        if self.is_train:
            # Random Horizontal Flip ทำพร้อมกันทั้งสองอย่าง
            if random.random() > 0.5:
                image = TF.hflip(image)
                mask = TF.hflip(mask)

            # Random Rotation มุมเล็กน้อย (-10 ถึง 10 องศา) ทำพร้อมกัน
            if random.random() > 0.5:
                angle = random.uniform(-10, 10)
                image = TF.rotate(image, angle, interpolation=TF.InterpolationMode.BILINEAR)
                mask = TF.rotate(mask, angle, interpolation=TF.InterpolationMode.NEAREST)

            # ปรับแต่งสีเฉพาะตัวภาพ (ห้ามทำกับ Mask)
            if random.random() > 0.3:
                image = self.color_jitter(image)

        # แปลง Image เป็น Tensor และ Normalization ตามมาตรฐาน ImageNet
        image = TF.to_tensor(image)
        image = TF.normalize(image, mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

        # แปลง Trimap Mask: เดิม 1 (Foreground), 2 (Background), 3 (Boundary)
        # ปรับเป็น: 0 (Background), 1 (Foreground), 2 (Boundary)
        mask_np = np.array(mask, dtype=np.int64)
        processed_mask = np.zeros_like(mask_np)
        processed_mask[mask_np == 1] = 1
        processed_mask[mask_np == 2] = 0
        processed_mask[mask_np == 3] = 2

        mask_tensor = torch.from_numpy(processed_mask).long()
        return image, mask_tensor

class OxfordPetMultiTaskDataset(Dataset):
    """Dataset Wrapper สำหรับส่งออก Output ทั้ง 3 Tasks พร้อมกัน"""
    def __init__(self, base_dataset, indices, transform):
        self.base_dataset = base_dataset
        self.indices = indices
        self.transform = transform

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        actual_idx = self.indices[idx]
        image, target = self.base_dataset[actual_idx]
        
        breed_id = int(target[0])
        raw_mask = target[1]
        species_id = get_species_id(breed_id)

        if image.mode != "RGB":
            image = image.convert("RGB")

        image, mask = self.transform(image, raw_mask)

        return {
            "image": image,
            "mask": mask,
            "breed": torch.tensor(breed_id, dtype=torch.long),
            "species": torch.tensor(species_id, dtype=torch.long)
        }

def get_dataloaders(cfg: Config):
    """ฟังก์ชันแบ่ง Train/Val/Test ป้องกัน Data Leakage"""
    # 1. โหลดข้อมูลชุด Trainval
    base_trainval = OxfordIIITPet(
        root=cfg.DATA_DIR,
        split="trainval",
        target_types=("category", "segmentation"),
        download=False
    )

    # 2. โหลดข้อมูลชุด Test (แยกเด็ดขาด ไม่นำมาใช้เทรนหรือปรับจูน)
    base_test = OxfordIIITPet(
        root=cfg.DATA_DIR,
        split="test",
        target_types=("category", "segmentation"),
        download=False
    )

    # 3. Stratified Split 80/20 ตามสายพันธุ์ 37 คลาส
    labels = [base_trainval[i][1][0] for i in range(len(base_trainval))]
    splitter = StratifiedShuffleSplit(n_splits=1, train_size=cfg.TRAIN_VAL_SPLIT_RATIO, random_state=cfg.SEED)
    train_indices, val_indices = next(splitter.split(np.zeros(len(labels)), labels))

    # 4. กำหนด Transformations
    train_transform = SynchronizedTransform(cfg.IMAGE_SIZE, is_train=True)
    eval_transform = SynchronizedTransform(cfg.IMAGE_SIZE, is_train=False)

    # 5. ประกอบ Dataset
    train_dataset = OxfordPetMultiTaskDataset(base_trainval, train_indices, train_transform)
    val_dataset = OxfordPetMultiTaskDataset(base_trainval, val_indices, eval_transform)
    test_indices = list(range(len(base_test)))
    test_dataset = OxfordPetMultiTaskDataset(base_test, test_indices, eval_transform)

    # 6. DataLoaders พร้อมตั้งค่า persistent_workers ให้เข้ากับ Windows
    train_loader = DataLoader(
        train_dataset,
        batch_size=cfg.BATCH_SIZE,
        shuffle=True,
        num_workers=cfg.NUM_WORKERS,
        pin_memory=cfg.PIN_MEMORY,
        persistent_workers=(cfg.NUM_WORKERS > 0)
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=cfg.BATCH_SIZE,
        shuffle=False,
        num_workers=cfg.NUM_WORKERS,
        pin_memory=cfg.PIN_MEMORY,
        persistent_workers=(cfg.NUM_WORKERS > 0)
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=cfg.BATCH_SIZE,
        shuffle=False,
        num_workers=cfg.NUM_WORKERS,
        pin_memory=cfg.PIN_MEMORY
    )

    return train_loader, val_loader, test_loader
