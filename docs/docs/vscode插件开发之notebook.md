## 修改`package.json`文件
在`contributes`处添加`notebooks`

```json
"contributes": {
  "notebooks": [
    {
      "type": "my-notebook",
      "displayName": "我的笔记",
      "selector": [
        {
          "filenamePattern": "*.dabook"
        }
      ]
    }
  ]
}
```

## 创建序列化类
实现这个才能正常的打开和保存notebook文件的内容

```typescript
import * as vscode from 'vscode'
import { TextDecoder, TextEncoder } from 'util'

interface RawNotebookCell {
    source: string[]
    cell_type: 'code' | 'markdown'
}

export class MySampleSerializer implements vscode.NotebookSerializer {
    deserializeNotebook(content: Uint8Array, token: vscode.CancellationToken): vscode.NotebookData | Thenable<vscode.NotebookData> {
        const contents = new TextDecoder().decode(content)
        let raw: RawNotebookCell[]
        try {
            raw = JSON.parse(contents) as Array<RawNotebookCell>
        } catch {
            raw = []
        }
        const cells = raw.map(
            item =>
                new vscode.NotebookCellData(
                    item.cell_type === 'code'
                        ? vscode.NotebookCellKind.Code
                        : vscode.NotebookCellKind.Markup,
                    item.source.join('\n'),
                    item.cell_type === 'code' ? 'javascript' : 'markdown'
                )
        )
        return new vscode.NotebookData(cells)
    }

    serializeNotebook(data: vscode.NotebookData, token: vscode.CancellationToken): Uint8Array | Thenable<Uint8Array> {
        let contents: RawNotebookCell[] = []

        for (const cell of data.cells) {
            contents.push({
                cell_type: cell.kind === vscode.NotebookCellKind.Code ? 'code' : 'markdown',
                source: cell.value.split(/\r?\n/g)
            })
        }

        return new TextEncoder().encode(JSON.stringify(contents))
    }

}
```

## 创建内核
通过内核去处理代码，执行和得到结果

```typescript
import * as vscode from 'vscode'

export class MyNotebookKernel {
    readonly controllerId = 'my-notebook-id'
    readonly notebookType = 'my-notebook'
    readonly label = '一个不完善的内核'
    readonly supportedLanguages = ['javascript']
    private codes: Array<string> = []

    private readonly _controller: vscode.NotebookController
    private _executionOrder = 0

    constructor() {
        this._controller = vscode.notebooks.createNotebookController(
            this.controllerId,
            this.notebookType,
            this.label
        )

        this._controller.supportedLanguages = this.supportedLanguages
        this._controller.supportsExecutionOrder = true
        this._controller.executeHandler = this._execute.bind(this)
    }

    private _execute(
        cells: vscode.NotebookCell[],
        _notebook: vscode.NotebookDocument,
        _controller: vscode.NotebookController
    ): void {
        for (let cell of cells) {
            this._doExecution(cell)
        }
    }

    private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
        const execution = this._controller.createNotebookCellExecution(cell)
        execution.executionOrder = ++this._executionOrder
        execution.start(Date.now())
        const code = cell.document.getText()
        if (!this.codes.includes(code)) {
            this.codes.push(cell.document.getText())
        }
        let text: vscode.NotebookCellOutputItem
        try {
            const data = eval(this.codes.reduce((a, b) => a + '\n' + b, ''))
            text = vscode.NotebookCellOutputItem.text(
                data ?
                    `当前 ${cell.document.getText()} 的返回值为 ${data} ${this.codes.reduce((a, b) => a + '\n' + b, '上下文代码为')}`
                    : `执行了 ${cell.document.getText()} 无返回值`
            )
        } catch (e) {
            this.codes.pop()
            text = vscode.NotebookCellOutputItem.error(e as Error)
        }

        execution.replaceOutput([
            new vscode.NotebookCellOutput([
                text
            ])
        ])

        execution.end(true, Date.now())
    }

    dispose(): void {
        this.codes.length = 0
    }
}
```

## 注册
在入口文件的`activate`方法中注册

```typescript
	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer('my-notebook', new MySampleSerializer())
	)

	context.subscriptions.push(new MyNotebookKernel())
```

