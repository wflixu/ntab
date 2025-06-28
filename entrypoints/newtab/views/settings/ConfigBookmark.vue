<template>
    <div class="config-bookmark">
        <h2 class="flex">
            <Checkbox v-model="layoutStore.syncBookmark" input-id="syncBookmark" binary></Checkbox>
             <label class="ml-12" for="syncBookmark"> 是否在新增站点的时候同步到书签 </label>
        </h2>
        <div class="row">
            <InputText style="width: 360px;" v-model="layoutStore.syncBookmarkFolder" placeholder="Sync Folder" maxlength="20" />
            <div>
                <Button severity="primary" @click="syncFromBookmarks" icon="pi pi-download" label="From Bookmarks" />
                <Button class="ml-2" severity="primary" @click="uploadBookmarks" icon="pi pi-upload" label="Sync Bookmarks" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { browser } from 'wxt/browser'
import { useLayoutStore } from '../../stores/layout'
import type { ISite } from "../home/type";
import { useLocalStorage } from '@vueuse/core'
import { faviconURL } from './../../shared/index'

const sites = useLocalStorage<ISite[]>('my-sites', [])
const layoutStore = useLayoutStore()
const toast = useToast()

const syncFromBookmarks = async () => {
    if (browser.bookmarks) {
        const results = await browser.bookmarks.search({ title: layoutStore.syncBookmarkFolder })
        if (results.length > 0) {
            const ntabFolder = results[0]
            browser.bookmarks.getChildren(ntabFolder.id).then((children) => {
                sites.value = []
                children.forEach((child) => {
                    sites.value.push({ title: child.title, href: child.url!, src: faviconURL(child.url!) })
                })
                toast.add({ severity: 'success', summary: '同步成功', detail: '已从书签同步', life: 2000 });
            })
        } else {
            toast.add({ severity: 'error', summary: '同步失败', detail: 'No ntab folder found in bookmarks', life: 2000 });
        }
    }
}

const uploadBookmarks = async () => {
    const results = await browser.bookmarks.search({ title: layoutStore.syncBookmarkFolder })
    let ntabFolder: Bookmarks.BookmarkTreeNode | undefined;
    if (results.length > 0) {
        ntabFolder = results[0]
    } else {
        ntabFolder = await browser.bookmarks.create({ title: layoutStore.syncBookmarkFolder })
    }

    browser.bookmarks.getChildren(ntabFolder.id).then((children) => {
        sites.value.forEach((site) => {
            const index = children.findIndex((c) => c.title === site.title)
            if (index === -1) {
                browser.bookmarks.create({
                    title: site.title,
                    url: site.href,
                    parentId: ntabFolder.id,
                })
            } else {
                browser.bookmarks.update(children[index].id, {
                    title: site.title,
                    url: site.href,
                })
            }
        })
        toast.add({ severity: 'success', summary: '同步成功', detail: '书签已同步', life: 2000 });
    })
}
</script>

<style scoped>
.row {
    display: flex;
    justify-content: space-between;
}

.ml-2 {
    margin-left: 10px;
}
</style>