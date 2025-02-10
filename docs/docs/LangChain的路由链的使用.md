```python
from langchain_community.llms.ollama import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains.llm import LLMChain
from langchain.chains.conversation.base import ConversationChain
from langchain.chains.router.multi_prompt_prompt import MULTI_PROMPT_ROUTER_TEMPLATE
from langchain.chains.router import LLMRouterChain, MultiPromptChain
from langchain.chains.router.llm_router import RouterOutputParser
import warnings

warnings.filterwarnings('ignore', category=Warning)

# 定义大模型
llm = Ollama(model="qwen2:0.5b", temperature=0.6)

# 准备各个链的prompt
physics_prompt = """
你是一位物理教授,擅长解决物理相关的问题,当问题超出了物理的范畴,请告诉用户你不清楚。
问题: {input}
"""

math_prompt = """
你是一位数学教授,擅长解决数学相关的问题,当问题超出了数学的范畴,请告诉用户你不清楚。
问题: {input}
"""

chinese_prompt = """
你是一位文学教授,擅长解决文学相关的问题,当问题超出了文学的范畴,请告诉用户你不清楚。
问题: {input}
"""

prompt_infos = [{
    "name": "physics",
    "description": "你擅长回答物理问题",
    "prompt_template": physics_prompt
}, {
    "name": "math",
    "description": "你擅长回答数学问题",
    "prompt_template": math_prompt
}, {
    "name": "chinese",
    "description": "你擅长回答文学问题",
    "prompt_template": chinese_prompt
}]

# 组装链
destination_chains = {}

for prompt_info in prompt_infos:
    name = prompt_info["name"]
    prompt_template = prompt_info["prompt_template"]
    prompt = PromptTemplate.from_template(template=prompt_template)
    destination_chains[name] = LLMChain(llm=llm, prompt=prompt)

# 定义默认的路由链
default_chain = ConversationChain(llm=llm, output_key="text")

destinations = [
    f"{prompt_info['name']}:{prompt_info['description']}"
    for prompt_info in prompt_infos
]

destinations_str = "\n".join(destinations)

router_template = MULTI_PROMPT_ROUTER_TEMPLATE.format(
    destinations=destinations_str)


# 路由链的prompt
router_prompt = PromptTemplate(template=router_template,
                               input_variables=["input"],
                               output_parser=RouterOutputParser())

# 定义路由链
router_chain = LLMRouterChain.from_llm(llm=llm, prompt=router_prompt)

# 组装路由链和其他链
chain = MultiPromptChain(router_chain=router_chain,
                         destination_chains=destination_chains,
                         default_chain=default_chain,
                         verbose=True)

# 使用组装完成后的链
res = chain.invoke({"input": "大漠孤烟直的下一句是什么？"})
print(res)
```

