## 安装onnx依赖
```bash
pip install onnx onnxruntime
```

## 转换模型为onnx模型
```python
class Model(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(
                in_channels=1, out_channels=32, kernel_size=3, stride=1, padding=1
            ),  # (1, 32, 28, 28)
            nn.MaxPool2d(kernel_size=2, stride=2),  # (1, 32, 14, 14)
            nn.ReLU(),
            nn.Conv2d(
                in_channels=32, out_channels=64, kernel_size=3, stride=1, padding=1
            ),  # (32, 64, 14, 14)
            nn.MaxPool2d(kernel_size=2, stride=2),  # (32, 64, 7, 7)
            nn.ReLU(),
            nn.Flatten(),  # (32, 64 * 7 * 7)
            nn.Linear(64 * 7 * 7, 10),
        )

    def forward(self, x):
        return self.net(x)

model = Model()

def export():
    # 加载训练好的模型权重文件
    if not os.path.exists("best_mnist_model.pth"):
        return
    model.load_state_dict(torch.load("best_mnist_model.pth", weights_only=False))
    model.eval()
    # 导出模型 参数: 模型 输入数据尺寸 导出文件名字
    torch.onnx.export(model, torch.randn(1, 1, 28, 28), "mnist.onnx")
    print("Model exported to ONNX format")
```

## python使用onnx模型
```python
import onnxruntime as ort
import numpy as np
import torch
from torchvision import datasets, transforms

testsets = datasets.MNIST(
    root="./data", train=False, download=False, transform=transforms.ToTensor()
)
testloader = torch.utils.data.DataLoader(testsets, batch_size=1, shuffle=True)

# 加载 ONNX 模型
session = ort.InferenceSession("mnist.onnx")

# 获取输入和输出的名称
input_name = session.get_inputs()[0].name
output_name = session.get_outputs()[0].name

correct = 0
total = 0
for data, target in testloader:
    # 将输入数据转换为 NumPy 数组
    input_data = data.numpy().astype(np.float32)
    # 运行模型
    outputs = session.run([output_name], {input_name: input_data})
    # 获取输出
    output = outputs[0]
    # 找到每个样本的预测类别 （最大概率的索引）
    predicted_classes = np.argmax(output, axis=1)
    # 计算准确率
    total += target.size(0)
    correct += (predicted_classes == target.numpy()).sum().item()

test_acc = 100.0 * correct / total
print(f"Accuracy: {test_acc:.2f}%")
```

