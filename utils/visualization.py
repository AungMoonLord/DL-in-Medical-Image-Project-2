import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def save_segmentation_comparisons(images, gt_masks, pred_masks, breed_names, output_dir, num_samples=5):
    os.makedirs(output_dir, exist_ok=True)
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])

    count = min(num_samples, len(images))
    for i in range(count):
        img = images[i].transpose(1, 2, 0)
        img = np.clip(img * std + mean, 0, 1)

        fig, axes = plt.subplots(1, 3, figsize=(12, 4))
        
        axes[0].imshow(img)
        axes[0].set_title(f"Input Image ({breed_names[i]})", fontsize=11, fontweight="bold")
        axes[0].axis("off")

        axes[1].imshow(gt_masks[i], cmap="viridis", vmin=0, vmax=2)
        axes[1].set_title("Ground Truth Trimap", fontsize=11)
        axes[1].axis("off")

        axes[2].imshow(pred_masks[i], cmap="viridis", vmin=0, vmax=2)
        axes[2].set_title("Predicted Trimap", fontsize=11)
        axes[2].axis("off")

        plt.tight_layout()
        save_path = os.path.join(output_dir, f"test_seg_example_{i+1}.png")
        plt.savefig(save_path, dpi=300)
        plt.close(fig)

def save_confusion_matrix(cm, class_names, title, save_path, figsize=(14, 12), annot=False):
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    fig, ax = plt.subplots(figsize=figsize)
    sns.heatmap(
        cm,
        annot=annot,
        fmt="d" if annot else "",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
        ax=ax
    )
    ax.set_title(title, fontsize=14, fontweight="bold")
    ax.set_xlabel("Predicted Class", fontsize=12)
    ax.set_ylabel("Actual Class", fontsize=12)
    plt.xticks(rotation=90, fontsize=8 if len(class_names) > 10 else 11)
    plt.yticks(rotation=0, fontsize=8 if len(class_names) > 10 else 11)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close(fig)
    