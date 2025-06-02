// 显示插件列表
async function showPlugins() {
  const { plugins = {}, config = { enabled: {} } } = await chrome.storage.local.get(['plugins', 'config']);
  const pluginList = document.getElementById('pluginList');
  
  if (Object.keys(plugins).length === 0) {
    pluginList.innerHTML = '<div style="color: #666; text-align: center;">暂无已安装的插件</div>';
    return;
  }

  pluginList.innerHTML = Object.entries(plugins)
    .map(([id, plugin]) => {
      const enabled = config.enabled[id] ?? true;
      return `
        <div class="plugin-item">
          <span class="plugin-name">${plugin.metadata?.name || id}</span>
          <label>
            <input type="checkbox" data-id="${id}" 
                   ${enabled ? 'checked' : ''}>
            启用
          </label>
        </div>
      `;
    })
    .join('');

  // 添加切换事件监听
  pluginList.addEventListener('change', async (e) => {
    const checkbox = e.target;
    if (checkbox.type === 'checkbox') {
      const id = checkbox.dataset.id;
      const enabled = checkbox.checked;
      
      // 更新配置
      const { config = { enabled: {} } } = await chrome.storage.local.get('config');
      config.enabled[id] = enabled;
      await chrome.storage.local.set({ config });
    }
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', showPlugins);
