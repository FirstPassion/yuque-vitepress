```typescript
import * as vscode from 'vscode'

class MyCompletionItemProvider1 implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {
        // 最简单的一个补全
        const simpleCompletion = new vscode.CompletionItem('一个简单的补全')

        // 一个带有文档的补全
        const snippetCompletion = new vscode.CompletionItem('一个带有文档的补全')
        // 补全的文档内容,插入到编辑页面的内容
        snippetCompletion.insertText = new vscode.SnippetString('${1:这是} ${2:一个} ${3:带有文档的补全}')
        // 补全的文档
        const docs: any = new vscode.MarkdownString("这是文档内容[link](你点我看看)")
        snippetCompletion.documentation = docs
        // 文档的标题
        snippetCompletion.detail = "这是详情内容"
        // 文档的链接
        docs.baseUri = vscode.Uri.parse('http://www.baidu.com')

        // 一个带有补全字符的补全
        const commitCharacterCompletion = new vscode.CompletionItem('一')
        // 一.触发补全
        commitCharacterCompletion.commitCharacters = ['.']
        commitCharacterCompletion.documentation = new vscode.MarkdownString('按.触发补全')

        // 获取补全列表
        const commandCompletion = new vscode.CompletionItem('ga')
        commandCompletion.kind = vscode.CompletionItemKind.Keyword
        commandCompletion.insertText = ''
        commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' }

        // 返回补全列表
        return [
            simpleCompletion,
            snippetCompletion,
            commitCharacterCompletion,
            commandCompletion
        ]
    }
    resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        throw new Error('Method not implemented.')
    }

}

class MyCompletionItemProvider2 implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> {

        const linePrefix = document.lineAt(position).text.slice(0, position.character)
        if (!linePrefix.endsWith('一.')) {
            return undefined
        }

        return [
            new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
            new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
            new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
        ]

    }
    resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        throw new Error('Method not implemented.')
    }

}

export function provideCompletionItems(context: vscode.ExtensionContext) {

    const a = vscode.languages.registerCompletionItemProvider('4gl', new MyCompletionItemProvider1())
    // 输入.后触发
    const b = vscode.languages.registerCompletionItemProvider('4gl', new MyCompletionItemProvider2(), '.')
    context.subscriptions.push(a, b)
}
```

