/**
 * ═══════════════════════════════════════════════════════════════
 * 奶龙大王的博客 - 增强功能模块
 * Enhanced Features Module
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // 工具函数
  // ═══════════════════════════════════════════════════════════════
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  // ═══════════════════════════════════════════════════════════════
  // PWA 安装提示
  // ═══════════════════════════════════════════════════════════════
  class PWAInstaller {
    constructor() {
      this.deferredPrompt = null;
      this.init();
    }

    init() {
      // 注册 Service Worker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('✅ Service Worker 注册成功:', registration.scope);

              // 检查更新
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                  }
                });
              });
            })
            .catch((error) => {
              console.error('❌ Service Worker 注册失败:', error);
            });
        });
      }

      // 监听安装提示
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showInstallPrompt();
      });

      // 监听安装成功
      window.addEventListener('appinstalled', () => {
        console.log('✅ PWA 已安装');
        this.deferredPrompt = null;
        this.hideInstallPrompt();
      });
    }

    showInstallPrompt() {
      // 检查是否已经显示过或用户已拒绝
      if (localStorage.getItem('pwa-install-dismissed')) return;

      const banner = document.createElement('div');
      banner.className = 'pwa-install-banner';
      banner.innerHTML = `
        <div class="pwa-install-content">
          <div class="pwa-install-icon">📱</div>
          <div class="pwa-install-text">
            <strong>安装应用</strong>
            <p>将博客添加到主屏幕，获得更好的体验</p>
          </div>
          <div class="pwa-install-actions">
            <button class="pwa-install-btn" id="pwa-install">安装</button>
            <button class="pwa-dismiss-btn" id="pwa-dismiss">×</button>
          </div>
        </div>
      `;

      document.body.appendChild(banner);

      // 安装按钮
      $('#pwa-install').addEventListener('click', () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('用户接受了安装提示');
            }
            this.deferredPrompt = null;
            this.hideInstallPrompt();
          });
        }
      });

      // 关闭按钮
      $('#pwa-dismiss').addEventListener('click', () => {
        localStorage.setItem('pwa-install-dismissed', 'true');
        this.hideInstallPrompt();
      });

      // 3秒后显示
      setTimeout(() => banner.classList.add('show'), 3000);
    }

    hideInstallPrompt() {
      const banner = $('.pwa-install-banner');
      if (banner) {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 300);
      }
    }

    showUpdateNotification() {
      const notification = document.createElement('div');
      notification.className = 'update-notification';
      notification.innerHTML = `
        <div class="update-notification-content">
          <span>🎉 新版本可用！</span>
          <button class="update-btn" id="update-reload">刷新</button>
        </div>
      `;

      document.body.appendChild(notification);
      setTimeout(() => notification.classList.add('show'), 100);

      $('#update-reload').addEventListener('click', () => {
        window.location.reload();
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 社交分享
  // ═══════════════════════════════════════════════════════════════
  class SocialShare {
    constructor() {
      this.shareButtons = $$('.share-btn');
      if (this.shareButtons.length) {
        this.init();
      }
    }

    init() {
      this.shareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const platform = btn.dataset.platform;
          this.share(platform);
        });
      });

      // 如果支持 Web Share API，添加原生分享
      if (navigator.share) {
        this.addNativeShareButton();
      }
    }

    share(platform) {
      const title = document.title;
      const url = window.location.href;
      const desc = $('meta[name="description"]')?.content || '';

      const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        weibo: `https://service.weibo.com/share/share.php?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(desc)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
        copy: () => this.copyLink(url)
      };

      if (platform === 'copy') {
        urls.copy();
      } else if (urls[platform]) {
        window.open(urls[platform], '_blank', 'width=600,height=400');
      }
    }

    copyLink(url) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('✅ 链接已复制到剪贴板');
      }).catch(() => {
        this.showToast('❌ 复制失败');
      });
    }

    addNativeShareButton() {
      const shareContainer = $('.social-share-buttons');
      if (!shareContainer) return;

      const nativeBtn = document.createElement('button');
      nativeBtn.className = 'share-btn share-btn-native';
      nativeBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <span>分享</span>
      `;

      nativeBtn.addEventListener('click', async () => {
        try {
          await navigator.share({
            title: document.title,
            text: $('meta[name="description"]')?.content || '',
            url: window.location.href
          });
        } catch (err) {
          console.log('分享取消或失败:', err);
        }
      });

      shareContainer.prepend(nativeBtn);
    }

    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 浏览统计（本地实现 + 可选第三方）
  // ═══════════════════════════════════════════════════════════════
  class ViewCounter {
    constructor() {
      this.init();
    }

    init() {
      this.updatePageViews();
      this.initBusuanzi(); // 不蒜子统计
    }

    updatePageViews() {
      const pageKey = `view_${window.location.pathname}`;
      let views = parseInt(localStorage.getItem(pageKey) || '0');
      views++;
      localStorage.setItem(pageKey, views.toString());

      // 显示浏览量
      const viewsElement = $('.post-views');
      if (viewsElement) {
        viewsElement.textContent = this.formatNumber(views);
      }
    }

    initBusuanzi() {
      // 不蒜子统计脚本
      const script = document.createElement('script');
      script.async = true;
      script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
      document.head.appendChild(script);
    }

    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 背景音乐播放器
  // ═══════════════════════════════════════════════════════════════
  class MusicPlayer {
    constructor() {
      this.playlist = [
        { title: '星空', artist: '奶龙', url: '/music/starry.mp3' },
        { title: '代码', artist: '奶龙', url: '/music/coding.mp3' },
        { title: '梦想', artist: '奶龙', url: '/music/dream.mp3' }
      ];
      this.currentIndex = 0;
      this.isPlaying = false;
      this.audio = new Audio();
      this.init();
    }

    init() {
      this.createPlayer();
      this.bindEvents();

      // 加载保存的播放状态
      const savedIndex = localStorage.getItem('music-index');
      if (savedIndex) {
        this.currentIndex = parseInt(savedIndex);
      }
    }

    createPlayer() {
      const player = document.createElement('div');
      player.className = 'music-player';
      player.innerHTML = `
        <div class="music-player-toggle" id="music-toggle">
          <svg class="music-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div class="music-player-panel" id="music-panel">
          <div class="music-info">
            <div class="music-title" id="music-title">未播放</div>
            <div class="music-artist" id="music-artist">-</div>
          </div>
          <div class="music-controls">
            <button class="music-btn" id="music-prev" title="上一首">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="19 20 9 12 19 4 19 20"/>
                <line x1="5" y1="19" x2="5" y2="5"/>
              </svg>
            </button>
            <button class="music-btn music-btn-play" id="music-play" title="播放">
              <svg class="play-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <svg class="pause-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            </button>
            <button class="music-btn" id="music-next" title="下一首">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 4 15 12 5 20 5 4"/>
                <line x1="19" y1="5" x2="19" y2="19"/>
              </svg>
            </button>
          </div>
          <div class="music-progress">
            <div class="music-progress-bar" id="music-progress-bar">
              <div class="music-progress-fill" id="music-progress-fill"></div>
            </div>
            <div class="music-time">
              <span id="music-current">0:00</span>
              <span id="music-duration">0:00</span>
            </div>
          </div>
          <div class="music-volume">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            <input type="range" class="music-volume-slider" id="music-volume" min="0" max="100" value="50">
          </div>
        </div>
      `;

      document.body.appendChild(player);
    }

    bindEvents() {
      const toggle = $('#music-toggle');
      const panel = $('#music-panel');
      const playBtn = $('#music-play');
      const prevBtn = $('#music-prev');
      const nextBtn = $('#music-next');
      const volumeSlider = $('#music-volume');
      const progressBar = $('#music-progress-bar');

      // 切换面板
      toggle.addEventListener('click', () => {
        panel.classList.toggle('show');
        if (panel.classList.contains('show')) {
          this.loadTrack(this.currentIndex);
        }
      });

      // 播放/暂停
      playBtn.addEventListener('click', () => this.togglePlay());

      // 上一首/下一首
      prevBtn.addEventListener('click', () => this.prev());
      nextBtn.addEventListener('click', () => this.next());

      // 音量控制
      volumeSlider.addEventListener('input', (e) => {
        this.audio.volume = e.target.value / 100;
        localStorage.setItem('music-volume', e.target.value);
      });

      // 进度条
      progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = this.audio.duration * percent;
      });

      // 音频事件
      this.audio.addEventListener('timeupdate', () => this.updateProgress());
      this.audio.addEventListener('ended', () => this.next());
      this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    }

    loadTrack(index) {
      if (index < 0 || index >= this.playlist.length) return;

      const track = this.playlist[index];
      this.audio.src = track.url;
      this.currentIndex = index;

      $('#music-title').textContent = track.title;
      $('#music-artist').textContent = track.artist;

      localStorage.setItem('music-index', index.toString());
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    play() {
      // 播放前先加载当前曲目
      if (!this.audio.src || this.audio.src.includes('undefined')) {
        this.loadTrack(this.currentIndex);
      }

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          $('.play-icon').style.display = 'none';
          $('.pause-icon').style.display = 'block';
          $('#music-toggle').classList.add('playing');
        }).catch((error) => {
          console.log('播放失败:', error);
          this.showMusicToast('音乐文件未找到，这是示例播放器');
        });
      }
    }

    pause() {
      this.audio.pause();
      this.isPlaying = false;
      $('.play-icon').style.display = 'block';
      $('.pause-icon').style.display = 'none';
      $('#music-toggle').classList.remove('playing');
    }

    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
      this.loadTrack(this.currentIndex);
      if (this.isPlaying) this.play();
    }

    next() {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      this.loadTrack(this.currentIndex);
      if (this.isPlaying) this.play();
    }

    updateProgress() {
      const percent = (this.audio.currentTime / this.audio.duration) * 100 || 0;
      $('#music-progress-fill').style.width = `${percent}%`;
      $('#music-current').textContent = this.formatTime(this.audio.currentTime);
    }

    updateDuration() {
      $('#music-duration').textContent = this.formatTime(this.audio.duration);
    }

    formatTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showMusicToast(message) {
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 评论系统（Giscus）
  // ═══════════════════════════════════════════════════════════════
  class CommentsSystem {
    constructor() {
      this.container = $('#comments-container');
      if (this.container) {
        this.init();
      }
    }

    init() {
      // Giscus 配置
      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';
      script.setAttribute('data-repo', 'xudaxmu-max/xudaxmu-max.github.io'); // 替换为实际仓库
      script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // 需要配置
      script.setAttribute('data-category', 'Announcements');
      script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // 需要配置
      script.setAttribute('data-mapping', 'pathname');
      script.setAttribute('data-strict', '0');
      script.setAttribute('data-reactions-enabled', '1');
      script.setAttribute('data-emit-metadata', '0');
      script.setAttribute('data-input-position', 'top');
      script.setAttribute('data-theme', 'dark');
      script.setAttribute('data-lang', 'zh-CN');
      script.setAttribute('data-loading', 'lazy');
      script.crossOrigin = 'anonymous';
      script.async = true;

      this.container.appendChild(script);

      // 主题切换时更新评论主题
      this.watchThemeChange();
    }

    watchThemeChange() {
      const themeToggle = $('.theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          setTimeout(() => {
            const theme = document.documentElement.getAttribute('data-theme');
            this.changeCommentsTheme(theme === 'dark' ? 'dark' : 'light');
          }, 100);
        });
      }
    }

    changeCommentsTheme(theme) {
      const iframe = $('iframe.giscus-frame');
      if (iframe) {
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme } } },
          'https://giscus.app'
        );
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 图片灯箱
  // ═══════════════════════════════════════════════════════════════
  class ImageLightbox {
    constructor() {
      this.images = $$('.post-content img');
      if (this.images.length) {
        this.init();
      }
    }

    init() {
      this.createLightbox();
      this.images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => this.open(img.src, img.alt));
      });
    }

    createLightbox() {
      const lightbox = document.createElement('div');
      lightbox.className = 'image-lightbox';
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close">&times;</button>
          <img class="lightbox-image" src="" alt="">
          <div class="lightbox-caption"></div>
        </div>
      `;

      document.body.appendChild(lightbox);

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) this.close();
      });

      $('.lightbox-close').addEventListener('click', () => this.close());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
      });
    }

    open(src, alt) {
      const lightbox = $('.image-lightbox');
      const img = $('.lightbox-image');
      const caption = $('.lightbox-caption');

      img.src = src;
      caption.textContent = alt || '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    close() {
      const lightbox = $('.image-lightbox');
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 初始化所有增强功能
  // ═══════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
    new SocialShare();
    new ViewCounter();
    new MusicPlayer();
    new CommentsSystem();
    new ImageLightbox();

    console.log('%c✨ 增强功能已加载', 'color: #00d4ff; font-weight: bold;');
  });

})();
