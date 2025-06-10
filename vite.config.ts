import { defineConfig } from "vite";

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Removed global variables import to prevent circular dependencies
      },
    },
  },
});
