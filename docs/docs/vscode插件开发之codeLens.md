## `codeLens`提供者
```typescript
import * as vscode from 'vscode'

export class MyCodeLens implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void> | undefined;
    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        // 找到要加codeLen的位置
        const lines = document.getText().split('\r\n')
        const functionLine = lines.map((line, idx) => {
            return {
                line,
                idx
            }
        }).filter(line => line.line.startsWith("FUNCTION"))

        return functionLine.map(line => {
            const idx = line.idx > 0 ? line.idx - 1 : 0
            const range = new vscode.Range(idx, 0, idx, 0);
            const cmd: vscode.Command = {
                arguments: [document, range],
                title: '点我看看',
                tooltip: '悬浮提示',
                command: 'ai-plugig.ack'
            }
            // 坐标和按下后要执行的命令
            return new vscode.CodeLens(range, cmd)
        })
    }
    resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        throw new Error('Method not implemented.');
    }

}
```

## 注册提供者
```typescript
vscode.languages.registerCodeLensProvider("*", new MyCodeLens())
```

