---
title: Debian / Ubuntu 开启 SSH 的 RSA Key 登录
date: 2023-06-09T00:00:00.000+00:00
tags:
  - debian
  - ssh
cover: https://s.bh.sb/images/debian-enable-ssh-rsa-key.webp
---

本文将指导如何在 Debian 和 Ubuntu 开启 SSH 的 RSA Key 登录。

自从 OpenSSH 8.3 开始，RSA Key 登录默认[被禁用](https://lwn.net/Articles/821544/)，并被认为[不安全](https://confluence.atlassian.com/bitbucketserverkb/ssh-rsa-key-rejected-with-message-no-mutual-signature-algorithm-1026057701.html)。

所以自从 Ubuntu 22.04 和 Debian 12 开始，如果某些古老的业务需要使用 RSA Key 登录，你需要手动开启 RSA Key 登录。

## 开启 RSA Key 登录

我们不需要修改 `/etc/ssh/sshd_config` 这个系统默认的 SSH 配置文件，只需要添加一个 `/etc/ssh/sshd_config.d/enable_rsa_keys.conf` 配置文件即可：

```bash
cat > /etc/ssh/sshd_config.d/enable_rsa_keys.conf << EOF
HostKeyAlgorithms +ssh-rsa
PubkeyAcceptedKeyTypes +ssh-rsa
EOF
```

## 重启 SSH 服务

然后重启 SSH 服务即可：

`systemctl status ssh`
或

`systemctl restart sshd`
这两个服务在 Debian 12 下都是一样的：

```bash
root@debian ~ # systemctl status ssh.service
● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled; preset: enabled)
     Active: active (running) since Fri 2023-06-09 16:54:43 UTC; 15min ago
```
对比

```bash
root@debian ~ # systemctl status sshd
● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled; preset: enabled)
     Active: active (running) since Fri 2023-06-09 16:54:43 UTC; 15min ago
```
我们可以看到 sshd 其实是 ssh 服务的别称：

```bash
root@debian ~ # cat /lib/systemd/system/ssh.service | grep Alias
Alias=sshd.service
```
此时您就可以使用 RSA Key 登录 SSH 了。