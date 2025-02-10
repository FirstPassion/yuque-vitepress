## 安装
```bash
pip install tensorflow
```

## 使用
### 手写数字识别
```python
# 忽略提示
import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "1"

from keras.api.datasets import mnist
from keras.api.models import Sequential
from keras.api.layers import Input, Dense, Flatten
from keras.api.saving import load_model, save_model

# 加载 MNIST 数据集
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# 归一化数据
x_train, x_test = x_train / 255.0, x_test / 255.0

# 构建模型
model = Sequential(
    [
        Input(shape=(28, 28)),
        Flatten(),
        Dense(128, activation="relu"),
        Dense(10, activation="softmax"),
    ]
)

# 编译模型
model.compile(
    optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"]
)

# 训练模型
model.fit(x_train, y_train, epochs=5)

# 评估模型
test_loss, test_acc = model.evaluate(x_test, y_test, verbose=2)
print("\nTest accuracy:", test_acc)

# 保存模型
save_model(model, "model.keras")

# 加载模型
model = load_model("model.keras")

# 评估模型
test_loss, test_acc = model.evaluate(x_test, y_test, verbose=2)
print("\nTest accuracy:", test_acc)
```



