// USB Theme — Main JavaScript
// u.sb (烧饼博客) Hexo Theme

document.addEventListener('DOMContentLoaded', function () {
  // Back-to-top button logic is in partial/back-to-top.ejs
  // Mobile menu toggle is in partial/header.ejs

  // Lazy load images
  var lazyImages = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    var imgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    });
    lazyImages.forEach(function (img) {
      imgObserver.observe(img);
    });
  } else {
    // Fallback: load all images immediately
    lazyImages.forEach(function (img) {
      img.src = img.dataset.src;
    });
  }

  // Add target="_blank" to external links
  var posts = document.querySelectorAll('.post-content a');
  var origin = window.location.origin;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].host && posts[i].host !== location.host) {
      posts[i].target = '_blank';
      posts[i].rel = 'noopener';
    }
  }


  // Highlight current year in footer
  var copyright = document.querySelector('.copyright-text');
  if (copyright) {
    copyright.textContent = 'Copyright ' + new Date().getFullYear() + ' 烧饼博客';
  }

  // Add copy button to code blocks (hljs mode)
  var codeBlocks = document.querySelectorAll('.post-content pre code.hljs');
  codeBlocks.forEach(function(code) {
    var pre = code.parentElement;

    // 跳过已经在 figure.highlight 里的代码块
    if (pre.closest('figure.highlight')) {
      return;
    }

    // 包裹 pre 标签
    var wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    // 创建按钮容器
    var btnContainer = document.createElement('div');
    btnContainer.className = 'code-copy-btn-container';

    // 创建复制按钮
    var copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.setAttribute('aria-label', 'Copy code');

    // 点击事件
    copyBtn.addEventListener('click', function() {
      var text = code.textContent;

      // 复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          copyBtn.textContent = 'Copied!';
          setTimeout(function() {
            copyBtn.textContent = 'Copy';
          }, 2000);
        });
      } else {
        // 降级方案
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          copyBtn.textContent = 'Copied!';
          setTimeout(function() {
            copyBtn.textContent = 'Copy';
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
        }
        document.body.removeChild(textarea);
      }
    });

    btnContainer.appendChild(copyBtn);
    wrapper.appendChild(btnContainer);
  });

  // Add copy button to figure.highlight (fallback)
  var figureBlocks = document.querySelectorAll('figure.highlight');
  figureBlocks.forEach(function(figure) {
    // 创建按钮容器
    var btnContainer = document.createElement('div');
    btnContainer.className = 'code-copy-btn-container';

    // 创建复制按钮
    var copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.setAttribute('aria-label', 'Copy code');

    // 点击事件
    copyBtn.addEventListener('click', function() {
      var code = figure.querySelector('.code pre');
      if (!code) return;

      // 处理 <br> 标签，将其转换为换行符
      var text = code.innerHTML
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')  // 移除所有 HTML 标签
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#123;/g, '{')
        .replace(/&#125;/g, '}');

      // 复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          copyBtn.textContent = 'Copied!';
          setTimeout(function() {
            copyBtn.textContent = 'Copy';
          }, 2000);
        });
      } else {
        // 降级方案
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          copyBtn.textContent = 'Copied!';
          setTimeout(function() {
            copyBtn.textContent = 'Copy';
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
        }
        document.body.removeChild(textarea);
      }
    });

    btnContainer.appendChild(copyBtn);
    figure.appendChild(btnContainer);
  });

  // ============================================================
  // 文章目录 TOC (Table of Contents)
  // ============================================================
  (function initTOC() {
    var toggle = document.getElementById('toc-toggle');
    var closeBtn = document.getElementById('toc-close');
    var overlay = document.getElementById('toc-overlay');
    var panel = document.getElementById('toc-panel');
    var list = document.getElementById('toc-list');

    // 缺少必要元素则不初始化（非文章页）
    if (!toggle || !panel || !list) return;

    var headings = document.querySelectorAll('.post-content h2');
    if (headings.length === 0) return;

    // 简单的 slugify（处理没有 id 的 h2）
    function slugify(text) {
      return String(text)
        .trim()
        .toLowerCase()
        .replace(/[\s　]+/g, '-')
        .replace(/[^\w一-龥-]+/g, '')
        .replace(/^-+|-+$/g, '');
    }

    // 收集 h2 列表，为缺失 id 的 h2 补一个
    var usedIds = {};
    headings.forEach(function(h, idx) {
      if (!h.id) {
        var base = slugify(h.textContent) || ('section-' + (idx + 1));
        var id = base;
        var n = 1;
        while (usedIds[id] || document.getElementById(id)) {
          n++;
          id = base + '-' + n;
        }
        h.id = id;
      }
      usedIds[h.id] = true;
    });

    // 生成目录项
    var frag = document.createDocumentFragment();
    headings.forEach(function(h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.setAttribute('data-target', h.id);
      li.appendChild(a);
      frag.appendChild(li);
    });
    list.appendChild(frag);

    var links = list.querySelectorAll('a');
    var linkMap = {};
    links.forEach(function(a) {
      linkMap[a.getAttribute('data-target')] = a;
    });

    // 打开/关闭面板
    function openPanel() {
      document.body.classList.add('toc-open');
      panel.setAttribute('aria-hidden', 'false');
    }
    function closePanel() {
      document.body.classList.remove('toc-open');
      panel.setAttribute('aria-hidden', 'true');
    }

    toggle.addEventListener('click', function() {
      if (document.body.classList.contains('toc-open')) {
        closePanel();
      } else {
        openPanel();
      }
    });
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && document.body.classList.contains('toc-open')) {
        closePanel();
      }
    });

    // 点击目录项平滑滚动
    links.forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var id = a.getAttribute('data-target');
        var target = document.getElementById(id);
        if (!target) return;
        var headerH = 56 + 16; // header 高度 + 一些缓冲
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (history.replaceState) {
          history.replaceState(null, '', '#' + id);
        }
      });
    });

    // 滚动联动：IntersectionObserver 高亮当前章节
    if ('IntersectionObserver' in window) {
      var activeId = null;
      function setActive(id) {
        if (activeId === id) return;
        if (activeId && linkMap[activeId]) {
          linkMap[activeId].classList.remove('toc-active');
        }
        activeId = id;
        if (id && linkMap[id]) {
          var active = linkMap[id];
          active.classList.add('toc-active');
          // 面板内自动滚动到当前项
          active.scrollIntoView({ block: 'nearest' });
        }
      }

      // 观察所有 h2
      var visibleMap = {};
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          visibleMap[entry.target.id] = entry.isIntersecting;
        });
        // 找到第一个可见的 h2（按文档顺序）
        var firstVisible = null;
        headings.forEach(function(h) {
          if (!firstVisible && visibleMap[h.id]) {
            firstVisible = h.id;
          }
        });
        if (firstVisible) {
          setActive(firstVisible);
        } else {
          // 滚到顶部：清空高亮
          if (window.scrollY < 100) setActive(null);
        }
      }, {
        rootMargin: '-80px 0px -65% 0px',
        threshold: 0
      });

      headings.forEach(function(h) {
        observer.observe(h);
      });
    }
  })();
});
