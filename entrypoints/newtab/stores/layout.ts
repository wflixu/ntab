import { ref, computed } from "vue";
import { defineStore } from "pinia";
import defaultBgImg from '../assets/imgs/bg.jpg'
const cachedBgUrl = window.localStorage.getItem('bg')


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
  return { showBookmark, showBackend, toggleShowBookmark, toggleShowBackend, bgurl, setBgurl };
});
