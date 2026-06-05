---
title: Debian 使用 extrepo 配置第三方软件源
date: 2025-10-20T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/debian-extrepo.webp
---

本文将指导如何在 Debian 下使用 extrepo 配置第三方软件源。

# 什么是 extrepo？

[extrepo](https://packages.debian.org/stable/extrepo) 用于管理 Debian 中的外部软件源。

在没有 extrepo 之前，想要使用未被 Debian 官方打包的软件，用户通常需要手动编写 APT 配置文件、以 root 身份运行未经签名的脚本，或安装一个包含所有系统配置的未签名 `.deb` 包。

遗憾的是，这些方法都不是很安全。

打个比方，我们要添加 Docker 的软件源，有三种方式。

第一种是传统的 `One-Line Style`：

`curl -sSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor > /usr/share/keyrings/docker-ce.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-ce.gpg] https://download.docker.com/linux/debian $(lsb_release -sc) stable" | sudo bash -c 'cat > /etc/apt/sources.list.d/docker-ce.list'

sudo apt update
sudo install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
`Copy
第二种是新的 `DEB822` 格式：

`curl -sSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor > /usr/share/keyrings/docker-ce.gpg

sudo bash -c 'cat > /etc/apt/sources.list.d/docker-ce.sources << EOF
Components: stable
Architectures: $(dpkg --print-architecture)
Suites: $(lsb_release -cs)
Types: deb
Uris: https://download.docker.com/linux/debian
Signed-By: /usr/share/keyrings/docker-ce.gpg
EOF'

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
`Copy
第三种方法则更为简单粗暴，直接运行脚本：

`curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
`Copy
在以上这些方法中（包括第三种脚本方式），我们都需要手动下载并导入 GPG 密钥，创建必要的 APT 配置文件，更新软件列表，然后再安装软件。而我们推荐使用 extrepo 的话，只需要简单的三个命令即可完成整个过程。

# 安装并使用 extrepo

Debian Stable 下直接用如下命令安装 extrepo 即可：

`sudo apt update
sudo apt install extrepo -y
`Copy
接着我们就可以启用比如 Docker CE 的仓库源：

`sudo extrepo enable docker-ce
`Copy
然后更新系统并安装 Docker：

`sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
`Copy
此时我们会发现在 `/etc/apt/sources.list.d` 目录中多了一个 `extrepo_docker-ce.sources` 文件：

`# cat /etc/apt/sources.list.d/extrepo_docker-ce.sources 
Suites: trixie
Types: deb
Uris: https://download.docker.com/linux/debian
Components: stable
Architectures: amd64 arm64 armhf s390x ppc64el
Signed-By: /var/lib/extrepo/keys/docker-ce.asc
`Copy
换句话说，extrepo 帮我们完成了以下工作：

- 抓取经过验证的 GPG Key

- 使用 DEB822 格式写入 APT 配置

对比之前的几种方法，你可能还需要满大街找配置命令，找脚本命令，现在只要敲几行命令就可以搞定，何乐而不为呢？

# External Repository Metadata

看到这里读者可能有疑问，extrepo 的数据又是谁维护的呢？它是由 [Debian External Repositories Team](https://salsa.debian.org/extrepo-team) 维护，成员主要为志愿者（包括本文作者），数据本身也有个仓库叫做 [extrepo-data](https://salsa.debian.org/extrepo-team/extrepo-data)。

我个人维护了一些仓库，包括 [Redis](https://salsa.debian.org/extrepo-team/extrepo-data/-/commits/master/repos/debian/redis.yaml?ref_type=heads)，[MariaDB](https://salsa.debian.org/extrepo-team/extrepo-data/-/commits/master/repos/debian/mariadb.yaml?ref_type=heads)，[N.WTF](https://salsa.debian.org/extrepo-team/extrepo-data/-/commits/master/repos/debian/n.wtf.yaml?ref_type=heads) 等，你可以从这里看到我的 [commits](https://salsa.debian.org/showfom/extrepo-data/-/commits/master?author=Xiufeng+Guo)。

任何人都可以对这个 Git 仓库做出贡献，而且 YAML 语法也十分容易上手，你可以参考默认的[模板文件](https://salsa.debian.org/extrepo-team/extrepo-data/-/blob/master/template.yaml?ref_type=heads)。

需要查看完整的第三方软件源列表的话，你可以在[这里](https://salsa.debian.org/extrepo-team/extrepo-data/-/tree/master/repos/debian?ref_type=heads)浏览所有的第三方仓库的 `.yaml` 文件。

了解了 extrepo 的机制和优势后，我们再来总结一下。

# 结论

总之，使用 extrepo 是一种既安全又方便的添加第三方软件源的方法。

它的主要优点在于：

- 可以让你快速启用经过测试和验证的软件源，而无需手动搜索和复制第三方软件源的配置信息。

- 当第三方仓库的 GPG 密钥过期或 URI 发生变化（这种情况相当常见）时，也不再需要手动更新。

比如，使用 extrepo 时，只需运行 `extrepo enable docker-ce` 和 `extrepo update docker-ce`，它就会自动刷新 Docker CE 仓库的 GPG 密钥和 URI。

不过，extrepo 也有一定的缺点：

- 目前只兼容 Debian 系统，Ubuntu 因为没有人维护 extrepo-data 所以基本没有可以用的第三方软件源。

- 默认的 [extrepo-data](https://extrepo-team.pages.debian.net/extrepo-data/) 托管在 Debian 官方的 GitLab Pages，这对一些网络不通畅的服务器来说获取仓库信息就有点困难，而自建 extrepo-data 的过程相对繁琐，并不算方便。

![That will save a lot of time](https://s.bh.sb/2025/10/20/that-will-save-lots-of-time-alicia-rodriguez_BhSQa.gif)

[English Version](https://be.st/MIQr)