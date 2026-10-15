<div align="center">

# 🐾 Oxford-IIIT Pet Multi-task Learning

**Segmentation + Breed Classification + Species Classification ด้วย Multi-task ResNet-50**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?logo=pytorch&logoColor=white)
![Albumentations](https://img.shields.io/badge/Albumentations-Augmentation-blueviolet)
![Dataset](https://img.shields.io/badge/Dataset-Oxford--IIIT%20Pet-orange)
[![Download Data](https://img.shields.io/badge/📥%20Download%20Data-Google%20Drive-4285F4?logo=googledrive&logoColor=white)](https://drive.google.com/drive/folders/1sGyT1zmcHphF5UrKyR3yzPUSb8jOcf_1?usp=sharing)
[![Download Model](https://img.shields.io/badge/🤖%20Download%20Model-Google%20Drive-34A853?logo=googledrive&logoColor=white)](https://drive.google.com/drive/folders/1-gLFBN5-i7dN8-7wchyqGQ55Kdez-0B5?usp=sharing)

</div>

---

## 📑 สารบัญ

1. [ภาพรวมโปรเจกต์](#-ภาพรวมโปรเจกต์)
2. [สถาปัตยกรรมโมเดล](#-สถาปัตยกรรมโมเดล)
3. [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
4. [การติดตั้ง](#-การติดตั้ง)
5. [การดาวน์โหลดข้อมูล](#-การดาวน์โหลดข้อมูล)
6. [การดาวน์โหลดโมเดลที่เทรนแล้ว](#-การดาวน์โหลดโมเดลที่เทรนแล้ว)
7. [การเทรนโมเดล (Training)](#-การเทรนโมเดล-training)
8. [การประเมินผล (Evaluation)](#-การประเมินผลบนชุดทดสอบ-evaluation)
9. [การทดสอบกับภาพเดี่ยว (Inference)](#-การทดสอบกับภาพเดี่ยว-inference)
10. [ผลลัพธ์ที่ได้ (Outputs)](#-ผลลัพธ์ที่ได้-outputs)

---

## 🎯 ภาพรวมโปรเจกต์

โปรเจกต์นี้พัฒนาโมเดล **Multi-task Learning** บนชุดข้อมูล **Oxford-IIIT Pet** (ภาพถ่ายสัตว์เลี้ยงทั้งหมด **7,349 ภาพ**) เพื่อทำ 3 งานพร้อมกันในโมเดลเดียว:

| งาน | รายละเอียด |
|---|---|
| 🖼️ **Segmentation** | แยกสัตว์เลี้ยงออกจากพื้นหลังระดับพิกเซล (Trimap 3 คลาส: Background / Pet / Boundary) |
| 🐶 **Breed Classification** | จำแนก **37 สายพันธุ์** |
| 🐱 **Species Classification** | จำแนก **แมว (Cat = 0)** หรือ **สุนัข (Dog = 1)** |

### ✨ จุดเด่น

- 🧩 **Shared Backbone** — ใช้ ResNet-50 ร่วมกันทุกงาน ลดความซ้ำซ้อนของพารามิเตอร์
- ⚖️ **ปรับน้ำหนัก Loss (λ) ได้** — เปรียบเทียบ 3 รูปแบบ: Balanced / Seg-focused / Cls-focused
- 🔒 **แยก Test Set ตาม Official Split + Stratified Train/Val Split (80:20)** — ป้องกัน Data Leakage
- 🔄 **Synchronized Augmentation** — ภาพและ Mask ถูกแปลงไปพร้อมกัน
- ⚡ **Training ที่ปรับจูนแล้ว** — bfloat16, AdamW, CosineAnnealingLR, cuDNN benchmark
- 📊 **ตัวชี้วัดครบถ้วน** — mIoU, Mean Dice, IoU รายคลาส, Precision, Recall, Macro F1, Accuracy, Confusion Matrix

---

## 🏗️ สถาปัตยกรรมโมเดล

```
                        Skip Connections (C1, C2, C3, C4)
                   ┌──────────────────────────────────────┐
                   │                                      ▼
 Input Image ─► ResNet-50 Encoder ── C5 ──────────► U-Net Decoder ─► Segmentation Mask
  (224×224)      (Shared Backbone)  │                                 (3 classes × 224×224)
                                    │
                                    └─► Global Avg Pool + Dropout ─┬─► Breed Head   ─► 37 breeds
                                                                   └─► Species Head ─► Cat / Dog
```

**Loss Function** (`utils/losses.py`):

```
L_total = λ_seg × (CrossEntropy + Dice)                  ← Segmentation
        + λ_breed × CrossEntropy (Label Smoothing 0.05)  ← Breed
        + λ_species × CrossEntropy                       ← Species
```

ค่าเริ่มต้น: λ_seg = 1.0, λ_breed = 1.0, λ_species = 0.5

---

## 📁 โครงสร้างโปรเจกต์

```
oxford_pet_multitask/
│
├── configs/
│   ├── __init__.py
│   └── config.py                 # Hyperparameters, Path และสัดส่วนน้ำหนัก Loss (λ)
│
├── data/
│   ├── __init__.py
│   ├── class_mappings.py         # รายชื่อ 37 สายพันธุ์ + แปลง breed_id → species_id (Cat=0, Dog=1)
│   └── dataset.py                # โหลดข้อมูล, Stratified Split, Synchronized Augmentation
│
├── models/
│   ├── __init__.py
│   ├── backbone.py               # Shared ResNet-50 Encoder (ส่งออก Feature C1–C5)
│   ├── decoder.py                # U-Net Decoder พร้อม Skip Connections
│   └── multitask_model.py        # รวม Backbone + Decoder + Breed/Species Heads
│
├── utils/
│   ├── __init__.py
│   ├── losses.py                 # MultiTaskLoss (CE + Dice + Label Smoothing)
│   ├── metrics.py                # mIoU, Mean Dice, Macro F1, Precision, Recall, Accuracy
│   └── visualization.py          # วาดภาพเปรียบเทียบ Mask และ Confusion Matrix
│
├── data_cache/                   # 🚫 .gitignore — เก็บชุดข้อมูลต้นฉบับ
│   └── oxford-iiit-pet/
│       ├── images/               # ภาพสัตว์เลี้ยง 7,349 ภาพ (.jpg)
│       └── annotations/          # list.txt, trainval.txt, test.txt, xmls/, trimaps/
│
├── checkpoints/                  # 🚫 .gitignore — ไฟล์น้ำหนักโมเดล
│   ├── best_model_resnet50.pth
│   ├── best_model_resnet50_seg2.0_cls0.5.pth
│   └── best_model_resnet50_seg0.5_cls2.0.pth
│
├── outputs/                      # 🚫 .gitignore — กราฟและภาพสำหรับทำสไลด์
│
├── train.py                      # ฝึกสอนโมเดล
├── evaluate.py                   # ประเมินผลบน Unseen Test Set (3,669 ภาพ)
├── inference.py                  # ทำนายผลจากภาพเดี่ยว (แสดง Mask และ % ความมั่นใจ)
├── project_overview_and_presentation_guide.ipynb   # สรุปโปรเจกต์ วิเคราะห์ผล และไกด์ทำสไลด์ 10 แผ่น
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 🛠️ การติดตั้ง

เปิด Terminal หรือ Command Prompt ในโฟลเดอร์โปรเจกต์ แล้วทำตามขั้นตอน:

### 1️⃣ สร้างและเปิดใช้งาน Virtual Environment

```bash
python -m venv venv
```

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2️⃣ ติดตั้งไลบรารีที่จำเป็น

```bash
pip install --upgrade pip

# ติดตั้ง PyTorch (ตัวอย่างสำหรับ NVIDIA GPU / CUDA)
pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu132

# ติดตั้งไลบรารีอื่น ๆ
pip install -r requirements.txt
```

> [!NOTE]
> 💡 **ให้เลือกเวอร์ชัน PyTorch ให้สอดคล้องกับสเปกเครื่องของตัวเอง** (บรรทัด `pip3 install torch torchvision --index-url ...` ด้านบน)
> ดูตัวเลือกทั้งหมดได้ที่ [pytorch.org/get-started](https://pytorch.org/get-started/locally/)

### 📦 ไลบรารีหลักที่ใช้

| หมวด | ไลบรารี |
|---|---|
| Deep Learning & Augmentation | `torch>=2.4.0`, `torchvision>=0.19.0` (Augmentation ใช้ `torchvision.transforms`) |
| Evaluation & Computation | `numpy>=1.26.0`, `scikit-learn>=1.4.0`, `pandas>=2.0.0` |
| Visualization | `matplotlib>=3.8.0`, `seaborn>=0.13.0` |
| Notebook | `jupyter` (สำหรับเปิด `project_overview_and_presentation_guide.ipynb`) |

---

## 📥 การดาวน์โหลดข้อมูล

📂 **ดาวน์โหลดข้อมูลได้ที่:** [Google Drive](https://drive.google.com/drive/folders/1sGyT1zmcHphF5UrKyR3yzPUSb8jOcf_1?usp=sharing)

> [!TIP]
> 📦 สามารถดาวน์โหลดเป็นไฟล์ **`.zip`** หรือ **`.rar`** ก็ได้ (เลือกแบบที่สะดวก)

หลังดาวน์โหลดและแตกไฟล์ ให้วางข้อมูลตามโครงสร้างนี้:

```
data_cache/
└── oxford-iiit-pet/
    ├── images/
    └── annotations/
```

---

## 🤖 การดาวน์โหลดโมเดลที่เทรนแล้ว

หากไม่ต้องการเทรนเอง สามารถดาวน์โหลดไฟล์น้ำหนักโมเดล (`.pth`) ที่เทรนเสร็จแล้วได้ที่:

📂 **ดาวน์โหลดโมเดลได้ที่:** [Google Drive](https://drive.google.com/drive/folders/1-gLFBN5-i7dN8-7wchyqGQ55Kdez-0B5?usp=sharing)

วางไฟล์ไว้ในโฟลเดอร์ `checkpoints/`:

```
checkpoints/
└── best_model_resnet50.pth
```

> [!IMPORTANT]
> ⭐ โมเดลที่ใช้จริงในการ **Inference** คือ **`best_model_resnet50.pth`** (รูปแบบหลัก Balanced Multi-task)

---

## 🚀 การเทรนโมเดล (Training)

มี 3 รูปแบบให้เลือก โดยปรับสัดส่วนน้ำหนัก Loss ระหว่างงาน Segmentation (λ_seg) และ Breed Classification (λ_breed):

| รูปแบบ | λ_seg | λ_breed | คำสั่ง | ไฟล์ที่บันทึก |
|---|:---:|:---:|---|---|
| ⚖️ **Balanced** (หลัก) | 1.0 | 1.0 | `python train.py` | `best_model_resnet50.pth` |
| 🎯 **Seg-focused** (เปรียบเทียบที่ 1) | 2.0 | 0.5 | `python train.py --w_seg 2.0 --w_breed 0.5` | `best_model_resnet50_seg2.0_cls0.5.pth` |
| 🏷️ **Cls-focused** (เปรียบเทียบที่ 2) | 0.5 | 2.0 | `python train.py --w_seg 0.5 --w_breed 2.0` | `best_model_resnet50_seg0.5_cls2.0.pth` |

```bash
# รูปแบบหลัก
python train.py

# รูปแบบเปรียบเทียบที่ 1: เน้น Segmentation
python train.py --w_seg 2.0 --w_breed 0.5

# รูปแบบเปรียบเทียบที่ 2: เน้น Classification
python train.py --w_seg 0.5 --w_breed 2.0
```

> ไฟล์น้ำหนักทั้งหมดจะถูกบันทึกไว้ในโฟลเดอร์ `checkpoints/`

---

## 📊 การประเมินผลบนชุดทดสอบ (Evaluation)

ประเมินโมเดลบน **Unseen Test Set (3,669 ภาพ)**:

```bash
python evaluate.py
```

สิ่งที่ได้จากการรัน:

- ตัวชี้วัดแยกตามงาน: **mIoU, Mean Dice** (Segmentation) และ **Accuracy, Precision, Recall, Macro F1** (Classification)
- ภาพตัวอย่างผล Segmentation
- Confusion Matrix ของ Breed (37 สายพันธุ์) และ Species (Cat vs Dog)

---

## 🔍 การทดสอบกับภาพเดี่ยว (Inference)

ทดสอบการทำนายกับภาพภายนอก โดยแสดงทั้ง **Segmentation Mask** และ **% ความมั่นใจ** ของการจำแนก

> 📌 ก่อนรัน ตรวจสอบว่ามีไฟล์ `checkpoints/best_model_resnet50.pth` แล้ว (เทรนเอง หรือ [ดาวน์โหลดโมเดล](#-การดาวน์โหลดโมเดลที่เทรนแล้ว))

```bash
python inference.py sample_dog.jpg
python inference.py "Inference_Image_Data/Image_Inference2.jpg"
python inference.py "Inference_Image_Data/cat2.jpg"
```

---

## 🖼️ ผลลัพธ์ที่ได้ (Outputs)

ไฟล์ภาพทั้งหมดถูกเก็บไว้ในโฟลเดอร์ `outputs/`:

| ไฟล์ | แหล่งที่มา | คำอธิบาย |
|---|---|---|
| `test_seg_example_1..5.png` | `evaluate.py` | ผลลัพธ์ Segmentation บน Test Set |
| `breed_confusion_matrix.png` | `evaluate.py` | Heatmap 37 สายพันธุ์ |
| `species_confusion_matrix.png` | `evaluate.py` | Heatmap Cat vs Dog |
| `slide_dataset_samples.png` | Notebook | ตัวอย่าง Dataset + Ground Truth Trimap (300 DPI) |
| `slide_learning_curves.png` | Notebook | กราฟ Loss และ mIoU/F1 ตลอด 30 Epochs (300 DPI) |
| `slide_confusion_matrices.png` | Notebook | Confusion Matrix คู่ขนาน (300 DPI) |
| `slide_good_vs_error_cases.png` | Notebook | วิเคราะห์ Good Cases vs Error Cases (300 DPI) |

> 📓 รายละเอียดการวิเคราะห์ผลและไกด์ไลน์ทำสไลด์ 10 แผ่น ดูได้ใน `project_overview_and_presentation_guide.ipynb`

---

<div align="center">

⭐ **Oxford-IIIT Pet Multi-task Learning** ⭐

</div>
