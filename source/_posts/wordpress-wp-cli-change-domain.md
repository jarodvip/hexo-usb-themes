---
title: WordPress 使用 WP-CLI 批量更换域名
date: 2022-03-22T00:00:00.000+00:00
tags:
  - wordpress
  - wp-cli
cover: https://s.bh.sb/images/wordpress-wp-cli-change-domain.webp
---

本文将指导如何在 Debian 11 和 Ubuntu 20.04 下 WP-CLI 更换 WordPress 域名。

*PS：本文同时适用于任意 Linux 系统，请自行承担使用风险*

## 前提背景

有时候我们需要给 [WordPress](https://wordpress.org/) 更换域名，大多数网上的教程是要你从 [phpMyAdmin](https://www.phpmyadmin.net/) 提交 SQL 语句，而且大多数教程要你修改的表就两个，实际上有三个。

对于本站的读者来说，我们都有 `root` 权限了，不需要这货，此时我们直接拿出大杀器，WordPress 官方的 [`WP-CLI`](https://wp-cli.org/) 工具。

## 安装 WP-CLI

按照[官方教程](https://wp-cli.org/#installing)，直接安装：

```bash
wget -O wp-cli.phar https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
```
此时即可通过 `wp --info` 命令查看 `WP-CLI` 信息：

```bash
root@wordpress ~ # sudo -u www-data wp --info
OS:	Linux 5.10.0-11-cloud-amd64 #1 SMP Debian 5.10.92-2 (2022-02-28) x86_64
Shell:	/usr/sbin/nologin
PHP binary:	/usr/bin/php8.1
PHP version:	8.1.3
php.ini used:	/etc/php/8.1/cli/php.ini
MySQL binary:	/usr/bin/mysql
MySQL version:	mysql  Ver 15.1 Distrib 10.7.3-MariaDB, for debian-linux-gnu (x86_64) using readline EditLine wrapper
SQL modes:	
WP-CLI root dir:	phar://wp-cli.phar/vendor/wp-cli/wp-cli
WP-CLI vendor dir:	phar://wp-cli.phar/vendor
WP_CLI phar path:	/root
WP-CLI packages dir:	
WP-CLI global config:	
WP-CLI project config:	
WP-CLI version:	2.6.0
```

## 批量替换 WordPress 域名

首先，按照本站的 [LEMP](/debian-install-nginx-php-mysql/) 或 [LAMP](/debian-install-apache-php-mysql/) 教程，复制一份 Nginx 或 Apache 的配置，让其同时生效新旧域名，记得 SSL 证书也需要更新。

然后，进入 WordPress 的安装目录，假设目录为 `/var/www/example.com` 旧的 URL 为 `https://old.example.com`，需要替换的新的 URL 为 `https://new.example.com`：

```bash
cd /var/www/example.com
sudo -u www-data wp search-replace 'https://old.example.com' 'https://new.example.com' --dry-run
```
此时并不会真正施行替换命令，因为我们加了 `--dry-run` 参数，你可以看到需要替换的条目数是否和预估的匹配：

```bash
root@wordpress /var/www/example.com # sudo -u www-data wp search-replace 'https://old.example.com' 'https://new.example.com' --dry-run
+------------------+-----------------------+--------------+------+
| Table            | Column                | Replacements | Type |
+------------------+-----------------------+--------------+------+
| wp_commentmeta   | meta_key              | 0            | SQL  |
| wp_commentmeta   | meta_value            | 0            | SQL  |
| wp_comments      | comment_author        | 0            | SQL  |
| wp_comments      | comment_author_email  | 0            | SQL  |
| wp_comments      | comment_author_url    | 0            | SQL  |
| wp_comments      | comment_author_IP     | 0            | SQL  |
| wp_comments      | comment_content       | 15           | SQL  |
| wp_comments      | comment_approved      | 0            | SQL  |
| wp_comments      | comment_agent         | 0            | SQL  |
| wp_comments      | comment_type          | 0            | SQL  |
| wp_links         | link_url              | 0            | SQL  |
| wp_links         | link_name             | 0            | SQL  |
| wp_links         | link_image            | 0            | SQL  |
| wp_links         | link_target           | 0            | SQL  |
| wp_links         | link_description      | 0            | SQL  |
| wp_links         | link_visible          | 0            | SQL  |
| wp_links         | link_rel              | 0            | SQL  |
| wp_links         | link_notes            | 0            | SQL  |
| wp_links         | link_rss              | 0            | SQL  |
| wp_options       | option_name           | 0            | SQL  |
| wp_options       | option_value          | 2            | PHP  |
| wp_options       | autoload              | 0            | SQL  |
| wp_postmeta      | meta_key              | 0            | SQL  |
| wp_postmeta      | meta_value            | 1            | PHP  |
| wp_posts         | post_content          | 331          | SQL  |
| wp_posts         | post_title            | 0            | SQL  |
| wp_posts         | post_excerpt          | 0            | SQL  |
| wp_posts         | post_status           | 0            | SQL  |
| wp_posts         | comment_status        | 0            | SQL  |
| wp_posts         | ping_status           | 0            | SQL  |
| wp_posts         | post_password         | 0            | SQL  |
| wp_posts         | post_name             | 0            | SQL  |
| wp_posts         | to_ping               | 0            | SQL  |
| wp_posts         | pinged                | 0            | SQL  |
| wp_posts         | post_content_filtered | 0            | SQL  |
| wp_posts         | guid                  | 19315        | SQL  |
| wp_posts         | post_type             | 0            | SQL  |
| wp_posts         | post_mime_type        | 0            | SQL  |
| wp_term_taxonomy | taxonomy              | 0            | SQL  |
| wp_term_taxonomy | description           | 0            | SQL  |
| wp_termmeta      | meta_key              | 0            | SQL  |
| wp_termmeta      | meta_value            | 0            | SQL  |
| wp_terms         | name                  | 0            | SQL  |
| wp_terms         | slug                  | 0            | SQL  |
| wp_usermeta      | meta_key              | 0            | SQL  |
| wp_usermeta      | meta_value            | 0            | PHP  |
| wp_users         | user_login            | 0            | SQL  |
| wp_users         | user_nicename         | 0            | SQL  |
| wp_users         | user_email            | 0            | SQL  |
| wp_users         | user_url              | 0            | SQL  |
| wp_users         | user_activation_key   | 0            | SQL  |
| wp_users         | display_name          | 0            | SQL  |
+------------------+-----------------------+--------------+------+
Success: 19664 replacements to be made.
```
我们可以看到，基本上就 `comment_content`，`post_content` 和 `guid` 需要替换，没有问题的话就直接执行：

```bash
cd /var/www/example.com
sudo -u www-data wp search-replace 'https://old.example.com' 'https://new.example.com'
```
执行完成后会出现类似 `Success: Made 19664 replacements.` 的提示。

注意，如果之前没有开启过 HTTPS，那么你可能需要使用 `http://old.example.com` 来替换，建议执行两次，不推荐直接执行替换 `old.example.com`。

## 修改 wp-config.php

我们也可以打开 `wp-config.php`，加入下面两行代码来完成新的域名替换：

```bash
define('WP_HOME','https://new.example.com/');
define('WP_SITEURL','https://new.example.com/');
```

## 修改 WordPress 后台设置

我们也可以进入 WordPress 后台，在常规设置里更换新的域名，进入 `https://new.example.com/wp-admin/options-general.php` 然后更换 `WordPress 地址（URL）` 和 `站点地址（URL）`

![image.png](https://s.bh.sb/uploads/2022/03/22/iYnw2gzFRc96dUm.png)

这两种方法治标不治本，仅对新的文章参数生效，旧的文章和评论地址里都是旧域名，所以我们还是推荐使用 `WP-CLI` 直接替换新的域名。

最后别忘了更新 `Nginx` 或 `Apache` 配置，让旧的域名跳转到新的域名：

Nginx 配置如下

```bash
server_name old.example.com;
return 301 https://new.example.com$request_uri;
```
Apache 配置如下

```
```
`RewriteEngine On
RewriteCond %{HTTP_HOST} ^old.example.com [NC]
RewriteRule ^(.*)$ https://new.example.com$1 [R=301,L]
`
```
```
Copy