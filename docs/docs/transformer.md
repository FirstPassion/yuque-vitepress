```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class PositionalEncoding(nn.Module):
    """
    位置编码
    d_model: 输入的维度
    max_len: 最大的序列长度
    """

    def __init__(self, d_model, max_len=5000):
        super(PositionalEncoding, self).__init__()
        # 创建一个全0的编码矩阵
        pe = torch.zeros(max_len, d_model)
        # 添加一维从0到max_len的float索引
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        # 计算位置编码的指数项
        # torch.arange(0, d_model, 2).float() 生成从 0 到 d_model-1 的偶数序列,并转换为浮点数
        # -torch.log(torch.tensor(10000.0)) / d_model 计算 -log(10000) / d_model,用于缩放指数项
        # torch.exp(...) 计算指数项
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float()
            * (-torch.log(torch.tensor(10000.0)) / d_model)
        )
        # 计算正弦和余弦位置编码
        # pe[:, 0::2] 选择 pe 矩阵中所有偶数列（即第 0, 2, 4, ... 列）
        # torch.sin(position * div_term) 计算正弦部分的位置编码
        pe[:, 0::2] = torch.sin(position * div_term)
        # pe[:, 1::2] 选择 pe 矩阵中所有奇数列（即第 1, 3, 5, ... 列）
        # torch.cos(position * div_term) 计算余弦部分的位置编码
        pe[:, 1::2] = torch.cos(position * div_term)
        # pe.unsqueeze(0) 在第一维度上增加一个维度 将 [max_len, d_model] 变为 [1, max_len, d_model]
        # transpose(0, 1) 交换第一和第二维度 将 [1, max_len, d_model] 变为 [max_len, 1, d_model]
        pe = pe.unsqueeze(0).transpose(0, 1)
        # self.register_buffer('pe', pe) 将 pe 注册为模型的缓冲区,这样在模型保存和加载时会自动保存和加载 pe
        self.register_buffer("pe", pe)

    def forward(self, x):
        # x 输入序列的嵌入表示,尺寸为 [seq_len, batch_size, d_model]
        # self.pe[:x.size(0), :] 选择与输入序列长度相同的位置编码
        # x = x + self.pe[:x.size(0), :] 将位置编码加到输入序列的嵌入表示上
        x = x + self.pe[: x.size(0), :]
        return x


class MultiHeadAttention(nn.Module):
    """
    多头注意力机制
    d_model: 输入的维度
    num_heads: 注意力头的数量
    """

    def __init__(self, d_model, num_heads):
        super(MultiHeadAttention, self).__init__()
        assert d_model % num_heads == 0, "d_model 必须能被 num_heads 整除"
        # 词嵌入维度,即每个词的向量维度
        self.d_model = d_model
        # 注意力头的数量
        self.num_heads = num_heads
        # 计算每个注意力头的维度
        self.d_k = d_model // num_heads
        # 定义查询矩阵的线性变换层
        self.W_q = nn.Linear(d_model, d_model)
        # 定义键矩阵的线性变换层
        self.W_k = nn.Linear(d_model, d_model)
        # 定义值矩阵的线性变换层
        self.W_v = nn.Linear(d_model, d_model)
        # 定义输出矩阵的线性变换层
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, query, key, value, mask=None):
        """
        query:查询矩阵,尺寸为 [batch_size, seq_len, d_model]
        key:键矩阵,尺寸为 [batch_size, seq_len, d_model]
        value:值矩阵,尺寸为 [batch_size, seq_len, d_model]
        mask:掩码矩阵,用于屏蔽无效位置,尺寸为 [batch_size, seq_len, seq_len]
        """
        # 获取批次大小
        batch_size = query.size(0)
        # 线性变换并分割成多个头
        Q = (
            # 对查询矩阵进行线性变换 尺寸为 [batch_size, seq_len, d_model]
            self.W_q(query)
            # 将线性变换后的查询矩阵重新调整为 [batch_size, seq_len, num_heads, d_k]
            .view(batch_size, -1, self.num_heads, self.d_k)
            # 交换第二和第三维度 尺寸调整为 [batch_size, num_heads, seq_len, d_k]
            .transpose(1, 2)
        )
        # K 和 V 同理
        K = self.W_k(key).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = (
            self.W_v(value)
            .view(batch_size, -1, self.num_heads, self.d_k)
            .transpose(1, 2)
        )

        # 计算注意力分数
        # torch.matmul(Q, K.transpose(-2, -1)) 计算查询矩阵和键矩阵的点积,尺寸为 [batch_size, num_heads, seq_len, seq_len]
        # / torch.sqrt(torch.tensor(self.d_k, dtype=torch.float32)) 对点积结果进行缩放，以防止梯度消失或爆炸
        scores = torch.matmul(Q, K.transpose(-2, -1)) / torch.sqrt(
            torch.tensor(self.d_k, dtype=torch.float32)
        )
        # 如果提供了掩码矩阵,则对注意力分数进行掩码处理
        if mask is not None:
            # 将掩码矩阵中为 0 的位置对应的注意力分数设为负无穷,后续的 softmax 操作中会把对应位置设为 0
            scores = scores.masked_fill(mask == 0, float("-inf"))
        # 对注意力分数进行 softmax 归一化,得到注意力权重矩阵,尺寸为 [batch_size, num_heads, seq_len, seq_len]
        attention_weights = F.softmax(scores, dim=-1)
        # 将注意力权重矩阵与值矩阵进行加权求和,尺寸为 [batch_size, num_heads, seq_len, d_k]
        output = torch.matmul(attention_weights, V)
        # transpose(1, 2) 交换第二和第三维度,尺寸变为 [batch_size, seq_len, num_heads, d_k]
        # contiguous().view(...) 尺寸变为 [batch_size, seq_len, d_model]
        output = output.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        # 对合并后的输出进行线性变换,尺寸为 [batch_size, seq_len, d_model]
        output = self.W_o(output)
        return output, attention_weights


class PositionWiseFeedForward(nn.Module):
    """
    前馈神经网络
    d_model: 词嵌入维度，即每个词的向量维度
    d_ff: 前馈神经网络的中间层维度
    """

    def __init__(self, d_model, d_ff):
        super(PositionWiseFeedForward, self).__init__()
        # 将输入从 d_model 维度映射到 d_ff 维度
        self.fc1 = nn.Linear(d_model, d_ff)
        # 将输入从 d_ff 维度映射回 d_model 维度
        self.fc2 = nn.Linear(d_ff, d_model)

    def forward(self, x):
        return self.fc2(F.relu(self.fc1(x)))


class EncoderLayer(nn.Module):
    """
    编码器层
    d_model: 词嵌入维度，即每个词的向量维度
    num_heads: 注意力头的数量
    d_ff: 前馈神经网络的中间层维度
    dropout: dropout 概率，默认值为 0.1
    """

    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super(EncoderLayer, self).__init__()
        # 计算多头自注意力机制
        self.self_attn = MultiHeadAttention(d_model, num_heads)
        # 计算前馈神经网络
        self.feed_forward = PositionWiseFeedForward(d_model, d_ff)
        # 归一化层
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        # dropout 层
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        # 调用多头自注意力机制 输入 query key 和 value 均为 x 并传入掩码矩阵 mask
        attn_output, _ = self.self_attn(x, x, x, mask)
        # x + self.dropout1(attn_output) 将 dropout 后的输出与输入 x 相加,形成残差连接
        x = self.norm1(x + self.dropout1(attn_output))
        # 前馈神经网络
        ff_output = self.feed_forward(x)
        # x + self.dropout1(attn_output) 将 dropout 后的输出与输入 x 相加,形成残差连接
        x = self.norm2(x + self.dropout2(ff_output))
        return x


class DecoderLayer(nn.Module):
    """
    解码器层
    d_model: 词嵌入维度，即每个词的向量维度
    num_heads: 注意力头的数量
    d_ff: 前馈神经网络的中间层维度
    dropout: dropout 概率，默认值为 0.1
    """

    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super(DecoderLayer, self).__init__()
        # 多头自注意力机制
        self.self_attn = MultiHeadAttention(d_model, num_heads)
        # 编码器-解码器注意力机制
        self.enc_dec_attn = MultiHeadAttention(d_model, num_heads)
        self.feed_forward = PositionWiseFeedForward(d_model, d_ff)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.norm3 = nn.LayerNorm(d_model)
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
        self.dropout3 = nn.Dropout(dropout)

    def forward(self, x, enc_output, src_mask=None, tgt_mask=None):
        # 多头自注意力机制
        attn_output, _ = self.self_attn(x, x, x, tgt_mask)
        x = self.norm1(x + self.dropout1(attn_output))

        # 编码器-解码器注意力机制
        # 输入 query 为 x key 和 value 均为 enc_output 并传入源序列的掩码矩阵 src_mask
        attn_output, _ = self.enc_dec_attn(x, enc_output, enc_output, src_mask)
        x = self.norm2(x + self.dropout2(attn_output))

        # 前馈神经网络
        ff_output = self.feed_forward(x)
        x = self.norm3(x + self.dropout3(ff_output))
        return x


class Transformer(nn.Module):
    """
    Transformer 模型
    src_vocab_size: 源序列的词汇表大小
    tgt_vocab_size: 目标序列的词汇表大小
    d_model: 词嵌入维度，即每个词的向量维度
    num_heads: 注意力头的数量
    num_layers: 编码器和解码器的层数
    d_ff: 前馈神经网络的中间层维度
    max_len: 输入序列的最大长度
    dropout: dropout 概率，默认值为 0.1
    """

    def __init__(
        self,
        src_vocab_size,
        tgt_vocab_size,
        d_model,
        num_heads,
        num_layers,
        d_ff,
        max_len,
        dropout=0.1,
    ):
        super(Transformer, self).__init__()
        self.d_model = d_model
        # 源序列的嵌入层
        self.embedding_src = nn.Embedding(src_vocab_size, d_model)
        # 目标序列的嵌入层
        self.embedding_tgt = nn.Embedding(tgt_vocab_size, d_model)
        # 位置编码层
        self.positional_encoding = PositionalEncoding(d_model, max_len)
        # 编码器层列表
        self.encoder_layers = nn.ModuleList(
            [EncoderLayer(d_model, num_heads, d_ff, dropout) for _ in range(num_layers)]
        )
        # 解码器层列表
        self.decoder_layers = nn.ModuleList(
            [DecoderLayer(d_model, num_heads, d_ff, dropout) for _ in range(num_layers)]
        )
        # 输出层 将解码器的输出映射到目标词汇表大小
        self.fc_out = nn.Linear(d_model, tgt_vocab_size)
        self.dropout = nn.Dropout(dropout)

    def generate_mask(self, src, tgt):
        """
        生成源序列和目标序列的掩码矩阵
        src: 源序列
        tgt: 目标序列
        """
        # [batch_size, 1, 1, seq_len]
        src_mask = (src != 0).unsqueeze(1).unsqueeze(2)
        # [batch_size, 1, seq_len, 1]
        tgt_mask = (tgt != 0).unsqueeze(1).unsqueeze(3)
        # 目标序列的长度
        seq_len = tgt.size(1)
        # 生成一个上三角矩阵,用于屏蔽未来位置,尺寸为 [1, seq_len, seq_len]
        nopeak_mask = (
            1 - torch.triu(torch.ones(1, seq_len, seq_len), diagonal=1)
        ).bool()
        # 将目标序列的掩码矩阵与上三角矩阵进行按位与操作 尺寸为 [batch_size, 1, seq_len, seq_len]
        tgt_mask = tgt_mask & nopeak_mask
        # 返回源序列和目标序列的掩码矩阵
        return src_mask, tgt_mask

    def forward(self, src, tgt):
        # 生成源序列和目标序列的掩码矩阵
        src_mask, tgt_mask = self.generate_mask(src, tgt)
        # 对源序列和目标序列进行嵌入和位置编码 [batch_size, seq_len, d_model]
        src_embedded = self.dropout(self.positional_encoding(self.embedding_src(src)))
        tgt_embedded = self.dropout(self.positional_encoding(self.embedding_tgt(tgt)))
        # 编码器的输出为源序列的嵌入
        enc_output = src_embedded
        # 遍历编码器层
        for enc_layer in self.encoder_layers:
            # 将编码器的输出通过当前编码器层,并传入源序列的掩码矩阵
            enc_output = enc_layer(enc_output, src_mask)
        # 解码器的输出为目标序列的嵌入
        dec_output = tgt_embedded
        # 遍历解码器层
        for dec_layer in self.decoder_layers:
            # 将解码器的输出通过当前解码器层,并传入编码器的输出、源序列的掩码矩阵和目标序列的掩码矩阵
            dec_output = dec_layer(dec_output, enc_output, src_mask, tgt_mask)
        # 将解码器的输出通过全连接层,得到最终的输出
        output = self.fc_out(dec_output)
        return output
```

## 试算
```python
# 定义超参数
src_vocab_size = 5
tgt_vocab_size = 5
d_model = 4
num_heads = 2
num_layers = 1
d_ff = 8
max_len = 3
dropout = 0.1

# 初始化模型
model = Transformer(
    src_vocab_size,
    tgt_vocab_size,
    d_model,
    num_heads,
    num_layers,
    d_ff,
    max_len,
    dropout,
)

src = torch.tensor([[1, 2, 3]])  # 源序列，尺寸为 [batch_size, seq_len]
tgt = torch.tensor([[1, 2, 0]])  # 目标序列，尺寸为 [batch_size, seq_len]
output = model(src, tgt)  # 前向传播，得到输出
print(output.shape)  # 打印输出
```

## 训练和验证
```python
# 定义损失函数和优化器
criterion = nn.CrossEntropyLoss(ignore_index=0)
optimizer = torch.optim.Adam(model.parameters(), lr=0.0001, betas=(0.9, 0.98), eps=1e-9)


# 训练过程
def train(model, iterator, optimizer, criterion, clip):
    model.train()
    epoch_loss = 0

    for i, batch in enumerate(iterator):
        src = batch.src
        tgt = batch.tgt
        optimizer.zero_grad()
        output = model(src, tgt[:, :-1])
        output_dim = output.shape[-1]
        output = output.contiguous().view(-1, output_dim)
        tgt = tgt[:, 1:].contiguous().view(-1)
        loss = criterion(output, tgt)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), clip)
        optimizer.step()
        epoch_loss += loss.item()

    return epoch_loss / len(iterator)


# 验证过程
def evaluate(model, iterator, criterion):
    model.eval()

    with torch.no_grad():
        for i, batch in enumerate(iterator):
            src = batch.src
            tgt = batch.tgt
            output = model(src, tgt[:, :-1])
            output_dim = output.shape[-1]
            output = output.contiguous().view(-1, output_dim)
            tgt = tgt[:, 1:].contiguous().view(-1)
```

