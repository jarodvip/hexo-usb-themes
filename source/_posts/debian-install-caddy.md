---
title: Debian / Ubuntu 安装 Caddy
date: 2022-12-27T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/debian-install-caddy.webp
---

本文将指导如何在 Debian 和 Ubuntu 下安装 Caddy。

# 什么是 Caddy？

[Caddy](https://caddyserver.com/) 是一款开源的 Web 服务器，它设计简单，易于使用，并且有很多强大的功能。它可以自动处理 TLS (SSL)，并且可以使用中间件扩展功能。

Caddy 采用简单的配置语法，可以轻松配置路由，反向代理，重定向，缓存和其他功能。它还支持 HTTP/2，QUIC (HTTP/3) 和 WebSockets 协议，可以提供快速的网络性能。

# 为什么尝试 Caddy？

对我来说比较简单的原因是 [nginx-quic](https://quic.nginx.org/) 这个项目一直未发布正式版，想要一款简单的能支持 [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3) 的 Web 服务器软件，目前来说 Caddy 的选择是最合适的。

Caddy 还支持自动化证书，对于懒人来说特别合适。

# 安装 Caddy

我们按照官方的[安装方法](https://caddyserver.com/docs/install#debian-ubuntu-raspbian)，首先，安装一些必要的软件包：

`apt update
apt upgrade -y
apt install curl vim wget gnupg dpkg apt-transport-https lsb-release ca-certificates
`Copy
然后加入 Caddy 的 GPG 公钥和 apt 源：

`curl -sSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor > /usr/share/keyrings/caddy.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/caddy.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" > /etc/apt/sources.list.d/caddy.list
`Copy
Debian 下也可以使用 extrepo：

`apt install extrepo
extrepo enable caddyserver
`Copy
然后更新系统后即可安装 Caddy：

`apt update
apt install caddy
`Copy

# 配置 Caddy

默认的 `Caddyfile` 文件位于 `/etc/caddy/Caddyfile`，官方的教程在[这儿](https://caddyserver.com/docs/caddyfile-tutorial)，如果你习惯了 Nginx 和 Apache 的配置，那么此时应该会非常不习惯，我们就来一个最简单的例子把：

- 我们需要绑定域名 `example.com`

- 这个域名的文件位于 `/var/www/example.com`，默认首页文件名为 `index.html`

- 我们需要开启 SSL 访问，并且访问 http 跳转到 https

- 我们需要设置开启 TLS 1.2 和 TLS 1.3，并开启 HSTS Preload

首先，设置 `http://example.com/` 跳转到 `https://example.com/`：

**注意**：默认情况如果下面的 `example.com:80` 和 `example.com:443` 没有配置其他的端口，Caddy 会自动使用 443 端口，并自动开启 `http://example.com/` 跳转到 `https://example.com/`，这里的示范是为了给有些奇怪的需求比如一些特定的端口访问 HTTP 和 HTTPS，则需要手动配置。

`example.com:80 {
	redir https://{host}{uri} permanent
}
`Copy
然后我们按照 Mozilla 的[推荐配置](https://ssl-config.mozilla.org/#server=caddy&version=2.6.2&config=intermediate&guideline=5.6)写入 `Caddyfile`：

`example.com:443 {
	tls {
		protocols tls1.2 tls1.3
		ciphers TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256 TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256
	}

	header {
		Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
		Referrer-Policy strict-origin-when-cross-origin
		X-Frame-Options SAMEORIGIN
		X-Content-Type-Options nosniff
		X-XSS-Protection "1; mode=block"
	}

	root * /var/www/example.com

	file_server {
		index index.html
	}

	encode gzip zstd
}
`Copy
当然也可以设置 `www.example.com` 跳转 `example.com`：

`www.example.com:80 {
	redir https://example.com{uri} permanent
}

www.example.com:443 {
	redir https://example.com{uri} permanent
}
`Copy
然后把以上所有内容合并成一个 `Caddyfile` 文件，放到 `/etc/caddy/Caddyfile`，然后检查 Caddy 配置：

`caddy validate --config /etc/caddy/Caddyfile
`Copy
输出如下内容则表示配置正确：

`root@debian ~ # caddy validate --config /etc/caddy/Caddyfile
2022/12/26 17:31:22.347	INFO	using provided configuration	{"config_file": "/etc/caddy/Caddyfile", "config_adapter": ""}
2022/12/26 17:31:22.349	WARN	http	server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server	{"server_name": "srv1", "http_port": 80}
2022/12/26 17:31:22.349	INFO	http	enabling automatic HTTP->HTTPS redirects	{"server_name": "srv0"}
2022/12/26 17:31:22.349	INFO	tls.cache.maintenance	started background certificate maintenance	{"cache": "0xc00018ad90"}
2022/12/26 17:31:22.350	INFO	tls.cache.maintenance	stopped background certificate maintenance	{"cache": "0xc00018ad90"}
Valid configuration
`Copy
有强迫症的也可以把你的 Caddyfile 文件美化一下：

`caddy fmt /etc/caddy/Caddyfile --overwrite
`Copy
最后重启 Caddy

`systemctl restart caddy
`Copy
耐心等待自动签发 SSL 证书，然后我们就可以打开浏览器控制台查看 `https://example.com/` 即可看到 SSL 证书已经自动部署，同时 HTTP/3 已经开启了：

![HTTP/3](https://s.bh.sb/img/2022/12/e3e00d.png)

更多的配置可以参考[官方文档](https://caddyserver.com/docs/caddyfile)或[《Caddyfile 语法浅析》](https://mritd.com/2021/06/30/understand-caddyfile-syntax/)