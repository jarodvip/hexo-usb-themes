---
title: Apache 配置 SSL 证书
date: 2022-02-03T00:00:00.000+00:00
tags:
  - apache
  - ssl
cover: https://s.bh.sb/images/apache-ssl.webp
---

本文将介绍购买 SSL 证书并在 Apache 2 配置的姿势。

## 购买证书并拿到所有文件

这里的步骤和 [Nginx 配置 SSL 证书](/nginx-ssl/)的步骤一样，只是把证书放在了一个新的目录下，比如我们可以新建一个文件夹 `/etc/apache2/ssl` 然后把文件都丢进去。

其中 `dhparam` 需要和证书文件放一起，可以使用命令：

`curl https://ssl-config.mozilla.org/ffdhe2048.txt >> /etc/nginx/ssl/example_com.chain.crt`
*注意两个剪头 `>>` 符号代表合并文件*

我们最终得到如下文件：

## 配置 Apache SSL 证书开启 HTTPS

同样我们参考 Mozilla 的 [SSL 配置生成器](https://ssl-config.mozilla.org/#server=apache&version=2.4.41&config=intermediate&openssl=1.1.1k&guideline=5.6)。

把所有 HTTP 请求跳转 HTTPS

```bash
<VirtualHost *:80>
    RewriteEngine On
    RewriteCond %{REQUEST_URI} !^/\.well\-known/acme\-challenge/
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>
```
然后使用现代化的 SSL 配置，开启 HTTP/2、OCSP、TLS 1.3 和 HSTS

我们以 `example.com` 为例，网站目录位于 `/var/www/example.com`

```bash
<VirtualHost *:443>
	ServerName example.com
	DocumentRoot /var/www/example.com
	DirectoryIndex index.html

	ErrorLog ${APACHE_LOG_DIR}/example.com.error.log
	CustomLog ${APACHE_LOG_DIR}/example.com.access.log combined

	<Directory /var/www/example.com>
		Options FollowSymLinks
		AllowOverride All
		Require all granted
	</Directory>
	
	SSLEngine on
	SSLCertificateFile      /etc/apache2/ssl/example_com.chain.crt
	SSLCertificateKeyFile   /etc/apache2/ssl/example.com.key
	
	Protocols h2 http/1.1

	Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
	Header always set X-Frame-Options SAMEORIGIN
	Header always set X-Content-Type-Options nosniff
	Header set X-XSS-Protection "1; mode=block"
	Header always set Referrer-Policy strict-origin-when-cross-origin
</VirtualHost>

## intermediate configuration
SSLProtocol             all -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite          ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
SSLHonorCipherOrder     off
SSLSessionTickets       off

SSLUseStapling On
SSLStaplingCache "shmcb:logs/ssl_stapling(32768)"
```
接着检查配置并重启 Apache 2

```bash
apache2ctl configtest
systemctl restart apache2
```
最终你就可以在浏览器打开 `https://example.com/` 查看是否生效了。