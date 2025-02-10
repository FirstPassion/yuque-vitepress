### yolov5项目地址
[https://github.com/ultralytics/yolov5](https://github.com/ultralytics/yolov5)



### pytorch加载本地yolov5模型
```python
import torch
model = torch.hub.load('./', 'yolov5s', source='local')
img = './data/images/bus.jpg'
result = model(img)
result.show()
```

### yolov5关键预测关键参数
`weights`训练好的模型文件

`source`检测得目标，可以是单张图片、文件夹、屏幕或者视频、摄像头等

`conf-thres`置信度阈值，越低框越多，越高框越少

`iou-thres`IOU阈值，越低框越少，越高框越多

### yolov5数据集构建
安装标注工具

```shell
pip install labelimg
```

### 视频抽帧
```python
import cv2
import matplotlib.pyplot as plt

# 打开视频文件
video = cv2.VideoCapture('./test.mp4')

num = 0 # 计数器
save_step = 30 # 间隔帧

while True:
	# 读取一帧
	ret, frame = video.read()
    if not ret:
        break
    num += 1
	if num % save_step == 0:
        # 保存图片
        cv2.imwrite('./images/' + str(num) + '.jpg', frame)
```

### 数据集准备
目录结构

> --datasets
>
> ---- images
>
> ------a.jpg
>
> ---- labels
>
> ------a.txt
>

复制`data`目录下的`coco128.yaml`文件，修改为自己的，比如`wzry.yaml`

```yaml
path: ./datasets # 数据集根目录
train: images # 训练图片根目录
val: images # 验证图片根目录
test: # 测试图片根目录,可以不要

# 类别
names:
  0: skz
  1: xq
  2: zz
  3: wzt
  4: nkll
  5: msy
  6: cjsh
  7: hx
  8: lb
  9: gj
```

修改`train.py`的`parse_opt`方法中的内容，然后运行开始训练自己的模型

```python
# 告诉训练集在什么地方,刚刚定义的wzry.yaml
parser.add_argument('--data', type=str, default=ROOT / 'data/wzry.yaml', help='dataset.yaml path')
# 指定batch-size的大小,显存不够大的把批次改小一点
parser.add_argument('--batch-size', type=int, default=4, help='total batch size for all GPUs, -1 for autobatch')
# 指定那个gpu或者cpu训练
parser.add_argument('--device', default='', help='cuda device, i.e. 0 or 0,1,2,3 or cpu')
# windows上要把这里改成1,不然跑不起来
parser.add_argument('--workers', type=int, default=1, help='max dataloader workers (per RANK in DDP mode)')
  
```

或者使用命令行指定对应的参数运行

```shell
python train.py --data ./data/wzry.yaml --batch-size 4
```

### 使用`pytorch`加载自己训练好的模型
```python
import torch
from PIL import Image

# best.pt 就是这次训练效果最好的一个模型
model = torch.hub.load('./', 'custom', 'best.pt', source='local')

img = './data/images/bus.jpg'
result = model(img)

# 获取识别出来的信息
result.render() # 这里会把框画上
# 识别出来的目标的信息
result.pandas().xyxy[0]
result.pandas().xyxyn[0]
result.pandas().xywh[0]
result.pandas().xywhn[0]
# 每个目标的信息
result.crop(save=False)
# 裁剪出识别出来的目标位置的图片
Image.fromarray(result.crop(save=False)[0]['im'][:, :, ::-1])
# 拿到识别的文本 image 1/1: 720x1600 1 skz\nSpeed: 19.0ms pre-process, 65.0ms inference, 3.0ms NMS per image at shape (1, 3, 288, 640)
str(result)
```

### 使用`gradio`搭建Web GUI页面
安装依赖

```shell
pip install gradio
```

简单示例

```python
import torch
import gradio as gd

model = torch.hub.load('./', 'custom', 'yolov5s.pt', source='local')

title = '基于Gradio的Yolov5演示项目'
desc = '这是描述信息'


def det_image(img, conf_thres, iou_thres):
    # 对应 inputs 的输入 image是图片 slider是滑动条
    # 设置模型参数
    model.conf = conf_thres
    model.iou = iou_thres
    # 返回模型的预测结果
    return model(img).render()[0]


gd.Interface(
    inputs=['image',
            gd.Slider(minimum=0, maximum=1, value=0.25),
            gd.Slider(minimum=0, maximum=1, value=0.45)],
    outputs=['image'],
    fn=det_image,
    title=title,
    description=desc
).launch()
```

