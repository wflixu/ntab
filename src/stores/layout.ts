import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useLayoutStore = defineStore("layout", () => {
  const showBookmark = ref(false);
  const showBackend = ref(false);

  const toggleShowBookmark = (v?: boolean) => {
    showBookmark.value = v ?? !showBookmark.value;
  };
  const toggleShowBackend = (v?: boolean) => {
    showBackend.value = v ?? !showBackend.value;
  };
  return { showBookmark, showBackend, toggleShowBookmark, toggleShowBackend };
});
