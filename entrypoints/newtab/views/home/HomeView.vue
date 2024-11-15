<template>
  <div class="page">
    <MaskLayer/>
    <SearchBox />
    <WebNavi />
    <Settings />
    <CommandTips />
    <img :src="bgurl" alt="" class="hidebg" @load="onLoad" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";

import WebNavi from './WebNavi.vue'
import Settings from "../settings/Settings.vue";
import CommandTips from "./CommandTips.vue";
import SearchBox from "./SearchBox.vue";
import MaskLayer from "./MaskLayer.vue";
import { useLayoutStore } from '../../stores/layout'

const layoutStore = useLayoutStore();

const bgurl = computed(() => {
  console.log('bgurl', layoutStore.bgurl)
  return `url(${layoutStore.bgurl})`
})

const onLoad = (event: Event) => {
  console.log('bg loaded', event.target)

}
</script>

<style scoped >
.page {
  position: relative;
  background-image: v-bind("bgurl");
  background-size: cover;
  height: 100vh;
  padding-top: 15vh;
}



</style>
