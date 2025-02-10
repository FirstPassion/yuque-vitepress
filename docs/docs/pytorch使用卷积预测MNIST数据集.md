```python
import torch
from torch import nn
from torch import optim
from torchvision import datasets, transforms
from tqdm import tqdm


trainsets = datasets.MNIST(
    root="./data", train=True, download=False, transform=transforms.ToTensor()
)
testsets = datasets.MNIST(
    root="./data", train=False, download=False, transform=transforms.ToTensor()
)

trainloader = torch.utils.data.DataLoader(trainsets, batch_size=64, shuffle=True)
testloader = torch.utils.data.DataLoader(testsets, batch_size=64, shuffle=True)


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


device = "cuda" if torch.cuda.is_available() else "cpu"
model = Model()
model.to(device)
# 交叉熵损失函数
criterion = nn.CrossEntropyLoss()
# 优化器
optimizer = optim.Adam(model.parameters(), lr=0.001)


def train(epochs=30):
    best_val_loss = float("inf")
    for epoch in range(epochs):
        model.load_state_dict(torch.load("best_model.pth", weights_only=False))
        model.train()
        running_loss = 0.0
        train_bar = tqdm(testloader, desc=f"Epoch [{epoch+1}/{epochs}]")
        for x, y in train_bar:
            x = x.to(device)
            y = y.to(device)
            optimizer.zero_grad()
            out = model(x)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
            train_bar.set_postfix({"Train Loss": running_loss / (train_bar.n + 1)})

        # 验证模型
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            val_bar = tqdm(testloader, desc="Validation")
            for images, labels in val_bar:
                images = images.to(device)
                labels = labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item()
                val_bar.set_postfix({"Val Loss": val_loss / (val_bar.n + 1)})

        # 计算平均损失
        train_loss = running_loss / len(trainloader)
        val_loss = val_loss / len(testloader)

        print(
            f"Epoch [{epoch+1}/{epochs}], Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}"
        )

        # 保存最优模型
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), "best_model.pth")
            print(f"Best model saved with Val Loss: {best_val_loss:.4f}")


def test():
    model.load_state_dict(torch.load("best_model.pth", weights_only=False))
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in testloader:
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    print(f"Accuracy of the model on the 10000 test images: {100 * correct / total}%")

# 训练
train()
# 预测
test()
```

