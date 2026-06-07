---
title: Debian 使用 apt 时 Could not get lock /var/lib/dpkg/lock-frontend 的解决方法
date: 2022-02-23T00:00:00.000+00:00
tags:
  - debian
cover: https://s.bh.sb/images/debian-apt-lock.webp
---

本文同样适合 Ubuntu 系统，请使用 root 用户进行操作。

## 问题复现

很多时候我们不挂个 `screen` 就盲目更新服务器，然后遇到断网停电等不可控因素时，`apt` 进程就会一直卡住，导致我们重新进入服务器的时候，会遇到类似以下的错误提示：

```bash
E: Could not get lock /var/lib/dpkg/lock-frontend - open (11: Resource temporarily unavailable)
E: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), is another process using it?
E: Could not get lock /var/lib/dpkg/lock-frontend - open (11: Resource temporarily unavailable)
E: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), is another process using it?
E: Could not get lock /var/cache/apt/archives/lock - open (11: Resource temporarily unavailable)
E: Unable to lock the download directory
E: Could not get lock /var/lib/dpkg/lock-frontend - open (11: Resource temporarily unavailable)
E: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), is another process using it?
```

## 解决办法一

此时我们只要使用 `kill` 命令，关闭 `apt` 进程即可，首先查找 `apt` 进程的 `pid`：

```bash
root@debian ~ # ps aux | grep -i apt
root      5016  0.1  1.2  66788 50096 ?        S    Feb18   7:25 apt-get upgrade -y
root     24835  0.0  0.0   6208   824 pts/2    S+   08:36   0:00 grep --color=auto -i apt
```
我们可以看到这台服务器上的 `apt` 进程编号为 `5016`，然后直接 `kill` 它：

`kill 5016`
接着我们就可以重新使用 `apt update` 等命令了，如果更新途中遇到类似这样的错误：

`E: dpkg was interrupted, you must manually run 'dpkg --configure -a' to correct the problem.`
那么直接按照提示运行 `dpkg --configure -a` 即可

## 解决方法二

还有个比较暴力的解决方法，直接删除这几个文件

```bash
rm /var/lib/dpkg/lock-frontend
rm /var/lib/dpkg/lock
rm /var/cache/apt/archives/lock
```
然后重新运行 `apt update` 即可，但是如果万一有其他程序的进程也在操作 `apt` 缓存，那么这个方法可能会无效，请自行承担风险。