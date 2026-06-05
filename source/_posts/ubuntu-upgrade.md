---
title: Ubuntu 20.04 Focal 升级 Ubuntu 22.04 Jammy
date: 2022-04-21T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/ubuntu-upgrade.webp
---

本文将指导如何升级 Ubuntu 20.04 Focal 到 Ubuntu 22.04 Jammy。

# 前言

Ubuntu 22.04 Jammy Jellyfish 已正式发布，如果您使用 Ubuntu 20.04，那么可以参考本站教程升级。

# 准备工作

除非你是物理服务器，以及没有用过奇奇怪怪定制或修改的内核的 KVM 构架的 VPS 和云主机，否则升级大版本更新内核是有一定机率导致 Grub 加载失败的，切记备份重要数据！

*OpenVZ 6 和 LXC 构架的 VPS 是无法升级的，因为他们没有自己独立的内核*

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
如果内核更新了，建议重启让最新的内核生效。

# 升级系统

我们有两种方法升级到最新的系统，第一种是和 [Debian](/debian-upgrade/) 类似，手工修改 `apt` 源文件：

首先更新 `apt` 源，替换 `focal` 为 `jammy`：

`sed -i 's/focal/jammy/g' /etc/apt/sources.list
sed -i 's/focal/jammy/g' /etc/apt/sources.list.d/*.list
`Copy
默认的系统 `apt` 源文件 `/etc/apt/sources.list` 应该是类似这样的：

`# See http://help.ubuntu.com/community/UpgradeNotes for how to upgrade to
# newer versions of the distribution.
deb http://archive.ubuntu.com/ubuntu/ jammy main restricted
# deb-src http://archive.ubuntu.com/ubuntu/ jammy main restricted

# Major bug fix updates produced after the final release of the
# distribution.
deb http://archive.ubuntu.com/ubuntu/ jammy-updates main restricted
# deb-src http://archive.ubuntu.com/ubuntu/ jammy-updates main restricted

# N.B. software from this repository is ENTIRELY UNSUPPORTED by the Ubuntu
# team. Also, please note that software in universe WILL NOT receive any
# review or updates from the Ubuntu security team.
deb http://archive.ubuntu.com/ubuntu/ jammy universe
# deb-src http://archive.ubuntu.com/ubuntu/ jammy universe
deb http://archive.ubuntu.com/ubuntu/ jammy-updates universe
# deb-src http://archive.ubuntu.com/ubuntu/ jammy-updates universe

# N.B. software from this repository is ENTIRELY UNSUPPORTED by the Ubuntu
# team, and may not be under a free licence. Please satisfy yourself as to
# your rights to use the software. Also, please note that software in
# multiverse WILL NOT receive any review or updates from the Ubuntu
# security team.
deb http://archive.ubuntu.com/ubuntu/ jammy multiverse
# deb-src http://archive.ubuntu.com/ubuntu/ jammy multiverse
deb http://archive.ubuntu.com/ubuntu/ jammy-updates multiverse
# deb-src http://archive.ubuntu.com/ubuntu/ jammy-updates multiverse

# N.B. software from this repository may not have been tested as
# extensively as that contained in the main release, although it includes
# newer versions of some applications which may provide useful features.
# Also, please note that software in backports WILL NOT receive any review
# or updates from the Ubuntu security team.
deb http://archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse
# deb-src http://archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse

# Uncomment the following two lines to add software from Canonical's
# 'partner' repository.
# This software is not part of Ubuntu, but is offered by Canonical and the
# respective vendors as a service to Ubuntu users.
# deb http://archive.canonical.com/ubuntu jammy partner
# deb-src http://archive.canonical.com/ubuntu jammy partner

deb http://archive.ubuntu.com/ubuntu jammy-security main restricted
# deb-src http://archive.ubuntu.com/ubuntu jammy-security main restricted
deb http://archive.ubuntu.com/ubuntu jammy-security universe
# deb-src http://archive.ubuntu.com/ubuntu jammy-security universe
deb http://archive.ubuntu.com/ubuntu jammy-security multiverse
# deb-src http://archive.ubuntu.com/ubuntu jammy-security multiverse

`Copy
*国内服务器可以替换 `archive.ubuntu.com` 为 `mirrors.tuna.tsinghua.edu.cn`*

然后我们再次执行更新系统：

`apt update
apt upgrade -y
apt dist-upgrade -y
`Copy
*更新过程中会提示一些软件是否需要自动重启，选 Yes 即可，以及一些软件的配置文件是否需要更新，按照自己的情况选择即可，默认回车即视为使用旧的配置文件，一般会出现在 OpenSSH 等软件的更新上。*

更新后删除不必要的软件和依赖：

`apt autoclean
apt autoremove -y
`Copy
然后我们使用 `reboot` 命令重启系统，耐心等待后，查看最新的系统版本：

`root@ubuntu ~ # lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 22.04 LTS
Release:        22.04
Codename:       jammy
`Copy

```
`root@ubuntu ~ # uname -a
Linux ubuntu 5.15.0-25 #4-Ubuntu SMP Fri Apr 1 07:36:38 UTC 2022 x86_64 x86_64 x86_64 GNU/Linux
`
```
Copy
这时我们就已经更新到了最新的 Ubuntu 22.04 Jammy 和内核了。

第二种方法是使用 `do-release-upgrade` 命令

首先安装 `update-manager-core` 软件包：

`apt install update-manager-core
`Copy
然后运行 `do-release-upgrade -d` 即可更新，其他方法和上面一样，不再详细解释。

如果添加过一些 PPA 源，如果他们还未发布最新版本的软件，可以临时先取消，比如

```
`add-apt-repository --remove ppa:ondrej/php
`
```
Copy