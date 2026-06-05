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

  // Copy code button for code blocks — u.sb has no copy button

  // Highlight current year in footer
  var copyright = document.querySelector('.copyright-text');
  if (copyright) {
    copyright.textContent = 'Copyright ' + new Date().getFullYear() + ' 烧饼博客';
  }
});
