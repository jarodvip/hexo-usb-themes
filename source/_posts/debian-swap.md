---
title: Debian / Ubuntu 手工添加 Swap 分区
date: 2022-12-21T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/debian-swap.webp
---

本文将指导如何在 Debian 11 和 Ubuntu 22.04 下手工添加 Swap 分区。

# 准备工作

首先，检查你的系统是否已经有 Swap 分区：

`swapon -s
`Copy
或

`free -m
`Copy
如果没有返回结果或者 `free -m` 中 `Swap` 一列数值是 `0`，则表示你的系统没有 Swap 分区。

# 创建 SWAP 分区

我们可以使用 `fallocate` 命令创建一个 1GB 大小的 Swap 分区：

`fallocate -l 1G /swapfile
`Copy
如果这个命令无法使用，请安装 `util-linux` 包：

`apt install util-linux
`Copy
然后设置这个文件的权限：

`chmod 600 /swapfile
`Copy
然后激活 SWAP 分区

`mkswap /swapfile
swapon /swapfile
`Copy
此时，你可以使用 `swapon -s` 或 `free -m` 命令查看 Swap 分区是否已经激活。

# 设置开机自启

我们需要编辑 `/etc/fstab` 这个文件，加入下面的内容即可：

`echo "/swapfile swap swap defaults 0 0" >> /etc/fstab
`Copy
大功告成，使用 `free -m` 命令查看 Swap 分区是否正确：

![Debian / Ubuntu 手工添加 Swap 分区](https://s.bh.sb/img/2022/12/1097a4.png)

# 调整系统内核 Swappiness 值

Swapiness 是 Linux 内核的一个属性，定义了系统使用交换空间的频率，Swapiness 的值在 0 到 100 之间 (默认是 60)，一个低的值会使内核尽可能地避免交换，而一个高的值会使内核更积极地使用交换空间。

这个值默认是 `60`，我们可以使用 `cat /proc/sys/vm/swappiness` 命令查看当前值。

一般我们可以给他改成 `10`：

`echo "vm.swappiness=10" >> /etc/sysctl.conf
`Copy
然后使用 `sysctl -p` 命令使其生效。

# 关闭 Swap

有时候我们需要关闭 Swap 分区，可以使用下面的命令：

首先，停用 Swap 分区：

`swapoff -v /swapfile
`Copy
然后检查 `/etc/fstab`，删除 `/swapfile swap swap defaults 0 0` 这一行。

最后删除 `/swapfile` 这个文件：

```
`rm /swapfile
`
```
Copy