---
title: Debian 11 Bullseye 升级 Debian 12 Bookworm
date: 2023-06-09T00:00:00.000+00:00
tags:
  - debian
cover: https://s.bh.sb/images/debian-upgrade-12.webp
---

本文将指导如何升级 Debian 11 Bullseye 到 Debian 12 Bookworm。

相关教程：[Debian 10 Buster 升级 Debian 11 Bullseye](/debian-upgrade/)。

## 准备工作

除非你是物理服务器，以及没有用过奇奇怪怪定制或修改的内核的 KVM 构架的 VPS 和云主机，否则升级大版本更新内核是有一定机率导致 Grub 加载失败的，切记备份重要数据！

*OpenVZ 6 和 LXC 构架的 VPS 是无法升级的，因为他们没有自己独立的内核*

再强调一遍，一定要备份重要数据！

以下操作需要在 root 用户下完成，请使用 `sudo -i` 或 `su root` 切换到 root 用户进行操作

## 更新系统

首先需要更新你当前的系统

```bash
apt update
apt upgrade -y
apt dist-upgrade -y
apt autoclean
apt autoremove -y
```
如果内核更新了，可以重启让最新的内核生效，也可以直接进行升级。

## 升级系统

首先更新 `apt` 源，替换 `bullseye` 为 `bookworm`：

```bash
sed -i 's/bullseye/bookworm/g' /etc/apt/sources.list
sed -i 's/bullseye/bookworm/g' /etc/apt/sources.list.d/*.list
sed -i 's/bullseye/bookworm/g' /etc/apt/sources.list.d/*.sources
```
对于 Debian 12 以后的版本，所有 Debian 可以分发的打包的非自由固件二进制文件 (non-free)，比如某些驱动，都被转移到 Debian Archive 中的一个新组件，称为非自由固件 (non-free-firmware)。如果您从旧版的 Debian 升级，并且需要这些固件二进制文件，您应该更新您系统上的 `/etc/apt/sources.list`，以使用这个新组件 ([来源](https://wiki.debian.org/Firmware#Debian_12_.28bookworm.29_and_later))：

`sed -i 's/non-free/non-free non-free-firmware/g' /etc/apt/sources.list`
默认的系统 `apt` 源文件 `/etc/apt/sources.list` 应该是类似这样的：

```bash
deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware

deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware

deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
```
大部分 Debian 的软件源配置文件使用传统的 One-Line-Style，路径为 `/etc/apt/sources.list`；但是对于容器镜像，从 Debian 12 开始，其软件源配置文件变更为 `DEB822` 格式，路径为 `/etc/apt/sources.list.d/debian.sources`:（[参考](https://mirrors.help/debian/)）

```bash
Types: deb
URIs: https://deb.debian.org/debian
Suites: bookworm bookworm-updates bookworm-backports
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

Types: deb
URIs: http://security.debian.org/debian-security
Suites: bookworm-security
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
```
*国内服务器可以替换 `deb.debian.org` 和 `security.debian.org` 为 `mirrors.tuna.tsinghua.edu.cn`*

然后我们再次执行更新系统：

```bash
apt update
apt upgrade -y
apt dist-upgrade -y
```
*更新过程中会提示一些软件是否需要自动重启，选 Yes 即可，以及一些软件的配置文件是否需要更新，按照自己的情况选择即可，默认回车即视为使用旧的配置文件，一般会出现在 OpenSSH 等软件的更新上。*

在 `apt-listchanges: News` 界面可以按 `q` 退出：

![image.png](https://s.bh.sb/uploads/2023/06/10/6zkX4boedhWO9nR.png)

提示是否自动重启服务：

![image.png](https://s.bh.sb/uploads/2023/06/10/gtoa1WO57ST24ui.png)

提示是否更新 OpenSSH 配置文件：

![image.png](https://s.bh.sb/uploads/2023/06/10/l4fe7Y9VckH8iBz.png)

注意某些软件更新后可能会更新 `systemd` 服务配置，此时我们可以执行 `systemctl daemon-reload` 重新加载配置。

如果升级的时候遇到了如下错误：

```bash
Setting up dbus-daemon (1.14.6-1) ...
UUID file '/var/lib/dbus/machine-id' should contain a hex string of length 32, not length 0, with no other text
dpkg: error processing package dbus-daemon (--configure):
 installed dbus-daemon package post-installation script subprocess returned error exit status 1
dpkg: dependency problems prevent configuration of dbus:
 dbus depends on dbus-daemon (= 1.14.6-1); however:
  Package dbus-daemon is not configured yet.

dpkg: error processing package dbus (--configure):
 dependency problems - leaving unconfigured
Processing triggers for libc-bin (2.36-9) ...
Errors were encountered while processing:
 dbus-daemon
 dbus
E: Sub-process /usr/bin/dpkg returned an error code (1)
```
删除 `/var/lib/dbus/machine-id` 这个空文件后重新执行命令即可，升级 `dbus` 时会自动生成这个文件。

`rm -rf /var/lib/dbus/machine-id`
更新后删除不必要的软件和依赖：

```bash
apt autoclean
apt autoremove -y
```
然后我们使用 `reboot` 命令重启系统，耐心等待后，查看最新的系统版本：

```bash
root@debian ~ # cat /etc/debian_version 
12.5
```

```
```
`root@debian ~ # lsb_release -a
No LSB modules are available.
Distributor ID:	Debian
Description:	Debian GNU/Linux 12 (bookworm)
Release:	12
Codename:	bookworm
`
```
```
Copy

```
```
`root@debian ~ # uname -a
Linux debian 6.1.0-21-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.90-1 (2024-05-03) x86_64 GNU/Linux
`
```
```
Copy
这时我们就已经更新到了最新的 Debian 12 Bookworm 和内核了。