import { ref, computed } from "vue";
import { defineStore } from "pinia";
import defaultBgImg from '../assets/imgs/bg.jpg'
import { useLocalStorage } from '@vueuse/core'

const cachedBgUrl = window.localStorage.getItem('bg')

const cachedFolder = window.localStorage.getItem('sync-bookmark-folder')


export const useLayoutStore = defineStore("layout", () => {
  const showBookmark = ref(false);
  const showBackend = ref(false);

  const bgurl = ref(cachedBgUrl ?? defaultBgImg)

  const setBgurl = (url: string) => {
    bgurl.value = url;
    window.localStorage.setItem('bg', url)
  }
  const toggleShowBookmark = (v?: boolean) => {
    showBookmark.value = v ?? !showBookmark.value;
  };
  const toggleShowBackend = (v?: boolean) => {
    showBackend.value = v ?? !showBackend.value;
  };

  const syncBookmarkFolder = ref<string>(cachedFolder ?? "ntab");

  const setSyncBookmarkFolder = (folder: string) => {
    syncBookmarkFolder.value = folder;
    window.localStorage.setItem('sync-bookmark-folder', folder)
  }


  const syncBookmark = useLocalStorage<boolean>('syncBookmark', true)

  return {
    showBookmark, showBackend, toggleShowBookmark, toggleShowBackend,
    bgurl, setBgurl,
    syncBookmarkFolder,
    setSyncBookmarkFolder,
    syncBookmark

  };
});
