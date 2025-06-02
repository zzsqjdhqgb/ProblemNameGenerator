# OJ题目名称一键复制浏览器扩展设计文档

## 1. 项目概述
一个浏览器扩展，通过插件化设计为各大Online Judge(OJ)平台提供一键复制题目名称的功能。

## 2. 系统架构

### 2.1 目录结构
```
ProblemNameGenerator/
├── manifest.json           # 扩展配置文件
├── popup/                  # 弹出窗口
│   ├── popup.html         # 快速设置界面
│   └── popup.js
├── options/               # 选项页面
│   ├── options.html       # 插件管理界面
│   └── options.js
├── core/                  # 核心逻辑
│   ├── content.js         # 内容脚本
│   └── plugin-loader.js   # 插件加载器
└── plugins/               # 官方插件目录
    ├── official.leetcode.js
    ├── official.codeforces.js
    └── ...
```

### 2.2 插件系统

#### 2.2.1 插件接口
```typescript
// 插件ID格式为 namespace.name，例如：
// - official.leetcode：官方LeetCode插件
// - remote.myluogu：从远程URL加载的洛谷插件
// - local.mycustom：本地自定义插件
type PluginId = `${string}.${string}`;

interface OJPlugin {
  metadata: {
    id: PluginId;      // 插件唯一标识
    name: string;       // 显示名称
    description: string;// 描述
    version: string;    // 版本号
    author: string;     // 作者
  };

  // 判断当前页面是否为该OJ的题目页面
  isMatch(): boolean;

  // 执行插件功能
  execute(): boolean;
}
```

#### 2.2.2 插件源
```typescript
// 插件来源类型
type PluginSource = 
  | { type: 'official'; id: PluginId }              // 官方插件
  | { type: 'remote'; id: PluginId; url: string }   // 网络插件
  | { type: 'local'; id: PluginId }                 // 本地插件

// 本地存储：插件代码
interface LocalStorage {
  plugins: {
    [pluginId: PluginId]: {
      code: string;         // 插件代码
      lastUpdated: number;  // 最后更新时间
      source: PluginSource; // 用于同步和更新
    }
  }
}

// 同步存储：插件配置
interface SyncStorage {
  config: {
    enabled: {[pluginId: PluginId]: boolean}; // 启用状态
    order: PluginId[];                        // 加载顺序
    formatOptions: {                          // 格式化选项
      includeProblemId: boolean;
      convertSpecialChars: boolean;
    }
  }
}
```

#### 2.2.3 插件生命周期

1. 初始化
```typescript
async function initializeExtension() {
  // 首次安装
  if (isFirstInstall) {
    // 加载官方插件到storage
    await loadOfficialPlugins();
  }
  // 同步设备
  else if (isNewDevice) {
    // 从配置加载插件
    const config = await chrome.storage.sync.get('config');
    // 下载远程插件
    await downloadRemotePlugins();
    // 提示导入本地插件
    notifyLocalPluginsNeeded();
  }
}
```

2. 运行时
```typescript
async function executePlugins() {
  const config = await chrome.storage.sync.get('config');
  const plugins = await loadEnabledPlugins();
  
  // 按顺序执行
  for (const plugin of sortByOrder(plugins, config.order)) {
    if (plugin.isMatch()) {
      await plugin.execute();
      break;
    }
  }
}
```

### 2.3 用户界面

#### 2.3.1 弹出窗口
- 当前页面可用插件
- 快速启用/禁用
- 打开设置入口

#### 2.3.2 设置页面
- 插件管理（启用/禁用/排序）
- 远程插件导入
- 本地插件上传
- 格式化选项配置

## 3. 开发计划

### 3.1 第一阶段：基础框架
1. 插件系统实现
2. 官方插件开发
3. 基本UI实现

### 3.2 第二阶段：功能完善
1. 远程插件支持
2. 本地插件管理
3. 配置同步

### 3.3 第三阶段：优化提升
1. UI/UX改进
2. 更多官方插件
3. 开发文档完善

## 4. 注意事项
1. 安全性：
   - 验证远程插件源
   - 限制插件权限
   - 代码执行沙箱

2. 同步机制：
   - 保持配置一致性
   - 处理同步冲突
   - 版本控制

3. 错误处理：
   - 插件加载失败
   - 执行异常捕获
   - 用户反馈机制
