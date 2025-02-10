## 安装
前提是有`pytorch`和`ffmpeg`

```bash
pip install -U openai-whisper
```

## 使用
```python
import torch
import whisper
import warnings

warnings.filterwarnings("ignore") # 忽略警告信息

device = "cuda" if torch.cuda.is_available() else "cpu"
# 加载模型
model = whisper.load_model("large-v3-turbo", device=device)
# 识别音频文件 指定语言为中文
result = model.transcribe("hello.mp3", language="chinese")
print(result["text"])
```

