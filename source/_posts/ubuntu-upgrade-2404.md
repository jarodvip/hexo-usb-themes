---
title: Ubuntu 22.04 Jammy 升级 Ubuntu 24.04 Noble
date: 2024-06-21T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/ubuntu-upgrade-2404.webp
---

本文将指导如何升级 Ubuntu 22.04 Jammy Jellyfish 到 Ubuntu 24.04 Noble Numbat。

相关教程：[Ubuntu 20.04 Focal Fossa 升级 Ubuntu 22.04 Jammy Jellyfish](/ubuntu-upgrade/)。

# 准备工作

除非你是物理服务器，以及没有用过奇奇怪怪定制或修改的内核的 KVM 构架的 VPS 和云主机，否则升级大版本更新内核是有一定机率导致 Grub 加载失败的，切记备份重要数据！

*OpenVZ 和 LXC 构架的 VPS 是无法升级的，因为他们没有自己独立的内核*

再强调一遍，一定要备份重要数据！

以下操作需要在 root 用户下完成，请使用 `sudo -i` 或 `su root` 切换到 root 用户进行操作

# 更新系统

首先需要更新你当前的系统

`apt update
apt upgrade -y
apt dist-upgrade -y
apt autoclean
apt autoremove -y
`Copy
如果内核更新了，可以重启让最新的内核生效，也可以直接进行升级。

# 升级系统

这里有两种升级系统的方法，第一种是使用 `do-release-upgrade` 命令，第二种是手动更新 `apt` 源文件。

## 方法一：使用 `do-release-upgrade` 命令

首先需要安装 `ubuntu-release-upgrader-core` 包：

`apt install ubuntu-release-upgrader-core
`Copy
然后修改 `/etc/update-manager/release-upgrades` 文件，确保 `Prompt` 值为 `lts`：

`cat /etc/update-manager/release-upgrades | grep lts
`Copy
显示如下内容即可：

`root@ubuntu ~ # cat /etc/update-manager/release-upgrades | grep lts
# lts    - Check to see if a new LTS release is available.  The upgrader
Prompt=lts
`Copy
最后执行以下命令升级系统：

`do-release-upgrade -d
`Copy

## 方法二：手动更新 `apt` 源文件

首先更新 `apt` 源，替换 `jammy` 为 `noble`：

`sed -i 's/jammy/noble/g' /etc/apt/sources.list
sed -i 's/jammy/noble/g' /etc/apt/sources.list.d/*.list
`Copy
系统 `apt` 源文件 `/etc/apt/sources.list` 应该是类似这样的：

`deb https://archive.ubuntu.com/ubuntu/ noble main restricted universe multiverse

deb https://archive.ubuntu.com/ubuntu/ noble-updates main restricted universe multiverse

deb https://archive.ubuntu.com/ubuntu/ noble-backports main restricted universe multiverse

deb http://security.ubuntu.com/ubuntu/ noble-security main restricted universe multiverse
`Copy
由于在 Ubuntu 24.04 之前，Ubuntu 的软件源配置文件使用传统的 One-Line-Style，路径为 `/etc/apt/sources.list`；从 Ubuntu 24.04 开始，Ubuntu 的软件源配置文件变更为 `DEB822` 格式，路径为 `/etc/apt/sources.list.d/ubuntu.sources`（[参考](https://mirrors.help/ubuntu/)），所以使用 `DEB822` 格式的源文件 `/etc/apt/sources.list.d/ubuntu.sources`：

`Types: deb
URIs: https://archive.ubuntu.com/ubuntu
Suites: noble noble-updates noble-backports
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb
URIs: http://security.ubuntu.com/ubuntu
Suites: noble-security
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
`Copy
*国内服务器可以替换 `archive.ubuntu.com` 和 `security.ubuntu.com` 为 `mirrors.tuna.tsinghua.edu.cn`*

然后我们再次执行更新系统：

`apt update
apt upgrade -y
apt full-upgrade -y
`Copy
*更新过程中会提示一些软件是否需要自动重启，选 Yes 即可，以及一些软件的配置文件是否需要更新，按照自己的情况选择即可，默认回车即视为使用旧的配置文件，一般会出现在 OpenSSH 等软件的更新上。*

更新后删除不必要的软件和依赖：

`apt autoclean
apt autoremove -y
`Copy
然后我们使用 `reboot` 命令重启系统，耐心等待后，查看最新的系统版本：

`root@ubuntu ~ # lsb_release -a
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 24.04 LTS
Release:	24.04
Codename:	noble
`Copy

```
`root@ubuntu ~ # uname -a
Linux ubuntu 6.8.0-35-generic #35-Ubuntu SMP PREEMPT_DYNAMIC Mon May 20 15:51:52 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux
`
```
Copy
这时我们就已经更新到了最新的 Ubuntu 24.04 Noble 和内核了。