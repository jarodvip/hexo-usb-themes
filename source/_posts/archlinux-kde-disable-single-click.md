---
title: KDE Plasma 关闭单击打开文件或文件夹
date: 2022-07-01T00:00:00.000+00:00
tags:
  - arch linux
  - kde
cover: https://s.bh.sb/images/archlinux-kde-disable-single-click.webp
---

本文将指导在 KDE Plasma 下关闭单击打开文件或文件夹。

## 前言

对于从 Windows 或 macOS 迁移到 Linux 的用户，需要花费很多时间来适应各种不习惯的操作，在 [KDE Plasma](https://kde.org/plasma-desktop/) 下，有一个默认设置，单击即可打开某个文件或者文件夹，这让很多用户感到非常不适应。

## 解决方法

参考[这个帖子](https://forum.kde.org/viewtopic.php?t=128669)，打开 `System Settings` -> `Workspace Behavior` -> `General Behavior`，然后找到 `Clicking files or folders`，把默认的 `Opens them` 改成 `Selects them`：

![KDE Plasma 关闭单击打开文件](https://s.bh.sb/uploads/2022/07/02/nRCidrQz7qZNEPT.png)

好了，解决了这个非常不习惯的操作。