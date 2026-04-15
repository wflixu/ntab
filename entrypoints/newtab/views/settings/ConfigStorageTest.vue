<template>
  <div class="storage-test">
    <Toast />
    <h3>IndexedDB 存储服务测试</h3>

    <!-- 状态显示 -->
    <div class="status-section">
      <div class="status-item">
        <span class="label">初始化状态:</span>
        <Tag :value="isInit ? '已初始化' : '未初始化'" :severity="isInit ? 'success' : 'warning'" />
      </div>
      <div class="status-item">
        <span class="label">书签数量:</span>
        <Tag :value="sites.length.toString()" severity="info" />
      </div>
      <div class="status-item">
        <span class="label">迁移状态:</span>
        <Tag :value="isMigrating ? '迁移中...' : '空闲'" :severity="isMigrating ? 'warn' : 'success'" />
      </div>
    </div>

    <!-- 迁移控制 -->
    <div class="section">
      <h4>数据迁移</h4>
      <p class="hint-text">💡 <strong>说明：</strong>这些按钮用于在 IndexedDB 和 localStorage 之间转移数据</p>
      <div class="migration-buttons">
        <div class="button-item">
          <Button label="从 localStorage 迁移到 IndexedDB" @click="handleMigrate" :disabled="isMigrating" class="btn-full" />
          <span class="button-hint">将旧数据迁移到新存储（自动跳过已存在的）</span>
        </div>
        <div class="button-item">
          <Button label="备份 IndexedDB 到 localStorage" @click="handleBackup" severity="secondary" class="btn-full" />
          <span class="button-hint">创建备份副本到 localStorage</span>
        </div>
        <div class="button-item">
          <Button label="回滚到 localStorage" @click="handleRollback" severity="danger" class="btn-full" />
          <span class="button-hint">放弃 IndexedDB 数据，恢复旧数据</span>
        </div>
      </div>
      <div v-if="migrationProgress.total > 0" class="progress">
        <ProgressBar :value="(migrationProgress.current / migrationProgress.total) * 100">
          迁移中: {{ migrationProgress.current }} / {{ migrationProgress.total }}
        </ProgressBar>
      </div>
    </div>

    <!-- 添加书签 -->
    <div class="section">
      <h4>添加书签</h4>
      <div class="form">
        <InputText v-model="newSite.title" placeholder="标题" class="input" />
        <InputText v-model="newSite.href" placeholder="网址 (https://...)" class="input" />
        <Button label="添加" @click="handleAdd" />
      </div>
    </div>

    <!-- 书签列表 -->
    <div class="section">
      <h4>书签列表 ({{ sites.length }})</h4>
      <div class="button-group">
        <Button label="清空全部" @click="handleClear" severity="danger" size="small" />
      </div>
      <DataTable :value="sites" size="small" class="table" tableStyle="min-width: 100%">
        <Column field="title" header="标题" style="width: 25%" />
        <Column field="href" header="网址" style="width: 60%">
          <template #body="slotProps">
            <span class="url-text" :title="slotProps.data.href">{{ slotProps.data.href }}</span>
          </template>
        </Column>
        <Column header="操作" style="width: 15%; text-align: center;">
          <template #body="slotProps">
            <Button icon="pi pi-trash" size="small" text @click="handleDelete(slotProps.data.href)" />
          </template>
        </Column>
        <template #empty>
          <div style="padding: 1rem; text-align: center; color: #999;">暂无数据</div>
        </template>
      </DataTable>
    </div>

    <!-- localStorage 数据检查 -->
    <div class="section">
      <h4>localStorage 数据</h4>
      <div class="storage-info">
        <div><strong>my-sites:</strong> {{ localStorageData.mySites ? '有数据' : '无数据' }}</div>
        <div><strong>my-sites-backup:</strong> {{ localStorageData.backup ? '有数据' : '无数据' }}</div>
        <div><strong>ntab_storage_migrated:</strong> {{ localStorageData.migrated || '未迁移' }}</div>
      </div>
      <Button label="刷新 localStorage 状态" @click="checkLocalStorage" severity="secondary" size="small" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toast from 'primevue/toast'
import type { ISite } from '../../home/type'
import { useBookmarkStorage } from '../../composables/useBookmarkStorage'
import { getBookmarkStorage } from '../../services/storage/bookmark-storage'

const toast = useToast()

const {
  sites,
  isInit,
  isMigrating,
  migrationProgress,
  init,
  load,
  add,
  remove,
  clear,
  rollbackToLocalStorage
} = useBookmarkStorage()

const newSite = reactive({
  title: '',
  href: ''
})

const localStorageData = reactive({
  mySites: '',
  backup: '',
  migrated: ''
})

// 初始化
onMounted(async () => {
  await init()
  checkLocalStorage()
})

// 检查 localStorage
function checkLocalStorage() {
  localStorageData.mySites = window.localStorage.getItem('my-sites') || ''
  localStorageData.backup = window.localStorage.getItem('my-sites-backup') || ''
  localStorageData.migrated = window.localStorage.getItem('ntab_storage_migrated') || ''
}

// 迁移
async function handleMigrate() {
  try {
    const storage = getBookmarkStorage()
    const migrated = await storage.migrateFromLocalStorage({
      onMigrationProgress: (current, total) => {
        console.log(`Migration progress: ${current}/${total}`)
      },
      onMigrationComplete: () => {
        toast.add({ severity: 'success', summary: '迁移完成', life: 3000 })
        checkLocalStorage()
        load()
      },
      onMigrationError: (error) => {
        toast.add({ severity: 'error', summary: '迁移失败', detail: error.message, life: 3000 })
      }
    })
    if (migrated === 0) {
      toast.add({ severity: 'info', summary: '无数据迁移', detail: 'localStorage 中没有 my-sites 数据', life: 3000 })
    }
  } catch (error: any) {
    toast.add({ severity: 'error', summary: '迁移失败', detail: error.message, life: 3000 })
  }
}

// 备份
async function handleBackup() {
  try {
    const storage = getBookmarkStorage()
    await storage.backupToLocalStorage()
    checkLocalStorage()
    toast.add({ severity: 'success', summary: '备份成功', detail: `已备份 ${sites.value.length} 个书签到 my-sites-backup`, life: 3000 })
  } catch (error: any) {
    toast.add({ severity: 'error', summary: '备份失败', detail: error.message, life: 3000 })
  }
}

// 回滚
async function handleRollback() {
  try {
    await rollbackToLocalStorage()
    toast.add({ severity: 'success', summary: '回滚成功', detail: '已恢复到 localStorage', life: 3000 })
    checkLocalStorage()
    load()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: '回滚失败', detail: error.message, life: 3000 })
  }
}

// 添加书签
async function handleAdd() {
  if (!newSite.title || !newSite.href) {
    toast.add({ severity: 'warn', summary: '请填写完整', life: 2000 })
    return
  }

  if (!/^https?:\/\//.test(newSite.href)) {
    toast.add({ severity: 'warn', summary: '网址格式错误', detail: '请以 http:// 或 https:// 开头', life: 2000 })
    return
  }

  try {
    await add({
      title: newSite.title,
      href: newSite.href,
      src: `https://www.google.com/s2/favicons?domain=${newSite.href}`
    })
    toast.add({ severity: 'success', summary: '添加成功', life: 2000 })
    newSite.title = ''
    newSite.href = ''
  } catch (error: any) {
    toast.add({ severity: 'error', summary: '添加失败', detail: error?.message || String(error), life: 3000 })
  }
}

// 删除书签
async function handleDelete(href: string) {
  try {
    await remove(href)
    toast.add({ severity: 'success', summary: '删除成功', life: 2000 })
  } catch (error: any) {
    toast.add({ severity: 'error', summary: '删除失败', detail: error.message, life: 3000 })
  }
}

// 清空全部
async function handleClear() {
  if (!confirm('确定要清空所有书签吗？')) return
  try {
    await clear()
    toast.add({ severity: 'success', summary: '清空成功', life: 2000 })
  } catch (error: any) {
    toast.add({ severity: 'error', summary: '清空失败', detail: error.message, life: 3000 })
  }
}
</script>

<style scoped>
.storage-test {
  padding: 20px;
}

h3 {
  margin-top: 0;
  color: #333;
}

h4 {
  color: #666;
  margin-bottom: 12px;
  font-size: 14px;
}

.status-section {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 500;
  color: #666;
}

.section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.hint-text {
  font-size: 13px;
  color: #666;
  margin: 0 0 16px 0;
  padding: 10px;
  background: #e8f4fd;
  border-radius: 4px;
  border-left: 3px solid #2196f3;
}

.migration-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 12px;
}

.button-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.button-hint {
  font-size: 12px;
  color: #888;
  padding-left: 4px;
}

.btn-full {
  width: 100%;
}

.form {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input {
  flex: 1;
}

.table {
  margin-top: 12px;
}

.progress {
  margin-top: 12px;
}

.storage-info {
  background: white;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.8;
  margin-bottom: 12px;
}

.storage-info div {
  color: #666;
}

.storage-info strong {
  color: #333;
}

.url-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
