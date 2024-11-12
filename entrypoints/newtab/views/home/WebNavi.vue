<template>
  <div class="web-navi">
    <div class="list">
      <template v-for="site in sites">
        <a class="item" target="_blank" :href="site.href">
          <span class="close" @click.prevent="onClose(site)">
            <CloseOutlined />
          </span>
          <img draggable="false" class="favicon-overlay" :alt="site.title" :src="site.src" />
          <div class="site-title">{{ site.title }}</div>
        </a>
      </template>
      <div class="item add" @click.prevent="onAdd">
        <PlusOutlined class="plus" :style="{ fontSize: '36px', color: '#08c' }" />
      </div>
    </div>
    <a-modal v-model:open="open" title="添加站点" @ok="handleOk">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }"
        autocomplete="off">
        <a-form-item label="名称" name="title" :rules="[{ required: true, message: 'Please input site title' }]">
          <a-input v-model:value="formState.title" />
        </a-form-item>
        <a-form-item label="地址" name="href" :rules="[{ required: true, message: 'Please input site href!' }]">
          <a-input v-model:value="formState.href" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, toRaw } from "vue";
import { PlusOutlined, CloseOutlined } from '@ant-design/icons-vue'
import type { ISite, ISiteFormState } from "./type";
import { useLocalStorage } from '@vueuse/core'
import { faviconURL } from './../../shared/index'
import { browser } from 'wxt/browser'
import { message } from "ant-design-vue";
import { useLayoutStore } from '../../stores/layout'

const layoutStore = useLayoutStore()

const open = ref(false);

const sites = useLocalStorage<ISite[]>('my-sites', [])


const onClose = (site: ISite) => {
  sites.value = sites.value.filter(item => item.href !== site.href)
}


const onAdd = () => {
  open.value = true
}
const addBookmark = async (title: string, href: string) => {
  const results = await browser.bookmarks.search({ title: layoutStore.syncBookmarkFolder })
        if (results.length > 0) {
            const ntabFolder = results[0]
            browser.bookmarks.getChildren(ntabFolder.id).then((children) => {
                console.log(children)
                console.log(sites.value)
                let index = children.findIndex((child) => child.title == title);
                if (index == -1) {
                    browser.bookmarks.create({
                        parentId: ntabFolder.id,
                        title: title,
                        url: href
                    })
                } else {
                    message.info('Bookmark already exists')
                }
                
            })
        } else {
            message.error('No ntab folder found in bookmarks')
            console.log(sites.value)
        }
}

const formState = reactive<ISiteFormState>({
  href: '',
  title: '',
});

const formRef = ref();

const handleOk = () => {
  formRef.value
    .validate()
    .then(() => {
      console.log('values', formState, toRaw(formState));
      const { title, href } = toRaw(formState);
      const site = sites.value.find(item => item.href == href);
      if (!site) {
        sites.value.push({
          title,
          href,
          src: faviconURL(href)
        })
        if(layoutStore.syncBookmark) {
          addBookmark(title, href)
        }

        open.value = false;
        formRef.value.resetFields()
        
      } else {
      }
    }).catch((error: any) => {
      console.warn('error', error);
    });
}

type HistoryItem = {
  url: string;
  title: string;
  visitCount: number;
}
// 
let microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
let oneWeekAgo = new Date().getTime() - microsecondsPerWeek;
const initBookmarks = () => {
  browser.history.search({ text: '', startTime: oneWeekAgo }).then((items) => {
    let count = 1
    // @ts-ignore
    // 把url 转换成url 对象，再根据url 对象的origin 合并，相同的origin 合并, 访问次方累加，
    let urlMap: { [key: string]: HistoryItem } = {};
    (items as HistoryItem[]).forEach((item: HistoryItem) => {
      let url = new URL(item.url)
      if (url.origin in urlMap) {
        urlMap[url.origin].visitCount = urlMap[url.origin].visitCount + item.visitCount
      } else {
        urlMap[url.origin] = item
      }
    });
    Object.entries(urlMap).sort((a, b) => { return b[1].visitCount - a[1].visitCount }).forEach(([origin, item]) => {
      if (count >= 8 || !item.url.startsWith('http') || item.visitCount < 3) {
        return
      } else {
        let url = new URL(item.url)
        console.log(url, item.visitCount)
        sites.value.push({
          title: item.title,
          href: origin,
          src: faviconURL(origin)
        })
        count++
      }
    })
  })

}

onMounted(() => {
  sites.value.forEach((item) => {
    if (!item.src) {
      item.src = faviconURL(item.href);
    }
  });
  

});
</script>

<style scoped>
.web-navi {
  padding-top: 25vh;
  /* padding-left: 20vw;
  padding-right: 20vw; */
  display: flex;
  justify-content: center;
}

.list {
  --item-width: 120px;
  --item-gap: 16px;
  background-color: rgba(242, 241, 240, 0.6);
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: var(--item-gap);
  width: calc((var(--item-width) + var(--item-gap)) * 8 - var(--item-gap));

  .item {
    width: var(--item-width);
    height: var(--item-width);
    padding-top: 16px;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .close {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      display: none;
    }

    &:hover {
      box-shadow: 0 5px 10px #999;
      background-color: #e8e8e9;

      .close {
        display: flex;
      }
    }

    &.add {
      padding-top: 0;

      &:hover {
        cursor: pointer;

        .plus {
          display: inline-flex;
        }
      }

      .plus {
        display: none
      }

    }

    .site-title {
      display: flex;
      margin-top: 4px;
      align-items: center;
      color: #333;
    }

    img {
      height: 48px;
      width: 48px;
    }

    a {
      border-radius: 12px;
      position: absolute;
      z-index: 10;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    a:hover {
      cursor: pointer;
    }
  }
}


@media screen and (min-width: 1980px) {
  .list {
    width: calc((var(--item-width) + var(--item-gap)) * 12 - var(--item-gap));
    ;
  }
}

@media screen and (min-width: 3200px) {
  .list {
    width: calc((var(--item-width) + var(--item-gap)) * 16 - var(--item-gap));
    ;
  }
}

@media screen and (max-width: 1280px) {
  .list {
    width: calc((var(--item-width) + var(--item-gap)) * 6 - var(--item-gap));
    ;
  }
}

@media screen and (max-width: 1024px) {
  .list {
    width: calc((var(--item-width) + var(--item-gap)) * 5 - var(--item-gap));
    ;
  }
}

@media screen and (max-width: 768px) {
  .list {
    width: calc((var(--item-width) + var(--item-gap)) * 4 - var(--item-gap));
    ;
  }
}
</style>
