// src\index.ts
import { App } from 'vue'
import ThreePCB from './components/ThreePCB.vue'

export { ThreePCB } //实现按需引入*

export default {
  install(app: App) {
    app.component('ThreePCB', ThreePCB) // 注册组件
  },
} // 批量的引入*

declare module 'vue' {
  export interface GlobalComponents {
    ThreePCB: typeof ThreePCB
  }
}
