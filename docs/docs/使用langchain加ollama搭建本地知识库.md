`langchain`官网[https://python.langchain.com/docs/get_started/quickstart](https://python.langchain.com/docs/get_started/quickstart)

`ollama`官网[https://ollama.com/](https://ollama.com/)

安装

```python
pip install langchain
```

使用

```python
from langchain_community.document_loaders import PyPDFLoader, TextLoader  #PDF加载器
from langchain.text_splitter import RecursiveCharacterTextSplitter  # 分割文档
from langchain_community.embeddings import OllamaEmbeddings  # 量化文档
from langchain_community.vectorstores import Chroma  # 量化文档数据库
from langchain_community.llms import Ollama  #模型
from langchain.chains import RetrievalQA  #链

# 编码模型
oembed_server = OllamaEmbeddings(model="nomic-embed-text")
# 聊天模型
ollama_server = Ollama(model="qwen:0.5b-chat")
# pdf文件
file_path = "./solon.pdf"
# 保存量化后的数据的数据库路径
db_path = "./chroma_db"


# 保存量化后的文件数据
def save_pdf(file_path, db_path):
    print("开始量化...")
    # 加载文档
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    # 分割文档
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=50,
                                                   chunk_overlap=10)
    all_splits = text_splitter.split_documents(docs)
    #量化文档存入数据库
    Chroma.from_documents(
        documents=all_splits,  # Data
        embedding=oembed_server,  # Embedding model
        persist_directory=db_path  # Directory to save data
    )
    print("量化完成")


def save_file(file_path, db_path):
    print("开始量化...")
    # 加载文档
    loader = TextLoader(file_path=file_path, encoding='utf-8')
    docs = loader.load()
    # 分割文档
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=50,
                                                   chunk_overlap=10)
    all_splits = text_splitter.split_documents(docs)
    #量化文档存入数据库
    Chroma.from_documents(
        documents=all_splits,  # Data
        embedding=oembed_server,  # Embedding model
        persist_directory=db_path  # Directory to save data
    )
    print("量化完成")


# save_file('./a.txt', db_path)


def chat(query):
    #加载embedding
    vectorstore_from_db = Chroma(
        persist_directory=db_path,  # Directory of db
        embedding_function=oembed_server  # Embedding model
    )
    #运行链
    qachain = RetrievalQA.from_chain_type(
        ollama_server, retriever=vectorstore_from_db.as_retriever())
    return qachain.invoke({"query": "请用中文回答我：" + query})


if __name__ == '__main__':
    while True:
        query = input("请输入您的问题：")
        if query == "bye":
            break
        result = chat(query)
        print(result['result'])
```

