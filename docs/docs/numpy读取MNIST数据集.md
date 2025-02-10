## 读取为`numpy`数组
```python
import numpy as np


def read_idx3(filename):
    with open(filename, "rb") as f:
        buf = f.read()
        index = 0
        header = np.frombuffer(buf, ">i", 4, index)
        index += header.size * header.itemsize
        data = np.frombuffer(
            buf, ">B", header[1] * header[2] * header[3], index
        ).reshape(header[1], -1)
        return data


def read_idx1(filename):
    with open(filename, "rb") as f:
        buf = f.read()
        index = 0
        header = np.frombuffer(buf, ">i", 2, index)
        index += header.size * header.itemsize
        data = np.frombuffer(buf, ">B", header[1], index)
        return data


train_images = read_idx3("./data/MNIST/raw/train-images-idx3-ubyte")
train_labels = read_idx1("./data/MNIST/raw/train-labels-idx1-ubyte")
test_images = read_idx3("./data/MNIST/raw/t10k-images-idx3-ubyte")
test_labels = read_idx1("./data/MNIST/raw/t10k-labels-idx1-ubyte")

print(train_images.shape, train_labels.shape, test_images.shape, test_labels.shape)
```

## 查看图片
```python
from matplotlib import pyplot as plt

print(train_labels[0])
plt.imshow(train_images[0].reshape(28, -1), cmap="gray")
plt.show()
```

