---
title: Debian / Ubuntu 安装 PowerDNS 和 PowerDNS-Admin 自建权威 DNS 教程
date: 2024-04-04T00:00:00.000+00:00
tags:
  - debian
  - powerdns
cover: https://s.bh.sb/images/debian-install-powerdns.webp
---

本文将指导如何在 Debian 和 Ubuntu 下安装 PowerDNS 以及 PowerDNS-Admin，本教程略复杂，学习者需要有一定的 Linux 运维经验以及熟读本站之前的教程。

本文的教程同时适用于 [Debian Stable](https://www.debian.org/releases/stable/) 以及 [Ubuntu LTS](https://releases.ubuntu.com/)。

## 什么是权威 DNS？

DNS 分为两种类型，一种是权威 DNS (Authoritative DNS)，一种是递归 DNS (Recursive DNS)，权威 DNS 提供 DNS 的解析记录，递归 DNS 提供解析 DNS 记录的功能，是不是有点拗口？

通俗来讲，权威 DNS 就是负责储存你的 DNS 解析记录，然后提供给递归 DNS 进行解析操作，举个例子，典型的权威 DNS 即为类似 Cloudflare 的域名解析服务，比如可能分配给你的 `bob.ns.cloudflare.com`，典型的递归 DNS 即为 Cloudflare 的公共 DNS 服务 `1.1.1.1`，你的域名的 DNS 记录储存在 `bob.ns.cloudflare.com` 这台服务器上，而你本地的电脑通过 `1.1.1.1` 来解析你的域名。

*本文要介绍的是权威 DNS，递归 DNS 在国内没有相关资质和备案是无法在公网自建的。*

## 为什么使用 PowerDNS？

按照我们多年的维护经验，[PowerDNS](https://doc.powerdns.com/authoritative/) 比 [Bind 9](https://www.isc.org/bind/) 维护起来更方便，且原生[支持](https://doc.powerdns.com/authoritative/backends/)各种数据库方便储存 DNS 记录，而 Bind 9 目前还是仅支持文本储存，其他储存需要安装第三方插件。

## 准备工作

首先，我们默认你已经拥有

- 一个或者两个域名

- 至少两台不同网络的 VPS 服务器

本文教程举例的域名和对应的 A/AAAA 解析记录如下：

这里我们假设你已经拥有 `example.com` 这个域名以及 `192.0.2.53` 和 `192.0.2.153` 这两台 VPS 服务器，分别对应 `ns1.example.com` 和 `ns2.example.com`，那么我们需要分两种情况

1、你需要 `example.com` 也使用 `ns1.example.com` 和 `ns2.example.com` 的 DNS 服务：

请前往你的域名注册商，添加 NS 记录，也称为 Glue 胶水记录，分别对应

- `ns1.example.com` - `192.0.2.53` 和 `2001:db8::53`

- `ns2.example.com` - `198.51.100.53` 和 `2001:db8::153`

然后修改 `example.com` 的 NS 记录为 `ns1.example.com` 和 `ns2.example.com`，这样就完成了域名的 NS 记录的更新。

2、你不需要 `example.com` 使用 `ns1.example.com` 和 `ns2.example.com` 的 DNS 服务，仅仅需要 `example.org` 使用这个 DNS 服务：

前往你的 DNS 服务商，添加 A/AAA 记录，分别对应

- `ns1.example.com` - `192.0.2.53` 和 `2001:db8::53`

- `ns2.example.com` - `198.51.100.53` 和 `2001:db8::153`

此时所有的 `ns1.example.com` 和 `ns2.example.com` 的请求会经过你的 DNS 服务商，请务必保证你的 DNS 服务商比较稳定，如果不稳定，就会导致所有的域名 DNS 都无法解析

本文以第一种情况为例，假设你要使用的域名 `example.com` 也同时会使用 `ns1.example.com` 和 `ns2.example.com` 的 DNS 服务，每个服务商的后台 UI 可能不一样，我们以 [Riven Cloud](https://sa.net/) 为例，注册完域名以后在域名管理页面里找到 `Private Nameservers` (私人 DNS 服务器) 然后注册 NS 即可：

![image.png](https://s.bh.sb/uploads/2022/02/10/qQHex3OzdXnSiJo.png)

然后在 `Nameservers` (DNS 服务器) 添加 `ns1.example.com` 和 `ns2.example.com` 即可。

![image.png](https://s.bh.sb/uploads/2022/02/10/WQd1k7OrcACDnN3.png)

## 安装 PowerDNS + Mariadb

首先使用 `root` 进入 `ns1.example.com`，更新系统

```bash
apt update
apt upgrade -y
```
然后我们添加 PowerDNS 的官方源，添加 PowerDNS 的 GPG 公钥后增加 apt 源文件：

```bash
curl -sSL https://repo.powerdns.com/FD380FBB-pub.asc | gpg --dearmor > /usr/share/keyrings/powerdns.gpg
cat > /etc/apt/sources.list.d/pdns.list << EOF
deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/powerdns.gpg] http://repo.powerdns.com/debian $(lsb_release -sc)-auth-50 main
deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/powerdns.gpg] http://repo.powerdns.com/debian $(lsb_release -sc)-rec-53 main
deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/powerdns.gpg] http://repo.powerdns.com/debian $(lsb_release -sc)-dnsdist-20 main
EOF
```

```
`curl -sSL https://repo.powerdns.com/FD380FBB-pub.asc | gpg --dearmor > /usr/share/keyrings/powerdns.gpg
cat > /etc/apt/sources.list.d/pdns.list << EOF
deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/powerdns.gpg] http://repo.powerdns.com/ubuntu $(lsb_release -sc)-auth-50 main
deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/powerdns.gpg] http://repo.powerdns.com/ubuntu $(lsb_release -sc)-rec-53 main
deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/powerdns.gpg] http://repo.powerdns.com/ubuntu $(lsb_release -sc)-dnsdist-20 main
EOF
`
```
Copy

您也可以修改使用 `repo.powerdns.com` 官方源优先安装 Powerdns 软件：

```bash
cat >> /etc/apt/preferences.d/pdns << EOF
Package: pdns-*
Pin: origin repo.powerdns.com
Pin-Priority: 600
EOF
```
然后安装 Mariadb，可以参考本站教程[《Debian 使用源安装 LEMP 教程》](/debian-install-nginx-php-mysql/#4%E3%80%81%E5%AE%89%E8%A3%85-mariadb-t5)：

下载并导入 GPG Key：

`curl -sSL https://supplychain.mariadb.com/MariaDB-Server-GPG-KEY | gpg --dearmor > /usr/share/keyrings/mariadb.gpg`
然后添加 MariaDB 的源：

`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mariadb.gpg] https://dlm.mariadb.com/repo/mariadb-server/11.8/repo/debian $(lsb_release -sc) main" > /etc/apt/sources.list.d/mariadb.list`

```
`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mariadb.gpg] https://dlm.mariadb.com/repo/mariadb-server/11.8/repo/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/mariadb.list
`
```
Copy

然后我们就可以更新系统并安装 PowerDNS + Powerdns MySQL Backend + Mariadb：

```bash
apt update
apt install pdns-server pdns-backend-mysql mariadb-server
```
然后我们重复 `ns1.example.com` 的操作，安装完成 `ns2.example.com` 服务器，这里不再赘述。

# 配置 MySQL 主从同步

我们使用 `ns1.example.com` 作为 Master，`ns2.example.com` 作为 Slave，则需要配置 MySQL 主从同步：

首先，在 `ns1.example.com` 上执行以下命令：

建立文件夹，方便以后保存 Bin 日志：

```bash
mkdir /var/lib/mysql-bin
chown mysql:mysql /var/lib/mysql-bin
```
添加 MariaDB 配置文件，让 MySQL 监听在所有的 IP：

```bash
cat > /etc/mysql/mariadb.conf.d/61-master.cnf <<EOF
[mysqld]
skip-host-cache
skip-name-resolve
bind-address = 0.0.0.0

server-id = $SRANDOM
log-bin = /var/lib/mysql-bin/binlog
expire_logs_days = 7
EOF
```
*注：我们设置 Master 机器的 ID 为随机数 `$SRANDOM`*

安装并开启 `nftables`，只允许本机和 Slave 机器，也就是 `ns2.example.com` 可以访问 MySQL 3306 端口：

```bash
apt install nftables
cat > /etc/nftables.conf <<EOF
# !/usr/sbin/nft -f

flush ruleset

table inet filter {
        chain input {
                type filter hook input priority filter; policy accept;
                ip saddr 127.0.0.1 accept
                ip saddr 198.51.100.53 accept
                tcp dport 3306 drop
        }

        chain forward {
                type filter hook forward priority filter; policy accept;
        }

        chain output {
                type filter hook output priority filter; policy accept;
        }
}
EOF
```
*注意替换 `198.51.100.53` 为你的 `ns2.example.com` 的 `IPv4` 地址*

新建一个 `backup` 的 MySQL 用户名并设置密码为 `backup_pass`，并开启所有数据库的访问权限

`mariadb -e "GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* to 'backup'@'%' identified by 'backup_pass';"`
启动 nftables 服务并重启 MariaDB 服务：

```bash
systemctl enable nftables --now
systemctl restart mariadb
```
然后我们来到 Slave 机器，即 `ns2.example.com`，执行以下命令：

```bash
mkdir /var/lib/mysql-bin
chown mysql:mysql /var/lib/mysql-bin
```
添加 MariaDB 配置：

```bash
cat > /etc/mysql/mariadb.conf.d/61-slave.cnf <<EOF
[mysqld]
skip-host-cache
skip-name-resolve

server-id = $SRANDOM
relay-log = /var/lib/mysql-bin/relaylog
expire_logs_days = 7
EOF
```
*注：我们设置 Slave 机器的 ID 为随机数 `$SRANDOM`*

注释 `expire_logs_days`

`sed -i 's/expire_logs_days/#expire_logs_days/g' /etc/mysql/mariadb.conf.d/50-server.cnf`
开启 nftbales 服务并写入配置，只允许本机访问 3306 端口：

```bash
apt install nftables
cat > /etc/nftables.conf <<EOF
# !/usr/sbin/nft -f

flush ruleset

table inet filter {
        chain input {
                type filter hook input priority filter; policy accept;
                ip saddr 127.0.0.1 accept
                tcp dport 3306 drop
        }

        chain forward {
                type filter hook forward priority filter; policy accept;
        }

        chain output {
                type filter hook output priority filter; policy accept;
        }
}
EOF
```
启动 nftables 服务并重启 MariaDB 服务：

```bash
systemctl enable nftables --now
systemctl restart mariadb
```
然后我们回到 Master 机器，即 `ns1.example.com`，运行：

`mariadb -e "show binary logs;\G"`
找到最后一个类似 `binlog.000001` 的日志名称，并对应的 `File_size`，一般来说，新安装的机器应该为 `binlog.000001` 和 `325`

然后我们回到 Slave 机器，即 `ns2.example.com`，运行：

`mariadb -e "CHANGE MASTER TO MASTER_HOST='192.0.2.53', MASTER_USER='backup', MASTER_PASSWORD='backup_pass', MASTER_PORT=3306, MASTER_LOG_FILE='binlog.000001', MASTER_LOG_POS=325; START SLAVE; SHOW SLAVE STATUS\G"`
*注意替换 `192.0.2.53` 为 `ns1.example.com` 的 `IPv4` 地址*

此时可以看到类似输出 `Slave_IO_State: Waiting for master to send event`，即安装 MySQL 主从同步完成

![image.png](https://s.bh.sb/uploads/2022/02/11/YuFTGydrVHRWDS9.png)

# 开启 PowerDNS 数据库并导入默认数据

配置完 MySQL 主从以后，我们回到 Master 机器，即 `ns1.example.com`，新添加一个 PowerDNS 的用户和数据库，比如 `pdns_user` 和 `pdns_database` 并设置密码 `pdns_password`：

```bash
mariadb -u root
CREATE DATABASE pdns_database DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 
GRANT ALL ON pdns_database.* TO 'pdns_user'@'%' IDENTIFIED BY 'pdns_password';
FLUSH PRIVILEGES; 
EXIT;
```
然后导入 PowerDNS 的[建议默认数据库](https://github.com/PowerDNS/pdns/tree/master/modules/gmysqlbackend)

```bash
cd /usr/share/pdns-backend-mysql/schema
mariadb -u pdns_user --default-character-set=utf8mb4 -p pdns_database < schema.mysql.sql
mariadb -u pdns_user --default-character-set=utf8mb4 -p pdns_database < enable-foreign-keys.mysql.sql
```
此时可以在 `ns2.example.com` 机器运行：

`mariadb -e "show databases;\G"`
查看是否已经同步 `pdns_database` 这个数据库，如果过了一分钟还没有，则返回前面的教程仔细看看自己遗漏或者写错了什么。

# 配置 PowerDNS 服务

首先，删除默认安装后的 `bind.conf`：

`rm -rf /etc/powerdns/pdns.d/bind.conf`
然后添加一个 `/etc/powerdns/pdns.d/dns.conf` 文件并输入输入以下内容：

```bash
cat >> /etc/powerdns/pdns.d/dns.conf << EOF
launch=gmysql
gmysql-host=localhost
gmysql-user=pdns_user
gmysql-dbname=pdns_database
gmysql-password=pdns_password
gmysql-dnssec=yes
default-soa-content=ns1.example.com hostmaster.example.com 0 3600 14400 604800 3600
api=yes
api-key=random_api_key
local-address=0.0.0.0 ::
local-port=53
webserver-address=0.0.0.0
webserver-allow-from=127.0.0.1, ::1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
webserver-port=8081
EOF
```
注意几个地方

```bash
gmysql-host=localhost
gmysql-user=pdns_user
gmysql-dbname=pdns_database
gmysql-password=pdns_password
gmysql-dnssec=yes
```
这几个 `gmysql` 开头的参数即 MySQL 数据库连接信息，以及开启 DNSSEC

`default-soa-content=ns1.example.com hostmaster.example.com 0 3600 14400 604800 3600`
这是添加的域名的默认 SOA 记录

`ns1.example.com` 为默认 DNS 服务器域名，`hostmaster.example.com` 为默认 DNS 管理员邮箱 `[[email protected]](/cdn-cgi/l/email-protection)`，在 SOA 记录里，需要替换 `@` 为英文点号

第一个 `0` 为 Serial，没有特殊需求可以从 `0` 开始

后面四个数字分别对应 `Refresh`，`Retry`，`Expire` 和 `Minimum TTL`，单位都是秒，没有特殊需求建议设置 `300` 以上

```bash
api=yes
api-key=random_api_key
local-address=0.0.0.0 ::
local-port=53
webserver-address=0.0.0.0
webserver-allow-from=127.0.0.1, ::1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
webserver-port=8081
```
这段配置则是我们开启了 API 和内置 API Web 服务器，请替换 `random_api_key` 为你需要的 API Key，随机字符即可，默认我们设置了 Web 服务器监听在所有 IP 并且只能内网 IP 访问，可以按照需求自行更改。

```bash
local-address=0.0.0.0 ::
local-port=53
```
这段配置表示你的权威 DNS 服务监听在本机所有 IPv4 和 IPv6 地址，并且使用默认的 `53` 端口。

然后我们重启 PowerDNS 服务

`systemctl restart pdns`
没有报错即配置成功。

然后我们进入 Slave 机器，即 `ns2.example.com` 按照同样的配置操作一次。

至此，PowerDNS + MySQL 主从已经配置完毕，但是添加域名解析等记录需要直接操作 MySQL 数据库，略显麻烦，此时我们的神奇 PowerDNS-Admin 登场

# 安装并使用 PowerDNS-Admin

[PowerDNS-Admin](https://github.com/PowerDNS-Admin/PowerDNS-Admin) 是一款 Python 写的 PowerDNS Web 管理软件，我们需要准备一台单独的机器，测试的时候您也可以直接装在 `ns1` 或 `ns2` 上 (不建议) 甚至装在本地电脑上。

首先，我们需要安装 Docker 和 Docker Compose，具体方法请参考[《Debian 安装 Docker 以及 Docker Compose 教程》](/debian-install-docker/)

安装完毕后，我们在 `/opt` 目录新建一个 `docker-compose.yaml`

```bash
cat > /opt/docker-compose.yaml <<EOF
services:
  powerdns-admin:
    image: powerdnsadmin/pda-legacy:latest
    container_name: powerdns-admin
    ports:
      - "127.0.0.1:8080:80"
    environment:
      - SECRET_KEY=random_secret_key
      - SQLALCHEMY_DATABASE_URI=mysql://powerdns-admin-user:powerdns-admin-password@powerdns-admin-mariadb/powerdns-admin-database
      - GUNICORN_TIMEOUT=60
      - GUNICORN_WORKERS=4
      - GUNICORN_LOGLEVEL=DEBUG
      - OFFLINE_MODE=False
    restart: unless-stopped
    volumes:
      - ./data/powerdns-admin:/data
    depends_on:
      - powerdns-admin-mariadb

  powerdns-admin-mariadb:
    image: mariadb:11.4
    container_name: powerdns-admin-mariadb
    ports:
      - '127.0.0.1:3306:3306'
    environment:
      - MYSQL_ROOT_PASSWORD=mysql_root_password
      - MYSQL_DATABASE=powerdns-admin-database
      - MYSQL_USER=powerdns-admin-user
      - MYSQL_PASSWORD=powerdns-admin-password
    restart: unless-stopped
    volumes:
      - ./data/mysql:/var/lib/mysql
EOF
```
记得修改 `random_secret_key` 为随机字符串，这个字符串可以随便写，但是不能为空，否则登录后会提示错误。

然后我们启动 `docker compose`：

```bash
cd /opt
docker compose pull
docker compose up -d
```
成功启动后，`PowerDNS-Admin` 会监听在 `127.0.0.1` 的 `8080` 端口，本地机器可以直接访问 `http://127.0.0.1:8080` 来登录，第一个注册的用户即为管理员。

如果您搭建在公网上，我们强烈推荐使用 `Nginx` 做一层反代服务，安装 Nginx 可以参考教程[《Debian 使用源安装 LEMP 教程》](/debian-install-nginx-php-mysql/#2%E3%80%81%E5%A2%9E%E5%8A%A0-nginx-io-%E6%89%93%E5%8C%85%E7%9A%84-nginx-%E6%BA%90%E5%B9%B6%E5%AE%89%E8%A3%85-t2)以及[《Nginx 配置 SSL 证书》](/nginx-ssl/)

安装完成后，在 `location` 字段中使用如下配置文件即可

```bash
location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "";
    proxy_redirect off;
    proxy_set_header        X-Forwarded-Proto $scheme;
    proxy_connect_timeout       300;
    proxy_send_timeout          300;
    proxy_read_timeout          300;
    send_timeout                300;
    proxy_pass http://127.0.0.1:8080;
}
```
然后我们即可登录 PowerDNS-Admin 并注册帐号，第一个帐号即为管理员，登录后输入 PowerDNS 的 API 地址和 API Key 以及 PowerDNS 的版本，截止本文发布，可以填写 `4.6.0`

![image.png](https://s.bh.sb/uploads/2022/02/11/Zzvm2jeAP6ON7xd.png)

记得把 PowerDNS-Admin 机器的 IP 加在 `ns1.example.com` 机器 `/etc/powerdns/pdns.d/dns.conf` 文件的 `webserver-allow-from=` 最后，这样 PowerDNS-Admin 就可以访问 PowerDNS 的 API 了。

然后我们添加一个域名模板，在左侧 `Domain Templates` 新建一个域名模板，随便写个名称和描述后，修改添加以下解析内容

如图所示

![image.png](https://s.bh.sb/uploads/2022/02/11/bmBUvLfKaigX3xN.png)

保存好模板后，点击左侧 `New Domain` 即可新添加域名 `example.com`，`Type` 选默认的 `Native`，记得选择 `Template` 为刚刚保存的模板，如无特殊需求，`SOA-EDIT-API` 选默认的 `DEFAULT` 即可

![image.png](https://s.bh.sb/uploads/2022/02/11/nDBcyuHbjKmFEdN.png)

添加完域名后，我们进入左侧 `Dashboard`，然后在 `Hosted Domains` 里选择添加的 `example.com`

如果需要开启 DNSSEC，则点击 `DNSSEC` 的按钮让其变成 `Enabled` 即可：

![image.png](https://s.bh.sb/uploads/2022/02/11/NWE8oOKGV1gCqyi.png)

我们点击 `Enabled` 小按钮，需要记录下 `DNSKEY` 值，一般是一个 “`257 + 3 + 13 + 一串字符`” 以及第二个 `DS` 值，一般是一个 “`随机数字 + 13 + 2 + 一串字符`”，如下图所示：

![image.png](https://s.bh.sb/uploads/2022/02/11/QnzWGiMBaACkl6u.png)

点击 `example.com` 进入解析页面，点击 `Add Record` 即可添加解析记录，我们添加以下几个记录

这里假设的是 `example.com` 解析到 `203.0.113.2` 和 `2001:db8::2`

好了，大功告成，然后我们返回注册商的网站添加 DNSSEC 记录，一般我们选择 “`随机数字 + 13 + 2 + 一串字符`”，分别对应：

- `随机数字` - Key Tag

- `13` - Algorithm 算法 `13`

- `2` - Digest Type，类型 `2`，即 `SHA-256`

- `一串字符` - Digest

个别后缀 (比如德国 .de 和爱沙尼亚 .ee) 需要添加 DNSKEY，此时我们添加上面截图里的 DNSKey 即可：

- `Flags` - 填写 `257`

- `Protocol` - 填写 `3`

- `Algorithm` - 填写 `13`

- `Public Key` - 填写 `DNSKEY 对应的一串字符`

所有的注册商原理都一样，还是以 [Riven Cloud](https://sa.net/) 为例，找到域名管理的 `DNSSEC Management` 选项，按照图示直接添加 `DS` 记录即可：

![image.png](https://s.bh.sb/uploads/2022/02/11/FVWgPuHfwIdDGmr.png)

*请注意所有的 gTLD 都明确规定必须支持 DNSSEC，但是国别域名不一定支持，可以通过 dig DS 记录查询你的域名后缀是否支持 DNSSEC*

此时去耐心喝一杯咖啡，一般域名会在 10 分钟到 24 小时内生效，喝完咖啡后您应该优雅地打开服务器，检查 `example.com` 是否解析生效并正确

首先安装万能的 `dnsutils`

`apt install dnsutils -y`
然后查看解析

```bash
root@debian ~ # host example.com
example.com has address 203.0.113.2
example.com has IPv6 address 2001:db8::2
```
一切正确即安装成功，如果失败，则进入 `ns1.example.com` 和 `ns1.example.com` 的服务器分别检查本地解析是否正确

```bash
root@ns1 ~ # dig A example.com @localhost +short
203.0.113.2

root@ns2 ~ # dig A example.com @localhost +short
203.0.113.2
```
如果返回正确结果，则检查你的 DNS 是否生效

```bash
root@ns1 ~ # dig NS example.com +short
ns1.example.com.
ns2.example.com.
```
检查公网其他递归 DNS 是否生效

```bash
root@ns1 ~ # dig NS example.com @1.1.1.1 +short
ns1.example.com.
ns2.example.com.
```
检查你的 DNS 是否在注册局被注册 (仅限 gTLD)

安装 `whois` 服务

`apt install whois`
检查 whois 里的 DNS 是否生效

```bash
root@ns2 ~ # whois example.com | grep 'Name\ Server'
   Name Server: NS1.EXAMPLE.COM
   Name Server: NS2.EXAMPLE.COM
```
检查 DNSSEC 的 DS 记录是否生效

`root@ns2 ~ # dig DS example.com +short`
如果都没问题，则耐心等待 DNS 缓存生效，一般 gTLD 生效时间在 24 小时内，如果你的域名是国别域名，则可能需要等待 72 小时，切记生效前不要删除旧的 DNS 服务。

如果遇到超时等问题，请检查您的云服务器提供商防火墙是否正确打开 `UDP 53` 和 `TCP 53` 以及 `TCP 3306` 端口

**课后作业，安装搭建完 PowerDNS + PowerDNS-Admin 后添加 `example.org` 域名并解析到 `233.252.0.2` 和 `2001:db8:3` 然后测试本地是否生效。**