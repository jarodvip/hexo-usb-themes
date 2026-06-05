---
title: Debian / Ubuntu 使用源安装 LAMP 教程
date: 2026-01-18T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/debian-install-apache-php-mysql.webp
---

本文将介绍使用官方源和第三方源在 Debian 和 Ubuntu 安装最新版 Apache 2 + PHP + MySQL 的教程，并且可以自行选择 PHP 版本。

**PS：本文适用于 Debian Stable 以及 Ubuntu LTS**

以下操作需要在 root 用户下完成，请使用 `sudo -i` 或 `su root` 切换到 root 用户进行操作。

# 1、更新系统并安装部分必要软件

`apt update
apt upgrade -y
apt dist-upgrade -y
apt install curl vim wget gnupg dpkg apt-transport-https lsb-release ca-certificates
`Copy
**如果您通过 iso 方式安装 Debian 并且设置了 root 密码，则默认不带 `sudo` 包，使用 `apt install sudo` 安装即可**

# 2、增加 Ondřej Surý 大神打包的 PHP 源并安装 PHP 8.x

和 [LEMP](/debian-install-nginx-php-mysql/) 安装方法一样，我们还是使用 [Ondřej Surý](https://deb.sury.org/) 大佬打包的 PHP 源。

至于为啥先装 PHP 再装 Apache 2，因为装了 PHP 以后 Apache 2 会识别你 PHP 版本然后生成对应的配置文件，所以顺序不要搞反。

## 2.1 Debian 和 Ubuntu 安装 LAMP 区别

唯一区别就是 PHP 和 Apache 2 的安装添加源方法不一样，其他的步骤都一毛一样。

## 2.2 加入大神做好的源

`wget -O /usr/share/keyrings/php.gpg https://packages.sury.org/php/apt.gpg
echo "deb [signed-by=/usr/share/keyrings/php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list
`Copy

```
`add-apt-repository ppa:ondrej/php
`
```
Copy

Debian 下也可以直接使用 [extrepo](/debian-extrepo/):

`sudo apt update
sudo apt install extrepo -y
sudo extrepo enable sury
`Copy

## 2.3 更新系统源

```
`apt update
apt upgrade -y
`
```
Copy

## 2.4 安装自己需要的 PHP 版本

这个源目前默认的 PHP 是 8.5.x，如果您需要其他版本，那么请修改对应的 PHP 版本号 (注意配置文件哦)。

这里举例 WordPress 需要的部分 PHP 包

安装 PHP 8.5.x (从 PHP 8.5 开始 OPcache 已经强制集成，不需要单独安装):

`apt install php8.5-{fpm,cli,mysql,curl,gd,mbstring,xml,zip,imap,soap,gmp,bcmath} -y
`Copy
安装 PHP 8.4.x：

`apt install php8.4-{fpm,cli,mysql,curl,gd,mbstring,xml,zip,imap,opcache,soap,gmp,bcmath} -y
`Copy
安装 PHP 8.3.x：

`apt install php8.3-{fpm,cli,mysql,curl,gd,mbstring,xml,zip,imap,opcache,soap,gmp,bcmath} -y
`Copy
安装 PHP 8.2.x：

`apt install php8.2-fpm php8.2-cli php8.2-mysql php8.2-curl php8.2-gd php8.2-mbstring php8.2-xml php8.2-zip php8.2-imap php8.2-opcache php8.2-soap php8.2-gmp php8.2-bcmath -y
`Copy
**以下版本 PHP 已经 EOL，PHP 官方不再提供支持，请尽快更新您的程序兼容最新的 PHP，如果您的程序还未兼容，建议鞭策开发者**

安装 PHP 8.1.x

`apt install php8.1-fpm php8.1-cli php8.1-mysql php8.1-curl php8.1-gd php8.1-mbstring php8.1-xml php8.1-zip php8.1-imap php8.1-opcache php8.1-soap php8.1-gmp php8.1-bcmath -y
`Copy
安装 PHP 8.0.x

`apt install php8.0-fpm php8.0-cli php8.0-mysql php8.0-curl php8.0-gd php8.0-mbstring php8.0-xml php8.0-zip php8.0-imap php8.0-opcache php8.0-soap php8.0-gmp php8.0-bcmath -y
`Copy
安装 PHP 7.4.x

`apt install php7.4-fpm php7.4-cli php7.4-mysql php7.4-curl php7.4-gd php7.4-mbstring php7.4-xml php7.4-xmlrpc php7.4-zip php7.4-json php7.4-imap php7.4-opcache php7.4-soap php7.4-gmp php7.4-bcmath -y
`Copy
安装 PHP 7.3.x

`apt install php7.3-fpm php7.3-mysql php7.3-curl php7.3-gd php7.3-mbstring php7.3-xml php7.3-xmlrpc php7.3-zip php7.3-opcache
`Copy
安装 PHP 7.2.x (PHP 7.2 开始已经不支持 mcrypt 组件)

`apt install php7.2-fpm php7.2-mysql php7.2-curl php7.2-gd php7.2-mbstring php7.2-xml php7.2-xmlrpc php7.2-zip php7.2-opcache
`Copy
安装 PHP 7.1.x

`apt install php7.1-fpm php7.1-mysql php7.1-curl php7.1-gd php7.1-mbstring php7.1-mcrypt php7.1-xml php7.1-xmlrpc php7.1-zip php7.1-opcache
`Copy
安装 PHP 7.0.x

`apt install php7.0-fpm php7.0-mysql php7.0-curl php7.0-gd php7.0-mbstring php7.0-mcrypt php7.0-xml php7.0-xmlrpc php7.0-zip php7.0-opcache
`Copy
安装 PHP 5.6.x

`apt install php5.6-fpm php5.6-mysql php5.6-curl php5.6-gd php5.6-mbstring php5.6-mcrypt php5.6-xml php5.6-xmlrpc php5.6-zip php5.6-opcache
`Copy
如果希望安装其他组件，可以通过搜索看看有没有对应的包

`apt-cache search php8.5* | grep php8.5
`Copy
修改 `php.ini` 防止跨目录攻击，如果安装的 PHP 8.5.x 请相应修改 `/etc/php/8.5/fpm/php.ini` PHP 7.4.x 请相应修改 `/etc/php/7.4/fpm/php.ini`

`sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' /etc/php/8.5/fpm/php.ini 
`Copy
修改 `php.ini` 增加上传大小限制

`sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 10M/' /etc/php/8.5/fpm/php.ini
sed -i 's/post_max_size = 8M/post_max_size = 10M/' /etc/php/8.5/fpm/php.ini
`Copy
您也可以同时安装多个 PHP 版本，然后使用以下命令选择系统默认的 PHP 版本：

`update-alternatives --config php
`Copy

# 3、增加 Ondřej Surý 大神打包的 Apache 2 源并安装

这里我们推荐 [Ondřej Surý](https://deb.sury.org/) 打包的 Apache 2 源。

## 3.1 Debian 和 Ubuntu 安装 LAMP 区别

唯一区别就是 Apache 2 和 PHP 的安装添加源方法不一样，其他的步骤都一毛一样。

## 3.2 首先增加 Apache 源

`wget -O /usr/share/keyrings/apache2.gpg https://packages.sury.org/apache2/apt.gpg
echo "deb [signed-by=/usr/share/keyrings/apache2.gpg] https://packages.sury.org/apache2/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/apache2.list
`Copy

```
`add-apt-repository ppa:ondrej/apache2
`
```
Copy

Debian 下也可以直接使用 [extrepo](/debian-extrepo/):

`sudo extrepo enable sury_apache2
`Copy

## 3.3 接着更新并安装 Apache 2.4

```
`apt update
apt upgrade -y
apt install apache2 -y
`
```
Copy
安装完毕后，我们可以使用 `apachectl -v` 命令看到 Apache 2 已经是最新的 2.4 版本了

`root@debian ~ # apachectl -v
Server version: Apache/2.4.66 (Debian)
Server built:   2025-12-05T14:35:42
`Copy

## 3.4 Apache 2 开启 PHP-FPM 支持

首先，需要开启 Apache 2 的 PHP-FPM 支持，我们以 PHP 8.5 为例，按照自己的需求，可以开启如下模块

`a2enconf php8.5-fpm
a2enmod proxy_fcgi
a2enmod headers
a2enmod http2
a2enmod remoteip
a2enmod ssl
a2enmod rewrite
a2enmod expires
a2enmod deflate
a2enmod mime
a2enmod setenvif
`Copy
然后我们重启 PHP-FPM 服务

`systemctl restart php8.5-fpm
`Copy
对应 PHP 7.4.x 命令如下

`systemctl restart php7.4-fpm
`Copy
Apache 2 参考配置文件如下，因为默认 Debian 的 Apache 2 默认配置已经使用了 `example.com` 这个域名，所以我们以 `example.org` 为例，新建立个 `/etc/apache2/sites-available/example.org.conf`

`cat >> /etc/apache2/sites-available/example.org.conf << EOF
<VirtualHost *:80>
	ServerName example.org
	DocumentRoot /var/www/example.org
	DirectoryIndex index.php index.html index.htm
	
	ErrorLog ${APACHE_LOG_DIR}/example.org.error.log
	CustomLog ${APACHE_LOG_DIR}/example.org.access.log combined

	<Directory /var/www/example.org>
		Options FollowSymLinks
		AllowOverride All
		Require all granted
	</Directory>
</VirtualHost>
EOF
`Copy
然后使用 `a2ensite` 命令使其生效

`a2ensite example.org.conf
`Copy
*如果不需要这个 vhost 的时候可以使用 `a2dissite example.org.conf` 命令移除*

检测是否已经软链接到 `/etc/apache2/sites-enabled` 目录

`root@debian ~ # ls /etc/apache2/sites-enabled
000-default.conf  example.org.conf
`Copy
到这里基本没有问题，我们可以执行 `apache2ctl configtest` 命令检查配置文件是否出错

`root@debian ~ # apache2ctl configtest 
Syntax OK
`Copy
显示 `Syntax OK` 则说明所有配置文件均无问题，可以重启 Apache 2 使我们的配置生效

`systemctl restart apache2
`Copy
我们的目录在 `/var/www/example.org`，我们先创建这个目录

`mkdir -p /var/www/example.org
`Copy
然后创建一个 `phpinfo.php` 并输入 `phpinfo()` 函数

`cat >> /var/www/example.org/phpinfo.php << EOF
<?php phpinfo(); ?>
EOF
`Copy
好了，此时在浏览器输入 `http://example.org/phpinfo.php`，如果看到经典的 `phpinfo` 页面则说明安装成功，如果不成功，请仔细对比步骤查找哪里出错或在烧饼博客下方留言。

最终效果如下：

![image.png](https://s.bh.sb/uploads/2022/01/29/uXMprq5Wh6oQOaK.png)

# 4、安装 MariaDB

这里我们使用 MariaDB 作为 MySQL 的代替

## 4.1 首先，添加并导入 Mariadb 的官方源

按照官方的[教程](https://mariadb.com/kb/en/gpg/)导入 GPG

下载 GPG Key：

`curl -sSL https://supplychain.mariadb.com/MariaDB-Server-GPG-KEY | gpg --dearmor > /usr/share/keyrings/mariadb.gpg
`Copy
然后添加 MariaDB 的源

`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mariadb.gpg] https://dlm.mariadb.com/repo/mariadb-server/11.8/repo/debian $(lsb_release -sc) main" > /etc/apt/sources.list.d/mariadb.list
`Copy

```
`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mariadb.gpg] https://dlm.mariadb.com/repo/mariadb-server/11.8/repo/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/mariadb.list
`
```
Copy

Debian 下也可以直接使用 [extrepo](/debian-extrepo/):

`sudo extrepo enable mariadb-11.8
`Copy
国内可以用清华 TUNA 的源

`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mariadb.gpg] https://mirrors.tuna.tsinghua.edu.cn/mariadb/repo/11.8/debian $(lsb_release -sc) main" > /etc/apt/sources.list.d/mariadb.list
`Copy

```
`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mariadb.gpg] https://mirrors.tuna.tsinghua.edu.cn/mariadb/repo/11.8/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/mariadb.list
`
```
Copy

您也可以[在这儿](https://mariadb.com/kb/en/mirror-sites-for-mariadb/)找到更多的 MariaDB 源

## 4.2 接着更新一下系统

`apt update
`Copy

## 4.3 然后直接安装最新稳定版 MariaDB

```
`apt install mariadb-server mariadb-client
`
```
Copy
安装完毕后强烈推荐使用 `mariadb-secure-installation` 命令做一次安全设置

## 4.4 创建数据库并测试

*开启数据库之前，您可以使用 `pwgen` 这个小工具或者[随机密码生成器](https://ip.sb/password/)生成一个强大的随机密码，比如 32 位，然后随意挑选一个使用*

`apt install pwgen
pwgen 32
`Copy
使用 MySQL root 用户登陆，因为默认使用 Unix domain socket 模式，所以本机不需要 MySQL root 密码即可登录

`mariadb -u root
`Copy
创建数据库 `example_database`

`CREATE DATABASE example_database DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`Copy
创建用户名 `example_user` 并赋予权限

`GRANT ALL ON example_database.* TO 'example_user'@'localhost' IDENTIFIED BY '这里改成您要设置的强大的没人能猜出来的随机的密码';
`Copy
刷新 MySQL 权限

`FLUSH PRIVILEGES;
`Copy
没问题以后就可以退出了

`EXIT;
`Copy
新建立一个 `/var/www/example.org/mysql-test.php` 文件并测试

`cat >> /var/www/example.org/mysql-test.php << EOF
<?php
\$dbname = 'example_database';    //MySQL 数据库名
\$dbuser = 'example_user';   //MySQL 用户名
\$dbpass = '您的强大的没人可以猜出来的密码';
\$dbhost = 'localhost';  //安装在本地就用 localhost
\$link = mysqli_connect(\$dbhost, \$dbuser, \$dbpass) or die("Unable to Connect to '\$dbhost'");
mysqli_select_db(\$link, \$dbname) or die("Could not open the db '\$dbname'");
\$test_query = "SHOW TABLES FROM \$dbname";
\$result = mysqli_query(\$link, \$test_query);
\$tblCnt = 0;
while(\$tbl = mysqli_fetch_array(\$result)) {
  \$tblCnt++;
  # echo \$tbl[0]."&lt;br /&gt;\n";
}
if (!\$tblCnt) {
  echo "MySQL is working fine. There are no tables.";
} else {
  echo "MySQL is working fine. There are \$tblCnt tables.";
}
?>
EOF
`Copy
创建完毕后访问 `http://example.org/mysql-test.php` 如果出现 `MySQL is working fine. There are no tables.` 则说明 MySQL 工作正常。

# 5、安装 MySQL (可选)

如果您必须使用某些 MySQL 才有的功能，那么可以按照 MySQL [官网的教程](https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/#apt-repo-fresh-install)安装 MySQL。

*注意：除非您知道您在做什么，否则不要同时安装 MySQL 和 MariaDB。*

## 5.1 添加 apt 源

`wget https://repo.mysql.com/mysql-apt-config_0.8.34-1_all.deb
dpkg -i mysql-apt-config_0.8.34-1_all.deb
`Copy
国内的机器可以在添加完成后修改为清华 TUNA 源，您可以修改 `/etc/apt/sources.list.d/mysql-community.list` 文件，替换成如下内容：

`deb https://mirrors.tuna.tsinghua.edu.cn/mysql/apt/debian $(lsb_release -sc) mysql-8.0 mysql-8.4-lts mysql-apt-config mysql-tools
`Copy
Debian 下也可以直接使用 [extrepo](/debian-extrepo/):

`sudo extrepo enable mysql-lts
`Copy

## 5.2 安装 MySQL

```
`apt update
apt install mysql-server -y
`
```
Copy
默认 MySQL 会安装最新的 8.4 版本，如果您需要更低的版本，比如 8.0，可以使用如下命令：

`dpkg-reconfigure mysql-apt-config
`Copy
您可能需要设置一个强大的 root 密码，接下来的步骤和 MariaDB 基本相同，把 `mariadb` 命令换成 `mysql` 命令即可，本文不再赘述。

好了，以上就是基本的 Debian 和 Ubuntu 安装最新版 LAMP 的教程，如有问题可以随时发评论留言讨论。