---
title: Debian 无人值守自动更新系统
date: 2022-06-16T00:00:00.000+00:00
tags:
  - debian
cover: https://s.bh.sb/images/debian-unattended-upgrades.webp
---

本文将指导如何设置 Debian 下无人值守自动更新系统。

## 准备工作

除非你是物理服务器，以及没有用过奇奇怪怪定制或修改的内核的 KVM 构架的 VPS 和云主机，否则升级系统更新内核是有一定机率导致 Grub 加载失败的，切记备份重要数据！

再强调一遍，一定要备份重要数据！

以下操作需要在 root 用户下完成，请使用 `sudo -i` 或 `su root` 切换到 root 用户进行操作。

## 安装必要软件

首先需要安装 `unattended-upgrades` 和 `apt-listchanges` 包：

```bash
apt update
apt install unattended-upgrades apt-listchanges -y
```
默认情况下 `unattended-upgrades` 服务会自动启动并生效：

```bash
root@debian ~ # systemctl status unattended-upgrades
● unattended-upgrades.service - Unattended Upgrades Shutdown
     Loaded: loaded (/lib/systemd/system/unattended-upgrades.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2022-05-03 09:50:36 UTC; 1 months 13 days ago
       Docs: man:unattended-upgrade(8)
   Main PID: 697 (unattended-upgr)
      Tasks: 2 (limit: 1059)
     Memory: 8.5M
        CPU: 69ms
     CGroup: /system.slice/unattended-upgrades.service
             └─697 /usr/bin/python3 /usr/share/unattended-upgrades/unattended-upgrade-shutdown --wait-for-signal
```
如果没有生效可以执行 `systemctl enable --now unattended-upgrades` 让其生效并开机自动启动。

## 配置 50unattended-upgrades 文件

我们直接编辑 `/etc/apt/apt.conf.d/50unattended-upgrades` 文件并输入以下内容：

```bash
cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1"; 
APT::Periodic::Verbose "1";
APT::Periodic::AutocleanInterval "7";

Unattended-Upgrade::Mail "root";

Unattended-Upgrade::Origins-Pattern {
  "origin=Debian,codename=\${distro_codename},label=Debian";
  "origin=Debian,codename=\${distro_codename},label=Debian-Security";
  "origin=Debian,codename=\${distro_codename}-security,label=Debian-Security";
};

Unattended-Upgrade::Package-Blacklist {
};

Unattended-Upgrade::Automatic-Reboot "false";
EOF
```
然后重启服务：

`systemctl restart unattended-upgrades`
上述配置中，`APT::Periodic::Update-Package-Lists "1";` 和 `APT::Periodic::Unattended-Upgrade "1";` 代表打开了自动更新，如果设置 `0` 则不会自动更新。

`APT::Periodic::AutocleanInterval "7";` 这个配置代表残留的无用依赖包保留 7 天，7 天后自动清理。

`Unattended-Upgrade::Origins-Pattern` 代表需要更新的 `apt` 源，我们仅更新包含 `debian` 和 `debian-security` 的仓库，如果您还需要更新某些第三方 `apt` 源安装软件，也可以加入自定义 `origin` 比如：

`"origin=PowerDNS";`
至于如何获取 `origin`，可以直接查看这个软件仓库的 `Release` 文件，比如 PowerDNS 仓库的这个 [Release](https://repo.powerdns.com/debian/dists/bullseye-auth-master/Release)：

```bash
root@debian ~ # curl -s https://repo.powerdns.com/debian/dists/bullseye-auth-master/Release | grep Origin
Origin: PowerDNS
```
`Unattended-Upgrade::Package-Blacklist` 是黑名单，可以把不需要自动更新的软件加进去，比如：

```bash
Unattended-Upgrade::Package-Blacklist {
    // 不自动更新所有 linux- 开头的包
    "linux-";
    // 不自动更新 Apache 2
    "apache2";
    // 也支持正则，这个规则不更新所有包含 xen，xenstore 以及 libxen 开头的包，比如 xen-system-amd64, xen-utils-4.1, xenstore-utils 和 libxenstore3.0
    "(lib)?xen(store)?";
};
```
`APT::Periodic::Verbose "1";` 默认情况下这个设置是 `0`，代表不发送任何报告，`1` 代表进度报告。

`Unattended-Upgrade::Mail "root";` 则是发送邮件给 `root` 用户，可以根据需求自定义。

`Unattended-Upgrade::Automatic-Reboot "false";` 则是不自动重启，特么服务器没事重启干嘛……

我们可以运行这个命令测试规则是否正确：

`unattended-upgrades --dry-run --debug`
如果没有报错即代表没问题，这样我们就配置好了 Debian 的无人值守自动更新，再也不用担心出安全漏洞无法及时更新系统咯。

需要查看日志可以使用 `journalctl -u apt-daily.service | tail` 命令：

```bash
root@debian ~ # journalctl -u apt-daily.service | tail
Jun 18 08:06:23 debian apt.systemd.daily[510126]: verbose level 1
Jun 18 08:06:26 debian apt.systemd.daily[510126]: download updated metadata (success).
Jun 18 08:06:26 debian apt.systemd.daily[510126]: download upgradable (not run)
Jun 18 08:06:28 debian apt.systemd.daily[510126]: unattended-upgrade -d (success)
Jun 18 08:06:28 debian systemd[1]: apt-daily.service: Succeeded.
Jun 18 08:06:28 debian systemd[1]: Finished Daily apt download activities.
```
我们看到 `download updated metadata (success).` 和 `unattended-upgrade -d (success)` 即为成功。