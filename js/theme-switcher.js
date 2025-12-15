/**
 * Theme Switcher - 主题切换器
 */

class ThemeSwitcher {
    constructor() {
        this.themeKey = 'flavor-theme';
        this.themes = ['minimal', 'serene', 'abyss'];
        this.currentTheme = 'minimal';
        this.effectsContainer = null;
        this.init();
    }

    init() {
        // 获取特效容器
        this.effectsContainer = document.getElementById('theme-effects');
        
        // 加载保存的主题
        const savedTheme = Utils.storage.get(this.themeKey);
        if (savedTheme && this.themes.includes(savedTheme)) {
            this.setTheme(savedTheme, false);
        } else {
            // 使用默认主题
            const defaultTheme = document.body.dataset.theme || 'minimal';
            this.setTheme(defaultTheme, false);
        }

        // 绑定切换按钮
        this.bindButtons();

        // 监听系统主题变化
        this.watchSystemTheme();
    }

    bindButtons() {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                if (theme && this.themes.includes(theme)) {
                    this.setTheme(theme);
                }
            });
        });
    }

    setTheme(theme, save = true) {
        if (!this.themes.includes(theme)) return;

        this.currentTheme = theme;
        document.body.dataset.theme = theme;

        // 更新按钮状态
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        // 清除旧特效
        this.clearEffects();

        // 添加新特效
        this.addEffects(theme);

        // 保存到本地存储
        if (save) {
            Utils.storage.set(this.themeKey, theme);
        }

        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme } 
        }));

        // 更新 meta theme-color
        this.updateMetaThemeColor(theme);
    }

    clearEffects() {
        if (this.effectsContainer) {
            this.effectsContainer.innerHTML = '';
        }
    }

    addEffects(theme) {
        if (!this.effectsContainer) return;

        switch (theme) {
            case 'abyss':
                this.addAbyssEffects();
                break;
            case 'serene':
                this.addSereneEffects();
                break;
            default:
                // Minimal 主题无特效
                break;
        }
    }

    addAbyssEffects() {
        // 血滴效果
        for (let i = 0; i < 6; i++) {
            const drip = document.createElement('div');
            drip.className = 'blood-drip';
            drip.style.left = `${10 + Math.random() * 80}%`;
            drip.style.animationDelay = `${Math.random() * 4}s`;
            drip.style.animationDuration = `${3 + Math.random() * 3}s`;
            this.effectsContainer.appendChild(drip);
        }
    }

    addSereneEffects() {
        // 装饰线
        const line = document.createElement('div');
        line.className = 'serene-line';
        this.effectsContainer.appendChild(line);

        // 落叶效果
        const leaves = ['🍂', '🍃', '🌿', '🌸'];
        for (let i = 0; i < 4; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
            leaf.style.left = `${Math.random() * 100}%`;
            leaf.style.animationDelay = `${Math.random() * 15}s`;
            leaf.style.animationDuration = `${12 + Math.random() * 8}s`;
            this.effectsContainer.appendChild(leaf);
        }
    }

    updateMetaThemeColor(theme) {
        let color = '#fafafa';
        if (theme === 'serene') color = '#fdf8f4';
        if (theme === 'abyss') color = '#0a0a0a';

        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = color;
    }

    watchSystemTheme() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // 如果用户没有手动选择主题，跟随系统
                if (!Utils.storage.get(this.themeKey)) {
                    this.setTheme(e.matches ? 'abyss' : 'minimal', false);
                }
            });
        }
    }

    // 获取当前主题
    getTheme() {
        return this.currentTheme;
    }

    // 循环切换主题
    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.themeSwitcher = new ThemeSwitcher();
});
