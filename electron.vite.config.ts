import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        // 确保electron不被externalize，而是正确打包
        exclude: ['electron']
      })
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      // Element Plus 自动导入
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia']
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ],
    build: {
      // 代码分割配置
      rollupOptions: {
        output: {
          // 手动配置 chunk 分割策略
          manualChunks: (id) => {
            // 分离 node_modules 中的第三方库
            if (id.includes('node_modules')) {
              // Element Plus 单独打包
              if (id.includes('element-plus')) {
                return 'element-plus'
              }
              // ECharts 单独打包（体积较大）
              if (id.includes('echarts')) {
                return 'echarts'
              }
              // Vue 生态单独打包
              if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
                return 'vue-vendor'
              }
              // 其他第三方库
              return 'vendor'
            }
            // 非 node_modules 的代码不分割
            return undefined
          },
          // 优化 chunk 文件命名
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        },
        // Tree-shaking 优化
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false
        }
      },
      // 压缩配置（esbuild 速度更快，压缩率也足够好）
      minify: 'esbuild',
      // esbuild 压缩选项
      esbuild: {
        drop: ['console', 'debugger'], // 移除 console 和 debugger
        legalComments: 'none' // 移除注释
      },
      // 启用 CSS 代码分割
      cssCodeSplit: true,
      // 资源内联阈值（小于 2KB 的资源内联为 base64，减小文件数量）
      assetsInlineLimit: 2048,
      // 关闭 sourcemap 以减小体积
      sourcemap: false,
      // 启用 chunk 大小警告限制（帮助识别大文件）
      chunkSizeWarningLimit: 1000,
      // 启用 CSS 压缩
      cssMinify: true
    }
  }
})
