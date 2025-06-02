class PluginLoader {
  constructor() {
    this.plugins = new Map();
  }

  async loadEnabledPlugins() {
    console.log('[PluginLoader] Loading enabled plugins');
    const { plugins = {}, config = { enabled: {}, order: [] } } = 
      await chrome.storage.local.get(['plugins', 'config']);
    
    for (const [id, plugin] of Object.entries(plugins)) {
      if (config.enabled[id]) {
        try {          console.log(`[PluginLoader] Loading plugin: ${id}`);          // 所有插件统一从storage中的code字段加载
          const code = plugin.code;
          if (!code) {
            throw new Error(`Plugin ${id} has no code in storage`);
          }

          const blob = new Blob([code], { type: 'text/javascript' });
          const url = URL.createObjectURL(blob);
          const module = await import(url);
          const PluginClass = module.default;
          const instance = new PluginClass();

          if (this.validatePlugin(instance)) {
            console.log(`[PluginLoader] Plugin ${id} loaded successfully`);
            this.plugins.set(id, instance);
          } else {
            console.error(`[PluginLoader] Plugin ${id} validation failed`);
          }
        } catch (error) {
          console.error(`[PluginLoader] Failed to load plugin ${id}:`, error);
        }
      } else {
        console.log(`[PluginLoader] Plugin ${id} is disabled, skipping`);
      }
    }

    const sortedPlugins = this.sortPlugins(config.order);
    console.log('[PluginLoader] Plugins loaded:', 
      sortedPlugins.map(p => p.metadata?.id));
    return sortedPlugins;
  }

  validatePlugin(plugin) {
    const requirements = {
      'metadata': plugin?.metadata,
      'metadata.id': typeof plugin?.metadata?.id === 'string',
      'isMatch': typeof plugin?.isMatch === 'function',
      'execute': typeof plugin?.execute === 'function'
    };

    console.log(`[PluginLoader] Validating plugin:`, requirements);
    return Object.values(requirements).every(Boolean);
  }

  sortPlugins(order = []) {
    return order
      .filter(id => this.plugins.has(id))
      .map(id => this.plugins.get(id));
  }
}

export { PluginLoader };
