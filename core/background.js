// 从内置的 javascript 文件加载官方插件代码
async function loadOfficialPlugins() {
  const officialPluginIds = ['official.leetcode', 'official.baidu'];
  const plugins = {};

  for (const id of officialPluginIds) {
    try {
      const url = chrome.runtime.getURL(`plugins/${id}.js`);
      const response = await fetch(url);
      // 获取代码内容并进行简单验证
      const code = await response.text();
      if (!code || !code.includes('export default class')) {
        throw new Error(`Invalid plugin code for ${id}`);
      }

      // 尝试提取插件元数据
      const metadataMatch = code.match(/metadata\s*=\s*({[\s\S]*?};)/);
      const metadata = metadataMatch ? eval(`(${metadataMatch[1]})`) : null;

      plugins[id] = {
        code,
        lastUpdated: Date.now(),
        source: { type: 'official', id },
        metadata
      };
      console.log(`[Background] Loaded official plugin: ${id}`, { metadata });
    } catch (error) {
      console.error(`[Background] Failed to load official plugin ${id}:`, error);
    }
  }

  return plugins;
}

// 首次安装或更新时初始化插件
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Background] Extension installed/updated:', details.reason);
    if (details.reason === 'install' || details.reason === 'update') {
    console.log(`[Background] ${details.reason}, loading official plugins...`);
    
    // 加载所有官方插件
    const officialPlugins = await loadOfficialPlugins();
    
    if (details.reason === 'install') {
      // 首次安装：初始化完整存储
      const storage = {
        plugins: officialPlugins,
        config: {
          enabled: Object.keys(officialPlugins).reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {}),
          order: Object.keys(officialPlugins),
          formatOptions: {
            includeProblemId: true,
            convertSpecialChars: true
          }
        }
      };
      await chrome.storage.local.set(storage);
      console.log('[Background] Storage initialized:', storage);
    } else {
      // 更新：仅更新官方插件代码
      const { plugins = {}, config = { enabled: {}, order: [] } } = 
        await chrome.storage.local.get(['plugins', 'config']);
      
      // 更新官方插件
      for (const [id, plugin] of Object.entries(officialPlugins)) {
        if (plugins[id]?.source?.type === 'official') {
          plugins[id] = plugin;
          console.log(`[Background] Updated official plugin: ${id}`);
        }
      }
        await chrome.storage.local.set({ plugins });
      console.log('[Background] Official plugins updated');
    }
  }
});
