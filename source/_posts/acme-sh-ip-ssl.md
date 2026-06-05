---
title: 使用 acme.sh 配置 Let&#x27;s Encrypt 签发的 IP 地址 SSL 证书
date: 2025-12-17T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/acme-sh-ip-ssl.webp
---

本文将介绍使用 acme.sh 配置 Let's Encrypt 为 IP 地址签发 SSL 证书。

之前写过一篇使用 [acme.sh](https://github.com/acmesh-official/acme.sh) 签发证书的[教程](/acme-sh-ssl/)，但在很长一段时间里，Let's Encrypt 只能给**域名**签发证书。

经过几个月的[测试](https://letsencrypt.org/2025/07/01/issuing-our-first-ip-address-certificate)之后，现在终于可以对 **IP 地址** 下手了。

# 为什么要给 IP 签发证书

在很多场景下，我们并不一定需要域名，但**确实需要 HTTPS**。比如：

- DNS over HTTPS（DoH）服务无需依赖域名解析

直接通过 IP 提供 DoH 服务，避免「为了安全先做一次不安全的域名解析」这种哲学问题。

- Web 服务默认站点隐藏真实域名

默认站点只暴露 IP，不暴露真实域名，顺便还能挡掉一部分不太礼貌的爬虫。

- 临时服务或测试环境

临时起个服务，只想加个锁，不想再去 DNS 那边折腾。

- 避免证书透明日志（Certificate Transparency Log）暴露域名，保护隐私

有些域名不太想出现在公开日志里，低调一点总是好的。

# 准备工作

首先更新 acme.sh 到最新版本：

`acme.sh --upgrade
`Copy
因为 IP 证书目前只能通过 [http-01](https://letsencrypt.org/docs/challenge-types/#http-01-challenge) 和 [tls-alpn-01](https://letsencrypt.org/docs/challenge-types/#tls-alpn-01) 方式进行验证，所以你需要检查服务器的防火墙，设置允许 TCP 80 和 TCP / UDP 443 端口在公网可以访问。

# 配置 Nginx 80 端口的默认站点

这里我只介绍在 Nginx 下的配置吧，我们可以直接写入 80 端口的默认配置：

如果你在 Debian 或 Ubuntu 下安装 Nginx，可以直接覆盖 `/etc/nginx/sites-available/default` 文件：

`server {
    # Listen on port 80 for all IPv4 and IPv6 addresses
    listen 80 default_server;
    listen [::]:80 default_server;
   
    # Match all domain names
    server_name _;

    # Merge Let's Encrypt and SSL verification path configuration
    location ~ ^/.well-known/(acme-challenge|pki-validation)/ {
        add_header Content-Type text/plain;
        root /var/www/letsencrypt;
    }

    # Redirect all other HTTP requests to HTTPS using 301 permanent redirect
    location / {
        return 301 https://$host$request_uri;
    }
}
`Copy
然后创建两个目录并重新加载 Nginx：

`mkdir -p /var/www/letsencrypt
mkdir -p /etc/nginx/ssl
nginx -t
nginx -s reload
`Copy

# 使用 acme.sh 签发 IP 证书

假设你服务器的 IP 地址是 `192.0.2.2` 和 `2001:db8::2`：

`acme.sh --issue --server letsencrypt -d 192.0.2.2 -d 2001:db8::2 \
  -w /var/www/letsencrypt \
  --certificate-profile shortlived \
  --days 3
`Copy
注意这里我们必须使用 [shortlived](https://letsencrypt.org/docs/profiles/#shortlived) 这个 Profile，因为 Let's Encrypt 的 IP 证书有效期只有 6.66666 天（160 小时），同时 acme.sh 需要更短的时间来进行检查更新证书，所以可以设置 `--days 3` 参数，让它 3 天检查并更新一次，你也可以设置 4 或 5，但是不要设置 6，否则可能证书过期了都没更新哦。

执行命令以后会看到类似的申请成功返回：

`[Wed Dec 17 05:46:28 AM UTC 2025] Using CA: https://acme-v02.api.letsencrypt.org/directory
[Wed Dec 17 05:46:28 AM UTC 2025] Multi domain='IP:192.0.2.2,IP:2001:db8::2'
[Wed Dec 17 05:46:30 AM UTC 2025] Getting webroot for domain='192.0.2.2'
[Wed Dec 17 05:46:30 AM UTC 2025] Getting webroot for domain='2001:db8::2'
[Wed Dec 17 05:46:30 AM UTC 2025] Verifying: 192.0.2.2
[Wed Dec 17 05:46:31 AM UTC 2025] Pending. The CA is processing your order, please wait. (1/30)
[Wed Dec 17 05:46:34 AM UTC 2025] Success
[Wed Dec 17 05:46:34 AM UTC 2025] Verifying: 2001:db8::2
[Wed Dec 17 05:46:35 AM UTC 2025] Pending. The CA is processing your order, please wait. (1/30)
[Wed Dec 17 05:46:38 AM UTC 2025] Success
[Wed Dec 17 05:46:38 AM UTC 2025] Verification finished, beginning signing.
[Wed Dec 17 05:46:38 AM UTC 2025] Let's finalize the order.
[Wed Dec 17 05:46:38 AM UTC 2025] Le_OrderFinalize='https://acme-v02.api.letsencrypt.org/acme/finalize/blablablablablablablabla/blablablablablablablabla'
[Wed Dec 17 05:46:41 AM UTC 2025] Downloading cert.
[Wed Dec 17 05:46:41 AM UTC 2025] Le_LinkCert='https://acme-v02.api.letsencrypt.org/acme/cert/blablablablablablablabla'
[Wed Dec 17 05:46:42 AM UTC 2025] Cert success.
-----BEGIN CERTIFICATE-----
blablablablablablablablablablablablablablablablablablabla
-----END CERTIFICATE-----
[Wed Dec 17 05:46:42 AM UTC 2025] Your cert is in: /root/.acme.sh/192.0.2.2_ecc/192.0.2.2.cer
[Wed Dec 17 05:46:42 AM UTC 2025] Your cert key is in: /root/.acme.sh/192.0.2.2_ecc/192.0.2.2.key
[Wed Dec 17 05:46:42 AM UTC 2025] The intermediate CA cert is in: /root/.acme.sh/192.0.2.2_ecc/ca.cer
[Wed Dec 17 05:46:42 AM UTC 2025] And the full-chain cert is in: /root/.acme.sh/192.0.2.2_ecc/fullchain.cer
`Copy
然后我们可以把申请好的证书放在 `/etc/nginx/ssl` 目录：

`mkdir -p /etc/nginx/ssl

acme.sh --install-cert -d 192.0.2.2 \
  --key-file       /etc/nginx/ssl/ip.key  \
  --fullchain-file /etc/nginx/ssl/ip.crt \
  --ca-file        /etc/nginx/ssl/ip.ca.crt \
  --reloadcmd     "systemctl restart nginx"
`Copy

# 配置 Nginx 443 端口的默认站点

安装完证书后我们即可配置 Nginx 默认的 443 端口了，你可以把这段配置一起放入 `/etc/nginx/sites-available/default` 文件：

`# HTTPS Server block - Handle all HTTPS requests
server {
    # Standard TLS listening
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;

    # HTTP/2 protocol support
    http2 on;
   
    # HTTP/3 QUIC protocol support
    listen 443 quic reuseport;
    listen [::]:443 quic reuseport;
    add_header Alt-Svc 'h3=":443"; ma=86400' always;
    add_header X-Protocol $server_protocol always;
   
    # Match all domain names
    server_name _;
    return 403;

    # modern configuration
    ssl_protocols TLSv1.3;
    ssl_ecdh_curve X25519:prime256v1:secp384r1;
    ssl_prefer_server_ciphers off;

    ssl_certificate /etc/nginx/ssl/ip.crt;
    ssl_certificate_key /etc/nginx/ssl/ip.key;
}
`Copy
然后检查并重新加载 Nginx：

`nginx -t
nginx -s reload
`Copy
一切就绪以后就可以直接访问 `https://192.0.2.2/` 并返回 403 错误页面，我们可以看到证书里 `Subject Alt Names` 字段也显示 `IP Address` 了：

![烧饼博客](https://s.bh.sb/2025/12/17/image_sK4sr.png)

读者们在使用过程中如果遇到问题，可以在 V2EX 交流讨论或在下方评论：

[https://be.st/pGx9](https://be.st/pGx9)