<template>
  <div class="search-box">
    <div class="search-input">
      <form @submit="onEnter">
        <input type="text" :value="keyword" placeholder="请输入关键字" @input="onInput" @keyup.enter="" />
      </form>

      <div class="search-selector" @click.stop="onClickChangeSearch">
        <template v-if="currentEngine">
          <img :src="currentEngine.img" :alt="currentEngine.name" class="logo curr" />
        </template>
        <div class="arrow">
          <svg class="arrow-icon" width="10" height="6" viewBox="0 0 10 6" fill="#999" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.34919 5.71075C5.15303 5.91082 4.83089 5.91082 4.63494 5.71075L0.627304 1.61875C0.317409 1.30233 0.541867 0.768799 0.984877 0.768799L9.0045 0.7688C9.44751 0.7688 9.6714 1.30233 9.36117 1.61875L5.34919 5.71075Z">
            </path>
          </svg>
        </div>
      </div>
      <div class="clear" v-if="showClear" @click="onClear">
        <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" />
        </svg>
      </div>
      <ul class="engine-list" v-if="showEngineList">
        <template v-for="item in engineList">
          <li class="item" :class="{ active: engine == item.id }" @click="onClickEngine(item)">
            <img :src="item.img" :alt="item.name" class="logo" />
            <span class="title">{{ item.name }}</span>
            <img v-if="engine == item.id" class="icon-checked"
              src="https://lf-cdn-tos.bytescm.com/obj/static/xitu_extension/static/icon-checked.9de545ad.svg" />
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SEARCH_ENGINE_LIST } from '../../shared';
import { computed, ref } from 'vue';
import type { Engine } from './type';
import { useLayoutStore } from '../../stores/layout'

const layoutStore = useLayoutStore();

let keyword = ref("");
let storage = window.localStorage.getItem("engine");
let engine = ref(storage ?? "baidu");

let showEngineList = ref(false);

const showClear = computed(() => {
  return keyword.value.length > 0;
});

layoutStore.$onAction(({ name, store, args, after, onError }) => {
  after(() => {
    if (name === 'toggleShowBackend') {
      showEngineList.value = store.showBackend;
    }
  })
});

const engineList = ref<Engine[]>(SEARCH_ENGINE_LIST);



let currentEngine = computed(() => {
  return engineList.value.find((item) => {
    return item.id == engine.value;
  });
});
const onClickEngine = (item: any) => {

  engine.value = item.id;
  window.localStorage.setItem("engine", item.id);
  layoutStore.toggleShowBackend(false)
};
const onClickChangeSearch = () => {
  showEngineList.value = true;
  layoutStore.toggleShowBackend(true);
}

const onInput = (evt: any) => {
  keyword.value = evt.target?.value;
};
const onEnter = () => {


  if (currentEngine) {
    let url = currentEngine?.value?.target + keyword.value;
    window.open(url, "_blank");
  }
};

const onClear = () => {
  keyword.value = "";
};

</script>

<style scoped>
.search-box {
  display: flex;
  justify-content: center;

  .search-input {
    width: 40vw;
    position: relative;

    form {
      width: 100%;
      display: flex;

      input {
        /* background-color: aqua; */
        flex: 1;
        height: 42px;
        padding-left: 72px;
        padding-right: 40px;
        font-size: 20px;
        border: 1px solid #aaa;
        border-radius: 4px;
      }
    }

    .clear {
      position: absolute;
      right: 16px;
      top: 10px;
      height: 20px;
      width: 20px;
      background-color: #c9cdd4;
      color: white;
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      vertical-align: middle;
      cursor: pointer;
      &:hover svg {
        fill: #1e80ff;
      }
    }

    .search-selector {
      height: 100%;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      user-select: none;
      cursor: pointer;
      padding-bottom: 1px;
      padding-left: 0.5rem;
      display: flex;
      flex-direction: row;
      align-items: center;

      .logo {
        height: 32px;
        background: rgba(255, 255, 255, 0.3);
      }

      .arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        flex-basis: 2.5rem;
        width: 1.5rem;
        height: 1.5rem;
        transition: transform 0.15s linear;
        color: #c9cdd4;
      }
    }

    .engine-list {
      display: flex;
      flex-direction: row;
      z-index: 750;
      flex-wrap: wrap;
      justify-content: flex-start;
      position: absolute;
      top: 48px;
      left: 0;
      background-color: #fff;
      border-radius: 4px;
      width: 40vw;
      padding: 8px 8px 0 8px;

      .item {
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 90px;
        height: 90px;
        border-radius: 2px;
        font-size: 0.8333333333rem;
        color: var(--color-primary);
        margin-right: 8px;
        margin-bottom: 8px;

        img {
          width: 36px;
          height: auto;
          margin-bottom: 6px;
        }


        &:hover {
          background-color: #e8f3ff;
        }

        &.active {
          font-weight: 500;
          background-color: #e8f3ff;
          color: #1e80ff;
        }

        .icon-checked {
          position: absolute;
          right: 4px;
          top: 4px;
          background-size: 100%;
          width: 14px;
          height: 14px;
        }
      }
    }
  }
}

@media screen and (max-width: 1360px) {

  .search-input {
    width: 90vw;

    .engine-list {
      width: 90vw;
    }
  }

}
</style>