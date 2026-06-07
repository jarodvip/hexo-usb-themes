# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**这是一个 Hexo 主题项目** —— `usb` 主题，一个像素级复刻 https://u.sb (烧饼博客) 设计风格的 Hexo 主题。

仓库根目录的 Hexo 配置和 `source/_posts/` 下的 46 篇测试文章（7274 行）**仅用于测试主题渲染效果**，不是真实的博客内容。**所有主题开发工作都在 `themes/usb/` 目录下进行。**

## 常用命令

`package.json` 暴露的脚本（与 `npx hexo` 等价，二选一）：

| 脚本 | 等价命令 | 说明 |
|------|---------|------|
| `npm run clean` | `npx hexo clean` | 清缓存（改完主题**必须先跑**） |
| `npm run build` | `npx hexo generate` | 生成静态文件到 `public/` |
| `npm run server` | `npx hexo server` | 启动开发服务器（http://localhost:4000） |
| `npm run deploy` | `npx hexo deploy` | 部署（当前 `_config.yml` 未配置 deploy 目标） |

标准开发流程：

```bash
npm run clean && npm run build && npm run server
```

> **本项目无测试套件、无 linter** —— 不要花时间找或写测试。

## 项目结构

```
hexo/
├── _config.yml              # Hexo 站点配置（仅测试用，主题配置见 themes/usb/_config.yml）
├── package.json             # 暴露 build/clean/server/deploy 四个脚本
├── source/
│   ├── _posts/              # 46 篇测试文章（不要修改）
│   ├── about/ contact/ disclaimer/ links/ tags/   # 独立页面
│   └── ...                  # 渲染后输出到 public/
├── themes/usb/              # ★ 主题核心代码（所有开发都在这）
│   ├── _config.yml          # 主题配置：菜单、社交、强调色、per_page、是否显示封面等
│   ├── layout/
│   │   ├── layout.ejs       # 主布局：HTML head/body 骨架、partial 装配
│   │   ├── index.ejs        # 首页：文章卡片网格 + 分页器
│   │   ├── post.ejs         # 文章页：三段式（正文 / footer-card / 标签区）
│   │   ├── page.ejs         # 独立页面
│   │   ├── archive.ejs      # 归档页
│   │   ├── tag.ejs          # 标签页
│   │   └── partials/
│   │       ├── header.ejs   # 顶部导航
│   │       ├── footer.ejs   # 页脚 + 社交链接
│   │       ├── back-to-top.ejs
│   │       └── toc.ejs      # 文章目录抽屉（仅 is_post() 时由 layout.ejs 引入）
│   └── source/
│       ├── css/style.css    # 完整主题样式（~1100 行，CSS 变量见 :root）
│       └── js/main.js       # 主题 JS：代码块 Copy 按钮、TOC 开关、版权年份
├── .playwright-mcp/         # Playwright MCP 截图输出（与 u.sb 原站对比调试用）
├── .claude/
│   ├── settings.local.json  # 已预授权 npx hexo / Playwright MCP 工具
│   └── _page_check_plan.md  # u.sb 复刻完整性检查清单（首页/文章页/标签/归档等）
├── db.json                  # Hexo 缓存（.gitignore）
├── public/                  # 构建产物（.gitignore）
└── node_modules/
```

> **根目录散落大量 `*.png` 文件**（`localhost-*.png` / `usb-*.png` / `compare-*.png` 等约 130+ 个）—— 是历史调试截图，**不是项目资产**。要对比时直接打开最新一组即可，不需要清理 git（已 untracked）。

## USB 主题设计规范

### 配色方案（三段式，参考 u.sb 最新实现）

| 区域 | 颜色 | 来源 |
|------|------|------|
| 页面背景 | `#0d0d0d` | `--background` |
| 文章正文区 | `#121212` | `.post-article`（写死，非 CSS 变量） |
| 标题/元信息卡片 | `#1a1a1a` | `.post-footer-card`（写死） |
| 标签区域 | `#121212` | `.post-footer-tags-section`（写死） |
| 边框色 | `#5c5c5c` | `--border` |
| 强调色 | `#ffdb33` | `--primary`（黄色） |
| Header | `#161616` | `--card` |

**注意**：文章页**不用边框分隔**，纯靠背景色深浅差异做视觉分层。三段宽度必须对齐（`max-width: 920px; margin: 0 auto`）。

### 视觉系统

- **字体**：Space Grotesk（中文回落 PingFang SC / Microsoft YaHei）
- **硬边阴影**：`rgb(92, 92, 92) 4px 4px 0px 0px`（无模糊、零偏移，存于 `--shadow-md`）
- **圆角**：全部 `0px`（硬边设计语言）
- **Header**：固定顶部，高度 `56px`
- **容器宽度**：通用 `1280px`；文章正文 `920px`
- **网格断点**：`640px`（2列）→ `768px`（3列）→ `1280px`（4列）

### 文章页三段式结构

```
┌─────────────────────────────┐
│  .post-article      #121212 │  正文（标题/元信息/正文）
├─────────────────────────────┤
│  .post-footer-card  #1a1a1a │  标题/URL/作者/版权元信息
├─────────────────────────────┤
│  .post-footer-tags  #121212 │  标签
└─────────────────────────────┘
```

由 `themes/usb/layout/post.ejs` 输出，对应 CSS 类在 `style.css:417`（`.post-article`）、`:720`（`.post-footer-card`）、`:778`（`.post-footer-tags-section`）。

## 主题开发工作流

修改主题后的标准流程：

```bash
npm run clean && npm run build && npm run server
```

然后在 http://localhost:4000 验证。视觉对比用 Playwright MCP 打开 u.sb 原站截图，再与本地对比（Playwright MCP 工具 `mcp__plugin_playwright_playwright__*` 已在 `.claude/settings.local.json` 预授权，截图输出到 `.playwright-mcp/`）。

### 改动对应文件

| 改动类型 | 文件 |
|---------|------|
| 颜色/间距/排版 | `themes/usb/source/css/style.css` |
| 页面结构 | `themes/usb/layout/*.ejs`（同步检查 CSS 类名） |
| 导航菜单/社交链接 | `themes/usb/_config.yml` |
| 代码块 Copy / TOC 抽屉 / 版权年份 | `themes/usb/source/js/main.js` |
| 文章目录抽屉 DOM | `themes/usb/layout/partials/toc.ejs` |
| TOC 样式 | `themes/usb/source/css/style.css`（`.toc-*` 段） |

### 关键 CSS 类

- `.header` `.header-inner` —— 顶部导航
- `.container` —— 通用内容容器
- `.posts-layout` `.post-card` —— 首页网格和卡片
- `.post-content` —— 文章正文（h2 带锚点）
- `.post-article` `.post-footer-card` `.post-footer-tags-section` —— 文章页三段
- `.toc-toggle` `.toc-panel` `.toc-overlay` —— 文章目录抽屉

### 关键 JS 模块（`main.js`）

- **代码块 Copy 按钮** —— 给所有 `pre code`（hljs 模式）注入按钮，附 fallback 处理 `figure.highlight`
- **TOC 抽屉** —— 解析 `h2`/`h3` 生成列表，绑定开关、点击锚点滚动、ESC 关闭
- **版权年份** —— 启动时把 `.copyright-text` 替换为当前年份

## 约定

- **不要修改** `source/_posts/*.md`，仅作渲染验证用
- **不引入新依赖** —— `package.json` 当前已安装的包足够（hexo 8、4 个 generator、3 个 renderer、theme-landscape）
- **遵循全局 CLAUDE.md 规则**（`~/.claude/CLAUDE.md`）：精准修改，不顺手重构未要求的部分
- **样式微调一次只改一个值**，方便和 u.sb 原站对比

## 调试技巧

- 样式不生效 → `npm run clean`，Hexo 会缓存
- 新加的 partial 没显示 → 检查 `layout.ejs` 是否 `include` 了它（`partials/toc.ejs` 仅在 `is_post()` 时引入）
- 文章页结构异常 → 检查 `post.ejs` 三段是否齐全，背景色是否在 CSS 中定义
- 截图对比 u.sb 原站 → Playwright MCP 工具，输出到 `.playwright-mcp/`
- 想要看「u.sb 复刻还有哪些没做」→ 读 `.claude_page_check_plan.md`（已勾选项 / 进行中 / 待检查）
