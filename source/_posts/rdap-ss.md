---
title: RDAP.SS - 基于 RDAP 协议的 Whois 查询网站
date: 2025-11-03T00:00:00.000+00:00
tags:
cover: https://s.bh.sb/images/rdap-ss.webp
---

RDAP.SS 是一个基于 RDAP 协议的 Whois 查询网站，本文介绍 RDAP 协议以及如何使用。

# 1、什么是 RDAP 协议？

[RDAP](https://www.icann.org/en/contracted-parties/registry-operators/resources/registration-data-access-protocol)，全称 Registration Data Access Protocol，由 IETF（互联网工程任务组）制定，主要用于查询以下注册信息：

- 域名（Domain）

- IP 地址（IPv4 / IPv6）

- ASN（自治系统号）

它定义在 RFC [7480](https://www.rfc-editor.org/rfc/rfc7480.txt)、[7481](https://www.rfc-editor.org/rfc/rfc7481.txt)、[7482](https://www.rfc-editor.org/rfc/rfc7482.txt)、[7483](https://www.rfc-editor.org/rfc/rfc7483.txt)、[7484](https://www.rfc-editor.org/rfc/rfc7484.txt) 等系列标准中。

# 2、RDAP 和 Whois 协议的区别

以下是对两者主要区别的总结：

在传统的 Whois 协议中，用户需要给 Whois 服务器的 43 端口发送查询，然后 Whois 服务器返回纯文本的结果。

这导致了传统的 Whois 协议有几个无法修补的劣势：

- 非结构化的文本输出，没有标准化的接口

传统的 Whois 没有统一的查询和返回 API，只有简单的文本命令，这导致每家注册局返回的信息格式不一致，例如有的字段写作 `Registrant Email`，有的写作 `Contact Email`。这给开发者带来了巨大的解析工作量，需要为不同注册局甚至注册商编写对应的匹配规则。

- 非加密传输

TCP 43 端口使用明文传输，任何中间节点（包括运营商）都能看到查询内容。🤷‍♂️ 这在 2025 年已经难以被接受。

- 缺乏访问控制权限

Whois 服务器只能识别查询的 IP 地址，无法针对单个用户分配权限或进行身份区分，安全设置也只能基于 IP 层面。

- 管理混乱

Whois 客户端需要为每个 TLD 手动配置对应的 Whois 服务器，缺乏类似 RDAP 的自动 `bootstrap` 机制。

# 3、RDAP 协议的优势

而 RDAP 协议完美的弥补了这些劣势：

- 标准化的 JSON 输出

RDAP 返回的数据是结构化的 JSON，字段统一定义，例如：

`{
  "objectClassName": "domain",
  "ldhName": "example.com",
  "status": ["active"],
  "entities": [...]
}
`Copy
这让程序能直接解析字段，无需依赖正则或人工格式识别。

- 统一的 API

RDAP 基于 HTTP/HTTPS 的 RESTful API，支持 GET 请求、分页、过滤等现代查询方式。

例如：

`GET https://rdap.verisign.com/com/v1/domain/example.com
`Copy
即可从注册局调用 `example.com` 的信息

- Bootstrap 自动重定向

RDAP 客户端无需知道具体注册商，它会根据 IANA 的 bootstrap 数据自动跳转到正确的注册局或 RIR

IANA 的 Bootstrap 数据是公开的，可在以下地址访问：

[https://data.iana.org/rdap/](https://data.iana.org/rdap/)

按照 RDAP.org 的[统计](https://deployment.rdap.org/)，目前大约有 77% 的注册局已经接入了 RDAP 协议，除了少部分 TLD 需要手工添加 RDAP 服务器，大部分已经都接入了 IANA 的 bootstrap 数据。

- 安全和隐私

RDAP 强制使用 HTTPS，保障查询与返回内容的完整性与保密性。防止中间人攻击与数据监听。

如有需要，注册局还可以通过 OAuth 2.0 或 Token 认证实现访问控制，根据用户身份（如公众、注册商或执法机构）返回不同级别的信息。这非常契合 GDPR 等隐私法规的要求。

- 可扩展性

RDAP 支持使用 extensions（扩展字段），注册局可以在标准字段外添加自定义信息，而不会破坏兼容性。

例如：

`"rdapConformance": ["rdap_level_0", "icann_rdap_technical_implementation_guide_0"]
`Copy

# 4、RDAP.SS 网站

基于 RDAP 的优势，我使用 Claude Code 开发了一个基于 RDAP 协议的 Whois 查询网站： [RDAP.SS](https://rdap.ss/)

技术栈：

- Next.js

- Tailwind CSS

- Redis 缓存

目前支持如下格式的 Whois 查询：

- 域名 - [https://rdap.ss/whois/google.com](https://rdap.ss/whois/google.com)

- IPv4 - [https://rdap.ss/whois/8.8.8.8](https://rdap.ss/whois/8.8.8.8)

- IPv4 CIDR - [https://rdap.ss/whois/8.8.8.0/24](https://rdap.ss/whois/8.8.8.0/24)

- IPv6 - [https://rdap.ss/whois/2001:4860:4860::8888](https://rdap.ss/whois/2001:4860:4860::8888)

- IPv6 CIDR - [https://rdap.ss/whois/2001:4860::/32](https://rdap.ss/whois/2001:4860::/32)

- ASN - [https://rdap.ss/whois/AS15169](https://rdap.ss/whois/AS15169)

仅当对应的 TLD 注册局支持 RDAP 协议时，域名查询才可用；未支持的注册局会降级为传统 Whois 协议返回结果。

如果在使用过程中遇到问题，请随时在 GitHub 提交 [issue](https://github.com/rdapss/rdap.ss/issues)。