---
title: Linux 下 Bash 脚本 bad interpreter 报错的解决方法
date: 2022-03-17T00:00:00.000+00:00
tags:
  - linux
cover: https://s.bh.sb/images/linux-bash-bad-interpreter.webp
---

本文理论上适合所有 Linux 操作系统。

## 问题复现

有时候为了图方便，我们会直接在本机 `git clone` 一个 Github 的私有仓库，然后再使用 `lrzsz` 或 `sftp` 上传到服务器上，此时如果你本机是 Windows 系统，服务器是 Linux 系统，那么 `git clone` 下来的脚本文件编码就自动给你换成 Windows 的 `CRLF`，然后在 Linux 服务器上执行脚本时，会报错

`/bin/bash^M: bad interpreter: No such file or directory`

## 解决方法一

使用 `VS Code` 或者其他类似的软件，打开脚本手工转换编码为 `UNIX (LF)`，一般情况下你可以在编辑器的右下角找到：

![image.png](https://s.bh.sb/uploads/2022/03/17/qvFdgsTJ8b7KOzU.png)

然后换成 LF 并保存：

![image.png](https://s.bh.sb/uploads/2022/03/17/agMbVZKXU3dLTqf.png)

再重新上传即可。

## 解决方法二

直接在 Linux 终端下运行：

`sed -i -e 's/\r$//' 脚本文件名`
好了，就完事了 = =