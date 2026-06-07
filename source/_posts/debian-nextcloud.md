---
title: Debian 安装 Nextcloud 服务端
date: 2025-10-20T00:00:00.000+00:00
tags:
  - debian
  - nextcloud
cover: https://s.bh.sb/images/debian-nextcloud.webp
---

本文将指导如何在 Debian 下安装并配置 Nextcloud 服务端。

本文的教程同时适用于 [Debian Stable](https://www.debian.org/releases/stable/) 以及 [Ubuntu LTS](https://releases.ubuntu.com/)。

以下操作需要在 root 用户下完成，请使用 `sudo -i` 或 `su root` 切换到 root 用户进行操作。

## 什么是 Nextcloud？

[Nextcloud](https://nextcloud.com/) 是一套用于建立网络硬盘的客户端和服务器软件。其功能和 Dropbox 相近，但 Nextcloud 是开源的，任何人都可以在自己的服务器上安装并运行它。

虽然 Nextcloud 性能比较弱，但是实际测试下来几个人的小团队用用也足够了。

安装之前你可以先去官方的 [Demo](https://try.nextcloud.com/access) 体验。

## 准备环境

由于 Nextcloud 消耗资源比较大，一般我们不建议在 4GB 内存以下的 VPS 安装，官方[推荐配置](https://docs.nextcloud.com/server/stable/admin_manual/installation/system_requirements.html)为 512MB 内存，实际体验下来安装在 8GB 内存上跑 Nextcloud 会比较流畅。

## 配置 LEMP 环境

首先，可以参考本站[教程](/debian-install-nginx-php-mysql/)配置好 LEMP 环境，在安装 PHP 的时候，请选择 PHP 8.3 以及以下模块：

`apt install php8.4-{common,fpm,mysql,curl,gd,mbstring,xml,xmlrpc,zip,bz2,intl,ldap,smbclient,bcmath,gmp,imap,opcache,imagick,redis} imagemagick redis-server -y`
这里我们使用了 Redis 作为缓存，所以需要安装 `redis-server` 和 `php8.4-redis`，请不要直接安装 `php-redis`，否则系统会默认把所有的 PHP 版本都给你安装一遍哦。

如果想用最新的官方 Redis 的话可以添加官方源：

```bash
curl -sSL https://packages.redis.io/gpg | gpg --dearmor > /usr/share/keyrings/redis-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" > /etc/apt/sources.list.d/redis.list

apt update
apt install redis-server -y
```

```
```
`curl -sSL https://packages.redis.io/gpg | gpg --dearmor > /usr/share/keyrings/redis-archive-keyring.gpg

cat > /etc/apt/sources.list.d/redis.sources << EOF
Components: main
Architectures: $(dpkg --print-architecture)
Suites: $(lsb_release -cs)
Types: deb
Uris: https://packages.redis.io/deb
Signed-By: /usr/share/keyrings/redis-archive-keyring.gpg
EOF

apt update
apt install redis-server -y
`
```
```
Copy

```
```
`apt install extrepo -y
extrepo enable redis
apt update
apt install redis-server -y
`
```
```
Copy

## 优化 PHP-FPM 设置

由于默认的 PHP-FPM 设置只适合小型应用，不适合 Nextcloud 这种消耗资源比较大的程序，所以我们可以修改如下参数，这里的例子是你想设置最大上传的文件为 10GB：

```bash
sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' /etc/php/8.4/fpm/php.ini 
sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 10240M/' /etc/php/8.4/fpm/php.ini
sed -i 's/post_max_size = 8M/post_max_size = 10240M/' /etc/php/8.4/fpm/php.ini
sed -i 's/memory_limit = 128M/memory_limit = 512M/' /etc/php/8.4/fpm/php.ini
sed -i 's/;opcache.interned_strings_buffer=8/opcache.interned_strings_buffer=16/' /etc/php/8.4/fpm/php.ini
sed -i 's/;listen.mode = 0660/listen.mode = 0660/' /etc/php/8.4/fpm/pool.d/www.conf
sed -i 's/pm.max_children = 5/pm.max_children = 20/' /etc/php/8.4/fpm/pool.d/www.conf
sed -i 's/pm.start_servers = 2/pm.start_servers = 4/' /etc/php/8.4/fpm/pool.d/www.conf
sed -i 's/pm.min_spare_servers = 1/pm.min_spare_servers = 2/' /etc/php/8.4/fpm/pool.d/www.conf
sed -i 's/pm.max_spare_servers = 3/pm.max_spare_servers = 8/' /etc/php/8.4/fpm/pool.d/www.conf
sed -i 's/;clear_env = no/clear_env = no/' /etc/php/8.4/fpm/pool.d/www.conf
```
具体配置可以参考[官网教程](https://docs.nextcloud.com/server/stable/admin_manual/installation/source_installation.html)。

然后我们重启 PHP-FPM 生效：

`systemctl restart php8.4-fpm.service`

## 配置 Nginx

我们假设你的 Nextcloud 需要安装在 `/var/www/nextcloud` 目录，配置的域名是 `cloud.example.com`，证书文件位于 `/etc/nginx/ssl/cloud.example.com.crt`，证书私钥位于 `/etc/nginx/ssl/cloud.example.com.key`，那么我们直接参考官网上的[第三方教程](https://docs.nextcloud.com/server/stable/admin_manual/installation/nginx.html)配置 Nginx：

`upstream php-handler {
    # server 127.0.0.1:9000;
    server unix:/var/run/php/php8.4-fpm.sock;
}

## Set the `immutable` cache control options only for assets with a cache busting `v` argument
map $arg_v $asset_immutable {
    "" "";
    default "immutable";
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    listen 443 quic;
    listen [::]:443 quic;

    http2 on;

    server_name cloud.example.com;

    # Path to the root of your installation
    root /var/www/nextcloud;

    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions
    ssl_session_tickets off;

    # curl https://ssl-config.mozilla.org/ffdhe2048.txt > /etc/nginx/ssl/dhparam
    ssl_dhparam /etc/nginx/ssl/dhparam;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

    ssl_certificate /etc/nginx/ssl/cloud.example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/cloud.example.com.key;

    # HSTS settings
    # WARNING: Only add the preload option once you read about
    # the consequences in https://hstspreload.org/. This option
    # will add the domain to a hardcoded list that is shipped
    # in all major browsers and getting removed from this list
    # could take several months.
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always; 
    add_header Alt-Svc 'h3=":443"; ma=86400' always;

    # set max upload size and increase upload timeout:
    client_max_body_size 10240M;
    client_body_timeout 300s;
    fastcgi_buffers 64 4K;

    # Enable gzip but do not remove ETag headers
    gzip on;
    gzip_vary on;
    gzip_comp_level 4;
    gzip_min_length 256;
    gzip_proxied expired no-cache no-store private no_last_modified no_etag auth;
    gzip_types application/atom+xml application/javascript application/json application/ld+json application/manifest+json application/rss+xml application/vnd.geo+json application/vnd.ms-fontobject application/wasm application/x-font-ttf application/x-web-app-manifest+json application/xhtml+xml application/xml font/opentype image/bmp image/svg+xml image/x-icon text/cache-manifest text/css text/plain text/vcard text/vnd.rim.location.xloc text/vtt text/x-component text/x-cross-domain-policy;

    # Pagespeed is not supported by Nextcloud, so if your server is built
    # with the `ngx_pagespeed` module, uncomment this line to disable it.
    # pagespeed off;

    # HTTP response headers borrowed from Nextcloud `.htaccess`
    add_header Referrer-Policy                      "no-referrer"   always;
    add_header X-Content-Type-Options               "nosniff"       always;
    add_header X-Download-Options                   "noopen"        always;
    add_header X-Frame-Options                      "SAMEORIGIN"    always;
    add_header X-Permitted-Cross-Domain-Policies    "none"          always;
    add_header X-Robots-Tag                         "none"          always;
    add_header X-XSS-Protection                     "1; mode=block" always;

    # Remove X-Powered-By, which is an information leak
    fastcgi_hide_header X-Powered-By;

    # Specify how to handle directories -- specifying `/index.php$request_uri`
    # here as the fallback means that Nginx always exhibits the desired behaviour
    # when a client requests a path that corresponds to a directory that exists
    # on the server. In particular, if that directory contains an index.php file,
    # that file is correctly served; if it doesn't, then the request is passed to
    # the front-end controller. This consistent behaviour means that we don't need
    # to specify custom rules for certain paths (e.g. images and other assets,
    # `/updater`, `/ocm-provider`, `/ocs-provider`), and thus
    # `try_files $uri $uri/ /index.php$request_uri`
    # always provides the desired behaviour.
    index index.php index.html /index.php$request_uri;

    # Rule borrowed from `.htaccess` to handle Microsoft DAV clients
    location = / {
        if ( $http_user_agent ~ ^DavClnt ) {
            return 302 /remote.php/webdav/$is_args$args;
        }
    }

    location = /robots.txt {
        allow all;
        log_not_found off;
        access_log off;
    }

    # Make a regex exception for `/.well-known` so that clients can still
    # access it despite the existence of the regex rule
    # `location ~ /(\.|autotest|...)` which would otherwise handle requests
    # for `/.well-known`.
    location ^~ /.well-known {
        # The rules in this block are an adaptation of the rules
        # in `.htaccess` that concern `/.well-known`.

        location = /.well-known/carddav { return 301 /remote.php/dav/; }
        location = /.well-known/caldav  { return 301 /remote.php/dav/; }

        location /.well-known/acme-challenge    { try_files $uri $uri/ =404; }
        location /.well-known/pki-validation    { try_files $uri $uri/ =404; }

        # Let Nextcloud's API for `/.well-known` URIs handle all other
        # requests by passing them to the front-end controller.
        return 301 /index.php$request_uri;
    }

    # Rules borrowed from `.htaccess` to hide certain paths from clients
    location ~ ^/(?:build|tests|config|lib|3rdparty|templates|data)(?:$|/)  { return 404; }
    location ~ ^/(?:\.|autotest|occ|issue|indie|db_|console)                { return 404; }

    # Ensure this block, which passes PHP files to the PHP process, is above the blocks
    # which handle static assets (as seen below). If this block is not declared first,
    # then Nginx will encounter an infinite rewriting loop when it prepends `/index.php`
    # to the URI, resulting in a HTTP 500 error response.
    location ~ \.php(?:$|/) {
        # Required for legacy support
        rewrite ^/(?!index|remote|public|cron|core\/ajax\/update|status|ocs\/v[12]|updater\/.+|oc[ms]-provider\/.+|.+\/richdocumentscode\/proxy) /index.php$request_uri;

        fastcgi_split_path_info ^(.+?\.php)(/.*)$;
        set $path_info $fastcgi_path_info;

        try_files $fastcgi_script_name =404;

        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $path_info;
        fastcgi_param HTTPS on;
        fastcgi_param HTTP_HOST $host;

        fastcgi_param modHeadersAvailable true;         # Avoid sending the security headers twice
        fastcgi_param front_controller_active true;     # Enable pretty urls
        fastcgi_pass php-handler;

        fastcgi_intercept_errors on;
        fastcgi_request_buffering off;

        fastcgi_max_temp_file_size 0;
    }

    location ~ \.(?:css|js|svg|gif|png|jpg|ico|wasm|tflite|map)$ {
        try_files $uri /index.php$request_uri;
        add_header Cache-Control "public, max-age=15778463, $asset_immutable";
        access_log off;     # Optional: Don't log access to assets

        location ~ \.wasm$ {
            default_type application/wasm;
        }
    }

    location ~ \.woff2?$ {
        try_files $uri /index.php$request_uri;
        expires 7d;         # Cache-Control policy borrowed from `.htaccess`
        access_log off;     # Optional: Don't log access to assets
    }

    # Rule borrowed from `.htaccess```bash
location /remote {
        return 301 /remote.php$request_uri;
    }

    location / {
        try_files $uri $uri/ /index.php$request_uri;
    }
}
```
关于 SSL 配置可以参考本站教程《[Nginx 配置 SSL 证书](/nginx-ssl/)》和《[使用 acme.sh 配置自动续签 SSL 证书](/acme-sh-ssl/)》。

如果要修改上传文件大小限制，请求改 Nginx 配置里的 `client_max_body_size 10240M;` 和 PHP 配置里的 `upload_max_filesize` 和 `post_max_size` 参数，本教程举例是上传文件最大限制 10GB。

检查无误后重启 Nginx 生效

```bash
nginx -t
nginx -s reload
```

## 安装 Nextcloud

首先进入 `/var/www` 目录，下载并解压最新的 Nextcloud：

```bash
cd /var/www
wget -O nextcloud.zip https://download.nextcloud.com/server/releases/latest.zip
unzip nextcloud.zip
```
然后我们设置解压出来的 `nextcloud` 文件夹权限和 PHP 以及 Nginx 对应，设置为 `www-data` 用户，因为 Debian 下默认 `www-data` 用户/用户组的 uid 和 gid 是 33，所以直接使用 `chown 33:33` 即可：

```bash
chown 33:33 nextcloud -R
find nextcloud/ -type d -exec chmod 750 {} \;
find nextcloud/ -type f -exec chmod 640 {} \;
```
安装完成后，直接访问 `https://cloud.example.com` 填入你配置好的数据库信息以及管理员帐号密码即可登录你的 Nextcloud。

## 配置 Redis 缓存

Debian 默认安装的 `redis-server` 已经给你基本配置好了，只监听在本地 `127.0.0.1` 的 `6379` 端口，如果没有特殊需求不需要修改。

首先，我们把 `redis` 用户加入 `www-data` 用户组：

`usermod -a -G redis www-data`
然后修改 `/var/www/nextcloud/config/config.php` 文件，在最后一行 `);` 字符前加入：

```bash
'memcache.locking' => '\\OC\\Memcache\\Redis',
  'memcache.distributed' => '\\OC\\Memcache\\Redis',
  'memcache.local' => '\\OC\\Memcache\\Redis',
  'redis' => 
  array (
    'host' => '127.0.0.1',
    'port' => 6379,
  ),
```
重启 PHP-FPM 生效：

`systemctl restart php8.4-fpm`
其他缓存方式可以参考[官方文档](https://docs.nextcloud.com/server/stable/admin_manual/configuration_server/caching_configuration.html)。

如果没有问题，可以访问 `https://cloud.example.com/settings/admin/serverinfo` 查看服务器信息了。

## 配置 Crontab

我们需要使用 Linux 内置的 cron 来运行自动化任务，直接使用 www-data 用户修改定时任务：

`crontab -u www-data -e`
选择一款你喜欢的编辑器然后加入：

`*/5  *  *  *  * /usr/bin/php -f /var/www/nextcloud/cron.php`
这个命令的含义是每 5 分钟执行一次 Nextcloud 的定时任务，具体可以参考[官网教程](https://docs.nextcloud.com/server/stable/admin_manual/configuration_server/background_jobs_configuration.html)。

保存后可以使用 `crontab -u www-data -l` 命令查看当前 `www-data` 用户下的定时任务。

## 安装 Nextcloud 客户端

这里就不再赘述了，直接从[官网](https://nextcloud.com/install/)下载并安装对应操作系统的软件即可，登录的时候输入完整的网址 `https://cloud.example.com/` 即可登录你自己的 Nextcloud。

![Nextcloud Demo](https://s.bh.sb/2025/10/20/nextcloud_KAJxG.webp)

## Nextcloud 更新

如果你的用户和数据不多，直接用管理员访问 `https://cloud.example.com/updater/` 即可更新到最新稳定版本。

如果服务器的负载较高或自动下载网速较慢，可以使用命令行更新：

```bash
cd /var/www/nextcloud
sudo -u www-data php ./updater/updater.phar --no-interaction
```
具体可以参考官网教程：[更新](https://docs.nextcloud.com/server/stable/admin_manual/maintenance/update.html)、[升级](https://docs.nextcloud.com/server/stable/admin_manual/maintenance/upgrade.html)和[手工升级](https://docs.nextcloud.com/server/stable/admin_manual/maintenance/manual_upgrade.html)。

**切记更新之前先备份数据，避免丢失重要数据哦。**

## Nextcloud 备份

Nextcloud 目前还是个典型的 PHP + MySQL 程序，所以理论上只要备份 `/var/www/nextcloud` 目录，你的文件储存目录 (默认在 `/var/www/nextcloud/data`) 以及 MySQL 数据库即可，这里不再赘述。