```python
def predict(model, image, device, class_names):
    if isinstance(image, torch.Tensor):
        # 如果是PIL打开的图片
        image = transforms.ToPILImage()(image)
    # 模型预测的时候第一位是批次大小，所以要加一维
    image = transform(image).unsqueeze(0).to(device)
    model.eval()
    with torch.no_grad():
        outputs = model(image)
        # 通过softmax去计算每个类别的概率
        probabilities = F.softmax(outputs, dim=1)
        # 获取概率最大的三个类别
        topk_values, topk_indices = torch.topk(probabilities, 3)
        # 获取下标位置的标签名字
        predicted_classes = [class_names[i] for i in topk_indices[0].tolist()]
        # 置信度
        predicted_confidences = [value.item() for value in topk_values[0]]
    return predicted_classes, predicted_confidences
```

