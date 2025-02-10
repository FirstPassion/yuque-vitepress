## 同步生成
```javascript
const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.assistant.capabilities()
if (available !== "no") {
  const session = await ai.assistant.create()
  // 非流式生成回答
  const result = await session.prompt("你好")
  console.log(result)
}
```

## 流式生成
```javascript
const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.assistant.capabilities()
if (available !== "no") {
  const session = await ai.assistant.create()
  // 生成流式回答
  const stream = session.promptStreaming("介绍一下你自己")
  for await (const chunk of stream) {
    console.log(chunk)
  }
}
```

## 会话会自动结合上下文
```javascript
const session = await ai.assistant.create({
  systemPrompt: "You are a friendly, helpful assistant specialized in clothing choices."
})
const result = await session.prompt(`
  What should I wear today? It's sunny and I'm unsure between a t-shirt and a polo.
`)
console.log(result)
const result2 = await session.prompt(`
  That sounds great, but oh no, it's actually going to rain! New advice??
`)
```

## 克隆会话
为了保留资源，可以克隆现有会话。对话上下文将被重置，但初始提示或系统提示将保持不变

```javascript
const clonedSession = await session.clone()
```

## 自定义topK和temperature
`topK` Top-k 是一种采样技术，用于限制模型在生成文本时的选择。它指定了生成过程中每个步骤最可能考虑的单词数。Top-k 是一个正整数（例如，5、10、40）。小 Top-k（例如，5）：该模型从非常狭窄的单词池中进行选择，使其响应更加集中和可预测。大 Top-k（例如，40）：该模型考虑了更广泛的可能性，从而产生了更多样化和创造性的输出。

  

`temperature`** **用于调整模型输出的随机性或创造性，它会影响模型如何选择句子中的下一个单词，通常，温度范围为 0 到 1 或更高，但高于 1 的值不太常见，低温（例如 0.2）：模型变得更加集中和确定性，通常会产生最可能或“安全”的响应。它适用于事实或精确的任务。高温（例如 0.8）：该模型变得更加冒险，探索可能性较小但可能更具创意或多样化的反应。它适合头脑风暴、产生想法或写小说。 



常见搭配

高温 + 低 Top-k：鼓励创造性但有点专注的回应，该模型探索了一小部分不太可能的单词。 

低温 + 高 Top-k：产生更可预测的输出，但仍允许一些多样性，该模型从大量可能的单词中进行选择。  

高温 + 高 Top-k：最大限度地提高创造力和多样性，该模型探索了大量的可能性。  

低温 + 低 Top-k：优先选择最可能且最安全的响应，此设置适用于需要精确度和事实准确性的任务。   

```javascript
const capabilities = await ai.assistant.capabilities()
// 初始化新会话必须同时指定topK和temperature,或者都不指定
const slightlyHighTemperatureSession = await ai.assistant.create({
  temperature: Math.max(capabilities.defaultTemperature * 1.2, 1.0),
  topK: capabilities.defaultTopK,
})
```

## 指定系统提示词
```javascript
const session = await ai.assistant.create({
  systemPrompt: "Pretend to be an eloquent hamster."
})
await session.prompt('Do you like nuts?')
```

## 清除会话
```javascript
await session.prompt(`
  You are a friendly, helpful assistant specialized in clothing choices.
`)
// 清除当前会话
session.destroy()
```

## 其他
更多内容参考:

[https://docs.google.com/document/u/0/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/mobilebasic?pli=1&_immersive_translate_auto_translate=1](https://docs.google.com/document/u/0/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/mobilebasic?pli=1&_immersive_translate_auto_translate=1)

