import numpy as np
import torch
from sklearn.metrics import f1_score, precision_score, recall_score, accuracy_score, confusion_matrix

def compute_segmentation_metrics(pred_masks: np.ndarray, target_masks: np.ndarray, num_classes: int = 3):
    """
    คำนวณ Mean IoU (mIoU) และ Mean Dice Score ระดับพิกเซล
    pred_masks, target_masks: shape [N, H, W]
    """
    iou_per_class = []
    dice_per_class = []
    smooth = 1e-6

    for c in range(num_classes):
        pred_c = (pred_masks == c)
        target_c = (target_masks == c)
        
        intersection = np.logical_and(pred_c, target_c).sum()
        union = np.logical_or(pred_c, target_c).sum()
        total_elements = pred_c.sum() + target_c.sum()

        iou = (intersection + smooth) / (union + smooth)
        dice = (2.0 * intersection + smooth) / (total_elements + smooth)
        
        iou_per_class.append(iou)
        dice_per_class.append(dice)

    return {
        "mIoU": float(np.mean(iou_per_class)),
        "mean_dice": float(np.mean(dice_per_class)),
        "iou_per_class": iou_per_class,
        "dice_per_class": dice_per_class
    }

def compute_classification_metrics(y_true: list, y_pred: list, average: str = "macro"):
    """
    คำนวณ Macro F1, Precision, Recall, Accuracy และสร้าง Confusion Matrix
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "f1_macro": float(f1_score(y_true, y_pred, average=average, zero_division=0)),
        "precision_macro": float(precision_score(y_true, y_pred, average=average, zero_division=0)),
        "recall_macro": float(recall_score(y_true, y_pred, average=average, zero_division=0)),
        "confusion_matrix": confusion_matrix(y_true, y_pred)
    }