<template>
    <div class="command-tips">
        <div class="item">
             <span>显示书签</span>
             <span>⌘ + ⇧ + B</span>
        </div>
        <div class="item">
             <span>历史记录</span>
             <span>⌘ + Y</span>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.command-tips {
    position: fixed;
    top:16px;
    left: 24px;
}
.item {
    height: 32px;
    color: #aaa;
    display: flex;
    font-size: 18px;
    justify-content: space-between;
    align-items: center;
    width: 200px;
}
</style>