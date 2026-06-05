---
title: Debian / Ubuntu 使用 xcaddy 自定义编译 Caddy
date: 2023-01-22T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/xcaddy.webp
---

本文将指导使用 xcaddy 自定义编译 Caddy。

上一篇文章介绍了如何[安装使用 Caddy](/debian-install-caddy/)，但是 Caddy 的功能有时候并不能满足业务需求，如果想要使用更多的功能，就需要自定义编译 Caddy。

[xcaddy](https://github.com/caddyserver/xcaddy) 是 Caddy 官方制作的用于自定义编译 Caddy 的工具，它可以帮助我们快速的编译出符合自己需求的 Caddy。

# 安装 xcaddy

我们按照官方的[安装方法](https://caddyserver.com/docs/install#debian-ubuntu-raspbian)，首先，安装一些必要的软件包：

`apt update
apt upgrade -y
apt install curl vim wget gnupg dpkg apt-transport-https lsb-release ca-certificates
`Copy
然后按照[官方教程](https://go.dev/doc/install)安装 Go：

`wget https://go.dev/dl/go1.24.5.linux-amd64.tar.gz
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.24.5.linux-amd64.tar.gz
`Copy
然后把 go 加入系统环境变量：

`echo "export PATH=\$PATH:/usr/local/go/bin" >> /etc/profile
`Copy
然后加入 Caddy 的 GPG 公钥和 apt 源：

`curl -sSL https://dl.cloudsmith.io/public/caddy/xcaddy/gpg.key | gpg --dearmor > /usr/share/keyrings/xcaddy.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/xcaddy.gpg] https://dl.cloudsmith.io/public/caddy/xcaddy/deb/debian any-version main" > /etc/apt/sources.list.d/xcaddy.list
`Copy
Debian 下也可以使用 extrepo：

`apt install extrepo
extrepo enable caddyserver
`Copy
然后更新系统后即可安装 xcaddy：

`apt update
apt install xcaddy
`Copy
重启打开 SSH 后检查一下 go 和 xcaddy 的版本：

`root@debian ~ # go version
go version go1.24.5 linux/amd64

root@debian ~ # xcaddy version
v0.4.5 h1:7E4b+3Gm2do/WpuDXh5MWIj+qgCCvQqR487Sm8C6hwc=
`Copy

# 自定义编译 Caddy

我们可以选择一些自己喜欢的模块，比如[缓存模块](https://github.com/caddyserver/cache-handler)和 [Brotli 压缩模块](https://github.com/ueffel/caddy-brotli)：

`xcaddy build \
    --with github.com/caddyserver/cache-handler \
	  --with github.com/ueffel/caddy-brotli
`Copy
经过一段时间的编译以后，我们就可以在当前目录下看到一个名为 `caddy` 的二进制文件，这就是我们自定义编译的 Caddy 了。

# 自定义 Caddy 和系统 Caddy 共存

如果我们想要自定义 Caddy 和系统 Caddy 共存，可以使用官方的[教程](https://caddyserver.com/docs/build)：

首先，按照我们的教程[安装](/debian-install-caddy/) Caddy，安装完毕后，先停止 Caddy 服务：

`systemctl stop caddy
`Copy
然后使用 `dpkg-divert` 命令将系统 Caddy 的二进制文件移动到 `/usr/bin/caddy.default` 并做软链接：

`dpkg-divert --divert /usr/bin/caddy.default --rename /usr/bin/caddy
`Copy
然后把我们自己编译好的 Caddy 二进制文件移动到 `/usr/bin/caddy.custom`：

`mv ./caddy /usr/bin/caddy.custom
`Copy
然后设置优先级，让我们的自定义 Caddy 优先启动：

`update-alternatives --install /usr/bin/caddy caddy /usr/bin/caddy.default 10
update-alternatives --install /usr/bin/caddy caddy /usr/bin/caddy.custom 50
`Copy
此时我们可以看到默认的 `/usr/bin/caddy` 已经是我们自定义的 Caddy 了：

`root@debian ~ # ls -l /usr/bin/caddy
lrwxrwxrwx 1 root root 23 Jan 22 10:52 /usr/bin/caddy -> /etc/alternatives/caddy*

root@debian ~ # ls -l /etc/alternatives/caddy
lrwxrwxrwx 1 root root 21 Jan 22 10:52 /etc/alternatives/caddy -> /usr/bin/caddy.custom
`Copy
我们也可以使用 `update-alternatives --config caddy` 命令来切换系统安装的 Caddy 和自定义的 Caddy：

`root@be ~ # update-alternatives --config caddy
There are 2 choices for the alternative caddy (providing /usr/bin/caddy).

  Selection    Path                    Priority   Status
------------------------------------------------------------
* 0            /usr/bin/caddy.custom    50        auto mode
  1            /usr/bin/caddy.custom    50        manual mode
  2            /usr/bin/caddy.default   10        manual mode

Press <enter> to keep the current choice[*], or type selection number:
`Copy
我们可以看到默认的 Caddy 二进制文件是我们自定义的，你可以输入 0 (按照优先级自动) 1 (手工切换自定义 Caddy) 或 2 (使用系统默认 Caddy) 来修改并切换默认的 Caddy 版本。