# ntab 智能书签管理系统 - 实施计划（增量式）

## 版本信息

- **版本**: 2.0.0
- **日期**: 2026-04-15
- **状态**: 设计阶段
- **项目**: ntab Chrome扩展

---

## 设计原则

### 增量式开发

每个阶段结束后必须满足：
1. ✅ **可运行** - `pnpm dev` 能正常启动
2. ✅ **可测试** - 新功能可以手动测试验证
3. ✅ **可回滚** - 不破坏已有功能
4. ✅ **有产出** - 有可见的用户价值

### 策略

- **纵向切片**：每个阶段包含从数据库到UI的完整功能
- **渐进替换**：新功能与旧功能并存，逐步替换
- **功能开关**：使用特性开关控制新功能的启用

---

## 总体路线图

```
阶段1: 存储升级 → 基础书签管理（替代localStorage）
    ↓
阶段2: AI配置 → API连接测试
    ↓
阶段3: 智能推荐 → 设置页面第一个可用功能
    ↓
阶段4: WebNavi重构 → 视图切换 + 拖拽
    ↓
阶段5: 高级管理 → 右键菜单 + 编辑 + 撤销
    ↓
阶段6: AI增强 → 智能分类 + 重复检测
    ↓
阶段7: 清理工具 → 清理建议 + 死链检测
    ↓
阶段8: 用户引导 → 首次使用流程
    ↓
阶段9: 优化完善 → 搜索 + 分组 + 性能优化
```

---

## 阶段1: 存储升级 + 基础书签管理

### 目标

将 localStorage 迁移到 IndexedDB，建立新的存储架构

### 时间：1-2周

### 功能范围

```
✅ 数据层
├── IndexedDB 初始化
├── 书签 CRUD 操作
├── 数据迁移脚本
└── 向后兼容（保留 localStorage 备份）

✅ 状态层
├── useNaviStore 重构
└── 使用新的存储服务

✅ UI层（保持不变）
└── WebNavi.vue 保持原有功能
```

### 实施步骤

| 顺序 | 任务 | 文件 | 工作量 |
|------|------|------|--------|
| 1 | 创建 IndexedDB 存储服务 | services/storage/bookmark-storage.ts | 1天 |
| 2 | 实现数据迁移 | services/storage/bookmark-storage.ts | 1天 |
| 3 | 重构书签 Store | stores/navi.ts | 1天 |
| 4 | 添加迁移触发逻辑 | entrypoints/newtab/views/home/WebNavi.vue | 0.5天 |
| 5 | 测试迁移和回滚 | - | 0.5天 |
| 6 | 文档更新 | README.md | 0.5天 |

### 验收标准

```bash
# 可运行测试
pnpm dev
# 打开新标签页，书签正常显示

# 可测试项目
✅ 首次安装自动迁移数据
✅ 迁移后书签功能正常
✅ 保留 localStorage 备份
✅ 可以手动回滚到旧方案
```

### 产出物

- 可运行的扩展，使用 IndexedDB 存储
- 数据迁移工具
- 技术文档

### 风险控制

- **风险**：迁移失败导致数据丢失
- **缓解**：保留备份，提供回滚方案
- **验证**：在多个设备上测试迁移

---

## 阶段2: AI 配置 + 连接测试

### 目标

实现 AI 配置界面，用户可以配置并测试 AI 服务

### 时间：1周

### 功能范围

```
✅ 数据层
├── 加密服务（Web Crypto API）
├── AI 配置存储（chrome.storage.local）
└── API Key 安全存储

✅ 服务层
├── AI 服务客户端
├── 连接测试
└── Token 统计

✅ UI层
├── AI 配置界面
└── 设置页面集成
```

### 实施步骤

| 顺序 | 任务 | 文件 | 工作量 |
|------|------|------|--------|
| 1 | 创建加密服务 | services/crypto.ts | 0.5天 |
| 2 | 创建 AI 存储服务 | services/storage/ai-storage.ts | 0.5天 |
| 3 | 创建 AI 客户端 | services/ai/client.ts | 1天 |
| 4 | 创建 AI Store | stores/ai.ts | 1天 |
| 5 | AI 配置界面 | views/settings/ConfigAI.vue | 1天 |
| 6 | 集成到设置页面 | views/settings/Settings.vue | 0.5天 |

### 验收标准

```bash
# 可运行测试
pnpm dev
# 进入设置 → AI配置

# 可测试项目
✅ 可以选择 AI 提供商
✅ 可以输入 API Key 并保存
✅ API Key 加密存储
✅ 可以测试连接
✅ Token 统计显示正确
```

### 产出物

- AI 配置界面
- 加密存储服务
- AI 服务基础框架

### 风险控制

- **风险**：加密 API 兼容性
- **缓解**：使用标准 Web Crypto API
- **验证**：在不同 Chrome 版本测试

---

## 阶段3: 智能推荐功能

### 目标

实现第一个完整的 AI 功能：智能推荐

### 时间：1-2周

### 功能范围

```
✅ 数据层
├── 历史记录服务
├── Prompt 模板
└── 分析服务

✅ 服务层
├── 本地推荐算法
├── AI 推荐集成
└── 降级策略

✅ UI层
├── 推荐界面
└── 设置页面集成
```

### 实施步骤

| 顺序 | 任务 | 文件 | 工作量 |
|------|------|------|--------|
| 1 | 历史记录分析 | services/history/analyzer.ts | 1天 |
| 2 | Prompt 模板 | services/ai/prompts.ts | 0.5天 |
| 3 | AI 推荐服务 | services/ai/analyzer.ts | 1天 |
| 4 | 推荐界面 | views/settings/bookmark-organize/BookmarkRecommend.vue | 2天 |
| 5 | 设置页面结构 | views/settings/ConfigBookmarkOrganize.vue | 0.5天 |
| 6 | 集成测试 | - | 1天 |

### 验收标准

```bash
# 可运行测试
pnpm dev
# 进入设置 → 书签整理 → 智能推荐

# 可测试项目
✅ 未配置 AI 时显示本地推荐
✅ 配置 AI 后显示 AI 推荐
✅ 可以选择时间范围
✅ 可以添加推荐网站到书签
✅ AI 失败时降级到本地算法
```

### 产出物

- 智能推荐功能
- 历史记录分析服务
- AI 降级策略

### 风险控制

- **风险**：历史记录数据量大
- **缓解**：限制查询数量，分页处理
- **验证**：测试大量历史记录场景

---

## 阶段4: WebNavi 基础重构

### 目标

重构主页组件，实现视图切换和拖拽排序

### 时间：2周

### 功能范围

```
✅ 组件层
├── 工具栏（视图切换）
├── 网格视图
└── 拖拽排序

✅ 兼容性
├── 使用新的 IndexedDB 存储
└── 保持原有 UI 风格
```

### 实施步骤

| 顺序 | 任务 | 文件 | 工作量 |
|------|------|------|--------|
| 1 | 创建工具栏组件 | views/home/navi/NaviToolbar.vue | 1天 |
| 2 | 重构网格视图 | views/home/navi/NaviGrid.vue | 2天 |
| 3 | 集成拖拽功能 | views/home/navi/NaviGrid.vue | 1天 |
| 4 | 重构主组件 | views/home/WebNavi.vue | 2天 |
| 5 | 样式调整 | views/home/navi/*.vue | 1天 |
| 6 | 集成测试 | - | 1天 |

### 验收标准

```bash
# 可运行测试
pnpm dev
# 打开新标签页

# 可测试项目
✅ 书签正常显示（使用 IndexedDB）
✅ 拖拽排序功能正常
✅ 拖拽后顺序持久化
✅ UI 风格与原来一致
✅ 添加/删除书签正常
```

### 产出物

- 重构后的 WebNavi 组件
- 工具栏组件
- 拖拽排序功能

### 风险控制

- **风险**：UI 风格变化
- **缓解**：保持原有 CSS，逐步调整
- **验证**：对比新旧版本的 UI

---

## 阶段5: 高级书签管理

### 目标

实现右键菜单、编辑功能和撤销功能

### 时间：1-2周

### 功能范围

```
✅ 组件层
├── 列表视图
├── 右键菜单
├── 编辑对话框
└── 撤销功能

✅ 状态层
├── 撤销栈管理
└── 操作历史
```

### 实施步骤

| 顺序 | 任务 | 文件 | 工作量 |
|------|------|------|--------|
| 1 | 创建列表视图 | views/home/navi/NaviList.vue | 2天 |
| 2 | 创建右键菜单 | views/home/navi/NContextMenu.vue | 1天 |
| 3 | 创建编辑对话框 | views/home/navi/NEditDialog.vue | 1天 |
| 4 | 实现撤销功能 | composables/useNaviUndo.ts | 1天 |
| 5 | 集成到工具栏 | views/home/navi/NaviToolbar.vue | 0.5天 |
| 6 | 测试 | - | 1天 |

### 验收标准

```bash
# 可运行测试
pnpm dev
# 打开新标签页

# 可测试项目
✅ 右键菜单正常显示
✅ 可以编辑书签标题和 URL
✅ 删除操作可以撤销
✅ 编辑操作可以撤销
✅ 视图切换功能正常
```

### 产出物

- 列表视图
- 右键菜单
- 编辑对话框
- 撤销功能

---

## 阶段6: AI 功能增强

### 目标

实现智能分类和重复检测功能

### 时间：1-2周

### 功能范围

```
✅ 服务层
├── AI 分类服务
├── 重复检测服务
└── 批量操作

✅ UI层
├── AI 分类集成
├── 重复检测界面
└── AI 助手面板
```

### 实施步骤

| 顺序 | 任务 | 文件 | 工作量 |
|------|------|------|--------|
| 1 | AI 分类服务 | services/ai/analyzer.ts | 1天 |
| 2 | 重复检测服务 | services/ai/analyzer.ts | 1天 |
| 3 | 重复检测界面 | views/settings/bookmark-organize/DeadLinkDetection.vue | 2天 |
| 4 | AI 助手面板 | views/home/navi/NAIAssistant.vue | 2天 |
| 5 | 右键菜单集成 | views/home/navi/NContextMenu.vue | 0.5天 |
| 6 | 测试 | - | 1天 |

### 验收标准

```bash
# 可运行测试
pnpm dev
# 主页：右键 → AI分类
# 设置：书签整理 → 重复检测

# 可测试项目
✅ 可以对单个书签进行 AI 分类
✅ 批量分类功能正常
✅ 重复检测功能正常
✅ AI 助手面板显示建议
```

### 产出物

- AI 分类功能
- 重复检测功能
- AI 助手面板

---

## 阶段7: 清理工具

### 目标

实现清理建议和死链检测功能

### 时间：1-2周

### 功能范围

```
✅ 服务层
├── 清理分析服务
├── 死链检测服务
└── 健康报告

✅ UI层
├── 清理建议界面
└── 死链检测界面
```

### 实施步骤

| 顺序 | 任务 | 文件 | 工作量 |
|------|------|------|--------|
| 1 | 清理分析服务 | services/bookmark/cleanup-service.ts | 1天 |
| 2 | 死链检测服务 | services/bookmark/health-service.ts | 1天 |
| 3 | 清理建议界面 | views/settings/bookmark-organize/BookmarkCleanup.vue | 2天 |
| 4 | 死链检测界面 | views/settings/bookmark-organize/DeadLinkDetection.vue | 2天 |
| 5 | 设置页面集成 | views/settings/ConfigBookmarkOrganize.vue | 0.5天 |
| 6 | 测试 | - | 1天 |

### 验收标准

```bash
# 可运行测试
pnpm dev
# 设置 → 书签整理

# 可测试项目
✅ 可以检测长期未访问的书签
✅ 可以批量删除选中项
✅ 死链检测功能正常
✅ 检测结果准确
```

### 产出物

- 清理建议功能
- 死链检测功能

---

## 阶段8: 首次使用引导

### 目标

实现新用户引导流程

### 时间：1-2周

### 功能范围

```
✅ 组件层
├── 欢迎引导
├── 快速选择
├── 完成步骤
├── AI 功能发现
└── 空状态处理
```

### 实施步骤

| 顺序 | 任务 | 文件 | 工作量 |
|------|------|------|--------|
| 1 | 引导主组件 | views/home/WelcomeGuide.vue | 1天 |
| 2 | 欢迎步骤 | views/home/steps/WelcomeStep.vue | 0.5天 |
| 3 | 快速选择步骤 | views/home/steps/QuickSelectStep.vue | 2天 |
| 4 | 完成步骤 | views/home/steps/CompletionStep.vue | 0.5天 |
| 5 | AI 功能发现 | views/home/steps/AIFeatureStep.vue | 1天 |
| 6 | 功能发现面板 | views/home/FeatureDiscovery.vue | 1天 |
| 7 | 空状态组件 | views/home/EmptyState.vue | 1天 |
| 8 | 集成测试 | - | 1天 |

### 验收标准

```bash
# 可运行测试
pnpm dev
# 清空 localStorage 后打开新标签页

# 可测试项目
✅ 首次打开显示引导
✅ 可以从历史记录选择网站
✅ 添加推荐网站功能正常
✅ AI 功能发现面板显示正确
✅ 跳过引导后显示空状态
✅ 空状态下可以添加书签
```

### 产出物

- 首次使用引导流程
- 空状态处理
- AI 功能发现

---

## 阶段9: 优化完善

### 目标

实现搜索、分组和性能优化

### 时间：1-2周

### 功能范围

```
✅ 功能层
├── 搜索功能
├── 分组视图
└── 分组管理

✅ 性能优化
├── 虚拟滚动
├── 缓存策略
└── 懒加载
```

### 实施步骤

| 顺序 | 任务 | 文件 | 工作量 |
|------|------|------|--------|
| 1 | 搜索功能 | views/home/navi/NaviSearch.vue | 1天 |
| 2 | 分组视图 | views/home/navi/NaviGroup.vue | 2天 |
| 3 | 分组管理 | composables/useNaviGroups.ts | 1天 |
| 4 | 虚拟滚动 | views/home/navi/NaviList.vue | 1天 |
| 5 | 缓存策略 | services/cache/ | 1天 |
| 6 | 性能测试 | - | 1天 |

### 验收标准

```bash
# 可运行测试
pnpm dev

# 可测试项目
✅ 搜索功能正常
✅ 分组功能正常
✅ 大量书签（1000+）流畅
✅ 内存使用正常
```

### 产出物

- 搜索功能
- 分组功能
- 性能优化

---

## 时间线总结

| 阶段 | 功能 | 时间 | 累计时间 |
|------|------|------|----------|
| 1 | 存储升级 + 基础书签 | 1-2周 | 1-2周 |
| 2 | AI 配置 | 1周 | 2-3周 |
| 3 | 智能推荐 | 1-2周 | 3-5周 |
| 4 | WebNavi 重构 | 2周 | 5-7周 |
| 5 | 高级管理 | 1-2周 | 6-9周 |
| 6 | AI 增强 | 1-2周 | 7-11周 |
| 7 | 清理工具 | 1-2周 | 8-13周 |
| 8 | 用户引导 | 1-2周 | 9-15周 |
| 9 | 优化完善 | 1-2周 | 10-17周 |

**总计：10-17周（约2.5-4个月）**

---

## 测试策略

### 每个阶段必须测试

```bash
# 功能测试
pnpm dev
# 手动测试新功能

# 回归测试
# 确保旧功能不被破坏

# 边界测试
# 测试空数据、大量数据等边界情况

# 兼容性测试
# 在不同 Chrome 版本测试
```

### 自动化测试（可选）

```bash
# 单元测试
pnpm test

# E2E 测试
pnpm test:e2e
```

---

## 发布策略

### Alpha 版本

阶段1-3完成后，发布内部测试版

### Beta 版本

阶段1-6完成后，发布给友好用户测试

### 正式版本

所有阶段完成后，正式发布

---

## 风险管理

### 常见风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 数据迁移失败 | 高 | 中 | 备份+回滚方案 |
| AI API 变化 | 中 | 低 | 抽象层隔离 |
| 性能问题 | 中 | 中 | 分阶段优化 |
| 时间延期 | 中 | 中 | 调整范围 |

---

## 附录

### A. 功能开关

使用功能开关控制新功能：

```typescript
const features = useLocalStorage('ntab_features', {
  newStorage: true,
  aiConfig: true,
  smartRecommend: true,
  newWebNavi: false,
  advancedManagement: false,
  aiEnhanced: false,
  cleanupTools: false,
  userGuide: false
});
```

### B. 回滚计划

每个阶段保留回滚方案：

```typescript
// 阶段1回滚：使用旧存储
if (!features.newStorage) {
  useLocalStorage('my-sites', []);
}

// 阶段4回滚：使用旧组件
if (!features.newWebNavi) {
  OldWebNavi.vue
}
```

### C. 数据检查点

每个阶段结束后创建数据检查点：

```bash
# 导出当前数据
pnpm backup

# 阶段完成后标记
pnpm checkpoint:stage3
```
