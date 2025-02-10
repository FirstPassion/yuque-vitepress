```python
pip install gradio
```

```python
import gradio as gr
import torch
from torchvision import transforms
from main import Net, class_names
import torch.nn.functional as F  # 导入 F 以使用 softmax
from PIL import Image

NUM_CLASSES = len(class_names)

# 加载模型
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = Net(class_nums=NUM_CLASSES)  # NUM_CLASSES 需要根据你的类别数进行设置
model.load_state_dict(
    torch.load("best_model.pth", weights_only=True)
)  # 确保模型加载到正确的设备
model.to(device)
model.eval()


# 数据预处理（添加归一化）
def preprocess_image(image):
    transform = transforms.Compose(
        [
            transforms.Resize((144, 144)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
            ),  # 添加归一化
        ]
    )
    return transform(image)


# 预测函数（添加错误处理和分批处理）
def process_images(gallery_data):
    if not gallery_data:
        return []

    images = []
    img_pils = []
    for item in gallery_data:
        img_path, _ = item
        try:
            img_pil = Image.open(img_path).convert("RGB")  # 确保图像是 RGB 格式
            img_pils.append(img_pil)
            images.append(preprocess_image(img_pil))
        except Exception as e:
            print(f"Error loading image {img_path}: {e}")
            continue

    if not images:
        return []

    # 分批处理以避免内存不足
    batch_size = 8  # 根据 GPU 内存调整
    results = []
    for i in range(0, len(images), batch_size):
        batch_images = images[i : i + batch_size]
        batch_pils = img_pils[i : i + batch_size]

        input_batch = torch.stack(batch_images).to(device)

        with torch.no_grad():
            outputs = model(input_batch)
            probabilities = F.softmax(outputs, dim=1)
            top3_probs, top3_classes = torch.topk(probabilities, k=3, dim=1)

            for j, img_pil in enumerate(batch_pils):
                top3_info = [
                    f"{class_names[top3_classes[j][k]]}: {top3_probs[j][k]:.4f}"
                    for k in range(3)
                ]
                top3_info_str = "\n".join(top3_info)
                results.append((img_pil, f"Top 3 Predictions:\n{top3_info_str}"))

        # 释放 GPU 内存
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    return results


# 清理函数
def clear_gallery():
    return [], []


# 创建 Gradio 接口
with gr.Blocks() as demo:
    gr.Markdown("## 图像分类预测")
    gr.Markdown("上传一张或多张图像以获取预测类别和置信度")

    with gr.Row():
        gallery = gr.Gallery(label="上传图像")  # 多图上传组件
        output_gallery = gr.Gallery(label="结果")  # 显示图片和结果

    with gr.Row():
        predict_button = gr.Button("预测", variant="primary")  # 添加预测按钮
        clear_button = gr.Button("清理")  # 添加清理按钮

    # 绑定按钮点击事件
    predict_button.click(process_images, inputs=gallery, outputs=output_gallery)
    clear_button.click(clear_gallery, outputs=[gallery, output_gallery])

# 启动 Gradio 应用
if __name__ == "__main__":
    demo.launch(share=False)  # 设置 share=True 以创建公共链接
```

