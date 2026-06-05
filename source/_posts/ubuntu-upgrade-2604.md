---
title: Ubuntu 24.04 Noble 升级 Ubuntu 26.04 Resolute
date: 2026-05-19T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/ubuntu-upgrade-2604.webp
---

本文将指导如何升级 Ubuntu 24.04 Noble Numbat 到 Ubuntu 26.04 Resolute Raccoon。

相关教程：[Ubuntu 22.04 Jammy 升级 Ubuntu 24.04 Noble](/ubuntu-upgrade-2404/)。

# 准备工作

除非你是物理服务器，以及没有用过奇奇怪怪定制或修改的内核的 KVM 构架的 VPS 和云主机，否则升级大版本更新内核是有一定机率导致 Grub 加载失败的，切记备份重要数据！

*OpenVZ 和 LXC 构架的 VPS 是无法升级的，因为他们没有自己独立的内核*

再强调一遍，一定要备份重要数据！

Ubuntu 26.04 LTS 已经正式发布，不过 Ubuntu LTS 版本的自动升级提示通常会等到第一个小版本发布后才会开放。如果你在 Ubuntu 26.04.1 LTS 发布前从 Ubuntu 24.04 LTS 升级，`do-release-upgrade` 需要加上 `-d` 参数。

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
等 Ubuntu 26.04.1 LTS 发布并开放 LTS 自动升级后，可以直接使用：

`do-release-upgrade
`Copy

## 方法二：手动更新 `apt` 源文件

Ubuntu 24.04 的默认软件源配置文件已经变更为 `DEB822` 格式，路径为 `/etc/apt/sources.list.d/ubuntu.sources`。我们可以直接替换 `noble` 为 `resolute`：

`sed -i 's/noble/resolute/g' /etc/apt/sources.list.d/ubuntu.sources
`Copy
如果你的系统里仍然有传统 One-Line-Style 的源文件，也可以一并替换：

`sed -i 's/noble/resolute/g' /etc/apt/sources.list
sed -i 's/noble/resolute/g' /etc/apt/sources.list.d/*.list
`Copy
如果没有对应文件会提示诸如 `sed: can't read /etc/apt/sources.list: No such file or directory` 的错误，忽略即可。

或者直接一行命令：

`sed -i 's/noble/resolute/g' /etc/apt/sources.list /etc/apt/sources.list.d/*.{list,sources} 2>/dev/null
`Copy
使用 `DEB822` 格式的源文件 `/etc/apt/sources.list.d/ubuntu.sources` 应该是类似这样的：

`Types: deb
URIs: https://archive.ubuntu.com/ubuntu
Suites: resolute resolute-updates resolute-backports
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb
URIs: http://security.ubuntu.com/ubuntu
Suites: resolute-security
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
`Copy
*国内服务器可以替换 `archive.ubuntu.com` 和 `security.ubuntu.com` 为 `mirrors.tuna.tsinghua.edu.cn`*

如果你有第三方源或 PPA，建议先备份并根据情况临时禁用，升级完成后再确认是否支持 Ubuntu 26.04：

`mkdir -p /root/apt-sources-backup
cp -a /etc/apt/sources.list.d /root/apt-sources-backup/
`Copy
第三方源通常需要单独检查，不能简单把 `noble` 替换成 `resolute`。

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
Description:	Ubuntu 26.04 LTS
Release:	26.04
Codename:	resolute
`Copy

```
`root@ubuntu ~ # uname -a
Linux Nana 7.0.0-15-generic #15-Ubuntu SMP PREEMPT_DYNAMIC Wed Apr 22 16:06:43 UTC 2026 x86_64 GNU/Linux
`
```
Copy
这时我们就已经更新到了最新的 Ubuntu 26.04 Resolute 和内核了。