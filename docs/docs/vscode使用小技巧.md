### vsocde开启连字效果
下载可以连字的字体安装，比如`Fira Code`[https://github.com/tonsky/FiraCode](https://github.com/tonsky/FiraCode)

在vscode的配置文件中加入

```json
"editor.fontFamily": "Fira Code, Consolas, Microsoft YaHei",
"editor.fontLigatures": true
```

### vscode安装unocss插件没有提示解决办法
找插件设置编辑`settings.json`,添加或者修改

```json
"editor.quickSuggestions": {
        "other": true,
        "comments": true,
        "strings": true
}
```

