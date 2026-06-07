---
title: Docker 安装 Plausible Analytics 自建网站统计
date: 2022-03-29T00:00:00.000+00:00
tags:
  - debian
  - ubuntu
cover: https://s.bh.sb/images/docker-plausible.webp
---

本文将指导使用 Docker 安装 Plausible Analytics 自建网站统计。

*PS：本文同时适用于任何可安装 Docker 的 Linux 发行版。*

## 为什么要自建网站统计？

原因很简单，自己网站的数据当然要自己保管，你希望你网站的数据都被第三方卖给 “所谓的” 大数据分析公司吗？

[Plausible Analytics](https://github.com/plausible/analytics) 是一款以隐私保护著称的网站统计软件，经过几个月的试用，基本可以满足所有的需求，可以取代商业化的 Google Analytics 等产品。

## 安装 Docker 和 Docker Compose

Debian 和 Ubuntu 系统请参考[本站教程](/debian-install-docker/)。

其他 Linux 系统可以使用 Docker 官方的脚本安装 Docker 和 Docker Compose：

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## 安装 Plausible Analytics

建议安装在 `/opt/plausible` 目录：

首先，需要克隆官方的社区版本 Docker Compose 仓库

```bash
cd /opt
git clone https://github.com/plausible/community-edition plausible
cd /opt/plausible
```
然后添加变量环境，比如你的 Plausible 访问域名和 Secret Key

```bash
touch .env
echo "BASE_URL=https://plausible.example.com" >> .env
echo "SECRET_KEY_BASE=$(openssl rand -base64 48)" >> .env
```
假设我们把 Plausible 监听在本地 8000 端口：

`echo "HTTP_PORT=8000" >> .env`
然后添加一个 `compose.override.yml` 文件：

```bash
cat > compose.override.yml << 'EOF'
services:
  plausible:
    ports:
      - 127.0.0.1:8000:${HTTP_PORT}
EOF
```
接着抓取镜像并启动：

```bash
docker compose pull
docker compose up -d
```
启动完成后即可使用 `http://127.0.0.1:8000/` 访问 Plausible，如果需要对外进行服务，我们还需要配置 Nginx 反向代理。

## 设置 Nginx 反代

从 `docker-compose.yaml` 配置里可以看出，我们监听在本地 8000 端口，此时我们可以用 Nginx 反代并开启 HTTPS，您可以参考本站教程：

- [安装 Nginx](/debian-install-nginx-php-mysql/#2%E3%80%81%E5%A2%9E%E5%8A%A0%E7%83%A7%E9%A5%BC%E5%8D%9A%E5%AE%A2%E6%89%93%E5%8C%85%E7%9A%84-nginx-%E6%BA%90%E5%B9%B6%E5%AE%89%E8%A3%85-t2=)

- [Nginx 配置 SSL 证书](/nginx-ssl/)

- [使用 acme.sh 配置自动续签 SSL 证书](/acme-sh-ssl/)

然后直接反代本地 `8000` 端口，参考配置如下：

```bash
location / {
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header Host $http_host;
	proxy_set_header X-NginX-Proxy true;
	proxy_http_version 1.1;
	proxy_set_header Upgrade $http_upgrade;
	proxy_redirect off;
	proxy_set_header        X-Forwarded-Proto $scheme;
	proxy_connect_timeout       300;
	proxy_send_timeout          300;
	proxy_read_timeout          300;
	send_timeout                300;
	proxy_pass http://127.0.0.1:8000;

    location = /live/websocket {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

}
```
重启 Nginx 后生效我们即可访问 `https://stat.example.com/`

## 配置 Plausible Analytics

访问刚搭建好的 Plausible 并使用配置文件里的管理员邮箱和密码登录 (要使用邮箱登录哦，不是用户名)：

![image.png](https://s.bh.sb/uploads/2022/03/29/EnYSGK293hjqfNl.png)

登录后新建第一个要统计的网站域名，点击 `+Add a website`：

![image.png](https://s.bh.sb/uploads/2022/03/29/HnqOVW4dUkNaXSj.png)

输入要统计的网站域名，选择发送报告的时区，然后点击 `Add snippet →` 按钮：

![image.png](https://s.bh.sb/uploads/2022/03/29/V7Yw1Th6qngyZ3K.png)

然后把统计代码插入你的网页即可进行统计：

![image.png](https://s.bh.sb/uploads/2022/03/29/GCcjFNrgRItYAOU.png)

## 更新 Plausible Analytics

首先更新仓库

```bash
cd /opt/plausible
git pull
```
接着用万能的 Docker 更新大法：

```bash
# 抓取最新的 Docker 镜像
docker compose pull
## 重启所有 Docker 镜像
docker compose up -d
## 清理 Docker 旧容器和残留镜像
docker system prune
```
切记更新前先备份！

## 备份 Plausible Analytics

其实主要是备份数据库，相关命令如下：

`docker exec -t plausible_plausible_db_1 pg_dumpall -c -U postgres | gzip > dump_$(date +"%Y-%m-%d_%H_%M_%S").gz`
即可按照当前时间 dump 出 PostgreSQL 数据库并使用 `gzip` 压缩打包。

## 迁移 Plausible Analytics

可以参考 Mailcow 的[迁移方法](/docker-mailcow/#mailcow-%E7%9A%84%E8%BF%81%E7%A7%BB-t2=)。

## 卸载 Plausible Analytics

```bash
docker compose down
rm -rf /opt/plausible
docker image rm postgres
docker image rm maxmindinc/geoipupdate:latest
docker image rm plausible/analytics:latest
docker image rm yandex/clickhouse-server
docker image rm bytemark/smtp:latest
docker volume rm plausible_db-data
docker volume rm plausible_event-data
```

## WordPress 添加方法

直接修改你使用的主题的 `header.php` 文件，在 `<?php wp_head(); ?>` 后面添加统计代码即可。

不想修改主题的也可以直接装官方的[插件](https://wordpress.org/plugins/plausible-analytics/)。

## VuePress 添加方法

如果你使用 `VuePress v1.x`，那么修改 `.vuepress/config.js` 文件，在 `module.exports` 加入：

`['script', {}, `
const script = document.createElement('script');
script.async = true;
script.defer = true;
script['data-domain'] = '统计域名';
script.src = 'https://stat.example.com/js/plausible.js';
document.head.appendChild(script);`],`
如果你试用 `VuePress v2.x`，那么修改 `.vuepress/config.ts` 文件，在 `export default` 加入：

`['script', {}, `
const script = document.createElement('script');
script.async = true;
script.defer = true;
script['data-domain'] = '统计域名';
script.src = 'https://stat.example.com/js/plausible.js';
document.head.appendChild(script);`],`

## Next.js 添加方法

安装 [next-plausible](https://github.com/4lejandrito/next-plausible) 这个包，然后使用类似如下的代码：

```bash
import PlausibleProvider from 'next-plausible'

export default function MyApp({ Component, pageProps }) {
  return (
    <PlausibleProvider domain="统计域名" customDomain="https://stat.example.com" selfHosted>
      <Component {...pageProps} />
    </PlausibleProvider>
  )
}
```
更多的添加方法请查看官网的[文档](https://plausible.io/docs/integration-guides)。

很多广告屏蔽插件会屏蔽 `plausible.js`，此时可以把 `plausible.js` 替换成 `script.js` 防止被屏蔽。