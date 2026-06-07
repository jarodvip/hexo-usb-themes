---
title: Debian 解决 /etc/rc.local 开机启动问题
date: 2022-01-20T00:00:00.000+00:00
tags:
  - debian
cover: https://s.bh.sb/images/debian-rc-local.webp
---

本文同样适用于 Debian 9 Strech 之后的版本。

由于某些软件并没有增加开启启动的服务，很多时候需要手工添加，一般我们都是推荐使用 `systemd` 写个系统服务，但是对于一些简单的脚本或者懒人来说，添加命令到 `/etc/rc.local` 文件更方便，但是自从 Debian 9 开始，Debian 默认不带 `/etc/rc.local` 文件，而 `rc.local` 服务却还是自带的：

```bash
root@debian ~ # cat /lib/systemd/system/rc-local.service
## SPDX-License-Identifier: LGPL-2.1-or-later
#
## This file is part of systemd.
#
## systemd is free software; you can redistribute it and/or modify it
## under the terms of the GNU Lesser General Public License as published by
## the Free Software Foundation; either version 2.1 of the License, or
# (at your option) any later version.

## This unit gets pulled automatically into multi-user.target by
## systemd-rc-local-generator if /etc/rc.local is executable.
[Unit]
Description=/etc/rc.local Compatibility
Documentation=man:systemd-rc-local-generator(8)
ConditionFileIsExecutable=/etc/rc.local
After=network.target

[Service]
Type=forking
ExecStart=/etc/rc.local start
TimeoutSec=0
RemainAfterExit=yes
GuessMainPID=no
```
并且默认情况下这个服务还是关闭的状态：

```bash
root@debian ~ # systemctl status rc-local
● rc-local.service - /etc/rc.local Compatibility
     Loaded: loaded (/lib/systemd/system/rc-local.service; static)
    Drop-In: /usr/lib/systemd/system/rc-local.service.d
             └─debian.conf
     Active: inactive (dead)
       Docs: man:systemd-rc-local-generator(8)
```
为了解决这个问题，我们需要手工添加一个 `/etc/rc.local` 文件：

```bash
cat <<EOF >/etc/rc.local
# !/bin/sh -e
#
## rc.local
#
## This script is executed at the end of each multiuser runlevel.
## Make sure that the script will "exit 0" on success or any other
## value on error.
#
## In order to enable or disable this script just change the execution
## bits.
#
## By default this script does nothing.

exit 0
EOF
```
然后赋予权限：

`chmod +x /etc/rc.local`
接着启动 `rc-local` 服务：

`systemctl enable --now rc-local`
此时可能会弹出警告：

```bash
The unit files have no installation config (WantedBy=, RequiredBy=, Also=,
Alias= settings in the [Install] section, and DefaultInstance= for template
units). This means they are not meant to be enabled using systemctl.
 
Possible reasons for having this kind of units are:
• A unit may be statically enabled by being symlinked from another unit's
  .wants/ or .requires/ directory.
• A unit's purpose may be to act as a helper for some other unit which has
  a requirement dependency on it.
• A unit may be started when needed via activation (socket, path, timer,
  D-Bus, udev, scripted systemctl call, ...).
• In case of template units, the unit is meant to be enabled with some
  instance name specified.
```
无视警告，因为这个服务没有任何依赖的系统服务，只是开机启动 `/etc/rc.local` 脚本而已。

再次查看状态：

```bash
root@debian ~ # systemctl status rc-local.service 
● rc-local.service - /etc/rc.local Compatibility
     Loaded: loaded (/lib/systemd/system/rc-local.service; enabled-runtime; vendor preset: enabled)
    Drop-In: /usr/lib/systemd/system/rc-local.service.d
             └─debian.conf
     Active: active (exited) since Thu 2022-01-27 18:52:43 UTC; 10s ago
       Docs: man:systemd-rc-local-generator(8)
    Process: 541 ExecStart=/etc/rc.local start (code=exited, status=0/SUCCESS)
        CPU: 3ms

Jan 27 18:52:43 debian systemd[1]: Starting /etc/rc.local Compatibility...
Jan 27 18:52:43 debian systemd[1]: Started /etc/rc.local Compatibility.
```
然后你就可以把需要开机启动的命令添加到 `/etc/rc.local` 文件，丢在 `exit 0` 前面即可，并尝试重启以后试试是否生效了。