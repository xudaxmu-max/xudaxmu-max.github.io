/**
 * ═══════════════════════════════════════════════════════════════
 * 奶龙大王的博客 - Nailong Theme JavaScript
 * 「数字星空实验室」核心交互脚本
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // 配置
  // ═══════════════════════════════════════════════════════════════
  const CONFIG = {
    stars: {
      count: 150,
      minSize: 1,
      maxSize: 3,
      colors: ['#ffffff', '#00d4ff', '#7b68ee', '#ff6b9d'],
    },
    shootingStars: {
      count: 3,
      interval: 5000,
    },
    navbar: {
      scrollThreshold: 50,
    },
    animation: {
      observerThreshold: 0.1,
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // 工具函数
  // ═══════════════════════════════════════════════════════════════
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  
  const random = (min, max) => Math.random() * (max - min) + min;
  const randomInt = (min, max) => Math.floor(random(min, max + 1));
  const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];

  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const throttle = (fn, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // ═══════════════════════════════════════════════════════════════
  // 星空背景
  // ═══════════════════════════════════════════════════════════════
  class StarryBackground {
    constructor() {
      this.container = $('#stars-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'stars-container';
        document.body.prepend(this.container);
      }
      this.init();
    }

    init() {
      this.createStars();
      this.createShootingStars();
      this.startShootingStarLoop();
    }

    createStars() {
      const { count, minSize, maxSize, colors } = CONFIG.stars;
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = random(minSize, maxSize);
        const x = random(0, 100);
        const y = random(0, 100);
        const duration = random(2, 5);
        const delay = random(0, 3);
        const opacity = random(0.3, 0.8);
        const color = randomItem(colors);

        star.style.cssText = `
          left: ${x}%;
          top: ${y}%;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          box-shadow: 0 0 ${size * 2}px ${color};
          --duration: ${duration}s;
          --delay: ${delay}s;
          --min-opacity: ${opacity};
        `;

        fragment.appendChild(star);
      }

      this.container.appendChild(fragment);
    }

    createShootingStars() {
      for (let i = 0; i < CONFIG.shootingStars.count; i++) {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        shootingStar.style.cssText = `
          left: ${random(0, 100)}%;
          top: ${random(0, 50)}%;
          animation-delay: ${random(0, 5)}s;
          animation-duration: ${random(2, 4)}s;
        `;
        this.container.appendChild(shootingStar);
      }
    }

    startShootingStarLoop() {
      setInterval(() => {
        const stars = $$('.shooting-star', this.container);
        stars.forEach(star => {
          star.style.left = `${random(0, 100)}%`;
          star.style.top = `${random(0, 50)}%`;
          star.style.animationDuration = `${random(2, 4)}s`;
        });
      }, CONFIG.shootingStars.interval);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 导航栏
  // ═══════════════════════════════════════════════════════════════
  class Navbar {
    constructor() {
      this.navbar = $('.navbar');
      this.toggle = $('.navbar-toggle');
      this.menu = $('.navbar-menu');
      
      if (this.navbar) {
        this.init();
      }
    }

    init() {
      this.bindScrollEvent();
      this.bindToggleEvent();
      this.setActiveLink();
    }

    bindScrollEvent() {
      const handleScroll = throttle(() => {
        const scrollY = window.scrollY;
        
        if (scrollY > CONFIG.navbar.scrollThreshold) {
          this.navbar.classList.add('scrolled');
        } else {
          this.navbar.classList.remove('scrolled');
        }
      }, 100);

      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    bindToggleEvent() {
      if (this.toggle && this.menu) {
        this.toggle.addEventListener('click', () => {
          this.menu.classList.toggle('active');
          this.toggle.classList.toggle('active');
        });

        // 点击链接后关闭菜单
        $$('.navbar-link', this.menu).forEach(link => {
          link.addEventListener('click', () => {
            this.menu.classList.remove('active');
            this.toggle.classList.remove('active');
          });
        });
      }
    }

    setActiveLink() {
      const currentPath = window.location.pathname;
      $$('.navbar-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
          link.classList.add('active');
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 滚动动画
  // ═══════════════════════════════════════════════════════════════
  class ScrollAnimator {
    constructor() {
      this.animatedElements = $$('[data-animate]');
      if (this.animatedElements.length) {
        this.init();
      }
    }

    init() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const el = entry.target;
              const animation = el.dataset.animate || 'fade-in';
              const delay = el.dataset.animateDelay || 0;
              
              setTimeout(() => {
                el.classList.add(animation, 'animated');
              }, delay * 1000);
              
              observer.unobserve(el);
            }
          });
        },
        { threshold: CONFIG.animation.observerThreshold }
      );

      this.animatedElements.forEach(el => observer.observe(el));
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 按钮涟漪效果
  // ═══════════════════════════════════════════════════════════════
  class RippleEffect {
    constructor() {
      this.buttons = $$('.btn, .navbar-btn');
      this.init();
    }

    init() {
      this.buttons.forEach(btn => {
        btn.addEventListener('click', (e) => this.createRipple(e, btn));
      });
    }

    createRipple(e, btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.className = 'ripple';
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;

      btn.appendChild(ripple);
      
      ripple.addEventListener('animationend', () => ripple.remove());
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 打字机效果
  // ═══════════════════════════════════════════════════════════════
  class Typewriter {
    constructor(element, options = {}) {
      this.element = element;
      this.text = options.text || element.textContent;
      this.speed = options.speed || 100;
      this.delay = options.delay || 0;
      this.cursor = options.cursor !== false;
      
      this.element.textContent = '';
      this.init();
    }

    init() {
      setTimeout(() => this.type(), this.delay);
    }

    type() {
      let i = 0;
      const typing = () => {
        if (i < this.text.length) {
          this.element.textContent += this.text.charAt(i);
          i++;
          setTimeout(typing, this.speed);
        }
      };
      typing();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 返回顶部
  // ═══════════════════════════════════════════════════════════════
  class BackToTop {
    constructor() {
      this.button = $('.back-to-top');
      if (!this.button) {
        this.createButton();
      }
      this.init();
    }

    createButton() {
      this.button = document.createElement('button');
      this.button.className = 'back-to-top';
      this.button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      `;
      document.body.appendChild(this.button);
    }

    init() {
      this.bindScrollEvent();
      this.bindClickEvent();
    }

    bindScrollEvent() {
      const handleScroll = throttle(() => {
        if (window.scrollY > 500) {
          this.button.classList.add('visible');
        } else {
          this.button.classList.remove('visible');
        }
      }, 100);

      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    bindClickEvent() {
      this.button.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 主题切换
  // ═══════════════════════════════════════════════════════════════
  class ThemeToggle {
    constructor() {
      this.button = $('.theme-toggle');
      this.theme = localStorage.getItem('theme') || 'dark';
      this.init();
    }

    init() {
      document.documentElement.setAttribute('data-theme', this.theme);
      
      if (this.button) {
        this.button.addEventListener('click', () => this.toggle());
        this.updateIcon();
      }
    }

    toggle() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.theme);
      localStorage.setItem('theme', this.theme);
      this.updateIcon();
    }

    updateIcon() {
      if (this.button) {
        const icon = this.theme === 'dark' ? '☀️' : '🌙';
        this.button.textContent = icon;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 图片懒加载
  // ═══════════════════════════════════════════════════════════════
  class LazyLoad {
    constructor() {
      this.images = $$('img[data-src]');
      if (this.images.length) {
        this.init();
      }
    }

    init() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '50px' }
      );

      this.images.forEach(img => observer.observe(img));
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 代码高亮增强
  // ═══════════════════════════════════════════════════════════════
  class CodeEnhancer {
    constructor() {
      this.codeBlocks = $$('pre code');
      if (this.codeBlocks.length) {
        this.init();
      }
    }

    init() {
      this.codeBlocks.forEach(code => {
        const pre = code.parentElement;
        this.addCopyButton(pre, code);
        this.addLanguageLabel(pre, code);
      });
    }

    addCopyButton(pre, code) {
      const button = document.createElement('button');
      button.className = 'code-copy-btn';
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      `;
      button.title = '复制代码';
      
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.textContent);
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          `;
          setTimeout(() => {
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            `;
          }, 2000);
        } catch (err) {
          console.error('复制失败:', err);
        }
      });

      pre.style.position = 'relative';
      pre.appendChild(button);
    }

    addLanguageLabel(pre, code) {
      const className = code.className;
      const match = className.match(/language-(\w+)/);
      if (match) {
        pre.setAttribute('data-lang', match[1]);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 搜索功能
  // ═══════════════════════════════════════════════════════════════
  class Search {
    constructor() {
      this.searchBtn = $('.search-btn');
      this.searchModal = $('.search-modal');
      this.searchInput = $('.search-input');
      this.searchResults = $('.search-results');
      
      if (this.searchBtn) {
        this.init();
      }
    }

    init() {
      this.searchBtn.addEventListener('click', () => this.open());
      
      if (this.searchModal) {
        this.searchModal.addEventListener('click', (e) => {
          if (e.target === this.searchModal) {
            this.close();
          }
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.open();
        }
      });
    }

    open() {
      if (this.searchModal) {
        this.searchModal.classList.add('active');
        this.searchInput?.focus();
      }
    }

    close() {
      if (this.searchModal) {
        this.searchModal.classList.remove('active');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 阅读进度条
  // ═══════════════════════════════════════════════════════════════
  class ReadingProgress {
    constructor() {
      this.progress = $('.reading-progress');
      if (!this.progress) {
        this.createProgressBar();
      }
      this.init();
    }

    createProgressBar() {
      this.progress = document.createElement('div');
      this.progress.className = 'reading-progress';
      this.progress.innerHTML = '<div class="reading-progress-bar"></div>';
      document.body.prepend(this.progress);
    }

    init() {
      const bar = $('.reading-progress-bar', this.progress);
      
      const updateProgress = throttle(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = `${Math.min(progress, 100)}%`;
      }, 50);

      window.addEventListener('scroll', updateProgress, { passive: true });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 卡片3D悬停效果
  // ═══════════════════════════════════════════════════════════════
  class Card3DEffect {
    constructor() {
      this.cards = $$('.card, .post-card');
      this.init();
    }

    init() {
      this.cards.forEach(card => {
        card.addEventListener('mousemove', (e) => this.handleMove(e, card));
        card.addEventListener('mouseleave', (e) => this.handleLeave(e, card));
      });
    }

    handleMove(e, card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        translateZ(10px)
      `;
    }

    handleLeave(e, card) {
      card.style.transform = '';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 平滑滚动到锚点
  // ═══════════════════════════════════════════════════════════════
  class SmoothScroll {
    constructor() {
      this.links = $$('a[href^="#"]');
      this.init();
    }

    init() {
      this.links.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href === '#') return;
          
          const target = $(href);
          if (target) {
            e.preventDefault();
            const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth',
            });
          }
        });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 目录生成（文章页）
  // ═══════════════════════════════════════════════════════════════
  class TableOfContents {
    constructor() {
      this.content = $('.post-content');
      this.container = $('.toc-container');
      
      if (this.content && this.container) {
        this.init();
      }
    }

    init() {
      const headings = $$('h2, h3, h4', this.content);
      if (headings.length < 3) {
        this.container.style.display = 'none';
        return;
      }

      const toc = document.createElement('nav');
      toc.className = 'toc';
      toc.innerHTML = '<h4 class="toc-title">目录</h4>';
      
      const list = document.createElement('ul');
      list.className = 'toc-list';

      headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;

        const item = document.createElement('li');
        item.className = `toc-item toc-${heading.tagName.toLowerCase()}`;
        
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        link.className = 'toc-link';
        
        item.appendChild(link);
        list.appendChild(item);
      });

      toc.appendChild(list);
      this.container.appendChild(toc);
      
      this.highlightOnScroll(headings);
    }

    highlightOnScroll(headings) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const link = $(`.toc-link[href="#${entry.target.id}"]`);
            if (link) {
              if (entry.isIntersecting) {
                $$('.toc-link.active').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
              }
            }
          });
        },
        { rootMargin: '-80px 0px -80% 0px' }
      );

      headings.forEach(heading => observer.observe(heading));
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 初始化
  // ═══════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    // 核心模块
    new StarryBackground();
    new Navbar();
    new BackToTop();
    new ThemeToggle();
    
    // 动效模块
    new ScrollAnimator();
    new RippleEffect();
    new Card3DEffect();
    new SmoothScroll();
    
    // 功能模块
    new LazyLoad();
    new CodeEnhancer();
    new Search();
    
    // 文章页模块
    if ($('.post-content')) {
      new ReadingProgress();
      new TableOfContents();
    }

    // 打字机效果
    const typewriterEl = $('.typewriter');
    if (typewriterEl) {
      new Typewriter(typewriterEl, {
        text: typewriterEl.dataset.text || typewriterEl.textContent,
        speed: 80,
        delay: 500,
      });
    }

    console.log('%c🐉 奶龙大王的博客 - Nailong Theme', 
      'color: #00d4ff; font-size: 16px; font-weight: bold;');
    console.log('%c✨ 欢迎来到数字星空实验室！', 
      'color: #7b68ee; font-size: 12px;');
  });

  // 页面加载完成后移除加载动画
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    const loader = $('.page-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  });

})();
