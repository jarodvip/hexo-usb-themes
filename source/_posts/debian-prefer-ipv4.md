---
title: Debian 双栈网络时开启 IPv4 优先
date: 2025-11-04T00:00:00.000+00:00
tags:
  - debian
cover: https://s.bh.sb/images/debian-prefer-ipv4.webp
---

本文原理适用于大多数 Linux 系统，其他系统尚未测试，请读者自行验证。

## 背景介绍

双协议栈技术就是指在一台设备上同时启用 IPv4 协议栈和 IPv6 协议栈，这样就可以同时使用 IPv4 和 IPv6 的网络。

现代操作系统和浏览器通常会优先使用 IPv6，只有当 IPv6 无法访问时，才会回退到 IPv4。但在某些特定的应用或场景中，我们可能更希望系统优先使用 IPv4，这时就需要通过配置文件进行调整。

## 修改 /etc/gai.conf

在 Debian 等 Linux 系统下，有一个 `/etc/gai.conf` 文件，用于系统的 `getaddrinfo` 调用，默认情况下，它会使用 IPv6 优先，如果您安装了 `curl` 并且本地支持 IPv6，那么可以使用 `curl ip.sb` 测试：

```bash
root@debian ~ # curl ip.sb
2001:db8::2
```
结果与 `curl ip.sb -6` 等效。

从 Debian 13 开始，curl (8.14.1) 默认强制使用 IPv6。因此，如果希望测试本地出口公网 IP，可以改用 `wget`：

```bash
root@debian ~ # wget -qO- http://ip.sb
2001:db8::2
```
效果等同于 `wget -qO- http://ip.sb -6`

如果你不想使用 IPv6 优先，可以在这个文件中找到：

`#precedence ::ffff:0:0/96  100`
取消注释，修改为：

`precedence ::ffff:0:0/96  100`
一行命令修改：

`sed -i 's/#precedence ::ffff:0:0\/96  100/precedence ::ffff:0:0\/96  100/' /etc/gai.conf`
此时再次执行 `curl ip.sb` 测试：

```bash
root@debian ~ # curl ip.sb
192.0.2.2
```
效果等同于 `curl ip.sb -4`

从 Debian 13 开始的 curl (8.14.1) 会强制 IPv6 优先，所以我们可以使用 `wget` 命令：

```bash
root@debian ~ # wget -qO- http://ip.sb
192.0.2.2
```
效果等同于 `wget -qO- http://ip.sb -4`

某些情况下，你可能又需要强制启用 IPv6 优先（是的，有些系统和用户的需求确实有点奇怪😅），因为目前 IANA 分配的公网 IPv6 还未进行到 `3000:0000::/4`，所以我们只要把这段之前的 IPv6 加到优先级列表即可，加入这两行 `label` 的优先级：

```bash
label 2002::/16    1
label 2001:0::/32   1
```

## 禁用 IPv6

有一些极端情况下，我们可能需要禁止系统的 IPv6 功能，这时候就需要添加或修改 `/etc/sysctl.d/local.conf` 文件，首先找到你的网卡名称，这里以 `eth0` 为例，然后加入如下内容：

```bash
net.ipv6.conf.all.autoconf = 0
net.ipv6.conf.default.autoconf = 0
net.ipv6.conf.all.accept_ra = 0
net.ipv6.conf.default.accept_ra = 0
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
net.ipv6.conf.eth0.disable_ipv6 = 1
```
若需对其他网卡禁用 IPv6，只需将 `eth0` 替换为对应网卡名称即可。

一句话命令

```bash
cat >> /etc/sysctl.d/local.conf << EOF
net.ipv6.conf.all.autoconf = 0
net.ipv6.conf.default.autoconf = 0
net.ipv6.conf.all.accept_ra = 0
net.ipv6.conf.default.accept_ra = 0
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
net.ipv6.conf.eth0.disable_ipv6 = 1
EOF
```
注意：`cat` 命令中的 `>>` 表示追加内容；若使用 `>`，则会覆盖原有内容。

然后执行 `sysctl --system` 重新加载配置文件。此时查看 `ip a`，即可发现 IPv6 已被禁用。

下图为修改前后的对比示例：

使用前，我们可以看到无论是本地还是公网网卡都有 `inet6`，即都有 IPv6 地址：

![image.png](https://s.bh.sb/uploads/2022/02/10/oyKXC1YLbu2Mi6j.png)

使用后，无论本地还是公网网卡均无 IPv6 地址：

![image.png](https://s.bh.sb/uploads/2022/02/10/qi2nwjWeLfQXJH4.png)

## 其他系统和软件

Windows 系统可参考[这篇回答](https://superuser.com/questions/436574/ipv4-vs-ipv6-priority-in-windows-7)

Firefox 下打开 `about:config` 然后把 `network.dns.disableIPv6` 改成 `true` 即可禁止 Firefox 请求 IPv6