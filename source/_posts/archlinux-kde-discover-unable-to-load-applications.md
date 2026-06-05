---
title: Arch Linux 下解决 KDE Plasma Discover 的 Unable to load applications 错误
date: 2022-04-23T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/archlinux-kde-discover-unable-to-load-applications.webp
---

本文将指导在 Arch Linux 下解决 KDE Plasma Discover 的 unable to load applications 错误。

# 前言

使用 Arch Linux [安装](https://wiki.archlinux.org/title/KDE#Installation) [KDE Plasma](https://kde.org/plasma-desktop/) 桌面以后，KDE 的软件管理器 [Discover](https://apps.kde.org/discover/) 一打开就提示 `Unable to load applications` 错误：

![image.png](https://s.bh.sb/uploads/2022/04/24/Nqp1DUFzndbhQi4.png)

其他所有设置也无法使用：

![image.png](https://s.bh.sb/uploads/2022/04/24/4uXRZo2mISgr5VJ.png)

# 解决方法

参考[这个帖子](https://bbs.archlinux.org/viewtopic.php?id=250224)，直接安装 `packagekit-qt5` 包即可解决：

`sudo pacman -S packagekit-qt5
`Copy
重新打开 Discover，一切问题解决：

![image.png](https://s.bh.sb/uploads/2022/04/24/H2R4m9CjwU3YFNI.png)