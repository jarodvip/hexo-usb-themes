---
title: Docker 安装 FreshRSS 教程
date: 2024-06-21T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/docker-freshrss.webp
---

本文将指导如何在 Linux 下使用 Docker 和 Docker Compose 安装 FreshRSS 开源 RSS 聚合器服务。

*PS：本文同时适用于任何可安装 Docker 的 Linux 发行版。*

# 什么是 FreshRSS？

[FreshRSS](https://freshrss.org/) 是一款免费且开源的 RSS 聚合器，设计用于帮助用户集中管理和阅读来自不同网站的新闻源。它具有高效、轻量的特点，并且支持多用户使用。

# 安装 Docker 和 Docker Compose

Debian 和 Ubuntu 系统请参考[本站教程](/debian-install-docker/)。

其他 Linux 系统可以使用 Docker 官方的脚本安装 Docker 和 Docker Compose：

`curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
`Copy

# 安装 FreshRSS

这里我们使用 PostgreSQL 数据库，首先创建一个目录用于存放 FreshRSS 的配置文件和数据库文件：

`mkdir -p /opt/freshrss
cd /opt/freshrss
`Copy
然后创建一个 `docker-compose.yml` 文件：

`services:

  freshrss:
    image: freshrss/freshrss:latest
    container_name: freshrss
    hostname: freshrss
    restart: unless-stopped
    logging:
      options:
        max-size: 10m
    volumes:
      - ./data:/var/www/FreshRSS/data
      - ./extensions:/var/www/FreshRSS/extensions
    environment:
      TZ: Etc/UTC
      CRON_MIN: '3,33'
      TRUSTED_PROXY: 172.16.0.1/12 192.168.0.1/16
      ADMIN_EMAIL: 你的邮箱
      BASE_URL: 你的 FreshRSS 访问地址
    ports:
      - 127.0.0.1:8080:80

  freshrss-db:
    image: postgres:16
    container_name: freshrss-db
    hostname: freshrss-db
    restart: unless-stopped
    logging:
      options:
        max-size: 10m
    volumes:
      - ./db:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: freshrss
      POSTGRES_USER: freshrss
      POSTGRES_PASSWORD: freshrss
    command:
      - -c
      - shared_buffers=1GB
      - -c
      - work_mem=32MB
`Copy
请自行替换 `ADMIN_EMAIL` 和 `BASE_URL` 的值，`BASE_URL` 需要写全，比如 `https://freshrss.example.com`。

然后拉取 Docker 镜像并运行：

`cd /opt/freshrss
docker compose pull
docker compose up -d
`Copy

# 安装配置 Nginx 反向代理

我们的 Docker Compose 配置文件中，FreshRSS 服务监听在 `127.0.0.1:8080` 端口，所以我们需要配置 Nginx 反代来访问，假设你 FreshRSS 的地址是 `https://freshrss.example.com`：

`freshrss.example.com` 段配置：

`	location / {
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header Host $http_host;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_redirect off;
		proxy_set_header        X-Forwarded-Proto $scheme;
		proxy_connect_timeout       300;
		proxy_send_timeout          300;
		proxy_read_timeout          300;
		send_timeout                300;
		proxy_pass http://127.0.0.1:8080;
	}
`Copy
最后记得参考本站 [Nginx SSL 配置教程](/nginx-ssl/)加上 SSL 证书后，即可访问 `https://freshrss.example.com/`：

# 配置 FreshRSS

访问 `https://freshrss.example.com/`，在安装向导中填写数据库信息：

- 数据库类型：`PostgreSQL`

- 数据库主机（Host）：`freshrss-db`

- 数据库名称（Database）：`freshrss`

- 数据库用户（User）：`freshrss`

- 数据库密码（Password）：`freshrss`

然后点击 `Install FreshRSS` 即可完成安装。

如果需要安装插件，可以把插件上传到 `/opt/freshrss/extensions` 目录，然后在 FreshRSS 后台安装。

推荐在官方插件仓库里下载插件：[FreshRSS Extensions](https://github.com/FreshRSS/Extensions)

推荐安装 [CustomCSS](https://github.com/FreshRSS/Extensions/tree/master/xExtension-CustomCSS) 插件，就可以使用自定义 CSS 样式了，个人比较喜欢[这个主题系列](https://github.com/catppuccin/freshrss)。

如果需要第三方客户端，可以在这里查看支持的应用：[APIs & native apps](https://github.com/FreshRSS/FreshRSS/blob/edge/README.md#apis--native-apps)

# 迁移 FreshRSS

可以参考《[使用 Docker 安装 Mailcow 自建域名邮箱](/docker-mailcow/#mailcow-%E7%9A%84%E8%BF%81%E7%A7%BB-t2)》。

# 备份 FreshRSS

我们可以定期备份 FreshRSS 网站文件和数据库，压缩网站目录和导出数据库命令如下：

```
`backup_folder_name=$(date +"%Y_%m_%d_%I_%M_%p")
# 备份 FreshRSS 网站文件
tar --exclude /opt/freshrss/data/cache -zcvf data-$backup_folder_name.tar.gz /opt/freshrss/data
tar -zcvf extensions-$backup_folder_name.tar.gz /opt/freshrss/extensions
# 备份 FreshRSS 数据库
docker exec -t freshrss-db pg_dumpall -c -U freshrss | gzip > database-$backup_folder_name.gz
`
```
Copy