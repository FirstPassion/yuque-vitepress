```typescript
// 注册文档内容提供者
vscode.workspace.registerTextDocumentContentProvider('my4gl', {
  provideTextDocumentContent(uri) {
    const scheme = uri.scheme;
    const authority = uri.authority;
    if (scheme === 'my4gl' && authority === '4glfile') {
      // 返回虚拟文件的内容
      return "hello world"
    }
  }
})

// 创建虚拟文件的URI
const uri = vscode.Uri.parse(`my4gl://4glfile/test.4gl`)

// 打开虚拟文件
vscode.workspace.openTextDocument(uri).then(doc => {
  vscode.window.showTextDocument(doc).then(editor => {
    console.log('虚拟文件已打开:', editor.document.uri)
    // 检查文件是否可写
    if (!editor.document.isDirty) {
      vscode.window.showInformationMessage('该文件是只读的，无法编辑。')
    }
  }, reason => {
    console.error('无法打开虚拟文件:', reason)
  })
}, reason => {
  console.error('无法打开虚拟文件:', reason)
})
```

