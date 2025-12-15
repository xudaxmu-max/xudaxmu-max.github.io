/**
 * Navigation - 导航功能
 */

class Navigation {
    constructor() {
        this.nav = document.getElementById('navbar');
        this.navMenu = document.getElementById('nav-menu');
        this.menuToggle = document.getElementById('menu-toggle');
        this.menuIcon = document.getElementById('menu-icon');
        this.navOverlay = document.getElementById('nav-overlay');
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleScroll();
    }

    bindEvents() {
        // 移动端菜单切换
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
        }

        // 点击遮罩关闭菜单
        if (this.navOverlay) {
            this.navOverlay.addEventListener('click', () => this.closeMenu());
        }

        // 滚动事件
        window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 100));

        // 点击导航链接关闭菜单
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (Utils.device.isMobile()) {
                    this.closeMenu();
                }
            });
        });

        // ESC 关闭菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
            }
        });

        // 窗口大小变化时关闭菜单
        window.addEventListener('resize', Utils.debounce(() => {
            if (!Utils.device.isMobile() && this.navMenu?.classList.contains('active')) {
                this.closeMenu();
            }
        }, 200));
    }

    handleScroll() {
        const scrollY = window.scrollY;

        // 添加滚动阴影
        if (this.nav) {
            this.nav.classList.toggle('scrolled', scrollY > 50);
        }

        // 可选：滚动隐藏导航栏
        // if (scrollY > this.lastScrollY && scrollY > 200) {
        //     this.nav.style.transform = 'translateY(-100%)';
        // } else {
        //     this.nav.style.transform = 'translateY(0)';
        // }

        this.lastScrollY = scrollY;
    }

    toggleMenu() {
        const isActive = this.navMenu?.classList.contains('active');
        if (isActive) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.navMenu?.classList.add('active');
        this.navOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 更换图标
        if (this.menuIcon) {
            this.menuIcon.setAttribute('data-lucide', 'x');
            lucide.createIcons();
        }
    }

    closeMenu() {
        this.navMenu?.classList.remove('active');
        this.navOverlay?.classList.remove('active');
        document.body.style.overflow = '';
        
        // 恢复图标
        if (this.menuIcon) {
            this.menuIcon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});
