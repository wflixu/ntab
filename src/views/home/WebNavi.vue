<template>
  <div class="web-navi">
    <div class="list">
      <template v-for="site in sites">
        <a class="item" target="_blank" :href="site.href">
          <span class="close" @click.prevent="onClose(site)">
            <CloseOutlined />
          </span>
          <img
            draggable="false"
            class="favicon-overlay"
            :alt="site.title"
            :src="site.src"
          />
          <div class="site-title">{{ site.title }}</div>
        </a>
      </template>
      <div class="item add" @click.prevent="onAdd">
        <PlusOutlined :style="{ fontSize: '36px', color: '#08c' }" />
      </div>
    </div>
    <a-modal v-model:open="open" title="添加" @ok="handleOk">
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <a-form-item
          label="名称"
          name="title"
          :rules="[{ required: true, message: 'Please input site title' }]"
        >
          <a-input v-model:value="formState.title" />
        </a-form-item>
        <a-form-item
          label="地址"
          name="href"
          :rules="[{ required: true, message: 'Please input site href!' }]"
        >
          <a-input v-model:value="formState.href" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted,reactive, toRaw } from "vue";
import {PlusOutlined,CloseOutlined}   from '@ant-design/icons-vue'
import npm from "./../../assets/search/logo-npm.png";
import type { ISite, ISiteFormState } from "./type";
import {useLocalStorage} from '@vueuse/core'


const open = ref(false);

const sites = useLocalStorage<ISite[]>('my-sites',[{
    title: "npm",
    href: "https://www.npmjs.com/",
    src: "",
  },
  {
    title: "npmmirror",
    href: "https://npmmirror.com/",
    src: "",
  },
  {
    title: "一言",
    href: "https://yiyan.baidu.com/",
    src: "",
  },])

// const sites = ref<ISite[]>([

// ]);

const onClose = (site:ISite) =>{
  sites.value = sites.value.filter(item=> item.href !== site.href)
}


const onAdd = () =>{
  open.value = true
}

const formState = reactive<ISiteFormState>({
  href: 'https://www.typescriptlang.org/',
  title: 'TS',
});

const formRef = ref();


const handleOk = () =>{
  formRef.value
    .validate()
    .then(() => {
      console.log('values', formState, toRaw(formState));
      const {title, href} = toRaw(formState);
      const site = sites.value.find(item => item.href == href);
      if(!site) {
        sites.value.push({
        title,
        href,
        src: faviconURL(href)
      })
        open.value = false;
        formRef.value.resetFields()
      } else {
        
      }

    })
    .catch(error => {
      console.log('error', error);
    });
}


const faviconURL = (u: string): string => {
  if(!chrome?.runtime?.getURL) {
    return npm
  }
  // @ts-nocheck
  console.log(u)
  const url =  new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u); // this encodes the URL as well
  url.searchParams.set("size", "32");
  return url.toString();
};

onMounted(() => {
  sites.value.forEach((item) => {

    item.src = faviconURL(item.href)?? npm;
    console.log(item.src)
  });
});
</script>

<style scoped lang="postcss">
.web-navi {
  padding: 8px;
  margin-top: 42px;
}
.list {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 36px 24px;
  .item {
    width: 120px;
    height: 120px;
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
    &.add:hover {
      cursor: pointer;
    }

    .site-title {
      display: flex;
      margin-top: 4px;
      align-items: center;
      color: #333;
    }
    img {
      height: 42px;
      width: 42px;
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
</style>
