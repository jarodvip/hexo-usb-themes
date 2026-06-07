---
title: WSL 2 使用 Docker 桥接模式网络访问 HTTPS 超时的解决方法
date: 2026-01-21T00:00:00.000+00:00
tags:
  - wsl 2
  - docker
cover: https://s.bh.sb/images/fix-wsl-2-docker-network.webp
---

本文介绍在 WSL 2 中使用 Docker 的桥接模式（bridge network）访问 HTTPS 时出现超时问题的解决方法。

最近一直在 Windows 下使用基于 WSL 2 的 Debian 进行开发。许多场景下需要使用 Docker 构建镜像，但过程中遇到一个奇怪的问题，在 Docker 容器内部访问 HTTP 站点时一切正常：

```bash
$ docker run --rm curlimages/curl time curl -s http://ip.gs
192.0.2.2
real    0m 0.02s
user    0m 0.00s
sys     0m 0.00s
```
一旦切换为 HTTPS，访问就会明显变慢，并且有一定概率出现超时：

```bash
$ docker run --rm curlimages/curl time curl -s https://ip.gs
192.0.2.2
real    0m 6.52s
user    0m 0.00s
sys     0m 0.00s
```
然而，如果将 Docker 切换到 Host 模式（`--network=host`），访问又恢复正常：

```bash
$ docker run --rm --network=host curlimages/curl time curl -s https://ip.gs
192.2.0.2
real    0m 0.28s
user    0m 0.00s
sys     0m 0.00s
```
在排查了 WSL 2 的 Debian 系统配置后，最终请教 ChatGPT 得到结论：

> 

Path MTU 与防火墙流量检查（inspection）不兼容导致问题

解决方法很简单：将 WSL 2 虚拟网络的 MTU 下调为 `1400` 即可。

## 1、添加 Docker 配置

在 WSL 2 的系统里，使用 root 用户修改 `/etc/docker/daemon.json` 文件：

```bash
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "20m",
        "max-file": "3"
    },
    "mtu": 1400,
    "dns": [
      "8.8.8.8",
      "1.1.1.1"
    ]
}
```
其中 `"mtu": 1400,` 是关键配置。

然后在 Windows 下把 WSL 2 关闭：

`wsl --shutdown`

## 2、修改 WSL 2 网卡配置

在 Windows 下使用管理员身份运行 Powershell，检查网卡名称：

```bash
PS C:\Users\showfom> Get-NetAdapter | Where-Object { $_.Name -like "*WSL*" }

Name                      InterfaceDescription                    ifIndex Status       MacAddress             LinkSpeed
----                      --------------------                    ------- ------       ----------             ---------
vEthernet (WSL (Hyper-V … Hyper-V Virtual Ethernet Adapter #3          41 Up           12-34-56-78-AB-CD        10 Gbps

PS C:\Users\showfom> Get-NetAdapter | Format-Table -AutoSize

Name                               InterfaceDescription                      ifIndex Status       MacAddress        Lin
                                                                                                                    kSp
                                                                                                                    eed
----                               --------------------                      ------- ------       ----------        ---
vEthernet (Default Switch)         Hyper-V Virtual Ethernet Adapter               35 Up           12-34-56-78-AB-AB …ps
vEthernet (WSL (Hyper-V firewall)) Hyper-V Virtual Ethernet Adapter #3            41 Up           12-34-56-78-AB-CD …ps
```
输出可以看到完整名称为 `vEthernet (WSL (Hyper-V firewall))`，然后为其设置 MTU：

`netsh interface ipv4 set subinterface "vEthernet (WSL (Hyper-V firewall))" mtu=1400 store=persistent`
出现 `Ok.` 字样即代表设置成功。

## 3、测试 WSL 2 中的 Docker 网络

然后重新运行 WSL 2 虚拟机：

`wsl -d debian`
再次测试：

```bash
$ docker run --rm curlimages/curl time curl -s https://ip.gs
192.0.2.2
real    0m 0.28s
user    0m 0.00s
sys     0m 0.00s
```
问题已完美解决，可以继续愉快地 Vibe Coding 了！ *★,°*:.☆(￣▽￣)/$:*.°★* 。