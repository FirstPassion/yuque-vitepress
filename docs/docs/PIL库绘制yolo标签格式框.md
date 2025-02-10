## lable标签格式
要转换为原始图片上的坐标才能绘制

```python
# 类别 x中心点坐标 y中心点坐标 框的宽度 框的高度
0 0.533333 0.492358 0.557576 0.251092
```

## 绘制
```python
import os
from PIL import ImageDraw, Image

labels = os.listdir("./data/mydata/labels")
classids = []

with open("./data/mydata/classes.txt", "r") as f:
    classids = f.read().strip().split()

for label in labels:
    # 读取标签文件
    with open("./data/mydata/labels/" + label, "r") as f:
        text = f.read()
    # 读取图片
    img = Image.open("./data/mydata/images/" + label.replace("txt", "jpg"))
    # 创建画笔
    draw = ImageDraw.Draw(img)
    # 解析标签文件内容 类别id x_center(中心点x坐标) y_center(中心点y坐标) box_w(框的宽度) box_h(框的高度)
    label_data = text.strip().split()
    classid = int(label_data[0])
    x_center = float(label_data[1]) * img.width
    y_center = float(label_data[2]) * img.height
    box_w = float(label_data[3]) * img.width
    box_h = float(label_data[4]) * img.height
    # 计算框的左上角和右下角坐标
    x_min = int(x_center - (box_w / 2))
    y_min = int(y_center - (box_h / 2))
    x_max = int(x_center + (box_w / 2))
    y_max = int(y_center + (box_h / 2))
    # 画框
    draw.rectangle([x_min, y_min, x_max, y_max], outline="red", width=3)
    # 写文字
    draw.text([x_min + 5, y_min + 5], classids[classid], fill="red")
    # 显示
    img.show()
    break
```

