import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFilmSearchStore = defineStore('filmSearch', () => {
  // 搜索关键词
  const title = ref<string>('');

  // 更新搜索关键词
  function setTitle(newTitle: string) {
    title.value = newTitle;
  }

  // 重置搜索
  function resetTitle() {
    title.value = '';
  }

  return {
    title,
    setTitle,
    resetTitle,
  };
});