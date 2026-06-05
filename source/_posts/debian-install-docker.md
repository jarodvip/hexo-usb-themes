---
title: Debian / Ubuntu 安装 Docker 以及 Docker Compose 教程
date: 2024-06-21T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/debian-install-docker.webp
---

本文将指导如何在 Debian 和 Ubuntu 下安装 Docker 以及 Docker Compose。

*PS：本文适用于 Debian Stable 以及 Ubuntu LTS*

# 什么是 Docker？

Docker 是一种容器化技术，可以在服务器上快速搭建容器并在不污染宿主机的情况下运行软件，而不再需要安装配置各种环境。开源 [Docker 社区](https://www.docker.com/)致力于改进这类技术，并免费提供给所有用户，使之获益。

# 什么是 Docker Compose？

传统模式下运维人员需要运行 `docker run` 来启动各种容器，一旦容器过多，就无法一次性记住所有的运行参数和命令，这时候我们可以使用 [Docker Compose](https://docs.docker.com/compose/) 来解决这个问题。

Docker Compose 是一个用于在单个主机上定义和运行多个 Docker 容器的工具。它使用 YAML 文件来配置应用程序的服务，然后使用一个命令就可以创建并启动所有服务。使用 Docker Compose 可以大大简化 Docker 容器的管理和部署，特别是对于具有多个互相依赖的容器的复杂应用。

# 使用官方源安装 Docker

以下操作需要在 root 用户下完成，请使用 `sudo -i` 或 `su root` 切换到 root 用户进行操作。

首先，安装一些必要的软件包：

`apt update
apt upgrade -y
apt install curl vim wget gnupg dpkg apt-transport-https lsb-release ca-certificates
`Copy
然后加入 Docker 的 GPG 公钥和 apt 源：

`curl -sSL https://download.docker.com/linux/debian/gpg | gpg --dearmor > /usr/share/keyrings/docker-ce.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-ce.gpg] https://download.docker.com/linux/debian $(lsb_release -sc) stable" > /etc/apt/sources.list.d/docker.list
`Copy

```
`curl -sSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor > /usr/share/keyrings/docker-ce.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-ce.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -sc) stable" > /etc/apt/sources.list.d/docker.list
`
```
Copy

国内机器可以用[清华 TUNA](https://mirrors.tuna.tsinghua.edu.cn/) 的国内源：

`curl -sSL https://download.docker.com/linux/debian/gpg | gpg --dearmor > /usr/share/keyrings/docker-ce.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-ce.gpg] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/debian $(lsb_release -sc) stable" > /etc/apt/sources.list.d/docker.list
`Copy

```
`curl -sSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor > /usr/share/keyrings/docker-ce.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-ce.gpg] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu $(lsb_release -sc) stable" > /etc/apt/sources.list.d/docker.list
`
```
Copy

Debian 下也可以直接使用 [extrepo](/debian-extrepo/):

`sudo apt update
sudo apt install extrepo -y
sudo extrepo enable docker-ce
`Copy
国内机器如果抓取 GPG Key 超时，在基于信任的前提下，也可以用国内的镜像代替，比如：

`curl -sSL https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/debian/gpg | gpg --dearmor > /usr/share/keyrings/docker-ce.gpg
`Copy
然后更新系统后即可安装 Docker CE 和 Docker Compose 插件：

`apt update
apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
`Copy
此时可以使用 `docker version` 命令检查是否安装成功：

`root@debian ~ # docker version
Client: Docker Engine - Community
 Version:           28.3.3
 API version:       1.51
 Go version:        go1.24.5
 Git commit:        980b856
 Built:             Fri Jul 25 11:34:00 2025
 OS/Arch:           linux/amd64
 Context:           default

Server: Docker Engine - Community
 Engine:
  Version:          28.3.3
  API version:      1.51 (minimum version 1.24)
  Go version:       go1.24.5
  Git commit:       bea959c
  Built:            Fri Jul 25 11:34:00 2025
  OS/Arch:          linux/amd64
  Experimental:     true
 containerd:
  Version:          1.7.27
  GitCommit:        05044ec0a9a75232cad458027ca83437aae3f4da
 runc:
  Version:          1.2.5
  GitCommit:        v1.2.5-0-g59923ef
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
`Copy
如果需要某个特定用户可以用 Docker [rootless](https://docs.docker.com/engine/security/rootless/) 模式运行 Docker，那么可以把这个用户也加入 docker 组，比如我们把 `www-data` 用户加进去：

`apt install docker-ce-rootless-extras
sudo usermod -aG docker www-data
`Copy

# 安装 Docker Compose

因为我们已经安装了 `docker-compose-plugin`，所以 Docker 目前已经自带 `docker compose` 命令，基本上可以替代 `docker-compose`：

`root@debian ~ # docker compose version
Docker Compose version v2.39.1
`Copy
如果某些镜像或命令不兼容，则我们还可以单独安装 Docker Compose：

我们可以使用 Docker 官方发布的 [Github](https://github.com/docker/compose) 直接安装最新版本：

`curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64 > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
`Copy
此时可以使用 `docker-compose version` 命令检查是否安装成功：

`root@debian ~ # docker-compose version
Docker Compose version v2.39.1
`Copy

# 修改 Docker 配置

以下配置会增加一段自定义内网 IPv6 地址，开启容器的 IPv6 功能，以及限制日志文件大小，防止 Docker 日志塞满硬盘 (泪的教训)：

`cat > /etc/docker/daemon.json << EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "20m",
        "max-file": "3"
    },
    "userland-proxy": false,
    "ipv6": true,
    "fixed-cidr-v6": "fdb::/64",
    "experimental":true,
    "ip6tables":true
}
EOF
`Copy
然后重启 Docker 服务：

`systemctl restart docker
`Copy
好了，我们已经安装好了 Docker 和 Docker Compose，然后就可以开始愉快的安装各种软件，限于篇幅，我们不再赘述，今后慢慢介绍安装各种 Docker 软件的方法。