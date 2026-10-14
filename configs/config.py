import os
import torch
from dataclasses import dataclass

@dataclass
class Config:
    # เส้นทางจัดเก็บข้อมูลและผลลัพธ์
    DATA_DIR: str = "./data_cache"
    CHECKPOINT_DIR: str = "./checkpoints"
    OUTPUT_DIR: str = "./outputs"
    
    # ฮาร์ดแวร์และการประมวลผล

    # 1. เพิ่ม Batch Size จาก 32 เป็น 64 หรือ 128 (VRAM 16GB รับได้สบาย)
    # Batch size ใหญ่ขึ้นทำให้ GPU ทำงานอิ่มตัว (High GPU Utilization) และเทรนจบเร็วขึ้นมาก
    BATCH_SIZE: int = 64

    # 2. ปรับ NUM_WORKERS ให้เหมาะกับ i5-12400F (มี 6 Performance Cores)
    # ตั้งเป็น 4 หรือ 6 เพื่อไม่ให้กินเธรดจนชน OS แต่ส่งข้อมูลเข้า GPU ได้ต่อเนื่อง
    NUM_WORKERS: int = 6
    PIN_MEMORY: bool = True

    # 3. สวิตช์เปิดใช้ Tensor Cores และ Bfloat16
    USE_AMP: bool = True
    AMP_DTYPE: str = "bfloat16"  # การ์ดจอ RTX 50-series รองรับ bfloat16 ระดับฮาร์ดแวร์โดยตรง


    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"

    
    # การแบ่งชุดข้อมูล (ป้องกัน Data Leakage)
    TRAIN_VAL_SPLIT_RATIO: float = 0.8  # 80% Train, 20% Val จาก trainval split
    SEED: int = 42
    
    # ขนาดภาพและโมเดล
    IMAGE_SIZE: int = 224
    BACKBONE: str = "resnet50"  # สามารถเปลี่ยนเป็น resnet34, resnet50 ได้
    PRETRAINED: bool = True
    
    # จำนวนคลาสของแต่ละ Task
    NUM_CLASSES_SEG: int = 3       # 0: Background, 1: Pet Foreground, 2: Boundary
    NUM_CLASSES_BREED: int = 37     # 37 สายพันธุ์
    NUM_CLASSES_SPECIES: int = 2   # 0: Cat, 1: Dog
    
    # ไฮเปอร์พารามิเตอร์การเทรน
    BATCH_SIZE: int = 32
    EPOCHS: int = 30
    LEARNING_RATE: float = 1e-4
    WEIGHT_DECAY: float = 1e-4
    LABEL_SMOOTHING: float = 0.05
    
    # ค่าน้ำหนัก Multi-task Loss (ปรับสมดุลระหว่างงาน)
    WEIGHT_SEG: float = 1.0
    WEIGHT_BREED: float = 1.0
    WEIGHT_SPECIES: float = 0.5

    def __post_init__(self):
        os.makedirs(self.CHECKPOINT_DIR, exist_ok=True)
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)
