import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MenuConfig from '@/views/MenuConfig.vue'
import Test from '@/views/Test.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'MenuConfig',
    component: MenuConfig,
    meta: { title: '菜单配置' },
  },
  {
    path: '/test',
    name: 'Test',
    component: Test,
    meta: { title: '测试' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
