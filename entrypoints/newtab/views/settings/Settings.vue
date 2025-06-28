<template>
    <div class="settings " :class="{ 'expand': open }">
        <span class="icon" @click="onToggle">
            <i class="pi pi-cog" :style="iconStyle"></i>
        </span>
        <Drawer v-model:visible="open" header="设置" :modal="true" :style="{ width: '810px' }" position="right" @after-hide="afterOpenChange(false)" @show="afterOpenChange(true)">
            <Tabs :value="activeKey">
                <TabList>
                    <Tab value="bg">背景</Tab>
                    <Tab value="bookmark">书签同步</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="bg">
                        <ConfigBackground />
                    </TabPanel>
                    <TabPanel value="bookmark">
                        <ConfigBookmark />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Drawer>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Drawer from 'primevue/drawer';
import ConfigBackground from './ConfigBackground.vue'
import ConfigBookmark from "./ConfigBookmark.vue";


const open = ref<boolean>(false);
const iconStyle = {
    fontSize: '24px',
    color: '#eee'
}

const activeKey = ref('bg')

const onToggle = () => {
    open.value = !open.value
}

const afterOpenChange = (bool: boolean) => {
    console.log('open', bool);
};
</script>

<style scoped>
.settings {
    position: fixed;
    width: 42px;
    height: 42px;
    bottom: 24px;
    left: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(1, 1, 1, 0.4);
    border-radius: 4px;
    cursor: pointer;

    .icon {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }
}
</style>