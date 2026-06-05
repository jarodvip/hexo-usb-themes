---
title: Debian 使用 Speedtest CLI 进行测速
date: 2022-12-20T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/debian-speedtest.webp
---

本文将指导如何在 Debian Stable 和 Ubuntu LTS 下安装并使用 Speedtest CLI 进行测速。

# 安装 Speedtest CLI

[Speedtest CLI](https://www.speedtest.net/apps/cli) 是 [Ookla](https://www.speedtest.net/) 官方推出的 Linux / BSD 下的 CLI 工具，方便我们在服务器里直接测试公网带宽速度。

首先，导入 GPG Key 并添加源：

`apt install -y lsb-release ca-certificates apt-transport-https curl gnupg dpkg
curl -sSL https://packagecloud.io/ookla/speedtest-cli/gpgkey | gpg --dearmor > /usr/share/keyrings/speedtest.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/speedtest.gpg] https://packagecloud.io/ookla/speedtest-cli/debian/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/speedtest.list
`Copy

```
`apt install -y lsb-release ca-certificates apt-transport-https curl gnupg dpkg
curl -sSL https://packagecloud.io/ookla/speedtest-cli/gpgkey | gpg --dearmor > /usr/share/keyrings/speedtest.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/speedtest.gpg] https://packagecloud.io/ookla/speedtest-cli/ubuntu/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/speedtest.list
`
```
Copy

然后更新系统并安装 `speedtest`：

`apt update
apt install speedtest -y
`Copy

# 使用 Speedtest CLI

安装完毕后我们即可使用默认的 `speedtest` 命令选择最近的节点并使用默认的网络测速，提示 `Do you accept the license? [type YES to accept]` 时，输入 `YES` 并回车即可：

![image.png](https://s.bh.sb/uploads/2022/03/23/Yqy71GpQ2WbOLFv.png)

# 高级用法

输入 `speedtest -h` 即可查看 `speedtest` 的命令参数：

`root@debian ~ # speedtest -h
Speedtest by Ookla is the official command line client for testing the speed and performance of your internet connection.

Version: speedtest 1.1.1.28

Usage: speedtest [<options>]
  -h, --help                        Print usage information
  -V, --version                     Print version number
  -L, --servers                     List nearest servers
  -s, --server-id=#                 Specify a server from the server list using its id
  -I, --interface=ARG               Attempt to bind to the specified interface when connecting to servers
  -i, --ip=ARG                      Attempt to bind to the specified IP address when connecting to servers
  -o, --host=ARG                    Specify a server, from the server list, using its host's fully qualified domain name
  -p, --progress=yes|no             Enable or disable progress bar (Note: only available for 'human-readable'
                                    or 'json' and defaults to yes when interactive)
  -P, --precision=#                 Number of decimals to use (0-8, default=2)
  -f, --format=ARG                  Output format (see below for valid formats)
      --progress-update-interval=#  Progress update interval (100-1000 milliseconds)
  -u, --unit[=ARG]                  Output unit for displaying speeds (Note: this is only applicable
                                    for ‘human-readable’ output format and the default unit is Mbps)
  -a                                Shortcut for [-u auto-decimal-bits]
  -A                                Shortcut for [-u auto-decimal-bytes]
  -b                                Shortcut for [-u auto-binary-bits]
  -B                                Shortcut for [-u auto-binary-bytes]
      --selection-details           Show server selection details
      --ca-certificate=ARG          CA Certificate bundle path
  -v                                Logging verbosity. Specify multiple times for higher verbosity
      --output-header               Show output header for CSV and TSV formats

 Valid output formats: human-readable (default), csv, tsv, json, jsonl, json-pretty

 Machine readable formats (csv, tsv, json, jsonl, json-pretty) use bytes as the unit of measure with max precision

 Valid units for [-u] flag: 
   Decimal prefix, bits per second:  bps, kbps, Mbps, Gbps
   Decimal prefix, bytes per second: B/s, kB/s, MB/s, GB/s
   Binary prefix, bits per second:   kibps, Mibps, Gibps
   Binary prefix, bytes per second:  kiB/s, MiB/s, GiB/s
   Auto-scaled prefix: auto-binary-bits, auto-binary-bytes, auto-decimal-bits, auto-decimal-bytes
`Copy
比较实用的有：

指定出口网卡：

`speedtest -I 指定网卡名称
`Copy
指定出口 IP：

`speedtest -i IP 地址
`Copy
*注意指定网卡或 IP 后可能会出现 `[error] Error: [0] Cannot open socket` 的错误提示，忽略即可。*

查看附近的测速节点列表：

`speedtest -L
`Copy
指定某个测速节点：

`speedtest -s 测速节点 ID
`Copy
最后秀一下我们的 40Gbps 公网带宽服务器：

![image.png](https://s.bh.sb/uploads/2022/03/23/MGnacZ63rzH8bJK.png)

![image.png](https://s.bh.sb/uploads/2022/03/23/nqBWjAkXt2DxguI.png)