<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import type { MenuMethod, MenuItem } from '@/types/menu'
import { defaultMenuMethods } from '@/config/menuMethods'

const title = ref('LINE 设置菜单 - 拖拽配置')

// 左侧：可选方法池（尚未加入菜单的）
const availableMethods = ref<MenuMethod[]>([])

// 右侧：当前菜单顺序（已选入的项，带 order）
const menuItems = ref<MenuItem[]>([])

// 初始化：把预设方法放进「可选」，菜单为空
function init() {
  availableMethods.value = [...defaultMenuMethods]
  menuItems.value = []
}

// 从可选拖到菜单时，补上 menuId 与 order
function onAdd(ev: { item: HTMLElement; newIndex: number }) {
  const item = menuItems.value[ev.newIndex] as MenuItem
  if (item && !item.menuId) {
    item.menuId = `menu-${item.id}-${Date.now()}`
    item.order = ev.newIndex
  }
  reorderMenu()
}

// 菜单内排序后更新 order
function onMenuSort() {
  reorderMenu()
}

function reorderMenu() {
  menuItems.value = menuItems.value.map((item, index) => ({
    ...item,
    order: index,
  }))
}

// 导出配置（可存 localStorage 或发后端）
const exportConfig = computed(() => ({
  title: title.value,
  items: menuItems.value.map(({ id, name, actionKey, order }) => ({
    id,
    name,
    actionKey,
    order,
  })),
}))

function menuItemKey(el: MenuItem | MenuMethod): string {
  const item = el as MenuItem
  if (item.menuId) return item.menuId
  return `tmp-${item.id}-${Math.random().toString(36).slice(2)}`
}

function copyConfig() {
  const json = JSON.stringify(exportConfig.value, null, 2)
  navigator.clipboard.writeText(json).then(() => {
    alert('已复制到剪贴簿')
  })
}

init()
</script>

<template>
  <div class="menu-config">
    <header class="header">
      <h1>{{ title }}</h1>
      <p class="subtitle">左侧为可选方法，拖拽到右侧组成菜单顺序</p>
    </header>

    <div class="panels">
      <section class="panel panel-available">
        <h2>可选方法</h2>
        <draggable
          v-model="availableMethods"
          :group="{ name: 'menu', pull: 'clone', put: true }"
          item-key="id"
          class="drag-list"
          ghost-class="ghost"
          chosen-class="chosen"
          @end="onAdd"
        >
          <template #item="{ element }">
            <div class="drag-item">
              <span v-if="element.icon" class="icon">{{ element.icon }}</span>
              <div class="info">
                <span class="name">{{ element.name }}</span>
                <span v-if="element.description" class="desc">{{ element.description }}</span>
              </div>
            </div>
          </template>
        </draggable>
      </section>

      <section class="panel panel-menu">
        <h2>当前菜单顺序</h2>
        <draggable
          v-model="menuItems"
          group="menu"
          :item-key="menuItemKey"
          class="drag-list"
          ghost-class="ghost"
          chosen-class="chosen"
          @add="onAdd"
          @end="onMenuSort"
        >
          <template #item="{ element, index }">
            <div class="drag-item">
              <span class="order">{{ index + 1 }}</span>
              <span v-if="element.icon" class="icon">{{ element.icon }}</span>
              <div class="info">
                <span class="name">{{ element.name }}</span>
              </div>
            </div>
          </template>
        </draggable>
      </section>
    </div>

    <footer class="footer">
      <button type="button" class="btn" @click="copyConfig">复制配置 JSON</button>
      <pre class="config-preview">{{ exportConfig }}</pre>
    </footer>
  </div>
</template>

<style scoped>
.menu-config {
  min-height: 100vh;
  padding: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.header {
  margin-bottom: 1.5rem;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.subtitle {
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.9rem;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 640px) {
  .panels {
    grid-template-columns: 1fr;
  }
}

.panel {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}

.panel h2 {
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  color: #333;
}

.drag-list {
  min-height: 120px;
}

.drag-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  margin-bottom: 0.5rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: grab;
}

.drag-item:active {
  cursor: grabbing;
}

.drag-item .order {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #06c755;
  color: #fff;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.drag-item .icon {
  font-size: 1.25rem;
}

.drag-item .info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.drag-item .name {
  font-weight: 500;
}

.drag-item .desc {
  font-size: 0.75rem;
  color: #666;
}

.ghost {
  opacity: 0.5;
  background: #e8f5e9;
}

.chosen {
  background: #fff8e1;
}

.footer {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  background: #06c755;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.btn:hover {
  background: #05b04c;
}

.config-preview {
  font-size: 0.75rem;
  background: #f5f5f5;
  padding: 0.75rem;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
