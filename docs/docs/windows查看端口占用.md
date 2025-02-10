### 查找所有运行的端口
```shell
netstat -ano
```

### 指定要查找的端口
```shell
# netstat -ano | findstr 要查找的端口号
netstat -ano | findstr 8080
```

### 查看指定PID的进程
<font style="color:rgb(51, 51, 51);">上面执行后,最后一位数字就是 PID</font>

```shell
# tasklist | findstr PID
tasklist | findstr 13544
```

### 结束进程
```shell
# taskkill /T /F /PID PID
taskkill /T /F /PID 13544
```

