/**
 * IndexedDB 书签存储服务
 * 用于替代 localStorage，支持大量书签存储
 */

import type { ISite } from '../../views/home/type'

const DB_NAME = 'ntab-bookmarks'
const DB_VERSION = 1
const STORE_NAME = 'bookmarks'

export interface BookmarkStorageOptions {
  onMigrationProgress?: (current: number, total: number) => void
  onMigrationComplete?: () => void
  onMigrationError?: (error: Error) => void
}

/**
 * 书签存储服务类
 */
export class BookmarkStorage {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  /**
   * 初始化数据库
   */
  async init(options?: BookmarkStorageOptions): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建书签存储对象
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'href' })
          objectStore.createIndex('title', 'title', { unique: false })
          objectStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })

    try {
      await this.initPromise
    } catch (error) {
      this.initPromise = null
      throw error
    }
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInit(): Promise<void> {
    if (!this.db) {
      await this.init()
    }
  }

  /**
   * 获取所有书签
   */
  async getAll(): Promise<ISite[]> {
    await this.ensureInit()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.getAll()

      request.onsuccess = () => resolve(request.result as ISite[])
      request.onerror = () => reject(new Error(`Failed to get bookmarks: ${request.error}`))
    })
  }

  /**
   * 添加单个书签（如果已存在则更新）
   */
  async add(site: ISite): Promise<void> {
    await this.ensureInit()

    const bookmark: ISite & { createdAt: number } = {
      ...site,
      createdAt: Date.now()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      // 使用 put 而不是 add，这样如果书签已存在会更新而不是报错
      const request = objectStore.put(bookmark)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error(`Failed to add bookmark: ${request.error}`))
    })
  }

  /**
   * 更新书签
   */
  async update(href: string, updates: Partial<ISite>): Promise<void> {
    await this.ensureInit()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)

      // 先获取现有数据
      const getRequest = objectStore.get(href)

      getRequest.onsuccess = () => {
        const existing = getRequest.result as ISite & { createdAt: number }
        if (!existing) {
          reject(new Error(`Bookmark not found: ${href}`))
          return
        }

        // 合并更新
        const updated = { ...existing, ...updates }
        const putRequest = objectStore.put(updated)

        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(new Error(`Failed to update bookmark: ${putRequest.error}`))
      }

      getRequest.onerror = () => reject(new Error(`Failed to get bookmark: ${getRequest.error}`))
    })
  }

  /**
   * 删除书签
   */
  async delete(href: string): Promise<void> {
    await this.ensureInit()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.delete(href)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error(`Failed to delete bookmark: ${request.error}`))
    })
  }

  /**
   * 清空所有书签
   */
  async clear(): Promise<void> {
    await this.ensureInit()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)
      const request = objectStore.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error(`Failed to clear bookmarks: ${request.error}`))
    })
  }

  /**
   * 从 localStorage 迁移数据到 IndexedDB
   */
  async migrateFromLocalStorage(options?: BookmarkStorageOptions): Promise<number> {
    // 从 localStorage 读取数据
    const localStorageData = window.localStorage.getItem('my-sites')
    if (!localStorageData) {
      return 0
    }

    let sites: ISite[]
    try {
      sites = JSON.parse(localStorageData)
    } catch {
      return 0
    }

    if (!Array.isArray(sites) || sites.length === 0) {
      return 0
    }

    // 确保数据库已初始化
    await this.ensureInit()

    // 迁移数据
    let migrated = 0
    const total = sites.length

    for (const site of sites) {
      await this.add(site)
      migrated++
      options?.onMigrationProgress?.(migrated, total)
    }

    options?.onMigrationComplete?.()
    return migrated
  }

  /**
   * 导出数据到 localStorage（备份）
   */
  async backupToLocalStorage(): Promise<void> {
    const bookmarks = await this.getAll()
    window.localStorage.setItem('my-sites-backup', JSON.stringify(bookmarks))
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
  }
}

// 单例实例
let storageInstance: BookmarkStorage | null = null

/**
 * 获取书签存储服务实例
 */
export function getBookmarkStorage(): BookmarkStorage {
  if (!storageInstance) {
    storageInstance = new BookmarkStorage()
  }
  return storageInstance
}
