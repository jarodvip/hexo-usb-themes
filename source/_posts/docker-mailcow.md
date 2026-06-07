---
title: Docker 安装 Mailcow 自建域名邮箱
date: 2023-05-02T00:00:00.000+00:00
tags:
  - debian
  - docker
cover: https://s.bh.sb/images/docker-mailcow.webp
---

本文将指导使用 Docker 安装 Mailcow 搭建自建邮箱。

*PS：本文同时适用于任何可安装 Docker 的 Linux 发行版。*

## 什么是电子邮箱？

电子邮箱，即电子邮件，就是 Email，是指一种由一寄件人将数字信息发送给一个人或多个人的信息交换方式，一般会通过互联网或其他电脑网络进行书写、发送和接收信件，目的是达成发信人和收信人之间的信息交互。一些早期的电子邮件需要寄件人和收件人同时在线，类似即时通信。([Wikipedia](https://zh.wikipedia.org/zh-cn/%E7%94%B5%E5%AD%90%E9%82%AE%E4%BB%B6))

国内用户一般会使用网易 (@163.com)、腾讯 (@qq.com) 等免费邮箱服务，国外用户一般会使用 Google (@gmail.com)、Yahoo (@yahoo.com)、Microsoft (@outlook.com) 等免费服务。

## 为什么要自建邮箱？

首先，你的数据是你自己的，你的隐私应当得到保护，而不是那些垄断巨头公司的，几乎所有市面上的免费邮箱服务，都是以牺牲你的隐私和数据为代价，利用你的大数据来进行广告行为分析来盈利，那么，你愿意把你自己的数据交付给和你素不相识的第三方么？

其次，看本博客的读者，几乎人手一个域名，人手一只 VPS，那为何不把现有资源利用起来做一些很酷的事情呢？

## 自建邮箱的优势和劣势

那么，会有小伙伴指出，市面上也有收费的邮箱呀，比如国内一些大厂的 “企业邮箱”，为什么不用收费服务呢？我们就自建邮箱，免费邮箱和收费邮箱做一个简单的表格对比：

着重指出一下我所强调的隐性成本：

因为免费和收费的邮箱服务，你的数据都是保存在第三方，你没有服务器的权限，你的帐号都是别人服务器里的冷冰冰的数据库，那么，你邮箱的提供商可以：

- 随时用各种理由关停你的服务，无论是合法的还是莫须有的原因，比如这里的[例子](https://news.ycombinator.com/item?id=24254484)

- 随时把你的资料卖给第三方，你作为最终用户是不可能知道的，比如？

- 随时面临倒闭关门从而永久丢失数据的风险，比如曾经的雅虎中文邮箱。

这些成本是你使用第三方服务的时候可能没有考虑过的，而自建邮箱服务的话，这个隐性成本我们是可控的：

- 你可以控制你的域名，只要选对有良好信誉的注册局和注册商，每年稳定续费并不做违反 ToS 的事情，域名一般不会被强制暂停；

- 你可以选择你的服务器供应商，只要选对有良好信誉的供应商，每月稳定续费并不做违反 ToS 的事情，服务器一般不会被强制暂停；

- 你可以每天备份你的数据，自己做数据容灾备份，不丢失任何重要的资料。

## 自建邮箱需要准备的资料

首先，你需要有一个你 “完全拥有使用权限” 的 “国际化” 的域名，我们不推荐使用任何小国家的国别后缀，不然哪天你域名怎么没的都不知道，这里主要还是推荐如下几个稳如狗的 gTLD 后缀：

- `.com`

- `.net`

- `.org`

其次，你需要一台服务器或 KVM / Xen 构架的 VPS，按照官网的[说法](https://docs.mailcow.email/prerequisite/prerequisite-system/#minimum-system-resources)，推荐的最小配置要求如下：

并且从防火墙放行这几个 TCP 端口：

*请注意，因为垃圾邮件滥用的原因，很多国外的 VPS 商家并不允许架设邮件发送服务器，并且默认 25 端口的出口方向是屏蔽的，请自行咨询厂商。*

## 安装 Docker 和 Docker Compose

Debian 和 Ubuntu 系统请参考[本站教程](/debian-install-docker/)。

其他 Linux 系统可以使用 Docker 官方的脚本安装 Docker 和 Docker Compose：

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## 设置 DNS 解析记录

我们假设你的邮箱服务器需要使用域名 `mail.example.com`，你想搭建 `[[email protected]](/cdn-cgi/l/email-protection)` 的邮箱；

然后你的服务器 IPv4 为 `192.0.2.25`，IPv6 为 `2001:db8::25`，那么请预先做好如下解析：

**请注意某些 DNS 厂商的控制面板添加 MX 和 CNAME 记录时不需要输入最后的点号，添加 TXT 记录时不需要最前面和最后面的引号。**

另外需要联系你的 VPS 厂商，设置 PTR 记录，即 IP 反向解析，请设置 `192.0.2.25` 和 `2001:db8::25` 的 PTR 记录为 `mail.example.com.` 提高邮件到达率。

## 安装 Mailcow

首先我们获取 Mailcow 的安装代码：

```bash
apt install git -y
cd /opt
git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized
```
然后生成配置文件，请注意使用 FQDN (比如 `mail.example.com`) 作为 hostname：

`bash generate_config.sh`
按照提示输入自己的需求后即可生成好配置文件 `mailcow.conf`，如有需要可以自己修改这个文件。

然后拉取 Docker 镜像并启动

```bash
docker compose pull
docker compose up -d
```
耐心等待几分钟后即可访问 `https://mail.example.com/` 默认用户名 `admin` 默认密码 `moohoo`，建议立马修改并开启 2FA 两步验证确保安全。

## 添加域名和邮箱

进入 Mailcow 后台后，我们可以在顶部的 `Configuration` > `Mail Setup` 里添加域名

![image.png](https://s.bh.sb/uploads/2022/03/08/PbIEhskNcM7Qntf.png)

在左侧的 `Domains` tab 里选择 `+Add domain` 添加域名：

![image.png](https://s.bh.sb/uploads/2022/03/08/woEQpS4bT9FOHBZ.png)

按照自己的要求填入各种设置：

![image.png](https://s.bh.sb/uploads/2022/03/08/s1SKvCToQpdGn5b.png)

如果需要立马生效 Web 客户端，可以选择 `Add domain and restart SOGo`：

![image.png](https://s.bh.sb/uploads/2022/03/08/JSBV4auPbXNf6jv.png)

## 开启 DKIM 并添加 DNS 记录

开启 DKIM 后邮件发信到达率更高，你可以登录 Mailcow 后台后在 `Configuration` > `ARC/DKIM keys` 查看你域名的 dkim 记录值：

![image.png](https://s.bh.sb/uploads/2022/03/08/86IcR4ioNHzMJEW.png)

右边那一串 `v=DKIM1;k=rsa;t=s;s=email;p=` 的 2048 位字符即你的 DKIM 值，如果未开启，可以在下方输入域名，选择 2048 位，然后点 `+ Add` 按钮添加

![image.png](https://s.bh.sb/uploads/2022/03/08/hUNulAx2TwrXWv5.png)

默认添加完域名后即开启了 DKIM，且 `Selector` 设置为 `dkim`，然后我们需要添加如下 DNS 记录：

**某些 DNS 厂商的后台可能无法直接添加 2048 位 DKIM 的 TXT 记录，因为 TXT 类型的 DNS 记录最大长度为 255 个字符，那么请手工截断成两个 TXT 记录，第一个需要 255 个字符，第二个记录为剩下的字符串**

## 添加邮箱用户

我们可以在 `Mailboxes` 这个 tab 里选择 `+Add mailbox` 按钮添加用户：

![image.png](https://s.bh.sb/uploads/2022/03/08/RtIGVgYECSP4mUa.png)

按要求提示填写即可：

![image.png](https://s.bh.sb/uploads/2022/03/08/lSd7GtyuIZqOVjB.png)

## 测试邮件

我们使用刚开的用户登录 Mailcow 自带的 SOGo，默认情况下地址为 `https://mail.example.com/SOGo/`

首先，测试接受邮件，使用任何外部邮箱给 `[[email protected]](/cdn-cgi/l/email-protection)` 发一封邮件，看看是否正常收到邮件。

然后我们测试发送邮件，在 [mail-tester.com](https://www.mail-tester.com/) 发送一封 `Plain Text` 格式的测试邮件，稍等片刻后即可查看你的邮件分数，我们可以看到，严格按照本文教程搭建的自建邮箱服务评分可以是 10 分：

![image.png](https://s.bh.sb/uploads/2022/03/08/9CE5N3IwOBjeycu.png)

## Mailcow 的更新和备份

Mailcow 的更新只需执行 `update.sh` 脚本即可：

```bash
cd /opt/mailcow-dockerized
./update.sh
```
按照提示更新仓库文件：

![image.png](https://s.bh.sb/uploads/2022/03/08/GoQUbntS8F1jOrk.png)

然后再次执行 `./update.sh` 更新 Mailcow，提供提示 `Are you sure you want to update mailcow: dockerized? All containers will be stopped. [y/N]` 输入 `y` 然后按回车：

![image.png](https://s.bh.sb/uploads/2022/03/08/6eTiFqzId451XD9.png)

然后耐心等待 Docker 更新并重启容器，并且可以选择删除旧的容器：

![image.png](https://s.bh.sb/uploads/2022/03/08/19ISftTLPlNYUz2.png)

你也可以使用 `docker system prune` 命令清除无用的 Docker 镜像。

Mailcow 的备份也自带脚本，我们只需进入目录执行 `./helper-scripts/backup_and_restore.sh` 即可：

假设你需要备份到 `/opt/backup` 目录

```bash
cd /opt/mailcow-dockerized
MAILCOW_BACKUP_LOCATION=/opt/backup
./helper-scripts/backup_and_restore.sh backup all
```
**建议使用定时脚本每天定时备份并同步到第三方机房加密保存**

一个简单的 crontab 定时脚本如下

`5 3 * * * cd /opt/mailcow-dockerized/; MAILCOW_BACKUP_LOCATION=/opt/backup /opt/mailcow-dockerized/helper-scripts/backup_and_restore.sh backup all`
具体备份命令可参考[官方教程](https://mailcow.github.io/mailcow-dockerized-docs/backup_restore/b_n_r-backup/)

## Mailcow 的迁移

有时候我们需要更换服务器，因为基于 Docker 安装，迁移 Mailcow 是个很简单的事情。

## 方法一：直接迁移整个 Docker

首先，在需要迁移的服务器安装 Docker 和 Docker Compose，并确保两边的版本一致，然后停止 Docker 服务：

```bash
systemctl stop docker.service
systemctl stop docker.socket
```
使用 `systemctl status docker` 命令检查下 Docker 的状态：

![image.png](https://s.bh.sb/uploads/2022/03/08/Mp67fW38OVj2JQA.png)

然后从原来的机器把 Docker 容器和挂载的 Volumes 同步到新的机器：

新旧机器均需要安装 `rsync`：

`apt install rsync -y`
旧的机器生成一个 SSH Key：

`ssh-keygen -t ed25519`
然后把 `/root/.ssh/id_ed25519.pub` 文件内容加到新机器的 `/root/.ssh/authorized_keys`

然后同步 Mailcow 文件和 Docker 挂载的 Volumes：

```bash
rsync -aHhP --numeric-ids --delete /opt/mailcow-dockerized/ root@新机器:/opt/mailcow-dockerized
rsync -aHhP --numeric-ids --delete /var/lib/docker/volumes/ root@新机器:/var/lib/docker/volumes
```
然后在原来的机器停止 Mailcow 容器：

```bash
cd /opt/mailcow-dockerized
docker compose down
```
然后再次执行一次同步：

```bash
rsync -aHhP --numeric-ids --delete /opt/mailcow-dockerized/ root@新机器:/opt/mailcow-dockerized
rsync -aHhP --numeric-ids --delete /var/lib/docker/volumes/ root@新机器:/var/lib/docker/volumes
```
然后在新的机器启动 Docker 服务：

`systemctl start docker.service`
然后在新的机器启动 Mailcow 容器：

```bash
cd /opt/mailcow-dockerized
docker compose pull
docker compose up -d
```
记得迁移之前需要修改好 DNS 记录，解析到新的服务器 IP 即可。

*这个迁移方法理论上适合任何使用 Docker 安装的软件*

## 方法二：使用 Mailcow 自带的备份和恢复脚本

首先进入旧的服务器，然后进入 Mailcow 的目录，执行备份脚本：

```bash
cd /opt/mailcow-dockerized
./helper-scripts/backup_and_restore.sh backup all
```
记得关闭 Mailcow 服务：

`docker compose down`
然后把备份好的文件夹使用 `rsync` 同步到新的机器，这里假设你备份在 `/opt/backup` 目录：

`rsync -avz /opt/backup root@新机器:/opt`
然后进入新的机器，从头开始安装一次全新的 Mailcow，然后执行恢复脚本：

```bash
cd /opt/mailcow-dockerized
./helper-scripts/backup_and_restore.sh restore
```
然后按照提示选择恢复的备份目录，比如 `/opt/backup` 即可。