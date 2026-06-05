---
title: Debian 12 Bookworm 升级 Debian 13 Trixie
date: 2025-08-05T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/debian-upgrade-13.webp
---

本文将指导如何升级 Debian 12 Bookworm 到 Debian 13 Trixie。

相关教程：[Debian 11 Bullseye 升级 Debian 12 Bookworm](/debian-upgrade-12/)。

# 准备工作

除非你是物理服务器，以及没有用过奇奇怪怪定制或修改的内核的 KVM 构架的 VPS 和云主机，否则升级大版本更新内核是有一定机率导致 Grub 加载失败的，切记备份重要数据！

*OpenVZ 6 和 LXC 构架的 VPS 是无法升级的，因为他们没有自己独立的内核*

再强调一遍，一定要备份重要数据！

以下操作需要在 root 用户下完成，请使用 `sudo -i` 或 `su root` 切换到 root 用户进行操作

# 更新系统

首先需要更新你当前的系统

`apt update
apt upgrade -y
apt full-upgrade -y
apt autoclean
apt autoremove -y
`Copy
如果内核更新了，可以重启让最新的内核生效，也可以直接进行升级。

# 升级系统

首先更新 `apt` 源，替换 `bookworm` 为 `trixie`：

`sed -i 's/bookworm/trixie/g' /etc/apt/sources.list
sed -i 's/bookworm/trixie/g' /etc/apt/sources.list.d/*.list
sed -i 's/bookworm/trixie/g' /etc/apt/sources.list.d/*.sources
`Copy
如果没有对应文件会提示诸如 `sed: can't read /etc/apt/sources.list.d/*.sources: No such file or directory` 的错误，忽略即可。

或者直接一行命令：

`sed -i 's/bookworm/trixie/g' /etc/apt/sources.list /etc/apt/sources.list.d/*.{list,sources} 2>/dev/null
`Copy
修改完成后你的 `/etc/apt/sources.list` 文件内容应该类似如下：

`deb https://deb.debian.org/debian trixie main contrib non-free non-free-firmware

deb https://security.debian.org/debian-security trixie-security main contrib non-free non-free-firmware

deb https://deb.debian.org/debian trixie-updates main contrib non-free non-free-firmware
`Copy
大部分旧的安装的 Debian 的软件源配置文件使用传统的 One-Line-Style，路径为 `/etc/apt/sources.list`；但是从 Debian 12 的容器版本开始，以及 Debian 13 正式版后，其软件源配置文件变更为 `DEB822` 格式，路径为 `/etc/apt/sources.list.d/debian.sources`:（[参考](https://mirrors.help/debian/)）

`Types: deb
URIs: https://deb.debian.org/debian
Suites: trixie trixie-updates trixie-backports
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

Types: deb
URIs: https://security.debian.org/debian-security
Suites: trixie-security
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
`Copy
如果使用 `DEB822` 格式，则你可以安全地删除 `/etc/apt/sources.list` 文件，只保留 `/etc/apt/sources.list.d/debian.sources` 即可。

*国内服务器可以替换 `deb.debian.org` 和 `security.debian.org` 为 `mirrors.tuna.tsinghua.edu.cn`*

然后我们再次执行更新系统：

`apt update
apt upgrade -y
apt full-upgrade -y
`Copy
*更新过程中，Debian 13 早期版本可能会提示你是否自动更换为软件源配置文件为 `DEB822` 格式，如果需要的话可以使用 `apt modernize-sources` 命令来自动转换，或者自行重写 sources 文件。如果使用命令转换，请自行重写 backports 仓库，目前的转换会有 bug 漏掉这个仓库的 GPG Key。*

推荐更换成更科学的 `DEB822` 格式哦~

*如果 apt 命令最后没有带 `-y` 自动同意参数的话，更新过程中还会提示一些软件的更新列表，是否需要自动重启等，选 `Yes` 即可，以及一些软件的配置文件是否需要更新，按照自己的情况选择即可，默认回车即视为使用旧的配置文件，一般会出现在 `OpenSSH` 等软件的更新上。*

在 `apt-listchanges: News` 界面可以按 `q` 退出：

![image.png](https://s.bh.sb/2025/08/05/image_S2xQK.png)

提示是否自动重启服务：

![image.png](https://s.bh.sb/2025/08/05/image_CeXju.png)

提示是否更新配置文件：

![image.png](https://s.bh.sb/2025/08/05/image_v7Yk2.png)

注意某些软件更新后可能会更新 `systemd` 服务配置，此时我们可以执行 `systemctl daemon-reload` 重新加载配置。

更新后删除不必要的软件和依赖：

`apt autoclean
apt autoremove -y
`Copy
然后我们使用 `reboot` 命令重启系统，耐心等待后，查看最新的系统版本：

`root@debian ~ # cat /etc/debian_version 
13.0
`Copy

```
`root@debian ~ # lsb_release -a
No LSB modules are available.
Distributor ID:	Debian
Description:	Debian GNU/Linux 13 (trixie)
Release:	13
Codename:	trixie
`
```
Copy

```
`root@debian ~ # uname -a
Linux upload 6.12.38+deb13-cloud-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.12.38-1 (2025-07-16) x86_64 GNU/Linux
`
```
Copy
这时我们就已经更新到了最新的 Debian 13 Trixie 和内核了。