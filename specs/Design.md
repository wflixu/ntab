# ntab 智能书签管理系统 - 设计文档

## 版本信息

- **版本**: 1.0.0
- **日期**: 2026-04-15
- **状态**: 设计阶段
- **项目**: ntab Chrome扩展

---

## 目录

1. [架构设计](#1-架构设计)
2. [AI服务层](#2-ai服务层)
3. [存储服务](#3-存储服务)
4. [设置页面设计](#4-设置页面设计)
5. [主页WebNavi设计](#5-主页webnavi设计)
6. [首次使用引导](#6-首次使用引导)
7. [类型定义](#7-类型定义)

---

## 1. 架构设计

### 1.1 目录结构

```
entrypoints/newtab/
├── services/
│   ├── ai/
│   │   ├── client.ts              # AI API客户端
│   │   ├── prompts.ts             # Prompt模板管理
│   │   └── analyzer.ts            # 业务逻辑分析
│   ├── storage/
│   │   ├── ai-storage.ts          # AI配置存储（加密）
│   │   └── bookmark-storage.ts    # 书签存储（IndexedDB）
│   ├── history/
│   │   ├── analyzer.ts            # 历史分析
│   │   └── aggregator.ts          # 数据聚合
│   └── crypto.ts                  # 加密服务
├── stores/
│   ├── ai.ts                      # AI状态管理
│   └── navi.ts                    # 书签导航状态管理
├── types/
│   ├── ai.ts                      # AI相关类型
│   └── bookmark.ts                # 书签类型定义
├── views/
│   ├── settings/
│   │   ├── Settings.vue           # 设置主页面
│   │   ├── ConfigAI.vue           # AI配置界面
│   │   ├── ConfigBookmarkOrganize.vue # 书签整理主界面
│   │   └── bookmark-organize/
│   │       ├── BookmarkRecommend.vue  # 智能推荐组件
│   │       ├── BookmarkCleanup.vue    # 清理建议组件
│   │       └── DeadLinkDetection.vue  # 死链检测组件
│   └── home/
│       ├── WebNavi.vue            # 主组件
│       ├── WelcomeGuide.vue       # 引导主组件
│       ├── EmptyState.vue         # 空状态组件
│       ├── FeatureDiscovery.vue   # AI功能发现面板
│       ├── navi/                  # 子模块目录
│       │   ├── NaviGrid.vue       # 网格视图
│       │   ├── NaviList.vue       # 列表视图
│       │   ├── NaviGroup.vue      # 分组视图
│       │   ├── NaviToolbar.vue    # 工具栏
│       │   ├── NContextMenu.vue   # 右键菜单
│       │   ├── NEditDialog.vue    # 编辑对话框
│       │   └── NAIAssistant.vue   # AI助手面板
│       └── steps/                 # 引导步骤组件
│           ├── WelcomeStep.vue    # 欢迎页
│           ├── QuickSelectStep.vue # 快速选择
│           ├── CompletionStep.vue # 完成页
│           └── AIFeatureStep.vue  # AI功能发现
└── shared/
    └── index.ts                   # 工具函数
```

### 1.2 数据流设计

```
┌─────────────────────────────────────────────────────────────────┐
│                           用户界面                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   设置页面    │  │    主页       │  │  右键菜单     │        │
│  │              │  │  WebNavi     │  │              │        │
│  │ - AI配置     │  │ - 工具栏     │  │ - 编辑       │        │
│  │ - 书签整理   │  │ - AI助手     │  │ - AI分类     │        │
│  │ - 智能推荐   │  │ - 视图切换   │  │ - 复制       │        │
│  │ - 清理建议   │  │ - 搜索       │  │ - 删除       │        │
│  │ - 死链检测   │  │ - 撤销       │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        状态管理层                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐          ┌──────────────────┐           │
│  │   useAIStore     │          │  useNaviStore    │           │
│  │                  │          │                  │           │
│  │ - config         │          │ - bookmarks      │           │
│  │ - stats          │          │ - groups         │           │
│  │ - isAvailable    │          │ - viewMode       │           │
│  │ - categorize()   │          │ - undoStack      │           │
│  │ - recommend()    │          │ - addBookmark()  │           │
│  └──────────────────┘          └──────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        服务层                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐          ┌──────────────────┐           │
│  │   AIService      │          │ AIStorageService │           │
│  │                  │          │                  │           │
│  │ - callAPI()      │          │ - saveConfig()   │           │
│  │ - categorize()   │          │ - getConfig()    │           │
│  │ - recommend()    │          │ - updateStats()  │           │
│  │ - findDups()     │          │ - checkLimit()   │           │
│  └──────────────────┘          └──────────────────┘           │
│                                                                  │
│  ┌──────────────────┐          ┌──────────────────┐           │
│  │ CryptoService    │          │BookmarkStorage   │           │
│  │                  │          │                  │           │
│  │ - encrypt()      │          │ - getBookmarks() │           │
│  │ - decrypt()      │          │ - saveBookmark() │           │
│  └──────────────────┘          └──────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      外部API层                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AI Provider API         Chrome Extension API                   │
│  - DeepSeek              - browser.history.search()             │
│  - OpenAI                - browser.bookmarks.*                  │
│  - Anthropic             - browser.tabs.*                       │
│  - Custom                - browser.storage.local                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. AI服务层

### 2.1 AI配置界面 (ConfigAI.vue)

```vue
<template>
  <div class="config-ai">
    <h2>AI服务配置</h2>

    <!-- 提供商选择 -->
    <div class="provider-section">
      <label>服务提供商</label>
      <Dropdown
        v-model="config.provider"
        :options="providers"
        optionLabel="name"
        optionValue="id"
        placeholder="选择提供商"
      />
    </div>

    <!-- API配置 -->
    <div class="api-config">
      <div class="config-row">
        <label>API Endpoint</label>
        <InputText
          v-model="config.endpoint"
          placeholder="https://api.deepseek.com/v1"
        />
      </div>

      <div class="config-row">
        <label>API Key</label>
        <Password
          v-model="config.apiKey"
          :feedback="false"
          toggleMask
          placeholder="输入您的API Key"
        />
      </div>

      <div class="config-row">
        <label>模型名称</label>
        <InputText
          v-model="config.model"
          placeholder="deepseek-chat"
        />
      </div>

      <div class="config-actions">
        <Button
          label="验证连接"
          @click="testConnection"
          :loading="isTesting"
        />
        <Button
          label="保存配置"
          @click="saveConfig"
          severity="success"
        />
      </div>
    </div>

    <!-- 高级设置 -->
    <Accordion>
      <AccordionTab header="高级设置">
        <div class="config-row">
          <label>Temperature</label>
          <InputNumber
            v-model="config.temperature"
            :min="0"
            :max="2"
            :step="0.1"
          />
        </div>
        <div class="config-row">
          <label>Max Tokens</label>
          <InputNumber
            v-model="config.maxTokens"
            :min="100"
            :max="8000"
            :step="100"
          />
        </div>
        <div class="config-row">
          <label>月度Token上限</label>
          <InputNumber
            v-model="config.monthlyLimit"
            :min="10000"
            :max="1000000"
            :step="10000"
          />
        </div>
      </AccordionTab>
    </Accordion>

    <!-- 使用统计 -->
    <div class="usage-stats">
      <h3>使用统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="label">本月已用</span>
          <span class="value">{{ formatNumber(stats.usedTokens) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">月度上限</span>
          <span class="value">{{ formatNumber(stats.monthlyLimit) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">API调用次数</span>
          <span class="value">{{ stats.apiCallCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">本月重置</span>
          <span class="value">{{ resetDate }}</span>
        </div>
      </div>

      <ProgressBar
        :value="tokenPercentage"
        :class="getSeverityClass(tokenPercentage)"
      />
    </div>

    <!-- 预设提供商 -->
    <div class="presets">
      <h3>快速配置</h3>
      <div class="preset-buttons">
        <Button
          v-for="preset in presets"
          :key="preset.id"
          :label="preset.name"
          @click="applyPreset(preset)"
          outlined
        />
      </div>
    </div>
  </div>
</template>
```

### 2.2 AI服务核心实现 (ai-service.ts)

包含重试机制的AI服务实现：

```typescript
export class AIService implements IAIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 重试机制 - 网络异常时自动重试
   */
  private async retryFetch<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delay?: number;
      factor?: number;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      factor = 2
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // 判断是否应该重试
        const shouldRetry = this.isRetryableError(error);

        if (!shouldRetry || attempt === maxAttempts) {
          throw error;
        }

        // 计算延迟时间（指数退避）
        const waitTime = delay * Math.pow(factor, attempt - 1);

        console.warn(`API调用失败，第${attempt}次重试，等待${waitTime}ms...`, error);

        await this.sleep(waitTime);
      }
    }

    throw lastError;
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // 网络相关错误
    if (message.includes('network') ||
        message.includes('timeout') ||
        message.includes('fetch') ||
        message.includes('connection')) {
      return true;
    }

    // HTTP 5xx 服务器错误
    if (message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')) {
      return true;
    }

    // HTTP 429 限流
    if (message.includes('429') || message.includes('rate limit')) {
      return true;
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 3. 存储服务

### 3.0 分发方式说明

**本项目采用 zip 包分发，所有存储方案完全可用。**

| 技术 | Web Store | Zip 包 | 说明 |
|------|-----------|--------|------|
| chrome.storage.local | ✅ | ✅ | 完全相同 |
| chrome.storage.session | ✅ | ✅ | 完全相同 |
| IndexedDB | ✅ | ✅ | 完全相同 |
| Web Crypto API | ✅ | ✅ | 完全相同 |
| localStorage | ✅ | ✅ | 完全相同 |

**结论**：zip 包分发只是安装方式不同，不影响任何 Chrome Extension API 或 Web 标准 API 的使用。

本设计采用的混合存储策略在 zip 包下完全可行：
- **chrome.storage.local**（加密） - 存储 AI 配置和 API Key
- **IndexedDB** - 存储书签数据（支持大量数据）
- **Web Crypto API** - 加密敏感信息

### 3.1 加密存储工具

```typescript
// services/crypto.ts
export class CryptoService {
  private static async getKey(password: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('ntab-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(data: string, password: string): Promise<string> {
    const key = await this.getKey(password);
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(data)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(data: string, password: string): Promise<string> {
    const key = await this.getKey(password);
    const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  }

  static async getDeviceKey(): Promise<string> {
    let key = localStorage.getItem('ntab_device_key');
    if (!key) {
      key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem('ntab_device_key', key);
    }
    return key;
  }
}
```

### 3.2 AI存储服务

```typescript
// services/storage/ai-storage.ts
export class AIStorageService {
  private deviceKey: string | null = null;

  constructor() {
    this.initDeviceKey();
  }

  private async initDeviceKey() {
    this.deviceKey = await CryptoService.getDeviceKey();
  }

  async saveConfig(config: AIConfig): Promise<void> {
    const safeConfig = { ...config, apiKey: '' };
    const encryptedKey = await CryptoService.encrypt(config.apiKey, this.deviceKey!);

    await browser.storage.local.set({
      'ntab_ai_config': safeConfig,
      'ntab_ai_api_key_encrypted': encryptedKey
    });
  }

  async getConfig(): Promise<AIConfig | null> {
    const result = await browser.storage.local.get('ntab_ai_config');
    const stored = result['ntab_ai_config'];
    if (!stored) return null;

    const config = { ...stored } as AIConfig;

    const keyResult = await browser.storage.local.get('ntab_ai_api_key_encrypted');
    if (keyResult.ntab_ai_api_key_encrypted) {
      try {
        config.apiKey = await CryptoService.decrypt(
          keyResult.ntab_ai_api_key_encrypted,
          this.deviceKey!
        );
      } catch {
        config.apiKey = '';
      }
    }

    return config;
  }
}
```

### 3.3 书签存储服务 (IndexedDB)

```typescript
// services/storage/bookmark-storage.ts
const DB_NAME = 'ntab-bookmarks';
const DB_VERSION = 1;

export class BookmarkStorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('bookmarks')) {
          const store = db.createObjectStore('bookmarks', { keyPath: 'href' });
          store.createIndex('groupId', 'groupId', { unique: false });
          store.createIndex('order', 'order', { unique: false });
        }

        if (!db.objectStoreNames.contains('groups')) {
          const groupStore = db.createObjectStore('groups', { keyPath: 'id' });
          groupStore.createIndex('order', 'order', { unique: false });
        }
      };
    });
  }

  async getBookmarks(): Promise<Bookmark[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('bookmarks', 'readonly');
      const store = transaction.objectStore('bookmarks');
      const index = store.index('order');
      const request = index.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveBookmark(bookmark: Bookmark): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('bookmarks', 'readwrite');
      const store = transaction.objectStore('bookmarks');
      const request = store.put(bookmark);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBookmark(href: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('bookmarks', 'readwrite');
      const store = transaction.objectStore('bookmarks');
      const request = store.delete(href);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// 数据迁移：从 localStorage 迁移到 IndexedDB
export async function migrateFromLocalStorage(): Promise<void> {
  const oldData = localStorage.getItem('my-sites');
  if (!oldData) return;

  try {
    const sites = JSON.parse(oldData) as Bookmark[];
    const storage = new BookmarkStorageService();
    await storage.init();

    await storage.saveBookmarks(sites.map((site, index) => ({
      ...site,
      order: site.order ?? index
    })));

    localStorage.setItem('my-sites.backup', oldData);
    localStorage.setItem('my-sites.migrated', Date.now().toString());

    console.log(`已迁移 ${sites.length} 个书签到 IndexedDB`);
  } catch (error) {
    console.error('数据迁移失败:', error);
    throw error;
  }
}
```

---

## 4. 设置页面设计

### 4.1 书签整理主界面

```vue
<template>
  <div class="bookmark-organize">
    <div class="header">
      <h2>书签整理</h2>
      <Tag v-if="aiStore.isAvailable" severity="success" value="AI已启用" />
      <Tag v-else severity="warn" value="AI未配置">
        <Button link @click="openAIConfig">配置</Button>
      </Tag>
    </div>

    <TabView>
      <TabPanel header="智能推荐">
        <BookmarkRecommend />
      </TabPanel>
      <TabPanel header="清理建议">
        <BookmarkCleanup />
      </TabPanel>
      <TabPanel header="死链检测">
        <DeadLinkDetection />
      </TabPanel>
    </TabView>
  </div>
</template>
```

---

## 5. 主页WebNavi设计

### 5.1 重构后的主组件

```vue
<template>
  <div class="web-navi" :class="`view-${viewMode}`">
    <!-- 工具栏 -->
    <NaviToolbar />

    <!-- AI助手面板 -->
    <NAIAssistant v-if="aiStore.isAvailable && showAIPanel" />

    <!-- 视图容器 -->
    <div class="navi-container">
      <NaviGrid v-if="viewMode === 'grid'" />
      <NaviList v-else-if="viewMode === 'list'" />
      <NaviGroup v-else-if="viewMode === 'group'" />
    </div>

    <!-- 右键菜单 -->
    <NContextMenu />

    <!-- 编辑对话框 -->
    <NEditDialog />

    <Toast />
  </div>
</template>
```

### 5.2 工具栏组件

```vue
<template>
  <div class="navi-toolbar">
    <!-- 视图切换 -->
    <div class="view-switcher">
      <Button
        icon="pi pi-th-large"
        :severity="viewMode === 'grid' ? 'primary' : 'secondary'"
        @click="setViewMode('grid')"
        v-tooltip="'网格视图'"
      />
      <Button
        icon="pi pi-list"
        :severity="viewMode === 'list' ? 'primary' : 'secondary'"
        @click="setViewMode('list')"
        v-tooltip="'列表视图'"
      />
      <Button
        icon="pi pi-folder"
        :severity="viewMode === 'group' ? 'primary' : 'secondary'"
        @click="setViewMode('group')"
        v-tooltip="'分组视图'"
      />
    </div>

    <!-- AI功能按钮 -->
    <div class="ai-actions" v-if="aiStore.isAvailable">
      <Button
        icon="pi pi-sparkles"
        label="智能分类"
        severity="help"
        @click="categorizeAll"
        :loading="isCategorizing"
      />
      <Button
        icon="pi pi-copy"
        label="查找重复"
        severity="warn"
        @click="findDuplicates"
        outlined
      />
    </div>

    <!-- 常规操作 -->
    <div class="actions">
      <Button
        icon="pi pi-search"
        severity="secondary"
        outlined
        @click="showSearch = true"
      />
      <Button
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        @click="undo"
        :disabled="!canUndo"
      />
    </div>
  </div>
</template>
```

---

## 6. 首次使用引导

### 6.1 引导流程

```
首次打开检测
     │
     ▼
检测 my-sites 是否为空
     │
     ├─→ 不为空 → 正常显示 WebNavi
     │
     └─→ 为空 → 检测是否已完成引导
                │
                ├─→ 已完成 → 显示空状态
                │
                └─→ 未完成 → 显示引导流程
                            - 步骤1: 欢迎
                            - 步骤2: 快速选择（历史记录推荐）
                            - 步骤3: 完成
                            - 步骤4: AI功能发现
```

### 6.2 AI功能发现面板

```vue
<template>
  <div class="feature-discovery">
    <div class="discovery-header">
      <h2>🚀 探索AI功能</h2>
      <p>配置AI服务后，可使用以下高级功能</p>
      <Button label="暂时跳过" text @click="skip" />
    </div>

    <div class="feature-grid">
      <div
        v-for="feature in features"
        :key="feature.id"
        class="feature-card"
        @click="showFeatureDetail(feature)"
      >
        <div class="feature-icon">
          <i :class="feature.icon"></i>
        </div>
        <div class="feature-content">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
          <Tag v-if="feature.tokens" :value="`~${feature.tokens} tokens/次`" severity="secondary" />
        </div>
        <div class="feature-action">
          <Button
            :label="aiStore.isAvailable ? feature.action : '需配置AI'"
            :disabled="!aiStore.isAvailable"
            @click.stop="feature.onClick"
            size="small"
          />
        </div>
      </div>
    </div>

    <div class="config-prompt">
      <div v-if="!aiStore.isAvailable" class="prompt-box">
        <i class="pi pi-info-circle"></i>
        <span>需要先配置AI服务才能使用这些功能</span>
        <Button label="前往配置" @click="goToConfig" size="small" />
      </div>
    </div>
  </div>
</template>
```

---

## 7. 类型定义

### 7.1 AI相关类型

```typescript
// types/ai.ts
export type AIProvider = 'deepseek' | 'openai' | 'anthropic' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  endpoint: string;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  monthlyLimit?: number;
}

export interface AIUsageStats {
  usedTokens: number;
  monthlyLimit: number;
  apiCallCount: number;
  lastResetDate: string;
}

export interface AIResponse<T> {
  data: T;
  tokensUsed: number;
  model: string;
}

export interface HistoryItem {
  url: string;
  title: string;
  visitCount: number;
  lastVisitTime: number;
}

export interface SiteRecommendation {
  title: string;
  url: string;
  reason: string;
  visitCount: number;
}

export interface DuplicateGroup {
  title: string;
  urls: string[];
  similarity: string;
}

export interface HealthReport {
  healthy: string[];
  unused: string[];
  dead: string[];
  recommendations: string[];
}
```

### 7.2 书签类型

```typescript
// types/bookmark.ts
export interface Bookmark {
  href: string;
  title: string;
  src: string;
  categories?: string[];
  groupId?: string;
  visitCount?: number;
  lastVisit?: number;
  order?: number;
}

export interface Group {
  id: string;
  name: string;
  bookmarks: Bookmark[];
  order: number;
}

export interface UndoAction {
  type: 'remove' | 'update' | 'reorder';
  bookmark?: Bookmark;
  bookmarks?: Bookmark[];
  redo: () => void;
}
```
