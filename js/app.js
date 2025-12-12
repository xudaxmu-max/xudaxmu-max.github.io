// 1. 简单的代码运行逻辑 (模拟 Node 环境)
function runQuickCode() {
    const code = document.getElementById('quick-code').value;
    const outputDiv = document.getElementById('quick-output');
    
    outputDiv.innerHTML = "Running...";
    
    try {
        // 捕获 console.log
        const originalLog = console.log;
        let logs = [];
        console.log = function(...args) {
            logs.push(args.join(' '));
            originalLog.apply(console, args); // 保持控制台也有输出
        };

        // 执行代码 (注意：这里使用 eval 是为了演示，实际项目建议使用 iframe 沙箱)
        // 为了模拟 Node.js，我们可以在这里注入一些 polyfill
        const result = eval(code);
        
        // 恢复 console.log
        console.log = originalLog;

        outputDiv.innerHTML = `> ${logs.join('<br>> ')}`;
        outputDiv.style.color = "#34d399"; // 绿色表示成功

    } catch (error) {
        outputDiv.innerHTML = `Error: ${error.message}`;
        outputDiv.style.color = "#f87171"; // 红色表示错误
    }
}

// 2. Dock 栏的磁吸效果 (可选的高级交互)
document.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        // 这里可以添加更复杂的物理引擎代码来实现完美的 macOS 效果
    });
});

console.log("%c Welcome to Milk Dragon's World ", "background: #222; color: #bada55; font-size: 20px");