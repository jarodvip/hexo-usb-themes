---
title: Debian 10 Buster 升级 Debian 11 Bullseye
date: 2022-02-04T00:00:00.000+00:00
tags:
  - debian
cover: https://s.bh.sb/images/debian-upgrade.webp
---

本文将指导如何升级 Debian 10 Buster 到 Debian 11 Bullseye。

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

首先更新 `apt` 源，替换 `buster` 为 `bullseye`：

```bash
sed -i 's/buster\/updates/bullseye-security/g;s/buster/bullseye/g' /etc/apt/sources.list
sed -i 's/buster/bullseye/g' /etc/apt/sources.list.d/*.list
sed -i 's/buster/bullseye/g' /etc/apt/sources.list.d/*.sources
```
如果是 Debian 9 更新到 Debian 10：

```bash
sed -i 's/stretch/buster/g' /etc/apt/sources.list
sed -i 's/stretch/buster/g' /etc/apt/sources.list.d/*.list
sed -i 's/stretch/buster/g' /etc/apt/sources.list.d/*.sources
```
默认的系统 `apt` 源文件 `/etc/apt/sources.list` 应该是类似这样的：

```bash
deb http://deb.debian.org/debian bullseye main contrib non-free

deb http://security.debian.org/debian-security bullseye-security main contrib non-free

deb http://deb.debian.org/debian bullseye-updates main contrib non-free
```
*国内服务器可以替换 `deb.debian.org` 和 `security.debian.org` 为 `mirrors.tuna.tsinghua.edu.cn`*

然后我们再次执行更新系统：

```bash
apt update
apt upgrade -y
apt dist-upgrade -y
```
*更新过程中会提示一些软件是否需要自动重启，选 Yes 即可，以及一些软件的配置文件是否需要更新，按照自己的情况选择即可，默认回车即视为使用旧的配置文件，一般会出现在 OpenSSH 等软件的更新上。*

提示是否自动重启服务：

![image.png](https://s.bh.sb/uploads/2022/02/23/I4HLZUVTXEprlJc.png)

提示是否更新软件配置文件：

![image.png](https://s.bh.sb/uploads/2022/02/07/fDp3dYmhjUNinab.png)

提示是否更新 OpenSSH 配置文件：

![image.png](https://s.bh.sb/uploads/2022/02/23/PEaHhV4qswbzZWL.png)

注意某些软件，比如 Mariadb 更新后可能会更新 `systemd` 服务配置，此时我们需要执行 `systemctl daemon-reload` 重新加载配置：

![image.png](https://s.bh.sb/uploads/2022/02/23/jtKIF758Xb2lo4S.png)

更新后删除不必要的软件和依赖：

```bash
apt autoclean
apt autoremove -y
```
然后我们使用 `reboot` 命令重启系统，耐心等待后，查看最新的系统版本：

```bash
root@debian ~ # cat /etc/debian_version 
11.2
```

```
```
`root@debian ~ # lsb_release -a
No LSB modules are available.
Distributor ID:	Debian
Description:	Debian GNU/Linux 11 (bullseye)
Release:	11
Codename:	bullseye
`
```
```
Copy

```
```
`root@debian ~ # uname -a
Linux server 5.10.0-11-amd64 #1 SMP Debian 5.10.92-1 (2022-01-18) x86_64 GNU/Linux
`
```
```
Copy
这时我们就已经更新到了最新的 Debian 11 Bullseye 和内核了。