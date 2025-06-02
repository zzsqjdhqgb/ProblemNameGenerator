// 加载所有插件信息
async function loadPlugins() {
  const { plugins = {}, config = { enabled: {}, order: [] } } = await chrome.storage.local.get(['plugins', 'config']);
  const pluginList = document.getElementById('pluginList');
  
  // 按照配置的顺序排序插件
  const sortedPlugins = config.order
    .filter(id => plugins[id])
    .map(id => ({ id, ...plugins[id] }))
    .concat(
      Object.entries(plugins)
        .filter(([id]) => !config.order.includes(id))
        .map(([id, plugin]) => ({ id, ...plugin }))
    );

  pluginList.innerHTML = sortedPlugins.map(plugin => {
    const enabled = config.enabled[plugin.id] ?? true;
    return `
      <li class="plugin-item" data-id="${plugin.id}">
        <div class="plugin-info">
          <div class="plugin-name">${plugin.metadata?.name || plugin.id}</div>
          <div class="plugin-meta">
            版本: ${plugin.metadata?.version || '未知'} | 
            作者: ${plugin.metadata?.author || '未知'} | 
            来源: ${getSourceType(plugin.source)}
          </div>
        </div>
        <div class="plugin-controls">
          <label class="btn">
            <input type="checkbox" class="plugin-toggle" 
                   ${enabled ? 'checked' : ''}>
            启用
          </label>
          ${plugin.source.type === 'official' ? '' : `
            <button class="btn plugin-edit">编辑</button>
            <button class="btn plugin-delete">删除</button>
          `}
        </div>
      </li>
    `;
  }).join('');

  // 添加拖拽排序功能
  initSortable();
}

// 获取插件来源类型的显示文本
function getSourceType(source) {
  const types = {
    official: '官方',
    remote: '远程',
    local: '本地'
  };
  return types[source.type] || '未知';
}

// 初始化拖拽排序
function initSortable() {
  const pluginList = document.getElementById('pluginList');
  let dragItem = null;

  pluginList.addEventListener('dragstart', e => {
    dragItem = e.target;
    e.target.style.opacity = '0.5';
  });

  pluginList.addEventListener('dragend', e => {
    e.target.style.opacity = '1';
    saveOrder();
  });

  pluginList.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(e.clientY);
    const item = dragItem;
    if (afterElement == null) {
      pluginList.appendChild(item);
    } else {
      pluginList.insertBefore(item, afterElement);
    }
  });

  // 获取拖拽后的目标位置
  function getDragAfterElement(y) {
    const items = [...pluginList.querySelectorAll('.plugin-item:not(.dragging)')];
    return items.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}

// 保存插件顺序
async function saveOrder() {
  const pluginList = document.getElementById('pluginList');
  const order = [...pluginList.querySelectorAll('.plugin-item')]
    .map(item => item.dataset.id);
  
  const { config = {} } = await chrome.storage.local.get('config');
  config.order = order;
  await chrome.storage.local.set({ config });
}

// 加载格式化选项
async function loadFormatOptions() {
  const { config = { formatOptions: {} } } = await chrome.storage.local.get('config');
  document.getElementById('includeProblemId').checked = config.formatOptions?.includeProblemId ?? true;
  document.getElementById('convertSpecialChars').checked = config.formatOptions?.convertSpecialChars ?? true;
}

// 保存格式化选项
async function saveFormatOptions() {
  const { config = {} } = await chrome.storage.local.get('config');
  config.formatOptions = {
    includeProblemId: document.getElementById('includeProblemId').checked,
    convertSpecialChars: document.getElementById('convertSpecialChars').checked
  };
  await chrome.storage.local.set({ config });
}

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
  loadPlugins();
  loadFormatOptions();

  // 插件启用/禁用
  document.getElementById('pluginList').addEventListener('change', async (e) => {
    if (e.target.classList.contains('plugin-toggle')) {
      const id = e.target.closest('.plugin-item').dataset.id;
      const enabled = e.target.checked;
      
      const { config = { enabled: {} } } = await chrome.storage.local.get('config');
      config.enabled[id] = enabled;
      await chrome.storage.local.set({ config });
    }
  });

  // 格式化选项变更
  document.querySelectorAll('.format-options input').forEach(input => {
    input.addEventListener('change', saveFormatOptions);
  });

  // 添加新插件
  document.getElementById('addPlugin').addEventListener('click', () => {
    // TODO: 实现插件导入功能
  });
});
