## 安装脚手架
```bash
npm install -g yo generator-code
```

## 生成插件模板
```bash
yo code
```

## 配置语言支持
我这里就自定义一种以`.da`结尾的语言，修改根目录下的`package.json`文件的`contributes`处的属性

```json
{
  "contributes": {
    "languages": [
      {
        "id": "da",
        "aliases": [
          "DA"
        ],
        "extensions": [
          ".da"
        ],
        "icon": {
          "dark": "logo.png",
          "light": "logo.png"
        },
        "configuration": "language.json"
      }
    ],
    "grammars": [
      {
        "language": "da",
        "scopeName": "source.da",
        "path": "grammars.json"
      }
    ],
    "snippets": [
      {
        "language": "da",
        "path": "snippets.json"
      }
    ],
  }
}
```

## 自动补全括号、注释
在根目录创建`language.json`文件，填入以下内容，该文件是用来自动补全括号，单行和多行注释用什么符号，我这里注释用`-`

```json
{
    "comments": {
        "blockComment": [
            "---",
            "---"
        ],
        "lineComment": "-"
    },
    "brackets": [
        [
            "(",
            ")"
        ],
        [
            "[",
            "]"
        ],
        [
            "{",
            "}"
        ]
    ],
    "autoClosingPairs": [
        [
            "(",
            ")"
        ],
        [
            "[",
            "]"
        ],
        [
            "{",
            "}"
        ]
    ],
    "surroundingPairs": [
        [
            "(",
            ")"
        ],
        [
            "[",
            "]"
        ],
        [
            "{",
            "}"
        ]
    ]
}
```

## 语言高亮
在根目录创建`grammars.json`文件，填入以下内容`patterns`里面对应`repository`里面的内容`patterns.match`就是匹配规则，颜色的话我也没怎么研究明白，交给你们研究了

```json
{
  "name": "da",
  "scopeName": "source.da",
  "patterns": [
    {
      "include": "#keywords"
    },
    {
      "include": "#strings"
    },
    {
      "include": "#numbers"
    },
    {
      "include": "#comments"
    },
    {
      "include": "#variables"
    },
    {
      "include": "functions"
    }
  ],
  "repository": {
    "keywords": {
      "patterns": [
        {
          "name": "keyword.control.da",
          "match": "\\b(?:def|print|class|if|for|while|do)\\b"
        }
      ]
    },
    "strings": {
      "name": "string.quoted.double.da",
      "begin": "\"",
      "end": "\"",
      "patterns": [
        {
          "name": "constant.character.escape.da",
          "match": "\\\\."
        }
      ]
    },
    "numbers": {
      "name": "constant.numeric.da",
      "match": "\\b\\d+(\\.\\d+)?\\b"
    },
    "comments": {
      "name": "comment.line.double-slash.da",
      "begin": "-",
      "end": "$"
    },
    "variables": {
      "name": "variable.other.da",
      "match": "\\b\\w+\\b"
    },
    "functions": {
      "name": "entity.name.function.da",
      "match": "\\b\\w+\\(.?\\)\\b"
    }
  }
}
```

## 代码片段
在根目录下创建`snippets.json`文件，在里面填入以下内容，`prefix`是输入的前缀，出现这个前缀就会有提示，`body`是片段内容，`$n`是片段生成后光标停留的位置

```json
{
    "da": {
        "prefix": "da",
        "body": [
            "da is very good"
        ],
        "description": "da提示片段"
    },
    "love": {
        "prefix": "i",
        "body": ["i love $1"],
        "description": "love提示片段"
    }
}
```

## 提示补全
在`extension.ts`的`activate`方法中注册自定义的`CompletionItemProvider`

```typescript
context.subscriptions.push(vscode.languages.registerCompletionItemProvider('da', new MyCompletionItemProvider))
```

代码提示实现类

```typescript
// 关键字
const keys = ['def', 'print', 'class', 'if', 'for', 'while', 'do']

// 代码提示
class MyCompletionItemProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
		// 提示关键字
    return keys.map(key => {
			return new vscode.CompletionItem(key, vscode.CompletionItemKind.Keyword)
		})
	}
	resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
		throw new Error('Method not implemented.')
	}
}
```

## 悬浮提示
在`extension.ts`的`activate`方法中注册自定义的`HoverProvider`

```typescript
context.subscriptions.push(vscode.languages.registerHoverProvider('da', new MyHoverProvider))
```

悬浮提示实现类

```typescript
class MyHoverProvider implements vscode.HoverProvider {
	provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
		// 通过position获取到鼠标悬浮位置单词的Range
		const wordRange = document.getWordRangeAtPosition(position)
		// 通过Range获取到这个单词
		const word = document.getText(wordRange)
		if(keys.includes(word)){
			return new vscode.Hover(`${word}是关键字`)
		}
	}
}
```

## 代码检查
在`extension.ts`的`activate`方法中注册自定义的编辑器文本改变事件

```typescript
const diagnosticCollection = vscode.languages.createDiagnosticCollection('caseChecker')
context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
  diagnosticCollection.set(event.document.uri, checkText(event.document))
}))
```

检查文本，显示告警信息

```typescript
const checkText = (document: vscode.TextDocument) => {
	const diagnostics = []
	const text = document.getText()
	const regex = /\b[A-Z]{2,}\b/g
	let match
	while ((match = regex.exec(text)) !== null && keys.includes(match[0].toLocaleLowerCase())) {
		const startPos = document.positionAt(match.index)
		const endPos = document.positionAt(match.index + match[0].length)
		diagnostics.push(new vscode.Diagnostic(
			new vscode.Range(startPos, endPos),
			`${match[0]}关键字需要小写`,
			vscode.DiagnosticSeverity.Warning
		))
	}
	return diagnostics
}
```

## 代码修复
在`extension.ts`的`activate`方法中注册自定义的`CodeActionProvider`

```typescript
context.subscriptions.push(vscode.languages.registerCodeActionsProvider('da', new MyCodeActionProvider))
```

处理警告信息的字符实现类

```typescript
class MyCodeActionProvider implements vscode.CodeActionProvider {
	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
		// 获取所有的告警信息
		const diagnostics = context.diagnostics
		const actions: vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> = []
		// 遍历所有的信息
		diagnostics.forEach(diagnostic => {
			// 处理 Warning 信息
			if (diagnostic.severity === vscode.DiagnosticSeverity.Warning) {
				const action = new vscode.CodeAction(`修复 ${diagnostic.message}`, vscode.CodeActionKind.QuickFix)
				action.edit = new vscode.WorkspaceEdit()
				// 获取警告的字符
				const word = document.getText(range).toLocaleLowerCase()
				// 替换原来位置上的字符
				action.edit.replace(document.uri, diagnostic.range, word)
				actions.push(action)
			}
		})
		return actions
	}
	resolveCodeAction?(codeAction: vscode.CodeAction, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeAction> {
		throw new Error('Method not implemented.')
	}
}
```

## 代码格式化
在`extension.ts`的`activate`方法中注册自定义的`DocumentFormattingEditProvider`

```typescript
context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('da', new MyDocumentFormattingEditProvider()))
```

代码格式化实现类

```typescript
const format = (source: string): string => {
	let output = ''
	const lines = source.split("\r\n").map(line => line.trim()).filter(Boolean)
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith('def')) {
			output += `\r\n${lines[i]}\r\n`
			let j = i + 1
			while (true) {
				if (lines[j].startsWith("}")) {
					output += `${lines[j]}\r\n\r\n`
					i = j + 1
					break
				}
				output += `    ${lines[j]}\r\n`
				j++
			}
		}
		output += `${lines[i]}\r\n`
	}
	return output
}

class MyDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {
	provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
		const text = document.getText()
		const range = new vscode.Range(
			document.positionAt(0),
			document.positionAt(text.length)
		)
		return Promise.resolve([new vscode.TextEdit(range, format(text))])
	}
}	
```

## 跳转到定义
在`extension.ts`的`activate`方法中注册自定义的`DefinitionProvider`

```typescript
context.subscriptions.push(vscode.languages.registerDefinitionProvider('da', new MyDefinitionProvider))
```

跳转实现类，我这里是处理以`()`结尾的单词

```typescript
// 查找点击单词在文档中的第一个位置
const findStringPosition = (document: vscode.TextDocument, search: string) => {
	const text = document.getText() 
	const lines = text.split(/\r?\n/)
	for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
		const line = lines[lineNumber]
		const position = line.indexOf(`def ${search}`)
		if (position !== -1) {
			// vscode.Position 的构造函数参数是：行号(从0开始)，列号(从0开始)
			return new vscode.Position(lineNumber, position);
		}
	}
	// 如果没有找到返回null
	return null;
}

class MyDefinitionProvider implements vscode.DefinitionProvider {
	provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
		const wordRange = document.getWordRangeAtPosition(position)
		const word = document.getText(new vscode.Range(wordRange?.start!, new vscode.Position(
			wordRange?.end.line!,
			wordRange?.end.character! + 2
		)))
		if (word.endsWith("()")) {
			const pos = findStringPosition(document, word)
			if (pos) {
				return new vscode.Location(document.uri, pos)
			}
		}
	}
}
```

## 本地打包插件
为什么不发布到插件市场？

因为注册账号什么的太麻烦了，这里篇幅已经很长了，以后单独发怎么打包发布。

安装依赖

```bash
npm i vsce -g
```

本地打包

切记要用npm安装依赖，不然本地打包不成功

```bash
vsce package
```

