// 动态导入插件加载器
const pluginLoaderUrl = chrome.runtime.getURL('core/plugin-loader.js');

class ContentScript {  constructor() {
    this.loader = null;
  }

  async loadPluginSystem() {
    const { PluginLoader } = await import(pluginLoaderUrl);
    this.loader = new PluginLoader();
  }
  async init() {
    try {
      console.log('[Content Script] Initializing...');
      await this.loadPluginSystem();
      console.log('[Content Script] Plugin system loaded');
      
      // 加载并执行插件
      const plugins = await this.loader.loadEnabledPlugins();
      
      for (const plugin of plugins) {
        if (plugin.isMatch()) {
          const success = await plugin.execute();
          if (success) break; // 找到匹配的插件并成功执行后就停止
        }
      }
    } catch (error) {
      console.error('Failed to initialize content script:', error);
    }
  }
}

// 在页面加载完成后初始化
const script = new ContentScript();
script.init();
