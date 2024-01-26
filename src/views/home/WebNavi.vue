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
        <PlusOutlined class="plus" :style="{ fontSize: '36px', color: '#08c' }" />
      </div>
    </div>
    <a-modal v-model:open="open" title="添加站点" @ok="handleOk">
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        :label-col="{ span: 3 }"
        :wrapper-col="{ span: 20 }"
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
import type { ISite, ISiteFormState } from "./type";
import {useLocalStorage} from '@vueuse/core'
import {faviconURL} from './../../shared/index'

const open = ref(false);

const sites = useLocalStorage<ISite[]>('my-sites',[])


const onClose = (site:ISite) =>{
  sites.value = sites.value.filter(item=> item.href !== site.href)
}


const onAdd = () =>{
  open.value = true
}

const formState = reactive<ISiteFormState>({
  href: '',
  title: '',
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
    }).catch((error:any) => {
      console.warn('error', error);
    });
}

onMounted(() => {
  sites.value.forEach((item) => {
    if(!item.src) {
      item.src = faviconURL(item.href);
    }
  });
});
</script>

<style scoped lang="postcss">
.web-navi {
  padding-top: 25vh;
  padding-left: 20vw;
  padding-right: 20vw;
}
.list {
  background-color: rgba(242, 241, 240, 0.6);
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
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
    &.add {
      padding-top: 0;
      &:hover {
        cursor: pointer;
        .plus{
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
</style>
