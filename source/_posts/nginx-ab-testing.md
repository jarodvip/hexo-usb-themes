---
title: Nginx 使用 split_clients 进行简易 A/B 测试
date: 2022-07-02T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/nginx-ab-testing.webp
---

本文将介绍在 Nginx 配置简易 A/B 测试的姿势。

# 背景前提

有时候我们需要简单的做一些 A/B 测试，并不需要复杂的判断条件，这时候我们可以用到 Nginx 的 [ngx_http_split_clients_module](https://nginx.org/en/docs/http/ngx_http_split_clients_module.html) 模块。

# 安装 ngx_http_split_clients_module 模块

一般来说这个模块已经自带，如果没有的话推荐安装我们打包的 [N.WTF](https://n.wtf/)

# 配置 Nginx

这里举例，我们想要 `20%` 的用户跳转到网址 `https://example.com/`，`30%` 的用户跳转到网址 `https://example.org/`，剩下的跳转到网址 `https://examle.edu/`：

`split_clients "${remote_addr}AAA" $variant {
    20%               https://example.com/;
    30%               https://example.org/;
    *                 https://example.edu/;
}

server {
    listen 80;
    listen [::]:80;
    server_name _;

    return 302 ${variant};
}
`Copy
上述例子中，按照访客请求的 `IP 地址` 加上 `AAA 字符串` 会使用 [MurmurHash2](https://en.wikipedia.org/wiki/MurmurHash#MurmurHash2) 转换成数字，如果得出的数字在前 `20%`，那么 `$variant` 值为 `https://example.com/`，相应的在中间 `30%` 区间的值为 `https://example.org/`，其他的为 `https://example.edu/`。

然后我们找两台不同 IP 的机器进行测试：

机器 A：

`root@debian ~ # curl -I 192.0.2.2
HTTP/1.1 302 Moved Temporarily
Server: nginx
Date: Sat, 02 Jul 2022 20:51:43 GMT
Content-Type: text/html
Content-Length: 138
Connection: keep-alive
Location: https://example.com/
`Copy
机器 B：

`root@debian ~ #  curl -I 192.0.2.2                         
HTTP/1.1 302 Moved Temporarily
Server: nginx
Date: Sat, 02 Jul 2022 20:52:12 GMT
Content-Type: text/html
Content-Length: 138
Connection: keep-alive
Location: https://example.org/
`Copy
然后就可以有更灵活的用法，比如指定不同的目录：

`root /var/www/${variant};
`Copy
指定不同的首页：

`index index-${variant}.html;
`Copy
读者可以举一反三，这个比较简易的 A/B 测试就完成啦～