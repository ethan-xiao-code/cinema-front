import { defineStore } from "pinia";
import { RouteLocationNormalizedLoaded } from "vue-router";

export const useTagsViewStore = defineStore("tagsView", {
  state: () => ({
    cachedNames: [] as string[], // keep-alive 缓存组件名
  }),
  actions: {
    addCachedView(route: RouteLocationNormalizedLoaded) {
      if (route.name && !this.cachedNames.includes(route.name.toString())) {
        this.cachedNames.push(route.name.toString());
      }
    },
    removeCachedView(route: RouteLocationNormalizedLoaded) {
      if (!route.name) return;
      this.cachedNames = this.cachedNames.filter(
        (name) => name !== route.name?.toString()
      );
    },
    resetCachedViews() {
      this.cachedNames = [];
    },
  },
});