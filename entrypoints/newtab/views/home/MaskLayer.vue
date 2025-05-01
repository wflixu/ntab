<template>
    <div class="backend" @click="onClickBackend" v-if="layoutStore.showBackend">
    </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from '../../stores/layout'

const layoutStore = useLayoutStore();
/**
 * Handles the click event on the backend layer.
 */
const onClickBackend = (): void => {
    layoutStore.toggleShowBookmark(false);
    layoutStore.toggleShowBackend(false);
};
</script>

<style scoped>
.backend {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(100, 100, 100, 0.1);
}
</style>