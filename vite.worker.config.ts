/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        dts({
            tsconfigPath: './tsconfig.json',
            include: ['src/**/*.{vue,ts}'],
        }),
    ],
    // 打包配置
    build: {
        // 打包后的文件输出目录
        outDir: 'dist/worker',
        lib: {
            entry: './src/worker.ts',
            name: 'ThreePCB',
            formats: ['es', 'cjs', 'umd'],
            fileName: (format, entryName) => {
                switch (format) {
                    // ES Module 格式的文件名
                    case 'es':
                        return `${entryName}.${format}.mjs`
                    // CommonJS 格式的文件名
                    case 'cjs':
                        return `${entryName}.${format}`
                    // UMD 格式的文件名
                    default:
                        return `${entryName}.${format}.js`
                }
            },
        },
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            output: {
                exports: 'named',
            },
        },
        minify: true,
    },
})
