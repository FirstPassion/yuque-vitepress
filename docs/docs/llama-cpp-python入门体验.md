## 安装
```bash
pip install llama-cpp-python
```

## 使用
### 聊天
```python
from llama_cpp import Llama

llm = Llama(
    # n_gpu_layers=-1,  # 使用全部GPU
    model_path="qwen2-0_5b-instruct-q8_0.gguf",  # 模型文件
    chat_format="chatml",  # 输入输出格式
    seed=1337,  # 随机种子
    n_ctx=2048,  # 上下文长度
    verbose=False,  # 是否输出调试信息
)

messages = [
    {
        "role": "system",
        "content": "You are a helpful assistant",
    }
]


def chat(question):
    messages.append({"role": "user", "content": question})
    response = llm.create_chat_completion(
        messages=messages, temperature=0.8, stream=True
    )
    message = {}
    for chunk in response:
        delta = chunk["choices"][0]["delta"]
        if "role" in delta:
            message["role"] = delta["role"]
            print(message["role"], end=": ", flush=True)
        elif "content" in delta:
            message["content"] = delta["content"]
            print(message["content"], end="", flush=True)
    print()
    messages.append(message)


while True:
    prompt = input("You: ")
    if prompt == "exit":
        break
    response = chat(prompt)
```

### 输出`JSON`格式
```python
from llama_cpp import Llama
llm = Llama(model_path="path/to/model.gguf", chat_format="chatml")
llm.create_chat_completion(
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant that outputs in JSON.",
        },
        {"role": "user", "content": "Who won the world series in 2020"},
    ],
    response_format={
        "type": "json_object",
    },
    temperature=0.7,
)
```

### 调用工具
```python
from llama_cpp import Llama
llm = Llama(model_path="path/to/chatml/llama-model.gguf", chat_format="chatml-function-calling")
llm.create_chat_completion(
      messages = [
        {
          "role": "system",
          "content": "A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions. The assistant calls functions with appropriate input when necessary"

        },
        {
          "role": "user",
          "content": "Extract Jason is 25 years old"
        }
      ],
      tools=[{
        "type": "function",
        "function": {
          "name": "UserDetail",
          "parameters": {
            "type": "object",
            "title": "UserDetail",
            "properties": {
              "name": {
                "title": "Name",
                "type": "string"
              },
              "age": {
                "title": "Age",
                "type": "integer"
              }
            },
            "required": [ "name", "age" ]
          }
        }
      }],
      tool_choice={
        "type": "function",
        "function": {
          "name": "UserDetail"
        }
      }
)
```

### 编码(embedding)
```python
import llama_cpp

llm = llama_cpp.Llama(model_path="path/to/model.gguf", embedding=True)

embeddings = llm.create_embedding("Hello, world!")

# or create multiple embeddings at once

embeddings = llm.create_embedding(["Hello, world!", "Goodbye, world!"])
```

