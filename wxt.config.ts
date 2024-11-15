import { defineConfig } from "wxt";
import vue from "@vitejs/plugin-vue";

// See https://wxt.dev/api/config.html
export default defineConfig({
  imports: {
    addons: {
      vueTemplate: true,
    },
  },
  icons: {
    16: "/icon/16.png",
    32: "/icon/32.png",
    36: "/icon/36.png",
    48: "/icon/48.png",
    96: "/icon/96.png",
    128: "/icon/128.png",
  },
  manifest: {
    description: "NewTab Page",
    permissions: [
      "storage",
      "tabs",
      "bookmarks",
      "history",
      "favicon",
      "topSites",
      "webRequest",
      "tabs",
      "sessions",
    ],
    "host_permissions": [
      "*://dailybing.com/*",
      "https://global.bing.com/*"
    ],
  },
  vite: () => ({
    plugins: [vue()],
  }),
});
