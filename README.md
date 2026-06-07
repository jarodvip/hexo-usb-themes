# USB — A Hexo Theme

> A pixel-perfect Hexo theme replicating the design style of [u.sb（烧饼博客）](https://u.sb).

![](assets/usb-homepage.png)

## ✨ Features

### Pixel-Perfect u.sb Replication

The three-tier dark color scheme from `#0d0d0d` → `#121212` → `#1a1a1a`, with the yellow accent `#ffdb33` tying it all together. Every detail is verified against the original site.

![](assets/usb-archive.png)

### Hard-Edge Design Language

- **0px border-radius** — zero rounded corners across the entire theme
- **Hard shadow** — `rgb(92, 92, 92) 4px 4px 0px 0px` with no blur, no offset
- **Pure black base** — four background shades (`#0d0d0d` / `#121212` / `#1a1a1a` / `#161616`) separated by luminance contrast, not borders

### Three-Section Post Layout

```
┌─────────────────────────────┐
│  .post-article      #121212 │  Content (title / meta / article)
├─────────────────────────────┤
│  .post-footer-card  #1a1a1a │  Title / URL / author / copyright
├─────────────────────────────┤
│  .post-footer-tags  #121212 │  Tags
└─────────────────────────────┘
```

Width locked to `920px`, centered.

![](assets/usb-homepage.png)

### Responsive Card Grid

| Breakpoint | Columns | Device |
|---|---|---|
| `< 640px` | 1 | Mobile |
| `640px – 768px` | 2 | Tablet |
| `768px – 1280px` | 3 | Small desktop |
| `≥ 1280px` | 4 | Large desktop |

### TOC Drawer

Auto-generates a table of contents from `h2`/`h3` tags. Click the side button to open a slide-out drawer, click anchor links for smooth scroll, press ESC to close.

### Code Block Copy Button

Automatically injects a copy button on every `pre code` (highlight.js rendered), with fallback support for `figure.highlight`.

### Flexible Configuration

All theme settings live in `themes/usb/_config.yml`:

- Navigation menu items
- Social links (GitHub, Twitter, etc.)
- Display toggles (cover image, excerpts, posts per page)
- Accent color

### Ready-Made Pages

Archives, Tags, About, Links, Disclaimer — covers every blog scenario.

![](assets/usb-tags.png)

## 🎨 Visual Specs

### Color Palette

| Variable | Color | Usage |
|---|---|---|
| `--background` | `#0d0d0d` | Page background |
| `--card` | `#161616` | Header / cards |
| `--border` | `#5c5c5c` | Borders |
| `--primary` | `#ffdb33` | Accent (yellow) |
| `.post-article` | `#121212` | Article body |
| `.post-footer-card` | `#1a1a1a` | Footer card |

### Typography

- **English**: Space Grotesk
- **Chinese**: PingFang SC → Microsoft YaHei
- **Header**: fixed at `56px`
- **Container**: `1280px`
- **Article**: `920px`

## 📦 Installation

```bash
git clone https://github.com/jarodvip/hexo-usb-themes.git themes/usb
```

Set the theme in your Hexo `_config.yml`:

```yaml
theme: usb
```

Clean cache and start:

```bash
hexo clean && hexo generate && hexo server
```

## 📁 Structure

```
themes/usb/
├── _config.yml                # Theme config: menus, social, accent color, etc.
├── layout/
│   ├── layout.ejs             # Master layout: HTML head/body, partial assembly
│   ├── index.ejs              # Homepage: article card grid + pagination
│   ├── post.ejs               # Post page: three-section layout
│   ├── page.ejs               # Static pages
│   ├── archive.ejs            # Archives page
│   ├── tag.ejs                # Tags page
│   └── partials/
│       ├── header.ejs         # Top navigation bar
│       ├── footer.ejs         # Footer + social links
│       ├── back-to-top.ejs    # Back to top button
│       └── toc.ejs            # TOC drawer
└── source/
    ├── css/style.css          # Full styles (~1100 lines, CSS vars in :root)
    └── js/main.js             # Code copy / TOC drawer / copyright year
```

---

> Designed with ❤️ for those who love clean, dark, hard-edged blogs.
