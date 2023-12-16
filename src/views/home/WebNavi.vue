<template>
  <div class="web-navi">
    <div class="list">
      <div class="item" v-for="site in sites">
        <h3 class="site-title">{{site.title}}</h3>
        <iframe
          :src="site.href"
          frameborder="0"
          width="300"
          height="200"
          scrolling="no"
        ></iframe>
        <a target="_blank" :href="site.href"> </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const sites = ref([
  {
    title: "npm",
    href: "https://www.npmjs.com/",
  },
  {
    title: "npmmirror",
    href: "https://npmmirror.com/",
  },
  {
    title: "一言",
    href: "https://yiyan.baidu.com/",
  },
]);
</script>

<style scoped lang="postcss">
.web-navi {
  padding: 8px;
  margin-top: 42px
}
.list {
  display: flex;
  flex-wrap: nowrap;
  gap: 24px 16px;
  .item {
    width: 300px;
    height: 200px;
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 0 5px #999;
    &:hover {
        box-shadow: 0 5px 10px #999;
    }
    .site-title {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 32px;
        display: flex;
        align-items: center;
        padding-left: 16px;
        border-bottom:  1px solid #aaa;
        background-color: rgba(125,125,125, 0.3);
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
