---
title: Nginx 配置 SSL 证书
date: 2023-08-02T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/nginx-ssl.webp
---

本文将介绍购买 SSL 证书并在 Nginx 配置的姿势。

# 免费证书和收费证书的区别

首先，免费的 SSL 证书是没有保险的，也没有 SLA 保障，适合个人项目以及短期的网站，对于长期运营的网站来说，我们并不推荐使用免费的 SSL 证书，这时候您就需要购买一个收费的 SSL 证书。

如果您需要免费证书，您可以在 [FreeSSL](https://freessl.cn/) 获取一年的 TrustAsia 证书，您也可以使用 [ACME](/acme-sh-ssl/) 获取 3 个月的 [Let's Encrypt](https://letsencrypt.org/) 或 [ZeroSSL](https://u.nu/zerossl) 证书。

对于普通网站来说，我们推荐 [Riven Cloud](https://sa.net/ssl/) 的 SSL DV 证书，单域名仅需 $4 美元一年，泛域名也就是俗称 “野卡” 证书也仅需 $40 美元一年，这个价格是比较实惠的。

对于商业网站来说，推荐购买 OV 证书，价格虽贵，但是更有保障，毕竟需要验证组织才签发证书，而普通的 DV 证书仅需要验证域名即可签发。

# 生成证书签发请求 (CSR)

您必须拥有一个证书签发请求 (Certificate Signing Request，CSR) 才能申请签发 SSL 证书。

这里我们使用 OS X，Linux，UNIX 及类似系统为例，UNIX 系操作系统一般已经内置了 OpenSSL 或 GnuTLS 工具链，您需要系统中存在 openssl 的可执行文件：

`apt install openssl
`Copy

```
`dnf install openssl
`
```
Copy

```
`pacman -S openssl
`
```
Copy

```
`zypper in openssl
`
```
Copy

# 交互式生成 CSR

首先生成一个 CSR，这个 CSR 将会用于请求 SSL 证书，这里以 2048 位 RSA 证书为例：

`openssl req -new -newkey rsa:2048 -sha256 -nodes -out example_com.csr -keyout example_com.key -subj "/C=CN/ST=Beijing/L=Beijing/O=Example Inc/OU=Network Dept/CN=example.com"
`Copy

如果您准备签发泛域名证书，则使用 `*.example.com` 作为 CN (common name)：

`openssl req -new -newkey rsa:2048 -sha256 -nodes -out example_com.csr -keyout example_com.key -subj "/C=CN/ST=Beijing/L=Beijing/O=Example Inc/OU=Network Dept/CN=*.example.com"
`Copy
如果您希望生成 ECC 证书，命令看起来像这样：

`openssl ecparam -out example_com.key -name prime256v1 -genkey && openssl req -new -key example_com.key -nodes -out example_com.csr -subj "/C=CN/ST=Beijing/L=Beijing/O=Example Inc/OU=Network Dept/CN=example.com"
`Copy
如果您准备签发的是多域名证书，请使用下面的命令将所有的域名包含进去

`openssl req -new -newkey rsa:2048 -sha256 -nodes -out example_com.csr -keyout example_com.key -subj "/C=CN/ST=Beijing/L=Beijing/O=Example Inc/OU=Network Dept/CN=example.com/subjectAltName=DNS.1=sub1.example.com,DNS.2=sub2.example.com,DNS.3=sub.another-example.com"
`Copy
如果您准备签发的是 IP 证书，则留空 CN (common name)

`openssl req -new -newkey rsa:2048 -sha256 -nodes -out example_com.csr -keyout example_com.key -subj "/C=CN/ST=Beijing/L=Beijing/O=Example Inc/OU=Network Dept/CN=/subjectAltName=DNS.1=192.0.2.1,DNS.2=192.0.2.2"
`Copy

# 购买下单并获取证书文件

所有网站购买证书的流程都是一样的，提交 `example_com.csr` 文件内容，然后填写相关资料，付款，等待邮件通知验证，验证后开通即可。

按照 [CA/Browser Forum](https://cabforum.org/) 的规定，普通 DV 单域名或多域名证书验证方式可选 HTTP/HTTPS，域名管理员邮箱以及 DNS 记录 (通常是 TXT 或 CNAME 记录) 进行验证，对于泛域名证书，目前有且仅支持 DNS 记录验证。

按照 CA/Browser Forum 的还有一条[规定](https://cabforum.org/baseline-requirements-documents/)，所有 SSL 证书有效期不得大于 13 个月 (397 天)，所有市面上的收费或免费证书都不能超过这个有效期，骗你可以买两年五年证书的都是忽悠你的，实际就是先给你签发一年，第二年免费给你续费，续费的流程和重新签发的流程是一样的，需要重新验证你的域名或组织。

这里不多叙述，购买完成后您会得到一个类似 `example_com.crt` 的文件，这个文件里面包含了证书的公钥，以及证书的其他信息，比如有效期，域名，签发者等等，需要注意的是这个证书链一般是不完整的，也有的商家会发送你完整的证书链，如果你强行配置在 Nginx 上，会造成个别浏览器提示证书错误，这时候可以使用 [What's My Chain Cert](https://whatsmychaincert.com/) 这个服务，把 crt 文件内容复制上去，然后下载完整的证书链：

![image.png](https://s.bh.sb/uploads/2022/02/03/F9Lda7bQPelV2At.png)

这时候会得到一个类似 `example_com.chain.crt` 的文件，我们把 `example_com.key` 和 `example_com.chain.crt` 丢入服务器。

此时记得打开 `example_com.chain.crt` 文件，把除了 `example_com.crt` 内容以外的 CA 根证书单独命名为一个单独的文件 `example_com.ca.crt`

我们最终得到如下文件：

记得把他们丢在你服务器上，比如创建并放在 `/etc/nginx/ssl` 目录。

# 配置 Nginx SSL 证书开启 HTTPS

如果您按照本站的[教程](/debian-install-nginx-php-mysql/)使用烧饼博客打包的 [Nginx](https://n.wtf/)，那么可以参考如下配置，请注意，只有默认的第一个监听端口的网站才可以在 `listen` 段使用 `default_server` 和 `reuseport`，如果需要添加更多网站，请删除这两个参数：

跳转所有的 HTTP 请求：

`server {
    listen 80 default_server;
    listen [::]:80 default_server;

    location / {
        return 301 https://$host$request_uri;
    }
}
`Copy
生成 dhparam 文件：

`mkdir -p /etc/nginx/ssl
openssl dhparam -dsaparam -out /etc/nginx/ssl/dhparam 2048
`Copy
嫌弃慢的也可以直接用 Mozilla 给你生成好的：

`curl https://ssl-config.mozilla.org/ffdhe2048.txt > /etc/nginx/ssl/dhparam
`Copy
然后监听 443 端口并开启 HTTP/2、HTTP/3、OCSP、TLS 1.2、TLS 1.3 和 HSTS Preload：

我们以 `example.com` 为例，网站目录位于 `/var/www/example.com`

`server {
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

    ssl_certificate /etc/nginx/ssl/example_com.chain.crt;
    ssl_certificate_key /etc/nginx/ssl/example_com.key;

    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;

    ssl_dhparam /etc/nginx/ssl/dhparam;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ecdh_curve X25519:prime256v1:secp384r1;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;

    add_header Alt-Svc 'h3=":443"; ma=86400';
	add_header Referrer-Policy strict-origin-when-cross-origin;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"; 
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
}
`Copy
然后测试 Nginx 配置并重新加载：

`nginx -t
nginx -s reload
`Copy
最终你就可以在浏览器打开 `https://example.com/` 查看是否生效了。