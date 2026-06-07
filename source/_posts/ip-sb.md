---
title: IP.SB - 在线 IPv4 / IPv6 信息查询
date: 2022-01-21T00:00:00.000+00:00
tags:
  - 工具
cover: https://s.bh.sb/images/ip-sb.webp
---

IP.SB 是一个免费的在线查询 IP 服务。

## 1、IP.SB 的由来

[IP.SB](https://ip.sb/) 前身是 [IP.GS](https://ip.gs/)，一个专门用于查询本地出口 IP 的网站，初衷是为了让用户更方便地知道自己的本地出口 IP，使用的数据库是 [Maxmind](https://maxmind.com/) 的 GeoIP2 数据库，并且提供了一个简单的 API 接口，可以获取本地出口 IP 的地理位置信息。

## 2、IP.SB 使用的 IP 数据库

IP.SB 数据库是 MaxMind 提供的商业版，介绍和购买链接请[摸这儿](https://www.maxmind.com/en/geoip2-isp-database)

## 3、IP.SB 基本功能介绍

## 3.1 查看本地出口 IP 地址

直接访问 [ip.sb](https://ip.sb/) 即可查看当前本地的 IP 出口地址，如果本地有 IPv6，那么我们也会同时检测出 IPv6 地址，如果没有则只有 IPv4 地址，目前我们检测的原理如下：

- `ip.sb` 同时解析了 IPv4 和 IPv6 地址，方便用户访问

- `ipv4.ip.sb` 只解析了 IPv4 地址，用途是检测用户的 IPv4，如果有，则提示 `Supported`

- `ipv6.ip.sb` 只解析了 IPv6 地址，用途是检测用户的 IPv6，如果有，则提示 `Supported`，如果没有或者当前 IPv6 连接失败，则提示 `Not Supported`

## 3.2 查询 IP 地址物理位置

假设你想查询的 IPv4 是 `192.0.2.2`，IPv6 是 `2001:db8::2` 那么直接访问如下地址即可查询您的 IP 物理位置信息

[https://ip.sb/ip/192.0.2.2](https://ip.sb/ip/192.0.2.2)

[https://ip.sb/ip/2001:db8::2](https://ip.sb/ip/2001:db8::2)

也可以在 [ip.sb](https://ip.sb/) 右上角搜索，直接输入 IP 地址即可

## 3.3 查询 IP 和 ASN 的 whois 信息

假设你想查询的 IPv4 是 `192.0.2.2`，IPv6 是 `2001:db8::2`，ASN 是 `AS64496` 那么直接访问如下地址即可查询相关公开的 whois 信息

[https://ip.sb/whois/192.0.2.2](https://ip.sb/whois/192.0.2.2)

[https://ip.sb/whois/2001:db8::2](https://ip.sb/whois/2001:db8::2)

[https://ip.sb/whois/AS3333](https://ip.sb/whois/AS3333)

当然你也可以在 [https://ip.sb/whois/](https://ip.sb/whois/) 页面输入查询，注意的是，并不是所有的 IP 地址或 ASN 都会有对应的 whois 信息

## 3.4 查询 IP 基本知识

目前我们收集并制作了如下页面

IPv4 和 IPv6 的 CIDR [https://ip.sb/cidr/](https://ip.sb/cidr/)。

IANA 的 IPv4 和 IPv6 分配 [https://ip.sb/iana-ip/](https://ip.sb/iana-ip/)

IANA 的 ASN 分配 [https://ip.sb/iana-asn/](https://ip.sb/iana-asn/)

所有的国别域名分配 [https://ip.sb/cctlds/](https://ip.sb/cctlds/)

未来会加入更多的 IP 和域名知识页面

## 3.5 其他小工具

本地浏览器环境监测 (主要用途是查看本地代理是否正常) [https://ip.sb/azenv/](https://ip.sb/azenv/)

IP 地址转换 PTR 记录 [https://ip.sb/ip2ptr/](https://ip.sb/ip2ptr/)

随机密码生成器 [https://ip.sb/password/](https://ip.sb/password/)

未来也会加入更多的小工具

## 4、简单 API 使用

## 4.1 curl 方式

首先，确保您的系统安装了 [curl](https://curl.haxx.se)，查询本地 IP 出口地址命令如下

当然如果你使用 curl 那么你也可以通过 `curl ip.sb` 命令来查看当前的 IP 地址，具体用法如下

默认情况下

`curl ip.sb`
只想查询 IPv4 的时候

`curl -4 ip.sb`
或

`curl ipv4.ip.sb`
只想查询 IPv6 的时候

`curl -6 ip.sb`
或

`curl ipv6.ip.sb`

## 4.2 文本方式或者 IP

直接访问 `https://api.ip.sb/ip` 即可获得当前 IP 地址，访问 `https://api-ipv4.ip.sb/ip` 获取 IPv4 地址，访问 `https://api-ipv6.ip.sb/ip` 获取 IPv6 地址，可配合任何程序使用

## 4.3 JSON 方式获取 IP

直接访问 `https://api.ip.sb/jsonip` 或 `https://api.ip.sb/jsonip?callback=getip` 后获取 JSON 格式的输出

更多使用方法请参考 [http://ip.sb/api/](https://ip.sb/api/)

目前免费 API 暂无限制，但是请勿滥用，如果需要商业使用请自行搭建或[联系](https://u.sb/contact/)我们。

*注意：*个别国内的网络环境可能无法使用本服务，我们也暂时没有办法解决这个问题，请自行检查或更换运营商。