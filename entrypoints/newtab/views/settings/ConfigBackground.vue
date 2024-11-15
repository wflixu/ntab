<template>
    <div class="background">
        <h2 class="title">当天壁纸（每日更新）</h2>
        <div class="box">
            <div class="item" >
                <img :src="todayPic" alt="">
                <div class="selection" @click="selectBg(todayPic)">
                    <CheckCircleOutlined :style="{
                        'fontSize': '28px',
                        'color': curBg === todayPic ? '#CB591A' : '#ddd'
                    }" />
                </div>
            </div>
            
        </div>
        <h2 class="title">最近6天的壁纸</h2>
        <div class="box">
           
            <div class="item" v-for="item in pics">
                <img :src="item" alt="">
                <div class="selection" @click="selectBg(item)">
                    <CheckCircleOutlined :style="{
                        'fontSize': '28px',
                        'color': curBg === item ? '#CB591A' : '#ddd'
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
import dayjs from 'dayjs';

const layoutStore = useLayoutStore()
const imgs = ref<string[]>([])

const todayPic = 'https://api.wflixu.cn/wallpaper'
// 生成一个包含日期格式 为 yyyyMMdd 格式的日期数组，今天之前6天的日期
const pics: string[] = [] = [
    dayjs().subtract(1, 'day'),
    dayjs().subtract(2, 'day'),
    dayjs().subtract(3, 'day'),
    dayjs().subtract(4, 'day'),
    dayjs().subtract(5, 'day'),
    dayjs().subtract(6, 'day'),
].map((date, index) => {
    return `${todayPic}/${date.format('YYYYMMDD')}/zh-cn/FHD`
})

console.log(pics)


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
    .title {
        height: 56px;
        display: flex;
        align-items: flex-end;
        border-bottom: 2px solid #ddd;
        font-size: 18px;
    }
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
                border-radius: 2px;
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