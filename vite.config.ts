/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      include: ['src/**/*.{vue,ts}'],
    }),
  ],
  // 打包配置
  build: {
    // 打包后的文件输出目录
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      name: 'ThreePCB',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        switch (format) {
          // ES Module 格式的文件名
          case 'es':
            return 'index.mjs'
          // CommonJS 格式的文件名
          case 'cjs':
            return 'index.cjs'
          // UMD 格式的文件名
          default:
            return 'index.min.js'
        }
      },
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        exports: 'named',
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
    },
    minify: true,
  },
})
