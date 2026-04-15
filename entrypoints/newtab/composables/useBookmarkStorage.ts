/**
 * 书签存储 Composable
 * 提供响应式的书签存储操作
 */

import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { ISite } from '../views/home/type'
import { getBookmarkStorage } from '../services/storage/bookmark-storage'

export interface UseBookmarkStorageOptions {
  /**
   * 是否自动从 localStorage 迁移数据
   * @default true
   */
  autoMigrate?: boolean

  /**
   * 迁移进度回调
   */
  onMigrationProgress?: (current: number, total: number) => void

  /**
   * 迁移完成回调
   */
  onMigrationComplete?: (migrated: number) => void

  /**
   * 迁移错误回调
   */
  onMigrationError?: (error: Error) => void
}

/**
 * 使用书签存储
 */
export function useBookmarkStorage(options: UseBookmarkStorageOptions = {}) {
  const {
    autoMigrate = true,
    onMigrationProgress,
    onMigrationComplete,
    onMigrationError
  } = options

  const storage = getBookmarkStorage()
  const sites = ref<ISite[]>([]) as Ref<ISite[]>
  const isInit = ref(false)
  const isMigrating = ref(false)
  const migrationProgress = ref({ current: 0, total: 0 })

  /**
   * 初始化存储
   */
  async function init() {
    if (isInit.value) return

    try {
      await storage.init()

      // 尝试从 localStorage 迁移数据
      if (autoMigrate) {
        const hasMigrated = window.localStorage.getItem('ntab_storage_migrated')
        const localStorageData = window.localStorage.getItem('my-sites')

        if (!hasMigrated && localStorageData) {
          isMigrating.value = true
          const migrated = await storage.migrateFromLocalStorage({
            onMigrationProgress: (current, total) => {
              migrationProgress.value = { current, total }
              onMigrationProgress?.(current, total)
            },
            onMigrationComplete: () => {
              window.localStorage.setItem('ntab_storage_migrated', Date.now().toString())
              isMigrating.value = false
              onMigrationComplete?.(migrated)
            },
            onMigrationError: (error) => {
              isMigrating.value = false
              onMigrationError?.(error)
            }
          })
        }
      }

      // 加载数据
      await load()
      isInit.value = true
    } catch (error) {
      console.error('Failed to initialize bookmark storage:', error)
      throw error
    }
  }

  /**
   * 加载所有书签
   */
  async function load() {
    try {
      sites.value = await storage.getAll()
    } catch (error) {
      console.error('[useBookmarkStorage] Failed to load bookmarks:', error)
      throw error
    }
  }

  /**
   * 添加书签
   */
  async function add(site: ISite) {
    try {
      await storage.add(site)
      await load()
    } catch (error) {
      console.error('[useBookmarkStorage] Failed to add bookmark:', error)
      throw error
    }
  }

  /**
   * 更新书签
   */
  async function update(href: string, updates: Partial<ISite>) {
    try {
      await storage.update(href, updates)
      await load()
    } catch (error) {
      console.error('Failed to update bookmark:', error)
      throw error
    }
  }

  /**
   * 删除书签
   */
  async function remove(href: string) {
    try {
      await storage.delete(href)
      await load()
    } catch (error) {
      console.error('Failed to remove bookmark:', error)
      throw error
    }
  }

  /**
   * 清空所有书签
   */
  async function clear() {
    try {
      await storage.clear()
      sites.value = []
    } catch (error) {
      console.error('Failed to clear bookmarks:', error)
      throw error
    }
  }

  /**
   * 回滚到 localStorage
   */
  async function rollbackToLocalStorage() {
    const localStorageData = window.localStorage.getItem('my-sites-backup')
    if (!localStorageData) {
      throw new Error('No backup found in localStorage')
    }

    try {
      const backupSites = JSON.parse(localStorageData) as ISite[]
      sites.value = backupSites
      // 恢复到 localStorage
      window.localStorage.setItem('my-sites', localStorageData)
      // 清除迁移标记
      window.localStorage.removeItem('ntab_storage_migrated')
    } catch (error) {
      console.error('Failed to rollback to localStorage:', error)
      throw error
    }
  }

  return {
    sites,
    isInit,
    isMigrating,
    migrationProgress,
    init,
    load,
    add,
    update,
    remove,
    clear,
    rollbackToLocalStorage
  }
}
