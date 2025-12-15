/**
 * Search - 搜索功能
 */

class Search {
    constructor() {
        this.modal = document.getElementById('search-modal');
        this.overlay = document.getElementById('search-modal-overlay');
        this.input = document.getElementById('search-input');
        this.results = document.getElementById('search-results');
        this.toggleBtn = document.getElementById('search-toggle');
        this.closeBtn = document.getElementById('search-close');
        
        this.searchData = [];
        this.selectedIndex = -1;
        this.isLoaded = false;
        
        this.init();
    }

    init() {
        if (!this.modal) return;
        this.bindEvents();
    }

    bindEvents() {
        // 打开搜索
        this.toggleBtn?.addEventListener('click', () => this.open());

        // 关闭搜索
        this.closeBtn?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());

        // 输入搜索
        this.input?.addEventListener('input', Utils.debounce((e) => {
            this.search(e.target.value);
        }, 300));

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K 打开搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }

            // ESC 关闭搜索
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.close();
            }

            // 上下键选择
            if (this.modal?.classList.contains('active')) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.selectNext();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.selectPrev();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.openSelected();
                }
            }
        });
    }

    async loadData() {
        if (this.isLoaded) return;

        try {
            const response = await fetch('/search.xml');
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            const entries = xml.querySelectorAll('entry');

            this.searchData = Array.from(entries).map(entry => ({
                title: entry.querySelector('title')?.textContent || '',
                url: entry.querySelector('url')?.textContent || '',
                content: entry.querySelector('content')?.textContent || '',
                categories: entry.querySelector('categories')?.textContent || '',
                tags: entry.querySelector('tags')?.textContent || ''
            }));

            this.isLoaded = true;
        } catch (err) {
            console.error('Failed to load search data:', err);
        }
    }

    async open() {
        this.modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 加载数据
        await this.loadData();
        
        // 聚焦输入框
        setTimeout(() => this.input?.focus(), 100);
    }

    close() {
        this.modal?.classList.remove('active');
        document.body.style.overflow = '';
        
        // 清空搜索
        if (this.input) this.input.value = '';
        this.showPlaceholder();
        this.selectedIndex = -1;
    }

    search(query) {
        query = query.trim().toLowerCase();

        if (!query) {
            this.showPlaceholder();
            return;
        }

        const results = this.searchData.filter(item => {
            const title = item.title.toLowerCase();
            const content = item.content.toLowerCase();
            const tags = item.tags.toLowerCase();
            return title.includes(query) || content.includes(query) || tags.includes(query);
        }).slice(0, 10);

        this.renderResults(results, query);
    }

    renderResults(results, query) {
        if (!this.results) return;

        if (results.length === 0) {
            this.results.innerHTML = `
                <div class="search-no-results">
                    <p>没有找到相关结果</p>
                    <p style="font-size: 0.85rem; margin-top: 8px;">试试其他关键词</p>
                </div>
            `;
            return;
        }

        this.results.innerHTML = results.map((item, index) => {
            // 高亮匹配文字
            const title = this.highlightText(item.title, query);
            const excerpt = this.getExcerpt(item.content, query);

            return `
                <div class="search-result-item" data-index="${index}" data-url="${item.url}">
                    <div class="search-result-title">${title}</div>
                    <div class="search-result-excerpt">${excerpt}</div>
                </div>
            `;
        }).join('');

        // 绑定点击事件
        this.results.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = item.dataset.url;
            });

            item.addEventListener('mouseenter', () => {
                this.selectedIndex = parseInt(item.dataset.index);
                this.updateSelection();
            });
        });

        this.selectedIndex = -1;
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    getExcerpt(content, query) {
        const maxLength = 150;
        const lowerContent = content.toLowerCase();
        const index = lowerContent.indexOf(query.toLowerCase());

        let excerpt;
        if (index !== -1) {
            const start = Math.max(0, index - 50);
            const end = Math.min(content.length, index + query.length + 100);
            excerpt = (start > 0 ? '...' : '') + 
                      content.substring(start, end) + 
                      (end < content.length ? '...' : '');
        } else {
            excerpt = content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
        }

        return this.highlightText(excerpt, query);
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    showPlaceholder() {
        if (this.results) {
            this.results.innerHTML = `
                <div class="search-placeholder">
                    <i data-lucide="file-search" class="search-placeholder-icon"></i>
                    <p>输入关键词开始搜索</p>
                    <p class="search-tips">支持搜索文章标题和内容</p>
                </div>
            `;
            lucide.createIcons();
        }
    }

    selectNext() {
        const items = this.results?.querySelectorAll('.search-result-item');
        if (!items?.length) return;

        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        this.updateSelection();
    }

    selectPrev() {
        const items = this.results?.querySelectorAll('.search-result-item');
        if (!items?.length) return;

        this.selectedIndex = this.selectedIndex <= 0 ? items.length - 1 : this.selectedIndex - 1;
        this.updateSelection();
    }

    updateSelection() {
        const items = this.results?.querySelectorAll('.search-result-item');
        items?.forEach((item, index) => {
            item.classList.toggle('active', index === this.selectedIndex);
        });

        // 滚动到可见区域
        const selected = this.results?.querySelector('.search-result-item.active');
        selected?.scrollIntoView({ block: 'nearest' });
    }

    openSelected() {
        const selected = this.results?.querySelector('.search-result-item.active');
        if (selected) {
            window.location.href = selected.dataset.url;
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.search = new Search();
});
