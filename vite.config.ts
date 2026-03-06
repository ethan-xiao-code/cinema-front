import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import pxtorem from 'postcss-pxtorem'
import { codeInspectorPlugin } from 'code-inspector-plugin';
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    vue(),
    codeInspectorPlugin({
      bundler: 'vite',
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()], // 按需导入elementplus组件
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    viteImagemin({
      webp: { // 将打包后的图片统一转化成webp，减少图片体积
        quality: 75, // 压缩质量 0-100
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')  // 配置别名路径
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'] // 文件扩展名解析顺序
  },
  server: {
    port: 8088,
    host: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    },
    proxy: {
      '/api': {
        // target: 'http://106.52.252.158:8080', // 上线环境
        target: 'http://localhost:8080', // 本地环境
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')  // 修正：参数名避免使用单个字母
      }
    }
  },

})
