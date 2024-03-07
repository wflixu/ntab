<template>
  <div class="bookmarks" :class="{
    expend: expend,
  }">
    <div v-if="expend" class="tree-box">
      <a-directory-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys" multiple :fieldNames="{
        url: 'key',
      }" :tree-data="treeData" @select="onSelect"></a-directory-tree>
    </div>
    <div class="icon expend" v-else @click="onExpend">
      <MenuUnfoldOutlined :style="iconStyle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons-vue";
import type { TreeProps } from "ant-design-vue";
import type { DataNode } from "ant-design-vue/es/tree";

import { useLayoutStore } from '../../stores/layout'
import {browser} from 'wxt/browser'
const layoutStore = useLayoutStore();
const expend = computed(() => {
  return layoutStore.showBookmark;
});

const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
let treeData: any[] = []

if (browser.bookmarks) {
  
  browser.bookmarks.getTree((tree) => {
    // @ts-nocheck
    treeData = (tree[0].children )[0].children ?? [];
  });
}


const iconStyle = {
  fontSize: "24px",
  color: "blue",
};

const onExpend = () => {
  layoutStore.toggleShowBookmark();
  layoutStore.toggleShowBackend(true);
};
const onSelect = (keys: any, { node, children }: any) => {
  if (!children && node.dataRef.url) {
    window.open(node.dataRef.url, '_blank')
  }
}
</script>

<style scoped>
.bookmarks {
  position: absolute;
  top: 24px;
  left: 0px;
  width: 42px;
  height: 42px;
}

.bookmarks.expend {
  width: 300px;
  height: 80vh;
  background-color: antiquewhite;
  border-radius: 4px;
  box-shadow: 0 0 5px #aaa;
}

.tree-box {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.icon {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  z-index: 100;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.icon.close {
  right: 0;
  left: auto;
}
</style>
