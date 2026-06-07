---
title: 升级 Debian 后 GitLab PostgreSQL 无法启动的解决方法
date: 2025-09-16T00:00:00.000+00:00
tags:
  - debian
  - gitlab
cover: https://s.bh.sb/images/fix-gitlab-postgresql-not-starting-debian-upgrade.webp
---

本文将介绍在升级 Debian 系统后，GitLab 的 PostgreSQL 数据库无法正常启动的问题。

## 背景前提

**本文的 GitLab 是基于官方源安装的，具体安装和升级方法限于篇幅，不再阐述。**

我们从 Debian 11 升级到 Debian 12 后，再更新 GitLab 会发现如下报错：

`gitlab [execute] WARNING: database "postgres" has a collation version mismatch DETAIL: The database was created using collation version 2.31, but the operating system provides version 2.36.`
或者从 Debian 12 升级到 Debian 13 后更新 GitLab 也会有如下报错：

```bash
WARNING:  database “gitlabhq_production” has a collation version mismatch
DETAIL:  The database was created using collation version 2.36, but the operating system provides version 2.41.
HINT:  Rebuild all objects in this database that use the default collation and run ALTER DATABASE gitlabhq_production REFRESH COLLATION VERSION, or build PostgreSQL with the right library version.
```
我们以 Debian 13 为例，可以看到系统自带的 glibc 版本为 2.41：

```bash
# ldd --version
ldd (Debian GLIBC 2.41-12) 2.41
```
而 Debian 12 自带的 glibc 版本为 2.36：

```bash
# ldd --version
ldd (Debian GLIBC 2.36-9+deb12u13) 2.36
```
Debian 11 的 glibc 版本为 2.31：

```bash
# ldd --version
ldd (Debian GLIBC 2.31-13+deb11u13) 2.31
```
所以我们直接升级系统以后 GitLab 的 PostgreSQL 数据库仍使用旧版本的排序规则，导致版本不匹配，所以 GitLab 升级会失败。

## 解决方法

我们以 Debian 11 升级到 Debian 12 后的情况举例，首先备份一下 GitLab：

`sudo gitlab-backup create`
然后我们进入 GitLab 的 PostgreSQL 控制台：

`sudo gitlab-psql`
接着重新建立索引并修复 `gitlabhq_production` 数据库：

```bash
SET statement_timeout = 0;
REINDEX DATABASE gitlabhq_production;
ALTER DATABASE gitlabhq_production REFRESH COLLATION VERSION;
```
重建完成后输入 `\q` 并按回车退出，然后我们修复 `template1` 和 `postgres` 数据库：

```bash
sudo gitlab-psql -d template1 -c "ALTER DATABASE template1 REFRESH COLLATION VERSION;"
sudo gitlab-psql -d postgres -c "ALTER DATABASE postgres REFRESH COLLATION VERSION;"
```
修复完成后验证结果：

```bash
sudo gitlab-psql -c "
SELECT 
    datname,
    datcollversion,
    pg_collation_actual_version((SELECT oid FROM pg_collation WHERE collname = 'default')) as system_version,
    CASE 
        WHEN datcollversion = pg_collation_actual_version((SELECT oid FROM pg_collation WHERE collname = 'default')) 
        THEN '✅ Good' 
        ELSE '❌ Bad' 
    END as status
FROM pg_database 
WHERE datname IN ('template1', 'postgres', 'gitlabhq_production')
ORDER BY datname;"
```
如果出现如下结果，则修复完成：

```bash
datname       | datcollversion | system_version | status  
---------------------+----------------+----------------+---------
 gitlabhq_production | 2.36           | 2.36           | ✅ Good
 postgres            | 2.36           | 2.36           | ✅ Good
 template1           | 2.36           | 2.36           | ✅ Good
```
然后我们就可以重新配置 GitLab 并更新升级了：

`sudo gitlab-ctl reconfigure`
完成以后重启 GitLab 即可恢复服务：

```
```
`sudo gitlab-ctl restart
`
```
```
Copy