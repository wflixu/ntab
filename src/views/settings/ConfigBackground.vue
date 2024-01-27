<template>
    <div class="background">
        <div class="box">
            <div class="item" v-for="item in imgs">
                <img :src="item" alt="">
                <div class="selection" @click="selectBg(item)">
                    <CheckCircleOutlined :style="{
                        'fontSize': '28px',
                        'color': curBg === item ? '#6081FC' : '#ddd'
                    }" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { CheckCircleOutlined } from "@ant-design/icons-vue"
import { useLayoutStore } from '../../stores/layout'

const layoutStore = useLayoutStore()
const imgs = ref<string[]>([])


const curBg = computed(() => {
    return layoutStore.bgurl;
})
const circleStyle = reactive({
    fontSize: '28px',
    color: '#ddd'
})

const selectBg = (url: string) => {
    layoutStore.setBgurl(url)
}

fetch('https://api.wflixu.cn/chunk/imgs').then(response => {
    return response.json()
}).then(res => {
    console.log(res)
    if (res.code == 200 && Array.isArray(res.data)) {
        imgs.value = res.data.map(item => {
            return `https://api.wflixu.cn/chunk/show?id=${item.id}`
        })
    }
})
    .catch(err => {
        console.log(err)
    })


</script>

<style scoped>
.background {
    .box {
        display: flex;
        flex-wrap: wrap;
        gap: 20px 16px;

        .item {
            width: 240px;
            height: 160px;
            box-shadow: 0 0 5px #999;
            position: relative;

            img {
                width: 100%;
                height: 100%;
                -o-object-fit: cover;
            }

            &:hover .selection {
                display: flex;
            }

            .selection {
                /* display: none; */
                display: flex;
                justify-content: center;
                align-items: center;
                position: absolute;
                cursor: pointer;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 42px;
                height: 42px;
                border-radius: 2px;
                background-color: rgba(10, 10, 10, 0.4);
            }
        }
    }
}
</style>