---
title: Debian / Ubuntu 使用 parted 转换硬盘为 GPT 并挂载分区教程
date: 2022-03-16T00:00:00.000+00:00
tags:
  - debian
cover: https://s.bh.sb/images/debian-parted-gpt.webp
---

本文将指导如何在 Debian 和 Ubuntu 下使用 parted 转换硬盘为 GPT 并分区挂载。

## 为什么使用 GPT 格式？

有时候我们会在 VPS 或服务器上挂载一块大于 2 TiB 的硬盘，默认的 `MBR` 格式是无法使用超过 2 TiB 的硬盘的，所以我们需要转换为 `GPT` 格式。

使用 `fdisk -l` 命令可以看到这个硬盘已经安装，但是没有任何分区：

![image.png](https://s.bh.sb/uploads/2022/03/16/wMSV6ndxKL3PFqO.png)

对应的硬盘符是 `/dev/vdb`，有些机器可能是 `/dev/sdb`，请注意自行更换盘符。

## 使用 parted 转换硬盘为 GPT 格式

然后我们安装 `parted`：

`apt install parted -y`
接着我们转换 `/dev/vdb` 为 GPT 格式，首先使用 `parted /dev/vdb` 命令选择硬盘，然后输入 `mklabel gpt`，回车确认后就转换完成了，此时可以用 `print` 命令查看这个硬盘是否已经是 GPT 格式：

![image.png](https://s.bh.sb/uploads/2022/03/16/HovRTe7buLaNmg5.png)

按下 `ctrl + c` 退出后

也可以使用 `fdisk -l` 命令查看硬盘已经是 GPT 格式：

![image.png](https://s.bh.sb/uploads/2022/03/16/qEUovS9AHT2rzV4.png)

## 使用 fdisk 进行分区挂载

然后我们就可以使用 `fdisk` 命令来挂载硬盘，首先进入硬盘：

`fdisk /dev/vdb`
输入 `n` 新建分区，没有特殊需求就都回车选默认，然后再输入 `w` 保存并退出：

![image.png](https://s.bh.sb/uploads/2022/03/16/ljWVDm3Gbnt75kw.png)

此时我们通过 `fdisk -l` 命令即可看到已经多出一个 `/dev/vdb1` 的硬盘设备：

![image.png](https://s.bh.sb/uploads/2022/03/16/zvrYFtf2TWUu8cB.png)

然后我们分区成 `ext4` 格式：

`mkfs -t ext4 /dev/vdb1`
![image.png](https://s.bh.sb/uploads/2022/03/16/FiYne9R6CLo8l1s.png)

接着把他挂载到 /mnt 目录：

`mount /dev/vdb1 /mnt`
设置开机自启：

`echo "/dev/vdb1 /mnt ext4 defaults 1 2" >> /etc/fstab`
大功告成，使用 `df -hT` 命令查看挂载和格式是否正确：

![image.png](https://s.bh.sb/uploads/2022/03/16/FybJD1PCgc9sQx3.png)

记得检查下重启后是否生效哦