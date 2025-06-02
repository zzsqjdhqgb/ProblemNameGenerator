export default class LeetCodePlugin {
  metadata = {
    id: 'official.leetcode',
    name: 'LeetCode Support',
    description: 'Support for LeetCode problems',
    version: '1.0.0',
    author: 'OJ Problem Name Copier'
  };

  isMatch() {
    const hostname = window.location.hostname;
    return hostname.includes('leetcode.com') || hostname.includes('leetcode.cn');
  }

  async execute() {
    try {
      // 等待题目标题加载
      const titleElement = await this.waitForElement('[data-cy="question-title"]');
      if (!titleElement) return false;

      // 创建复制按钮
      const button = document.createElement('button');
      button.textContent = '复制题目';
      button.style.cssText = `
        margin-left: 8px;
        padding: 4px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
      `;

      // 添加复制功能
      button.onclick = () => {
        const title = titleElement.textContent.trim();
        navigator.clipboard.writeText(title);
        
        // 显示复制成功提示
        const originalText = button.textContent;
        button.textContent = '已复制！';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1000);
      };

      // 插入按钮
      titleElement.parentNode.insertBefore(button, titleElement.nextSibling);
      return true;
    } catch (error) {
      console.error('LeetCode plugin execution failed:', error);
      return false;
    }
  }

  // 辅助函数：等待元素出现
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 设置超时
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }
}
