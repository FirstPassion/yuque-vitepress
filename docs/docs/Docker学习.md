### 下载/拉取 镜像
```shell
# docker pull 镜像名称
dokcer pull hello-world
```

### 运行镜像
```shell
# 直接运行
# docker run 镜像名字
docker run hello-world
```

```shell
# 指定运行后镜像的名字
# docker run --name=指定名字 镜像名字
docker run --name=da hello-world
```

运行容器并且进入容器内部，`-i`表示在容器上打开一个标准的输入接口，`-t`表示分配一个伪tty设备，可以支持终端登录，一般这２个是一起使用的，不然base容器启动后就自动停止了。

```shell
# docker run -it 镜像名字
docker run -it ubuntu　# 使用exit退出容器，退出后容器就自动停止了
```

### 指定端口运行容器
绑定端口到宿主机上，不然不能访问容器内部的端口，`-p`表示端口绑定，`-i`表示后台运行

```shell
docker run -p 宿主机端口:容器端口 -d 镜像名字
docker run -p 8080:80 -d nginx
```

### 指定容器的网络类型
`none`表示回环网络，无法连接外部网络

`bridge`，这是桥接网络，容器默认使用的类型，应用的最多的一种形式

`host`当容器连接到此网络后，会共享宿主机的网络，网络配置与宿主机是一致的

```shell
docker run -it --network=none 镜像名字
```

### 查看运行中的容器
```shell
docker ps
```

查看所有运行过的容器，包括停止的

```shell
docker ps -a
```

### 手动开启处于停止状态的容器
```shell
# docker start 容器名称/容器ID
docker start da # da是容器名称，ID通过 docker ps 获取 CONTAINER　ID，不用写全也行
```

### 启动并且进入容器内部
```shell
# docker start -i 容器名称/容器ID
docker start -i ubuntu
```

### 手动停止处于运行状态的容器
```shell
# docker stop 容器名称/容器ID
docker stop da
```

### 重启正在运行的容器
```shell
# docker restart 容器名称/容器ID
docker restart da
```

### 删除容器
只有处于停止状态的容器才能删除

```shell
# docker rm 容器名称/容器ID
docker rm da
```

如果想要容器停止后就自动删除就加上`--rm`

```shell
# docker run --name=指定名字 --rm 镜像名字
docker run --name=da --rm hello-world
```

### 查看本地保存的镜像
```shell
docker images
```

### 删除本地下载的镜像
如果当前镜像有正在运行的容器是无法删除的

```shell
docker rmi 镜像名称
```

### 构建镜像
```shell
docker commit 容器名称/容器ID　保存的镜像名字 
docker commit 55a4d my_ubuntu
```

使用Dockerfile构建镜像，当前目录下创建一个`Dockerfile`文件

```shell
touch Dockerfile
```

编辑`Dockerfile`文件

```shell
vim Dockerfile
```

构建一个安装了`openjdk-8-jdk`的ubuntu镜像

```shell
FROM ubuntu
RUN apt update
RUN apt install -y openjdk-8-jdk
```

执行构建命令

```shell
# docker build -t 镜像名字 构建目录(当前目录可以用.表示)
docker build -t ubuntu_java .
```

### 查看构建历史
使用commit构建的镜像没有构建历史

```shell
docker history ubuntu_java
```

### 修改本地镜像的信息
```shell
# docker tag 要修改的镜像名称:latest 用户名/仓库名称:版本
docker tag ubuntu_java:latest da/ubuntu_for_java:1.0
```

docker安装后会在主机上创建３个网络

```shell
docker network ls
```

默认输出

```shell
NETWORK ID     NAME      DRIVER    SCOPE
d5ae262de5ab   bridge    bridge    local
0677cabad2bb   host      host      local
c39860987130   none      null      local
```

### 定义自己的网络
docker默认提供三种网络驱动`bridge``overlay``macvlan`，不同的驱动对应不同的网络设备驱动

`bridge`是桥接网络

```shell
# docker network create --driver 驱动类型 自定义网络名字
docker network create --driver bridge test
```

### 删除自定义的网络
```shell
# docker network rm 网络名字
docker network rm test
```

### 查看对应网络信息
```shell
# docker network inspect 网络名字
docker network inspect test
```

### 运行容器时指定网络
```shell
# docker run -it --network=网络名字 镜像名字
docker run -it --network=test ubuntu_network
```

使用`ctrl``p``ctrl``q`可以退出容器同时让容器在后台运行

### 重新进入后台运行的容器
```shell
# docker attach 容器名字/容器ID
docker attach 4e18
```

不同的容器之间网络是互相隔离的，无法进行通信，让容器连接指定网络

```shell
# docker network connect 网络名字 容器名字/容器ID
docker network connect test n1
```

### 持久化存储
把容器中的文件保存到宿主机上，就算容器删除了，文件还是存在于宿主机上

```shell
# mkdir 目录名字
mkdir test
# 在当前的test目录下创建一个a.txt文件，并且写入 hello world
echo 'hello world' > ./test/a.txt
```

使用`-v`用于指定文件挂载，容器内修改文件或者宿主机修改文件都会同步修改

```shell
# docker run -it -v 宿主机绝对路径:容器里的路径 容器名字/容器ID
docker run -it -v ~/code/test:/root/test my_ubuntu
# 查看
cat /root/test/a.txt
```

### 把宿主机的文件复制到容器内
```shell
# docker cp 宿主机文件 容器名字/ID:容器内路径
docker cp ./Dockerfile fdf5b5966c8a:/
```

### 查看虚拟卷
```shell
docker volume ls
```

### 创建虚拟卷
或者说容器共享目录

```shell
# docker volume create 目录名称
docker volume create test
```

### 查看创建的数据卷信息
```shell
# docker inspect 目录名称
docker inspect test
```

上面创建了就能直接用数据卷名称指定目录了

```shell
# docker run -it -v 目录名称:容器内目录 容器名称/ID
docker run -it -v test:/root/test my_ubuntu
```

### 删除创建的数据卷
```shell
# docker volume rm 目录名称
docker volume rm test
```

### 打印容器内的日志
```shell
docker logs 容器名称/ID
# 持续打印
docker logs -f 容器名称/ID
```

### 使用exec在容器中启动一个新的终端或者在容器中执行命令
```shell
docker exec -it 容器名字/ID bash # 进入容器
docker exec 容器名字 要执行的命令 # 执行命令
```

### 强制停止容器
```shell
docker kill 容器名字/ID
```

### 暂停容器的运行
```shell
docker pause 容器名字/ID
```

### 恢复容器的运行
```shell
docker unpause 容器名字/ID
```

### 物理资源管理
`-m`是对容器的物理内存的使用限制,`-memory-swap`是对内存和交换分区总和的限制，他们默认都是-1，就是没有任何的限制(如果一开始只指定`-m`参数，那么交换内存的限制与其保持一致，内存+交换等于`-m`的两倍大小)，默认情况下与宿主机保持一致。

```shell
docker run -m 内存限制 --memory-swap=内存和交换分区总共的内存限制 镜像名称
```

除了对内存的限制还可以对CPU进行限制`-c`或者`--cpu-share`调节容器的CPU权重(默认1024)

```shell
docker run -c 1024 容器名字/ID
```

也可以使用`--cpuset-cpus`来直接限制CPU的数量

```shell
docker run -it --cpuset-cpus=1 容器名称/ID # 多个cpu用,分割比如 --cpuset-cpus=0,1
```

### 容器监控
对容器状态进行实时监控

```shell
docker stats
```

查看容器中的进程

```shell
docker top 容器名字/ID
```

使用Portainer监控

先创建一个数据卷供Portainer使用

```shell
docker volume create portainer_data
```

运行Portainer容器，服务器要开放8000和9443端口

```shell
docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v protainer_data:/data portainer/portainer-ce:latest
```

运行成功后访问 [https://ip:9443](https://192.168.56.100:9443/#!/2/docker/containers) 一定要加https不然不能访问

### docker-compose的简单使用
编写docker-compose.yml文件

```yaml
version: "3.9"
services:
  spring: # 服务名称,自己随便取
    container_name: app_springboot # 一会要创建的容器名称
    build: . # build表示使用构建的镜像, .表示用当前目录下Dockerfile文件构建
    ports:
      - "8080:8080" # 端口映射
  mysql:
    container_name: app_mysql
    image: mysql:latest # image表示要使用的镜像,本地没有会从远程仓库下载
  redis:
    container_name: app_redis
    image: redis:latest
```

### docker-compose常用命令
启动容器

```shell
docker-compose up # 执行当前目录下的docker-compose.yml文件
```

```shell
docker-compose up -d # 后台执行
```

查看运行的容器信息

```shell
docker-compose top
```

关闭容器，同时删除

```shell
docker-compose down
```

停止容器

```shell
docker-compose stop
```

