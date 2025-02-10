`win+s`输入`<font style="color:rgb(33, 37, 41);">regedit</font>`<font style="color:rgb(33, 37, 41);">打开注册表，然后</font>去注册表搜索`<font style="color:rgb(79, 79, 79);">计算机\HKEY_CURRENT_USER\Software\Microsoft\Command Processor</font>`<font style="color:rgb(79, 79, 79);">，把下面的</font>`<font style="color:rgb(79, 79, 79);">AutoRun</font>`<font style="color:rgb(79, 79, 79);">删除了</font>

![](../images/72b683ebd7d82deb1a16de5cc4a32d57.png)

原理就是，`conda init`的时候给`powershell`和`cmd`写入了一些配置

![](../images/95b140d110542e95ae7fb70ae5853828.png)

如果`powershell`也出了问题记得去检查上面图片对应位置的文件内容



