// Baidu Plugin for OJ Problem Name Copier
export default class BaiduPlugin {
  metadata = {
    id: 'official.baidu',
    name: 'Baidu Demo Plugin',
    description: 'A demo plugin for testing plugin system',
    version: '1.0.0',
    author: 'OJ Problem Name Copier'
  };

  isMatch() {
    const isMatch = window.location.hostname.includes('baidu.com');
    console.log('[Baidu Plugin] isMatch check:', {
      url: window.location.href,
      hostname: window.location.hostname,
      isMatch
    });
    return isMatch;
  }

  async execute() {
    console.log('[Baidu Plugin] Starting execution');
    try {
      // 等待搜索框加载
      console.log('[Baidu Plugin] Waiting for search input element');
      const searchInput = await this.waitForElement('#kw');
      console.log('[Baidu Plugin] Search input found:', searchInput ? 'yes' : 'no');
      if (!searchInput) return false;

      // 创建复制按钮
      const button = this.createCopyButton(() => {
        const searchText = searchInput.value.trim();
        if (searchText) {
          navigator.clipboard.writeText(searchText);
          this.showCopySuccess(button);
        }
      });

      // 插入到搜索框旁边
      searchInput.parentElement.style.position = 'relative';
      searchInput.parentElement.appendChild(button);
      console.log('[Baidu Plugin] Search box button added');

      // 处理搜索结果页面
      const resultTitle = document.querySelector('title');
      console.log('[Baidu Plugin] Checking search results page:', {
        hasTitle: !!resultTitle,
        titleContent: resultTitle?.textContent
      });

      if (resultTitle?.textContent.includes('百度搜索')) {
        console.log('[Baidu Plugin] Creating result copy button');
        const copyResultButton = this.createCopyButton(() => {
          const firstResult = document.querySelector('.result h3');
          if (firstResult) {
            const title = firstResult.textContent.trim();
            navigator.clipboard.writeText(title);
            this.showCopySuccess(copyResultButton);
          }
        }, '复制标题', {
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          background: '#4e6ef2',
          color: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          zIndex: '1000'
        });

        document.body.appendChild(copyResultButton);
        console.log('[Baidu Plugin] Result copy button added');
      }

      return true;
    } catch (error) {
      console.error('[Baidu Plugin] Execution failed:', error);
      return false;
    }
  }

  // 创建复制按钮
  createCopyButton(onClick, text = '复制搜索词', styles = {}) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #4e6ef2;
      border-radius: 4px;
      background: #fff;
      color: #4e6ef2;
      cursor: pointer;
      font-size: 13px;
      ${styles.position ? `position: ${styles.position};` : 'position: absolute;'}
      ${styles.right ? `right: ${styles.right};` : 'right: -80px;'}
      ${styles.top ? `top: ${styles.top};` : 'top: 50%;'}
      ${styles.transform ? `transform: ${styles.transform};` : 'transform: translateY(-50%);'}
      ${styles.background ? `background: ${styles.background};` : ''}
      ${styles.color ? `color: ${styles.color};` : ''}
      ${styles.boxShadow ? `box-shadow: ${styles.boxShadow};` : ''}
      ${styles.zIndex ? `z-index: ${styles.zIndex};` : ''}
    `;
    button.onclick = onClick;
    return button;
  }

  // 显示复制成功提示
  showCopySuccess(button) {
    const originalText = button.textContent;
    button.textContent = '已复制！';
    setTimeout(() => {
      button.textContent = originalText;
    }, 1000);
  }

  // 辅助函数：等待元素出现
  waitForElement(selector, timeout = 5000) {
    console.log(`[Baidu Plugin] Waiting for element: ${selector}, timeout: ${timeout}ms`);
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`[Baidu Plugin] Element found immediately: ${selector}`);
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`[Baidu Plugin] Element found after mutation: ${selector}`);
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
        console.log(`[Baidu Plugin] Element not found after ${timeout}ms: ${selector}`);
        resolve(null);
      }, timeout);
    });
  }
}
