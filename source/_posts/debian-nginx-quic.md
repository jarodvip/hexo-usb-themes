---
title: Debian / Ubuntu 下使用 HTTP/3 协议的 Nginx QUIC
date: 2023-08-02T00:00:00.000+00:00
tags:
  - nginx
  - quic
cover: https://s.bh.sb/images/debian-nginx-quic.webp
---

本文适合 Debian Stable 和 Ubuntu LTS，请使用 root 用户进行操作。

## 1、什么是 HTTP/3 和 QUIC？

[HTTP/3](https://en.wikipedia.org/wiki/HTTP/3) 是一种基于 [QUIC](https://en.wikipedia.org/wiki/QUIC) (Quick UDP Internet Connections) 协议的 HTTP 协议版本，它是 HTTP/2 的后继者，旨在改进 Web 性能和安全性。

HTTP/3 与之前的 HTTP 协议有很大的不同，最明显的区别是它使用 QUIC 协议而不是 TCP 协议来传输数据。

QUIC 是一种由 Google 开发的协议，基于 [UDP](https://en.wikipedia.org/wiki/User_Datagram_Protocol)，它在保持安全性的同时提供更快的连接和更少的延迟。与 TCP 不同，QUIC 允许多个请求同时在同一连接上进行，从而减少了网络拥塞和握手延迟的影响。

总的来说，HTTP/3 的设计目标是通过减少延迟和提高性能，为 Web 应用程序提供更快、更安全和更高效的用户体验。

## 2、安装 Nginx Quic

这里我们推荐[烧饼博客](https://n.wtf/)团队打包的 Nginx Quic 版本，它是基于最新的官方 1.25.0 源码打包的，支持 HTTP/3 和 QUIC 协议。

## 2.1 更新系统并安装部分必要软件

```bash
apt update
apt upgrade -y
apt dist-upgrade -y
apt install curl vim wget gnupg dpkg apt-transport-https lsb-release ca-certificates
```

## 2.2 增加 GPG Key

```
```
`curl -sSL https://n.wtf/public.key | gpg --dearmor > /usr/share/keyrings/n.wtf.gpg
`
```
```
Copy

## 2.3 添加 Nginx QUIC 源

```
```
`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/n.wtf.gpg] https://mirror-cdn.xtom.com/sb/nginx/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/n.wtf.list
`
```
```
Copy
如果你的服务器在国内，可以使用下面的源：

`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/n.wtf.gpg] https://mirror.iscas.ac.cn/sb/nginx/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/n.wtf.list`
或

`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/n.wtf.gpg] https://mirror.nju.edu.cn/sb/nginx/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/n.wtf.list`

## 2.4 更新并安装 Nginx

```
```
`apt update
apt install nginx-extras -y
`
```
```
Copy
安装完毕后，我们可以使用 `nginx -V` 命令看到 Nginx 已经是最新的 1.27.0 主线版 + QUIC 了：

```bash
root@debian ~ # nginx -V
nginx version: nginx-n.wtf/1.27.0
built with OpenSSL 3.3.1 4 Jun 2024
TLS SNI support enabled
```

## 2.5 使用 Docker 安装

你也可以使用 [Docker](https://github.com/u-sb/nginx-docker) 进行体验：

`docker run --name nginx --net host --restart always -v $HOME/nginx-config:/usr/src/docker-nginx/conf:ro -d ghcr.io/u-sb/nginx`
此时配置文件的目录在当前目录的 `nginx-config` 文件夹下。

## 3、配置 Nginx

首先，HTTP/3 仅支持 HTTPS 协议，因此我们需要准备好 SSL 证书，可以参考[《Nginx 配置 SSL 证书》](/nginx-ssl/)获取 SSL 证书。

其次，需要开启 TLS 1.3 支持，因为 HTTP/3 是基于 TLS 1.3 的，如果没有开启 TLS 1.3，那么 HTTP/3 将无法正常工作。

最后，需要添加 `listen 443 http3` 监听端口并开启 HTTP/3 支持，以及需要添加一个 `Alt-Svc` 的头部信息 `add_header Alt-Svc 'h3=":443"; ma=86400';`，用于告诉浏览器使用 HTTP/3 协议访问网站。

最后，需要添加 `listen 443 quic` 监听端口并开启 HTTP/3 支持，以及需要添加一个 `Alt-Svc` 的头部信息 `add_header Alt-Svc 'h3=":$server_port"; ma=86400';`，用于告诉浏览器使用 HTTP/3 协议访问网站。

因为[这个修改](https://hg.nginx.org/nginx-quic/rev/69bae2437d74)，从 Nginx 1.25.0 开始，已经不支持 `http3` 的 `listen` 段，需要改为 `quic`。

另外，从 Nginx 1.25.1 开始，`listen ... http2` 已废弃，需要改为 `http2 on`，否则会报警告 `nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead`：

我们附上一个基本的配置示例：

```bash
server {
	listen 443 ssl default_server;
	listen [::]:443 ssl default_server;
    # 开启 HTTP/3
	listen 443 quic reuseport;
	listen [::]:443 quic reuseport;
    # 开启 HTTP/2
    http2 on;

	server_name example.com;

	root /var/www/example.com;
	index index.html;

	ssl_certificate /etc/nginx/ssl/example.com.crt;
	ssl_certificate_key /etc/nginx/ssl/example.com.key;
	ssl_trusted_certificate /etc/nginx/ssl/example.com.ca.crt;

	ssl_session_timeout 1d;
	ssl_session_cache shared:MozSSL:10m;
	ssl_session_tickets off;

	ssl_protocols TLSv1.3;
	ssl_prefer_server_ciphers off;

	ssl_stapling on;
	ssl_stapling_verify on;

	resolver 1.1.1.1 8.8.8.8 valid=300s;
	resolver_timeout 10s;

	add_header Alt-Svc 'h3=":$server_port"; ma=86400';
    add_header X-protocol $server_protocol always;
}
```
请注意 `listen 443 quic reuseport` 里的 `reuseport` 参数，以及 `listen 443 ssl default_server` 里的 `default_server` 参数，所有 server 段里，只允许一个段出现 `reuseport` 和 `default_server` 参数，否则会报错。

另外 `listen` 段里的 `ssl` 无法和 `quic` 放一起，必须分开写两段。

## 4、测试 HTTP/3

我们使用 Firefox 浏览器，因为目前 DNS SVCB/HTTPS 记录[尚未普及](https://taoshu.in/dns/dns-svcb-https.html)，所以第一次访问的时候，浏览器还是走 TCP 协议使用 HTTP/2 或者 HTTP/1.1 请求你的网站，获取 `Alt-Svc` 的头部信息后，才会走 HTTP/3 协议，所以第一次访问以后，可以关掉浏览器重新打开再测试。

我们可以打开 F12 开发者工具，查看 Network 选项卡，可以看到 HTTP/3 协议的请求：

![Firefox HTTP/3](https://s.bh.sb/uploads/2023/02/20/bzZGxtN9lRjMD3f.png)