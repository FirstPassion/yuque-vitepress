启动时报错说`3658`端口被占用，但是使用命令

```powershell
netstat -aon | findstr 3658
```

却查不到端口被那个程序占用了，如果安装了`Linux子系统`会保留一些端口，通过下面的命令可以查看保留的端口

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

最简单的解决办法就是修改监听端口

```powershell
java -jar arthas-boot.jar --telnet-port 可以用的端口号
```

