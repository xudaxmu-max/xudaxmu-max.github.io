/**
 * Main - 主脚本
 */

document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有功能
    initLoading();
    initScrollProgress();
    initBackToTop();
    initFadeInAnimations();
    initStatsAnimation();
    initCodeCopy();
    initImageLightbox();
    initTOC();
    initShareButtons();
    initSmoothScroll();

    // 初始化 Lucide 图标
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/**
 * 页面加载动画
 */
function initLoading() {
    const loading = document.getElementById('page-loading');
    if (!loading) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            loading.classList.add('loaded');
            setTimeout(() => loading.remove(), 500);
        }, 300);
    });

    // 最长等待 3 秒
    setTimeout(() => {
        loading.classList.add('loaded');
    }, 3000);
}

/**
 * 阅读进度条
 */
function initScrollProgress() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;

    const updateProgress = () => {
        const percent = Utils.getScrollPercent();
        progressBar.style.width = `${percent}%`;
    };

    window.addEventListener('scroll', Utils.throttle(updateProgress, 50));
    updateProgress();
}

/**
 * 返回顶部按钮
 */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    const progressCircle = btn.querySelector('.back-to-top-progress circle');

    const updateButton = () => {
        const scrollY = window.scrollY;
        const percent = Utils.getScrollPercent();

        // 显示/隐藏按钮
        btn.classList.toggle('visible', scrollY > 300);

        // 更新进度圆圈
        if (progressCircle) {
            const circumference = 126; // 2 * PI * 20
            const offset = circumference - (percent / 100 * circumference);
            progressCircle.style.strokeDashoffset = offset;
        }
    };

    window.addEventListener('scroll', Utils.throttle(updateButton, 50));

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * 滚动淡入动画
 */
function initFadeInAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/**
 * 统计数字动画
 */
function initStatsAnimation() {
    const stats = document.querySelectorAll('.stat-number[data-count]');
    if (!stats.length) return;

    const animateNumber = (el) => {
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // 缓动函数
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);
            
            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

/**
 * 代码复制按钮
 */
function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('.post-content pre');
    
    codeBlocks.forEach(pre => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = '复制';
        
        btn.addEventListener('click', async () => {
            const code = pre.querySelector('code')?.textContent || pre.textContent;
            const success = await Utils.copyToClipboard(code);
            
            btn.textContent = success ? '已复制!' : '失败';
            btn.style.background = success ? 'var(--accent)' : '#dc3545';
            btn.style.color = 'var(--bg-primary)';
            
            setTimeout(() => {
                btn.textContent = '复制';
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });

        pre.style.position = 'relative';
        pre.appendChild(btn);
    });
}

/**
 * 图片灯箱
 */
function initImageLightbox() {
    const images = document.querySelectorAll('.post-content img');
    
    if (typeof Fancybox !== 'undefined') {
        images.forEach(img => {
            if (!img.closest('a')) {
                const wrapper = document.createElement('a');
                wrapper.href = img.src;
                wrapper.setAttribute('data-fancybox', 'gallery');
                wrapper.setAttribute('data-caption', img.alt || '');
                img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);
            }
        });

        Fancybox.bind('[data-fancybox]', {
            Toolbar: {
                display: ['zoom', 'close']
            }
        });
    }
}

/**
 * 文章目录
 */
function initTOC() {
    const tocWrapper = document.getElementById('toc-wrapper');
    const tocToggle = document.getElementById('toc-toggle');
    const tocContent = document.getElementById('toc-content');
    const tocProgressBar = document.getElementById('toc-progress-bar');
    const postContent = document.getElementById('post-content');

    if (!tocWrapper || !postContent) return;

    // 折叠/展开目录
    tocToggle?.addEventListener('click', () => {
        tocWrapper.classList.toggle('collapsed');
    });

    // 获取所有标题
    const headings = postContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const tocLinks = tocContent?.querySelectorAll('a');

    if (!headings.length || !tocLinks?.length) return;

    // 高亮当前章节
    const updateActiveLink = () => {
        const scrollY = window.scrollY;
        const navHeight = 72;
        let currentId = '';

        headings.forEach(heading => {
            const top = heading.getBoundingClientRect().top + scrollY - navHeight - 20;
            if (scrollY >= top) {
                currentId = heading.id;
            }
        });

        tocLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${currentId}`);
        });

        // 更新进度条
        if (tocProgressBar) {
            const percent = Utils.getScrollPercent();
            tocProgressBar.style.width = `${percent}%`;
        }
    };

    window.addEventListener('scroll', Utils.throttle(updateActiveLink, 100));
    updateActiveLink();

    // 目录链接点击
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                Utils.scrollTo(target, 90);
            }
        });
    });
}

/**
 * 分享按钮
 */
function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const shareType = btn.dataset.share;
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);

            switch (shareType) {
                case 'twitter':
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
                    break;
                case 'weibo':
                    window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank');
                    break;
                case 'copy':
                    Utils.copyToClipboard(window.location.href).then(success => {
                        Utils.showToast(success ? '链接已复制到剪贴板' : '复制失败');
                    });
                    break;
            }
        });
    });
}

/**
 * 平滑滚动
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                Utils.scrollTo(target, 80);
            }
        });
    });
}

/**
 * 控制台彩蛋
 */
console.log('%c🎨 Flavor Theme', 'font-size: 24px; font-weight: bold; color: #333;');
console.log('%c三种风格可切换的 Hexo 主题', 'font-size: 14px; color: #666;');
console.log('%c• Minimal - 简约现代', 'color: #000;');
console.log('%c• Serene - 清新文艺', 'color: #c4a77d;');
console.log('%c• Abyss - 深渊地狱', 'color: #ff0000;');
