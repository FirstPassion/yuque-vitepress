```typescript
let myStatusBarItem: vscode.StatusBarItem
let isLogin: Boolean = false

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand("ai-plugig.ack", () => ack(myStatusBarItem)))
	const myCommandId = 'ai-plugig.BarItem'
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, () => { }))
	// 创建状态按钮
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
	myStatusBarItem.command = myCommandId
	context.subscriptions.push(myStatusBarItem)
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
		updateStatusBarItem(myStatusBarItem, isLogin)
	}))
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
		updateStatusBarItem(myStatusBarItem, isLogin)
	}))
	// 更新状态栏
	updateStatusBarItem(myStatusBarItem, isLogin)
}
```

更新状态栏的方法

```typescript
export function updateStatusBarItem(myStatusBarItem: vscode.StatusBarItem, isLogin: Boolean): void {
    if (isLogin) {
        myStatusBarItem.text = `$(loading~spin) AI正在思考`
        myStatusBarItem.show()
    } else {
        myStatusBarItem.hide()
    }
}
```

