连接用use连接的手机，手机要在开发者选项中打开use调试

```shell
adb devices
```

进入shell，要上面连接成功后才行

```shell
adb shell # 进入命令行
exit # 退出命令行
```

从手机端传文件到电脑

```shell
adb pull /sdcard/文件名字
```

从电脑端传文件到手机

```shell
adb push 文件名(电脑上要传输的文件) /sdcard/文件名(手机上要保存的文件)
```

查找手机中已安装的所有apk文件命令

```shell
# -s：列出系统应用  -3：列出第三方应用 -f：列出应用包名及对应的apk名及存放位置  -i：列出应用包名及其安装来源
adb shell pm list package -3 
```

使用adb命令获取当前运行的应用的包名

```shell
adb shell dumpsys window | findstr mCurrentFocus
```

查找apk对应的路径 

```shell
adb shell pm path <包名>
```

导出apk 

```shell
adb pull <apk路径> <导出位置>
```

常用命令

```shell
adb devices #查看连接设备

adb -s cf27456f shell # 指定连接设备使用命令

adb install test.apk # 安装应用

adb install -r demo.apk #安装apk 到sd 卡：

adb uninstall cn.com.test.mobile #卸载应用，需要指定包

adb uninstall -k cn.com.test.mobile #卸载app 但保留数据和缓存文件

adb shell pm list packages #列出手机装的所有app 的包名

adb shell pm list packages -3 #列出除了系统应用的第三方应用包名

adb shell pm clear cn.com.test.mobile #清除应用数据与缓存

adb shell am start -ncn.com.test.mobile/.ui.SplashActivity #启动应用

adb shell dumpsys package #包信息Package Information

adb shell dumpsys meminfo #内存使用情况Memory Usage

adb shell am force-stop cn.com.test.mobile #强制停止应用

adb logcat #查看日志

adb logcat -c #清除log 缓存

adb reboot #重启

adb get-serialno #获取序列号

adb shell getprop ro.build.version.release #查看Android 系统版本

adb shell top -s 10 #查看占用内存前10 的app

adb push <local> <remote> #从本地复制文件到设备

adb pull <remote> <local> #从设备复制文件到本地

adb bugreport #查看bug 报告

adb help #查看ADB 帮助
```

参考：[https://zhuanlan.zhihu.com/p/89060003](https://zhuanlan.zhihu.com/p/89060003)

