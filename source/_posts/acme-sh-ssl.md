---
title: 使用 acme.sh 配置自动续签 SSL 证书
date: 2022-02-03T00:00:00.000+00:00
tags:
  - nginx
  - ssl
cover: https://s.bh.sb/images/acme-sh-ssl.webp
---

本文将介绍使用 acme.sh 配置自动续签的 SSL 证书。
之前介绍了 [Nginx](https://u.sb/nginx-ssl/) 和 [Apache](https://u.sb/apache-ssl/) 手工配置 SSL 证书的方法，美中不足的是，基本上大多数商业 SSL 证书都需要手工申请和签发，能支持 ACME 自动签发的并不多，有也略贵，比如 [ZeroSSL 高级版](https://u.nu/zerossl)和 [Digicert](https://www.digicert.com/) 等，那么对于大多数懒人来说，免费的 [Let's Encrypt](https://letsencrypt.org/)、[Buypass](https://www.buypass.com) 和 [ZeroSSL 免费版](https://u.nu/zerossl)就是不错的选择。

## 自动签发和手工签发证书的对比

所以我们建议如果您对服务器有完全控制权，那么自动签发的证书比较适合懒人运维，如果是长期运营的网站和项目，手工签发的证书对新手更友好，请自行选择。

## 安装 acme.sh

[acme.sh](https://acme.sh/) 是一个集成了 ACME 客户端协议的 Bash 脚本，作者是 [@neilpangxa](https://twitter.com/neilpangxa)，按照[官方文档](https://github.com/acmesh-official/acme.sh)说明，我们直接在 Linux 下安装。

`curl https://get.acme.sh | sh -s [[email protected]](/cdn-cgi/l/email-protection)`
如果是国内的机器，可以使用拖回源码直接安装：

```bash
git clone --depth 1 https://github.com/acmesh-official/acme.sh.git
cd acme.sh
./acme.sh --install -m [[email protected]](/cdn-cgi/l/email-protection)
```
请注意替换 `[[email protected]](/cdn-cgi/l/email-protection)` 为你自己的邮箱，避免无法收到上游证书的邮件通知，比如 Let's Encrypt 偶尔会错发证书，然后就会邮件通知你，这时候就需要重新签发一次证书了。

安装完成后重新加载 Bash：

`source ~/.bashrc`
然后也可以开启自动更新：

`acme.sh --upgrade --auto-upgrade`

## 选择默认 CA

目前 acme.sh 支持 4 个正式环境 CA，分别是 [Let's Encrypt](https://letsencrypt.org/)、[Buypass](https://www.buypass.com/)、[ZeroSSL](https://u.nu/zerossl)、[SSL.com](https://www.ssl.com/) 和 [Google Public CA](https://cloud.google.com/certificate-manager/docs/public-ca-tutorial)，默认使用 ZeroSSL，如果需要更换可以使用如下命令：

切换 Let's Encrypt

`acme.sh --set-default-ca --server letsencrypt`
切换 Buypass (已停止服务)

`acme.sh --set-default-ca --server buypass`
切换 ZeroSSL

`acme.sh --set-default-ca --server zerossl`
切换 SSL.com

`acme.sh --set-default-ca --server ssl.com`
切换 Google Public CA

`acme.sh --set-default-ca --server google`
如果已有 ZeroSSL 帐号，可以在后台控制面板拿到 API Key，然后执行如下命令

```bash
apt install jq
curl -s -X POST "https://api.zerossl.com/acme/eab-credentials?access_key=你的API_Key" | jq
```
终端会输出如下内容

```bash
{
  "success": true,
  "eab_kid": "kid字符串",
  "eab_hmac_key": "hmac_key字符串",
}
```
然后手工添加帐号

```bash
acme.sh --register-account  --server zerossl \
        --eab-kid kid字符串  \
        --eab-hmac-key hmac_key字符串
```
Google Public CA 需要按照[官方博客](https://cloud.google.com/blog/products/identity-security/automate-public-certificate-lifecycle-management-via--acme-client-api)申请内测，然后获取 Key。

几个 CA 的简单对比

简单来说，如果没有特殊需求，可以选择 Let's Encrypt，如果服务器在国内，可以选择 ZeroSSL 或 Buypass，如果愿意付费得到更好的服务和保障，可以选择 ZeroSSL 和 SSL.com，如果面向欧盟用户，可以选择 Buypass 和 ZeroSSL。

*注意：经过测试 Google Public CA 的 ACME 验证域名在国内是无法访问的，只有国外服务器才可以申请，申请完成后的证书并无影响。*

## 使用 HTTP 验证签发证书

首先我们要做一下准备工作，假设你域名是 `example.com`，解析到你的服务器让其生效后，我们建立一个目录：

`mkdir -p /var/www/letsencrypt`
我们的目的是绑定 `http://example.com/.well-known/acme-challenge` 到这个目录。

如果您用的 Nginx，那么新建一个配置文件：

```bash
server {
	listen 80;
	listen [::]:80;
	server_name example.com;

	location /.well-known/acme-challenge {
		root /var/www/letsencrypt;
	}

	location / {
		rewrite	^/(.*)$ https://$host/$1 permanent;
	}
}
```
如果您使用的 Apache，那么新建一个配置文件：

```bash
<VirtualHost *:80>
    ServerName example.com
    DocumentRoot /var/www/letsencrypt
    RewriteEngine On
    RewriteCond %{REQUEST_URI} !^/\.well\-known/acme\-challenge/
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>
```
我们以 Let's Encrypt 为例，直接在终端运行

`acme.sh --issue -d example.com -w /var/www/letsencrypt`
如果希望签发 RSA 证书，则运行

`acme.sh --issue -d example.com --keylength 2048 -w /var/www/letsencrypt`
如果需要多个域名，则运行

`acme.sh --issue -d example.com -d example.org -w /var/www/letsencrypt`
然后就等他执行完，直到出现 `Cert success` 的提示

![image.png](https://s.bh.sb/uploads/2022/02/03/AkZKwpqDhEYvPuf.png)

然后我们可以安装证书

Nginx

```bash
acme.sh --install-cert -d example.com \
--key-file       /etc/nginx/ssl/example.com.key  \
--fullchain-file /etc/nginx/ssl/example.com.crt \
--ca-file        /etc/nginx/ssl/example.com.ca.crt \
--reloadcmd     "systemctl restart nginx"
```
对应的 Nginx 配置指定证书文件

```bash
ssl_certificate /etc/nginx/ssl/example.com.crt;
ssl_certificate_key /etc/nginx/ssl/example.com.key;
ssl_trusted_certificate /etc/nginx/ssl/example.com.ca.crt;
```
Apache

```bash
acme.sh --install-cert -d example.com \
--key-file       /etc/apache2/ssl/example.com.key  \
--fullchain-file /etc/apache2/ssl/example.com.crt \
--ca-file        /etc/apache2/ssl/example.com.ca.crt \
--reloadcmd     "curl https://ssl-config.mozilla.org/ffdhe2048.txt >> /etc/apache2/ssl/example.com.crt && systemctl restart apache2"
```
对应的 Apache 配置指定证书文件

```bash
SSLCertificateFile      /etc/apache2/ssl/example.com.crt
SSLCertificateKeyFile   /etc/apache2/ssl/example.com.key
```
如果是 ECC 证书，则安装的时候需要带上 `--ecc` 参数，比如

```bash
acme.sh --install-cert --ecc -d example.com \
--key-file       /etc/nginx/ssl/example.com.key  \
--fullchain-file /etc/nginx/ssl/example.com.crt \
--ca-file        /etc/nginx/ssl/example.com.ca.crt \
--reloadcmd     "systemctl restart nginx"
```
注意如果是多个域名，也仅需要在 `-d` 参数后面指定第一个域名即可。

## 使用 DNS 验证签发证书

有时候因为不想暴露一些二级域名，或者希望在多台机器上部署同一个域名的证书，这时候就需要用到 DNS 插件了，[acme.sh](https://github.com/acmesh-official/acme.sh/wiki/dnsapi) 支持几十种 DNS 插件。

这里以 Cloudflare 为例，登录 Cloudflare Dash 后在 [API Token](https://dash.cloudflare.com/profile/api-tokens) 菜单里添加一个 API Token：

![image.png](https://s.bh.sb/uploads/2022/02/03/v3mqaPBoQrMdeWY.png)

然后选择 Edit Zone DNS 的模板

![image.png](https://s.bh.sb/uploads/2022/02/03/8apTAqQWw7yKjcH.png)

选择你要编辑的域名，也可以加入你服务器的 IP 作为白名单

![image.png](https://s.bh.sb/uploads/2022/02/03/29BYTVniOpDwU4c.png)

完成后会给你一串字符，把他复制下来，需要填入下方的 `CF_Token` 参数

![image.png](https://s.bh.sb/uploads/2022/02/03/lMy3AeGgXsRJnHk.png)

然后进入域名的管理页面，在右侧 API 列找到 `Account ID` 和 `Zone ID` 并复制

![image.png](https://s.bh.sb/uploads/2022/02/03/Mi2eUH5X7xJqclj.png)

接着在终端运行

```bash
export CF_Token="复制下来的 Token"
export CF_Account_ID="复制下来的 Account ID"
export CF_Zone_ID="复制下来的 Zone ID"
```
然后开启 acme.sh 的 DNS API 模式申请证书

`acme.sh --issue --dns dns_cf -d example.com -d *.example.com`
安装证书方法同上，另外吐槽下，很多教程会让你用 Cloudflare 的全局 Global API Key，真的是，风险太大了，最后怎么被黑的都不知道 = =

如果不想使用第三方的 DNS 服务完全可以自建 [acme-dns](https://github.com/joohoi/acme-dns) 或者 [PowerDNS](https://github.com/PowerDNS/pdns)，篇幅有限，我们之后再介绍。