<template>
    <div class="settings " :class="{ 'expand': open }">
        <span class="icon" @click="onToggle">
            <SettingOutlined :style="iconStyle" />
        </span>
        <a-drawer v-model:open="open" title="设置" :width="810" placement="right" @after-open-change="afterOpenChange">
            <a-tabs v-model:activeKey="activeKey" type="card">
                <a-tab-pane key="bg" tab="背景">
                   
                </a-tab-pane>
            </a-tabs>
            <template v-if="activeKey == 'bg'">
                <ConfigBackground />
            </template>
        </a-drawer>
    </div>
</template>

<script setup lang="ts">
import { SettingOutlined } from "@ant-design/icons-vue"
import ConfigBackground from './ConfigBackground.vue'
import { ref } from "vue";


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