## 基础使用
```python
from transformers import AutoModelForCausalLM, AutoTokenizer, TextStreamer

# 要用的模型,可以用本地模型的路径
model_name = "Qwen/Qwen2.5-0.5B-Instruct"
# 加载模型
model = AutoModelForCausalLM.from_pretrained(
    model_name, torch_dtype="auto", device_map="auto"
)
# 加载模型配套的分词器
tokenizer = AutoTokenizer.from_pretrained(model_name)
# 保存到本地,指定目录保存模型
# model.save_pretrained("./local_model")
# tokenizer.save_pretrained("./local_tokenizer")
# 构建模型需要的输入
messages = [
    {
        "role": "system",
        "content": "你是一个智能助手",
    },
    {"role": "user", "content": "吃了没?"},
]
# 构建 chatml 格式的提示词
# <|im_start|>system\n你是一个智能助手<|im_end|>\n<|im_start|>user\n吃了没?<|im_end|>\n<|im_start|>assistant\n'
text = tokenizer.apply_chat_template(
    messages, tokenize=False, add_generation_prompt=True
)
# 通过分词器编码文字为模型的输入tensor
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
# 让模型通过前面的词去续写后面的内容
generated_ids = model.generate(**model_inputs, max_new_tokens=512)
# 只获取模型续写的ids
generated_ids = [
    output_ids[len(input_ids) :]
    for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]
# 通过分词器去解码ids得到对应的文字
response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)

# 用来流式输出数据
streamer = TextStreamer(tokenizer)
# 流式输出内容
model.generate(
    **model_inputs,
    max_new_tokens=512,
    streamer=streamer,
    temperature=0.7,
    do_sample=True,
    pad_token_id=tokenizer.eos_token_id,
)
```

## `transformers`加载本地模型，并且流式输出
```python
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
import sys
import time
import threading

class QwenChat:
    """
    通义千问对话模型封装类
    用于加载模型并处理对话生成
    """
    def __init__(self, model_path):
        """
        初始化模型和分词器
        Args:
            model_path: 模型路径，可以是本地路径或Hugging Face模型名
        """
        # 加载模型，启用自动数据类型和设备选择
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype="auto",  # 自动选择合适的数据类型
            device_map="auto"    # 自动选择可用设备(CPU/GPU)
        )
        # 加载对应的分词器
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)

    def generate_response(self, prompt, stream=False):
        """
        生成对话回复
        Args:
            prompt: 用户输入的文本
            stream: 是否使用流式输出
        Returns:
            如果stream=False，返回生成的文本
            如果stream=True，实时打印生成的文本，返回None
        """
        # 构建对话消息列表
        messages = [
            {"role": "system", "content": "You are Qwen, created by Alibaba Cloud. You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
        
        # 使用分词器的对话模板处理消息
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        # 将输入文本转换为模型输入格式
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.model.device)

        if not stream:
            # 非流式输出模式
            generated_ids = self.model.generate(
                **model_inputs,
                max_new_tokens=512  # 最大生成512个新token
            )
            # 截取生成的部分（去除输入部分）
            generated_ids = [
                output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]
            # 解码生成的token为文本
            return self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        else:
            # 流式输出模式
            # 创建文本流式输出器
            streamer = TextIteratorStreamer(self.tokenizer, skip_special_tokens=True)
            
            # 在新线程中运行模型生成
            # 这样可以避免生成过程阻塞主线程，实现流式输出
            generation_kwargs = dict(
                **model_inputs,
                max_new_tokens=512,
                streamer=streamer,
            )
            thread = threading.Thread(target=self.model.generate, kwargs=generation_kwargs)
            thread.start()

            # 从streamer中获取生成的文本
            is_first_token = True
            for new_text in streamer:
                # 跳过第一个token，因为它通常包含输入提示
                if is_first_token:
                    is_first_token = False
                    continue
                
                # 实时写出生成的文本
                sys.stdout.write(new_text)
                sys.stdout.flush()  # 确保文本立即显示
                time.sleep(0.02)    # 添加小延迟，使输出更自然

            # 等待生成线程完成
            thread.join()
            print()  # 输出换行
            return None

if __name__ == "__main__":
    # 初始化聊天模型
    chat_model = QwenChat("./qwen_finetune_final")
    
    # 交互式对话循环
    print("开始与模型对话（输入 'quit' 退出）：")
    while True:
        # 获取用户输入
        user_input = input("\n用户: ")
        if user_input.lower() == 'quit':
            break
        
        # 生成并显示模型回复
        print("助手: ", end='', flush=True)
        chat_model.generate_response(user_input, stream=True) 
```

## 微调qwen模型
### 数据准备`data.json`
```json
[
  {
    "conversations": [
      {"role": "user", "content": "我是谁？"},
      {"role": "assistant", "content": "彭于晏"}
    ]
  },
  {
    "conversations": [
      {"role": "user", "content": "我是谁？"},
      {"role": "assistant", "content": "彭于晏"}
    ]
  }
]
```

### 微调代码
```python
import logging
from pathlib import Path
from typing import List, Dict, Any
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from datasets import Dataset
import json

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class QwenFineTuner:
    def __init__(
        self, 
        model_name: str = "Qwen/Qwen2.5-0.5B-Instruct",
        output_dir: str = "./qwen_finetune",
        device: str = "auto"
    ):
        self.model_name = model_name
        self.output_dir = Path(output_dir)
        self.device = device
        
        logging.info(f"初始化模型: {model_name}")
        try:
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name, 
                torch_dtype=torch.float16,  # 使用float16以减少内存使用
                device_map=device
            )
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        except Exception as e:
            logging.error(f"模型加载失败: {str(e)}")
            raise

    def prepare_training_data(self, data_list: List[Dict[str, Any]]) -> Dataset:
        """准备训练数据集"""
        logging.info("开始准备训练数据")
        formatted_data = []
        
        for item in data_list:
            try:
                conversation = item["conversations"]
                input_text = self.tokenizer.apply_chat_template(
                    conversation, 
                    tokenize=False, 
                    add_generation_prompt=True
                )
                
                encoded = self.tokenizer(
                    input_text,
                    truncation=True,
                    max_length=512,
                    return_tensors="pt"
                )
                
                formatted_data.append({
                    "input_ids": encoded.input_ids[0],
                    "labels": encoded.input_ids[0],
                    "attention_mask": encoded.attention_mask[0]
                })
            except Exception as e:
                logging.warning(f"处理数据项时出错: {str(e)}")
                continue
                
        return Dataset.from_list(formatted_data)

    def train(self, train_data: List[Dict[str, Any]], training_args: Dict[str, Any] = None):
        """训练模型"""
        default_args = {
            "output_dir": str(self.output_dir),
            "num_train_epochs": 3,
            "per_device_train_batch_size": 4,
            "gradient_accumulation_steps": 4,  # 梯度累积
            "save_steps": 100,
            "save_total_limit": 2,
            "logging_steps": 10,
            "learning_rate": 2e-5,
            "remove_unused_columns": False,
            "fp16": True,  # 使用混合精度训练
            "optim": "adamw_torch",
            "warmup_ratio": 0.1,
        }
        
        if training_args:
            default_args.update(training_args)
            
        training_args = TrainingArguments(**default_args)
        
        try:
            dataset = self.prepare_training_data(train_data)
            trainer = Trainer(
                model=self.model,
                args=training_args,
                train_dataset=dataset,
            )
            
            logging.info("开始训练模型")
            trainer.train()
            
            # 保存模型
            output_path = self.output_dir / "final"
            self.model.save_pretrained(output_path)
            self.tokenizer.save_pretrained(output_path)
            logging.info(f"模型已保存至: {output_path}")
            
        except Exception as e:
            logging.error(f"训练过程出错: {str(e)}")
            raise

    def generate_response(self, prompt: str, max_length: int = 512) -> str:
        """生成响应"""
        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ]
            
            text = self.tokenizer.apply_chat_template(
                messages, 
                tokenize=False, 
                add_generation_prompt=True
            )
            
            model_inputs = self.tokenizer(
                [text], 
                return_tensors="pt"
            ).to(self.model.device)

            with torch.no_grad():
                generated_ids = self.model.generate(
                    **model_inputs,
                    max_new_tokens=max_length,
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    repetition_penalty=1.1
                )
                
            generated_ids = [
                output_ids[len(input_ids):] 
                for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]
            
            return self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
        except Exception as e:
            logging.error(f"生成响应时出错: {str(e)}")
            return f"生成响应时发生错误: {str(e)}"

def main():
    # 初始化模型
    fine_tuner = QwenFineTuner()
    
    try:
        # 加载训练数据
        with open("data.json", "r", encoding="utf-8") as f:
            train_data = json.load(f)
    except Exception as e:
        logging.error(f"加载训练数据失败: {str(e)}")
        return

    # 训练模型
    fine_tuner.train(train_data)
    
    # 测试模型
    test_prompts = ["我是谁？", "我谁？", "我？"]
    for prompt in test_prompts:
        print(f"\n问题: {prompt}")
        print(f"回答: {fine_tuner.generate_response(prompt)}")

if __name__ == "__main__":
    main()
```

