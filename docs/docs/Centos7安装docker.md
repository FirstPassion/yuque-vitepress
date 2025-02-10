# <font style="color:rgb(51, 51, 51);">安装docker</font>
<font style="color:rgb(51, 51, 51);">安装需要的软件包， yum-util 提供yum-config-manager功能，另两个是devicemapper驱动依赖</font>

```shell
yum install -y yum-utils device-mapper-persistent-data lvm2
```

<font style="color:rgb(51, 51, 51);">设置 yum 源,</font><font style="color:rgb(51, 51, 51);">设置一个yum源，下面两个都可用</font>

```shell
yum-config-manager --add-repo http://download.docker.com/linux/centos/docker-ce.repo（中央仓库）

yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo（阿里仓库）
```

<font style="color:rgb(51, 51, 51);">查看可用版本有哪些</font>

```shell
yum list docker-ce --showduplicates | sort -r
```

<font style="color:rgb(51, 51, 51);">选择一个版本并安装</font>`<font style="color:rgb(51, 51, 51);">yum install docker-ce-版本号</font>`

```shell
yum -y install docker-ce-18.03.1.ce
```

<font style="color:rgb(51, 51, 51);">不加sudo使用docker</font>

```shell
# 添加docker用户组，如果已存在，不需要执行，大概率是存在的
sudo groupadd docker     
# 将登陆用户加入到docker用户组中
sudo gpasswd -a ${USER} docker
# 更新用户组
newgrp docker   
# 测试docker命令是否可以不使用sudo，并且正常使用
docker version  
```

<font style="color:rgb(51, 51, 51);">启动 Docker 并设置开机自启</font>

```shell
systemctl start docker
systemctl enable docker
```

# 安装<font style="color:rgb(51, 51, 51);">docker-compose</font>
在 GitHub 上下载 Docker Compose 的二进制文件

```shell
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

将下载的二进制文件赋予执行权限

```shell
sudo chmod +x /usr/local/bin/docker-compose
```

创建 Docker Compose 的软链接

```shell
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

验证安装

```shell
docker-compose --version
```

# 开启<font style="color:rgb(51, 51, 51);">docker</font>远程客户端访问
编辑`/etc/systemd/system/multi-user.target.wants/docker.service`文件

```shell
sudo vim /etc/systemd/system/multi-user.target.wants/docker.service
```

加上`-H tcp://0.0.0.0`

```shell
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0 --containerd=/run/containerd/containerd.sock
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutStartSec=0
RestartSec=2
Restart=always
```

重启docker服务，服务器需要开放2375端口

```shell
sudo systemctl daemon-reload
sudo systemctl restart docker.service
```

