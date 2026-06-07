---
title: Firefox 指定特定网站关闭所有扩展
date: 2022-06-18T00:00:00.000+00:00
tags:
  - firefox
cover: https://s.bh.sb/images/firefox-no-webextensions.webp
---

本文将指导在 Firefox 下设置特定的网站不启用所有扩展。

## 背景前提

有时候我们想针对某个特定的网站不启用 Firefox 的扩展，由于没有对应的插件来解决这个问题，每次都用安全模式启动略显麻烦，所以我们只能手工修改配置。

## 解决方法

首先，在地址栏输入 `about:config` 然后回车进入：

![image.png](https://s.bh.sb/uploads/2022/06/18/NvDXhfpoKBuUmMP.png)

点击确认后，在搜索框输入 `extensions.webextensions.restrictedDomains`：

![image.png](https://s.bh.sb/uploads/2022/06/18/KVAHyc9odEtD2uO.png)

默认情况下，为了保护用户隐私，这些 Mozilla 官方的域名是强制不开启扩展的：

`accounts-static.cdn.mozilla.net,accounts.firefox.com,addons.cdn.mozilla.net,addons.mozilla.org,api.accounts.firefox.com,content.cdn.mozilla.net,discovery.addons.mozilla.org,install.mozilla.org,oauth.accounts.firefox.com,profile.accounts.firefox.com,support.mozilla.org,sync.services.mozilla.com`
然后就可以添加或删除域名了，记得域名前面加一个英文的逗号，比如我要加一个 `example.com`：

`accounts-static.cdn.mozilla.net,accounts.firefox.com,addons.cdn.mozilla.net,addons.mozilla.org,api.accounts.firefox.com,content.cdn.mozilla.net,discovery.addons.mozilla.org,install.mozilla.org,oauth.accounts.firefox.com,profile.accounts.firefox.com,support.mozilla.org,sync.services.mozilla.com,example.com`
好了，就这么简单解决问题了，重新打开页面或者重启浏览器试试吧。