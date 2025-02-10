```python
import torch
from torch import nn

# 原始图片尺寸 28x28 通道数 3
img = torch.randn(1, 3, 28, 28)
print(f"原始图片尺寸 {img.shape}")
# 输入通道数 3 输出通道数 16 卷积核大小 3x3 步长 1 填充 1 图片尺寸大小不变,通道数变化
conv = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, stride=1, padding=1)
out = conv(img)
print(f"3x3卷积后图片尺寸 {out.shape}")
# 输入通道数 3 输出通道数 16 卷积核大小 5x5 步长 2 填充 2 图片尺寸变小一半,通道数变化
conv = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=5, stride=2, padding=2)
out = conv(img)
print(f"5x5卷积后图片尺寸 {out.shape}")
# 输入通道数 3 输出通道数 16 卷积核大小 7x7 步长 1 填充 3 图片尺寸大小不变,通道数变化
conv = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=7, stride=1, padding=3)
out = conv(img)
print(f"7x7卷积后图片尺寸 {out.shape}")
# 输入通道数 3 输出通道数 3 核大小 2x2 步长 2 填充 0 图片尺寸缩小一半,通道数不变
avg_pool = nn.AvgPool2d(kernel_size=2, stride=2)
out = avg_pool(img)
print(f"2x2平均池化后图片尺寸 {out.shape}")
# 输入通道数 3 输出通道数 3 核大小 2x2 步长 2 填充 0 图片尺寸缩小一半,通道数不变
max_pool = nn.MaxPool2d(kernel_size=2, stride=2)
out = max_pool(img)
print(f"2x2最大池化后图片尺寸 {out.shape}")
```

