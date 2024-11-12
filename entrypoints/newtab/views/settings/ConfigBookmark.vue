<template>
    <div class="config-bookmark">
        <h2>
            <a-checkbox v-model:checked="layoutStore.syncBookmark">sync to bookmarks when add or remove a
                site</a-checkbox>
        </h2>
        <div class="row">
            <a-input style="width: 360px;" v-model:value="layoutStore.syncBookmarkFolder" size="large"
                placeholder="Sync Folder" max-length="20" />
            <div>
                <a-button type="primary" @click="syncFromBookmarks">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    From Bookmarks
                </a-button>
                <a-button class="ml-2" type="primary" @click="uploadBookmarks">
                    <template #icon>
                        <UploadOutlined />
                    </template>
                    Upload Bookmarks
                </a-button>
            </div>

        </div>

    </div>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { browser } from 'wxt/browser'
import { message } from 'ant-design-vue';

import { useLayoutStore } from '../../stores/layout'
import type { ISite, ISiteFormState } from "../home/type";
import { useLocalStorage } from '@vueuse/core'
import { faviconURL } from './../../shared/index'

const sites = useLocalStorage<ISite[]>('my-sites', [])

const layoutStore = useLayoutStore()





const syncFromBookmarks = async () => {

    if (browser.bookmarks) {

        //     browser.bookmarks.getTree((tree) => {

        //         console.log(tree)
        //     });
        browser.bookmarks.getTree().then(([tree]) => {
            console.log(tree)
        })
        // browser.bookmarks.getChildren('1').then((children) => {
        //     console.log(children)
        // })

        // browser.bookmarks.create({ title: 'ntab',}).then((newFolder) => {
        //     console.log(newFolder)
        // })
        const results = await browser.bookmarks.search({ title: layoutStore.syncBookmarkFolder })
        if (results.length > 0) {
            const ntabFolder = results[0]
            browser.bookmarks.getChildren(ntabFolder.id).then((children) => {
                console.log(children)
                console.log(sites.value)
                sites.value = []
                children.forEach((child) => {
                    
                    sites.value.push({ title: child.title, href: child.url!, src: faviconURL(child.url!) })

                })
            })
        } else {
            message.error('No ntab folder found in bookmarks')
            console.log(sites.value)
        }

    }

}

const uploadBookmarks = async () => {
    const results = await browser.bookmarks.search({ title: layoutStore.syncBookmarkFolder })
    if (results.length > 0) {
        const ntabFolder = results[0]
        browser.bookmarks.getChildren(ntabFolder.id).then((children) => {
            console.log(children)
            console.log(sites.value)
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
        })


    } else {
        message.error(`No ${layoutStore.syncBookmarkFolder} folder found in bookmarks`)
        console.log(sites.value)
    }
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