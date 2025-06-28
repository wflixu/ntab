<template>
  <div class="web-navi">
    <div class="list">
      <template v-for="site in sites">
        <a class="item" target="_blank" :href="site.href">
          <span class="close" @click.prevent="onClose(site)">
          <i class="pi pi-times" style="font-s ize: 1rem"></i>
          </span>
          <img draggable="false" class="favicon-overlay" :alt="site.title" :src="site.src" />
          <div class="site-title">{{ site.title }}</div>
        </a>
      </template>
      <div class="item add" @click.prevent="onAdd">
         <i class="pi pi-plus plus" style="font-s ize: 1rem" :style="{ fontSize: '36px', color: '#08c' }"></i>
      </div>
    </div>
     <Toast />
    <Dialog v-model:visible="open" header="添加站点" :modal="true" :closable="true" :style="{ width: '400px' }"
      @hide="open = false">
      <Form v-slot="$form" :initialValues="initialValues" :resolver="resolver" @submit="handleOk" ref="formRef">
        <div class="form-row">
          <label for="title" class="form-label">名称</label>
          <div class="form-field">
            <InputText id="title" name="title" required autofocus placeholder="请输入站点名称" class="input-full" />
            <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">
              {{ $form.title.error?.message }}
            </Message>
          </div>
        </div>
        <div class="form-row">
          <label for="href" class="form-label">地址</label>
          <div class="form-field">
            <InputText id="href" name="href" required placeholder="请输入站点地址" class="input-full" />
            <Message v-if="$form.href?.invalid" severity="error" size="small" variant="simple">
              {{ $form.href.error?.message }}
            </Message>
          </div>
        </div>
        <div class="form-actions">
          <Button label="取消" class="btn-cancel" @click="open = false" type="button" />
          <Button label="确定" class="btn-ok" type="submit" />
        </div>
      </Form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import type { ISite, ISiteFormState } from "./type";
import { useLocalStorage } from '@vueuse/core'
import { faviconURL } from './../../shared/index'
import { browser } from 'wxt/browser'
import { useLayoutStore } from '../../stores/layout'
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { Form } from '@primevue/forms';
import Message from 'primevue/message';
import { useToast } from "primevue/usetoast";

const layoutStore = useLayoutStore()

const open = ref(false);
const toast = useToast();

const sites = useLocalStorage<ISite[]>('my-sites', [])


const onClose = (site: ISite) => {
  sites.value = sites.value.filter(item => item.href !== site.href)
}


const onAdd = () => {
  open.value = true
}

// primevue form 相关
const initialValues = reactive<ISiteFormState>({
  href: '',
  title: '',
});

const resolver = ({ values }: { values: Record<string, any> }) => {
  const errors: Record<string, any[]> = {};

  if (!values.title) {
    errors.title = [{ message: '请输入站点名称' }];
  }
  if (!values.href) {
    errors.href = [{ message: '请输入站点地址' }];
  } else if (!/^https?:\/\//.test(values.href)) {
    errors.href = [{ message: '请输入有效的网址（以 http:// 或 https:// 开头）' }];
  }

  return {
    values,
    errors
  };
};

const formRef = ref();

const handleOk = ({ values, valid }) => {
  if (!valid) return;
  const { title, href } = values;
  const site = sites.value.find(item => item.href == href);
  if (!site) {
    sites.value.push({
      title,
      href,
      src: faviconURL(href)
    })
    if (layoutStore.syncBookmark) {
      addBookmark(title, href)
    }
    open.value = false;
    // 重置表单
    if (formRef.value?.reset) {
      formRef.value.reset();
    }
    toast.add({ severity: 'success', summary: '添加成功', detail: '站点已添加', life: 2000 });
  } else {
    toast.add({ severity: 'info', summary: '提示', detail: '站点已存在', life: 2000 });
  }
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
        toast.add({ severity: 'success', summary: '书签同步', detail: '书签已添加', life: 2000 });
      } else {
        toast.add({ severity: 'info', summary: '书签同步', detail: 'Bookmark already exists', life: 2000 });
      }

    })
  } else {
    toast.add({ severity: 'error', summary: '书签同步', detail: 'No ntab folder found in bookmarks', life: 2000 });
    console.log(sites.value)
  }
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

.form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 18px;
}

.form-label {
  width: 60px;
  min-width: 60px;
  font-weight: 500;
  padding-top: 6px;
  color: #333;
}

.form-field {
  flex: 1;
}

.input-full {
  width: 100%;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btn-cancel {
  background: none;
  border: none;
  color: #888;
}

.btn-ok {
  margin-left: 8px;
}
</style>
