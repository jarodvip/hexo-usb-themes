---
title: Docker 安装 Shlink 自建短网址
date: 2026-01-18T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/docker-shlink.webp
---

本文将指导使用 Docker 安装 Shlink 搭建自建短网址服务。

*PS：本文同时适用于任何可安装 Docker 的 Linux 发行版。*

# 什么是短网址？

短网址，即 URL Shortener (缩略网址服务)，一般我们使用 `HTTP 协议` 的 `301` 或 `302` 响应码，现在也有使用 `307` 或 `308` 来跳转一个长网址，简单的区别：

MDN 上有对这几个状态码的详细介绍：

- [301 Moved Permanently](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/301)

- [302 Found](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/302)

- [307 Temporary Redirect](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/307)

- [308 Permanent Redirect](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/308)

`301` 和 `302` 有一个最重要的区别，前者会在浏览器留下缓存，后者不会，导致如果你需要精确的统计访客，尤其是有一些使用一个浏览器的重复访客会不准确，但是影响不大，而使用 `302` 每次都会请求服务器造成服务器资源紧张，所以一般没有特殊需求的话，使用 `301` 就行。

举一个典型的 `301` 跳转的例子：

`root@debian ~ # curl -I http://u.sb/ -A Mozilla
HTTP/1.1 301 Moved Permanently
Date: Tue, 26 Apr 2022 18:28:14 GMT
Content-Type: text/html
Content-Length: 162
Location: https://u.sb/
`Copy
我们可以看到，使用浏览器访问 `http://u.sb/` 的时候，会返回 `HTTP/1.1 301 Moved Permanently` 状态，对应跳转到 Location `https://u.sb/`。

# 市面上开源和收费的短网址源码

众所周知，本人的短域名贼多，对各种短网址程序都有所研究，市面上主要有这几款免费的短网址程序：

- [Blink](https://docs.blink.rest) - Easy-to-host，SSO-integrated，CDN-powered link shortener (+decoupled analytics) for teams。([Source Code](https://github.com/JaneJeon/blink)) `AGPL-3.0` `Nodejs`

- [Kutt](https://kutt.it) - A modern URL shortener with support for custom domains。([Source Code](https://github.com/thedevs-network/kutt)) `MIT` `Nodejs`

- [Polr](https://project.polr.me/) - Modern，minimalist，modular，and lightweight URL shortener。([Source Code](https://github.com/Cydrobolt/polr)) `GPL-2.0` `PHP`

- [Shlink](https://shlink.io) - URL shortener with REST API and command line interface。Includes official progressive web application and docker images。([Source Code](https://github.com/shlinkio/shlink)，[Clients](https://shlink.io/apps)) `MIT` `PHP`

- [YOURLS](https://yourls.org/) - YOURLS is a set of PHP scripts that will allow you to run Your Own URL Shortener。Features include password protection，URL customization，bookmarklets，statistics，API，plugins，jsonp。([Source Code](https://github.com/YOURLS/YOURLS)) `MIT` `PHP`

我基本上都安装使用过，数据量大了以后性能基本惨不忍睹，对比以后还是使用 [PHP Swoole](https://www.php.net/manual/en/intro.swoole.php) 写的 [Shlink](https://shlink.io) 稍微占优，所以本文推荐安装 Shlink。

至于收费的？呵呵，没一个好用的，建议别去踩坑，我都帮你们踩过了。。。

广告：因为市面上没有好用的收费短网址，所以我们做了一个 [S.EE](https://s.ee/) 欢迎购买使用~

# 安装 Docker 和 Docker Compose

Debian 和 Ubuntu 系统请参考[本站教程](/debian-install-docker/)。

其他 Linux 系统可以使用 Docker 官方的脚本安装 Docker 和 Docker Compose：

`curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
`Copy

# 安装 Shlink Server 和 Web Client

参考官网的[安装教程](https://shlink.io/documentation/install-docker-image/)，我们可以把 Server 和 Web Client 装在一个地方方便管理。

首先我们新建 `/opt/shlink` 和 `/opt/shlink/data` 目录：

`mkdir -p /opt/shlink
mkdir -p /opt/shlink/data
`Copy
然后我们新建一个 `compose.yaml` 文件，假设你的域名是 `example.com`，放在 `/opt/shlink/compose.yaml`：

`cat > /opt/shlink/compose.yaml << EOF
services:
    shlink:
      image: shlinkio/shlink:stable
      container_name: shlink
      ports:
        - 127.0.0.1:8080:8080
      environment:
        - DEFAULT_DOMAIN=example.com
        - IS_HTTPS_ENABLED=true
        - GEOLITE_LICENSE_KEY=
        - DB_DRIVER=maria
        - DB_NAME=shlink
        - DB_USER=shlink
        - DB_PASSWORD=随机密码1
        - DB_HOST=db
        - DB_PORT=3306
        - TIMEZONE=UTC
        - REDIRECT_STATUS_CODE=301
      depends_on:
        db:
          condition: service_healthy
      restart: always

    db:
      image: mariadb:lts
      container_name: db
      ports:
        - 127.0.0.1:3306:3306
      environment:
        - MYSQL_ROOT_PASSWORD=随机密码2
        - MYSQL_DATABASE=shlink
        - MYSQL_USER=shlink
        - MYSQL_PASSWORD=随机密码1
      volumes:
        - /opt/shlink/data:/var/lib/mysql
      healthcheck:
        test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
        interval: 10s
        timeout: 5s
        retries: 3
        start_period: 30s
      restart: always

    shlink-web-client:
        image: shlinkio/shlink-web-client:stable
        container_name: shlink-web-client
        ports:
          - 127.0.0.1:8081:8080
        restart: always
EOF
`Copy
如果希望有用户登录等功能，则可以用官方的下一代面板 [shlink-dashboard](https://github.com/shlinkio/shlink-dashboard)，这里我们可以让 `shlink-dashboard` 容器和 `shlink` 容器共用一个 MariaDB 容器和用户，首先还是一样建立 docker compose 文件：

`cat > /opt/shlink/compose.yaml << EOF
services:
    shlink:
      image: shlinkio/shlink:stable
      container_name: shlink
      ports:
        - 127.0.0.1:8080:8080
      environment:
        - DEFAULT_DOMAIN=example.com
        - IS_HTTPS_ENABLED=true
        - GEOLITE_LICENSE_KEY=
        - DB_DRIVER=maria
        - DB_NAME=shlink
        - DB_USER=shlink
        - DB_PASSWORD=随机密码1
        - DB_HOST=db
        - DB_PORT=3306
        - TIMEZONE=UTC
        - REDIRECT_STATUS_CODE=301
      depends_on:
        db:
          condition: service_healthy
      restart: always

    db:
      image: mariadb:lts
      container_name: db
      ports:
        - 127.0.0.1:3306:3306
      environment:
        - MYSQL_ROOT_PASSWORD=随机密码2
        - MYSQL_DATABASE=shlink
        - MYSQL_USER=shlink
        - MYSQL_PASSWORD=随机密码1
      volumes:
        - /opt/shlink/data:/var/lib/mysql
        - /opt/shlink/mariadb-init:/docker-entrypoint-initdb.d
      healthcheck:
        test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
        interval: 10s
        timeout: 5s
        retries: 3
        start_period: 30s
      restart: always

    shlink-dashboard:
      image: shlinkio/shlink-dashboard:stable
      container_name: shlink-dashboard
      ports:
        - '127.0.0.1:8081:8080'
      environment:
        - SHLINK_DASHBOARD_DB_DRIVER=mariadb
        - SHLINK_DASHBOARD_DB_HOST=db
        - SHLINK_DASHBOARD_DB_PORT=3306
        - SHLINK_DASHBOARD_DB_USER=shlink
        - SHLINK_DASHBOARD_DB_PASSWORD=随机密码1
        - SHLINK_DASHBOARD_DB_NAME=shlink-dashboard
        - SHLINK_DASHBOARD_SESSION_SECRETS=secret1,secret2  # 设置会话加密，需要设置多个高强度随机值，用半角逗号隔开
      depends_on:
        db:
          condition: service_healthy
      restart: always
EOF
`Copy
然后创建一个 `/opt/shlink/mariadb-init/01-create-databases.sql` 文件

`mkdir -p /opt/shlink/mariadb-init

cat > /opt/shlink/mariadb-init/01-create-databases.sql << 'EOF'
CREATE DATABASE IF NOT EXISTS `shlink-dashboard`;
GRANT ALL PRIVILEGES ON `shlink-dashboard`.* TO 'shlink'@'%';
FLUSH PRIVILEGES;
EOF
`Copy
然后我们可以先启动 MariaDB 容器创建用户和数据库：

`cd /opt/shlink
docker compose up db -d
`Copy
验证下是否成功：

`docker exec -it db mariadb -u root -p'随机密码2' -e "SHOW DATABASES;"
`Copy
看到有 `shlink` 和 `shlink-dashboard` 两个数据库就成功了：

`# docker exec -it db mariadb -u root -p'随机密码2' -e "SHOW DATABASES;"
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| shlink             |
| shlink-dashboard   |
| sys                |
+--------------------+
`Copy
注意：

`GEOLITE_LICENSE_KEY` 需要在 [Maxmind](https://www.maxmind.com/) 注册帐号获取，可以参考《[使用 Docker 安装 Plausible Analytics 自建网站统计](/docker-plausible/#%E5%AE%89%E8%A3%85-plausible-analytics-t2)》

`MYSQL_ROOT_PASSWORD` 和 `MYSQL_PASSWORD` 记得设置两个随机的密码，同时 `MYSQL_PASSWORD` 需要和 `DB_PASSWORD` 一致。

更多的环境变量参数可以参考[这里](https://shlink.io/documentation/environment-variables/)。

然后拉取所有的 Docker 镜像并运行：

`docker compose pull
docker compose up -d
`Copy
然后获取一个 API Key：

`docker exec -it shlink shlink api-key:generate
`Copy
![image.png](https://s.bh.sb/uploads/2022/04/27/F3ehKWInwVkqQdD.png)

注意第一个 `shlink` 是 Docker 容器名字，第二个 `shlink` 是命令名称。

所有 API 命令如下：

`docker exec -it shlink shlink
`Copy
记得保存你的 API Key，下面会要用到。

# 安装配置 Nginx 反代

我们的 Docker Compose 配置文件中，Shlink Server 服务监听在 `127.0.0.1:8080` 端口，Shlink Web Client 监听在 `127.0.0.1:8081` 端口，所以我们需要配置 Nginx 反代来访问，假设你短网址是 `https://example.com/` Web 客户端是 `https://app.example.com/`

`example.com` 段配置：

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
`app.example.com` 段配置：

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
		proxy_pass http://127.0.0.1:8081;
	}
`Copy
最后记得参考本站 [Nginx SSL 配置教程](/nginx-ssl/)加上 SSL 证书后，即可访问 `https://app.example.com/`：

点击 `+ Add a server` 添加你的 Shlink 服务：

![image.png](https://s.bh.sb/uploads/2022/04/27/MqzdHDPh6F9AvWu.png)

输入名称，URL 和 API Key 以后点击 `Create server` 即可使用：

![image.png](https://s.bh.sb/uploads/2022/04/27/4RmMsk3VCUHDjhf.png)

如果你懒得搭建 Web Client，也可以使用官方现成的服务：

[Shlink Web Client](https://app.shlink.io/)

数据都是储存在浏览器本地的，可放心使用。

如果搭建的 Shlink Dashboard，则默认账号密码都是 `admin`， 登录以后记得修改哦！

# 升级 Shlink

直接使用 Docker Compose 升级并删除旧的镜像文件：

`cd /opt/shlink
docker compose pull
docker compose up -d
docker system prune -f
`Copy
切记不要跨多个版本升级，最好按照每个小版本的最新补丁顺序更新 Shlink。

比如，要从 `3.2.1` 版本升级到 `3.4.0`，先更新到 `3.3.2`，然后再升级到 `3.4.0`，可以自行替换 Docker 镜像里的 `stable` 标签为具体版本号来更新升级。

# 迁移 Shlink

可以参考《[使用 Docker 安装 Mailcow 自建域名邮箱](/docker-mailcow/#mailcow-%E7%9A%84%E8%BF%81%E7%A7%BB-t2)》。

# 备份 Shlink

我们可以定期备份数据库，导出命令如下：

`docker exec db mariadb-dump -u root --password='随机密码2' --databases shlink > shlink-all-$(date +"%Y_%m_%d_%I_%M_%p").sql
`Copy
如果装了 `shlink-dashboard`：

`docker exec db mariadb-dump -u root --password='随机密码2' --databases shlink shlink-dashboard > shlink-all-$(date +"%Y_%m_%d_%I_%M_%p").sql
`Copy
请替换 `随机密码2` 为你的数据库 `root` 密码。