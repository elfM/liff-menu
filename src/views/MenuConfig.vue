<template>
  <div class="menu-config">
    <header class="header">
      <h1>{{ title }}</h1>
      <p class="subtitle">
        左侧为 LINE 菜单接口方法，拖拽到右侧排列；右侧顺序即<strong>同步执行顺序</strong>，同一方法可重复拖入
      </p>
    </header>

    <section class="token-section">
      <label class="token-label">Channel Access Token</label>
      <textarea
        v-model="accessTokenValue"
        class="token-input"
        placeholder="从 LINE Developers Console 获取的 Channel Access Token"
        autocomplete="off"
      ></textarea>
      <p class="token-hint">所有 Rich Menu 接口的请求头将使用此处输入的 Token</p>
    </section>

    <div class="panels">
      <section class="panel panel-available">
        <h2>LINE 菜单方法</h2>
        <VueDraggable
          v-model="availableMethods"
          :group="{ name: 'menu', pull: 'clone', put: false }"
          :clone="cloneMethod"
          :animation="150"
          class="drag-list-wrap drag-list"
          ghost-class="ghost"
          chosen-class="chosen"
          @clone="onClone"
        >
          <div
            v-for="item in availableMethods"
            :key="item.id"
            class="drag-item"
          >
            <div class="info">
              <span class="name">{{ item.name }}</span>
              <span v-if="item.description" class="desc">{{ item.description }}</span>
            </div>
          </div>
        </VueDraggable>
      </section>

      <section class="panel panel-menu">
        <h2>执行顺序（按此顺序同步执行）</h2>
        <VueDraggable
          v-model="menuItems"
          group="menu"
          :animation="150"
          class="drag-list-wrap drag-list"
          ghost-class="ghost"
          chosen-class="chosen"
        >
          <div
            v-for="(item, index) in menuItems"
            :key="item.menuId"
            class="drag-item"
          >
            <span class="order">{{ index + 1 }}</span>
            <div class="info">
              <span class="name">{{ item.name }}</span>
              <!-- 上传 Rich Menu 图片：需配置 richMenuId 并选择图片 -->
              <div v-if="item.actionKey === 'setRichMenuImage'" class="item-params">
                <input
                  v-model="richMenuIdByMenuId[item.menuId]"
                  type="text"
                  class="param-input"
                  placeholder="Rich Menu ID"
                />
                <label class="file-label">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    class="file-input"
                    @change="onSetRichMenuImageFile($event, item.menuId)"
                  />
                  <span class="file-label-text">{{ imageFileByMenuId[item.menuId]?.name || '选择图片 (JPEG/PNG)' }}</span>
                </label>
              </div>
            </div>
          </div>
        </VueDraggable>
      </section>
    </div>

    <footer class="footer">
      <button type="button" class="btn" @click="copyConfig">复制配置 JSON</button>
      <button type="button" class="btn btn-run" :disabled="!hasToken || running" @click="runSequence">
        {{ running ? '执行中…' : '按顺序执行' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="downloadLog">下载完整日志</button>
      <section v-if="runLogs.length > 0" class="run-logs">
        <h3 class="run-logs-title">执行记录（成功 / 失败均会记录）</h3>
        <ul class="run-logs-list">
          <li
            v-for="(entry, index) in runLogs"
            :key="index"
            class="run-log-item"
            :class="entry.success ? 'run-log-success' : 'run-log-fail'"
          >
            <span class="run-log-time">{{ entry.time }}</span>
            <span class="run-log-badge">{{ entry.success ? '成功' : '失败' }}</span>
            <span class="run-log-name">{{ entry.name }}</span>
            <span class="run-log-msg">{{ entry.message }}</span>
            <span v-if="entry.detail" class="run-log-detail">{{ entry.detail }}</span>
          </li>
        </ul>
      </section>
      <p class="footer-hint">配置中的 <code>items</code> 即按顺序同步执行的方法列表</p>
      <pre class="config-preview">{{ exportConfig }}</pre>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { MenuMethod, MenuItem } from '@/types/menu'
import { defaultMenuMethods } from '@/config/menuMethods'
import {
  createRichMenuConfig,
  getRichMenuList,
  getRichMenuAliasList,
  getRichMenu,
  deleteRichMenuById,
  getDefaultRichMenuId,
  cancelDefaultRichMenu,
  getRichMenuAlias,
  setRichMenuImage,
  apiLogger,
} from '@/core'

const title = ref('LINE 设置菜单 - 拖拽配置')

/** 用户输入的 Channel Access Token，用于所有 Rich Menu 接口请求头 */
const accessTokenValue = ref('')
const running = ref(false)

/** 执行记录：成功与失败均写入，用于页面展示与下载日志 */
interface RunLogEntry {
  time: string
  name: string
  actionKey: string
  success: boolean
  message: string
  detail?: string
}
const runLogs = ref<RunLogEntry[]>([])

const hasToken = computed(() => accessTokenValue.value.trim().length > 0)

// 导出配置：items 按当前顺序，即同步执行顺序
const exportConfig = computed(() => ({
  title: title.value,
  items: menuItems.value.map(({ id, name, actionKey }, index) => ({
    id,
    name,
    actionKey,
    order: index,
  })),
  _comment: 'items 按 order 顺序同步执行',
}))

function copyConfig() {
  const { _comment, ...rest } = exportConfig.value
  const json = JSON.stringify(rest, null, 2)
  navigator.clipboard.writeText(json).then(() => {
    alert('已复制到剪贴簿')
  })
}

function formatLogTime(): string {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0')
}

// 左侧：LINE 菜单接口相关方法（可选方法池）
const availableMethods = ref<MenuMethod[]>([])

// 右侧：当前菜单顺序，按此顺序同步执行
const menuItems = ref<MenuItem[]>([])

/** 上传 Rich Menu 图片：按 menuId 存储用户选择的图片文件（仅 setRichMenuImage 使用） */
const imageFileByMenuId = ref<Record<string, File>>({})
/** 上传 Rich Menu 图片：按 menuId 存储用户输入的 richMenuId */
const richMenuIdByMenuId = ref<Record<string, string>>({})

function init() {
  try {
    availableMethods.value = Array.isArray(defaultMenuMethods) ? [...defaultMenuMethods] : []
    menuItems.value = []
  } catch (e) {
    console.error('MenuConfig init error:', e)
    availableMethods.value = []
    menuItems.value = []
  }
}

// 克隆计数，保证每次拖入的 menuId 唯一
let cloneCounter = 0

// 从左侧拖到右侧时克隆，并生成唯一 menuId
function cloneMethod(el: MenuMethod): MenuItem {
  cloneCounter += 1

  const newItem = {
    ...el,
    menuId: `menu-${el.id}-${cloneCounter}-${Date.now()}`,
  }

  return newItem
}

function onClone(event: any) {
  console.log(event)
  console.log('menu', menuItems)
}

/** 用户为「上传 Rich Menu 图片」选择了文件时，按 menuId 存起来 */
function onSetRichMenuImageFile(event: Event, menuId: string) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    imageFileByMenuId.value = { ...imageFileByMenuId.value, [menuId]: file }
  }
}


/** 按右侧顺序执行：使用 input 中的 token 调用 Rich Menu API，成功/失败均记录并展示 */
async function runSequence() {
  const token = accessTokenValue.value.trim()
  if (!token) {
    runLogs.value = [
      {
        time: formatLogTime(),
        name: '-',
        actionKey: '-',
        success: false,
        message: '请先输入 Channel Access Token',
      },
    ]
    return
  }
  const items = [...menuItems.value]
  if (items.length === 0) {
    runLogs.value = [
      {
        time: formatLogTime(),
        name: '-',
        actionKey: '-',
        success: false,
        message: '请先拖拽方法到右侧',
      },
    ]
    return
  }
  running.value = true
  runLogs.value = []

  const config = createRichMenuConfig(token)

  for (const item of items) {
    const time = formatLogTime()
    try {
      const extra = item as MenuItem & { richMenuId?: string; userId?: string; richMenuAliasId?: string }
      switch (item.actionKey) {
        case 'getRichMenuList': {
          const list = await getRichMenuList(config)
          const message = `共 ${list.length} 个菜单`
          const detail = list.length > 0 ? JSON.stringify(list.map((m) => ({ id: m.richMenuId, name: m.name })), null, 2) : undefined
          apiLogger.info(item.actionKey, message, { count: list.length })
          runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: true, message, detail })
          break
        }
        case 'getRichMenuAliasList': {
          const aliases = await getRichMenuAliasList(config)
          const message = `共 ${aliases.length} 个别名`
          const detail = aliases.length > 0 ? JSON.stringify(aliases, null, 2) : undefined
          apiLogger.info(item.actionKey, message, { count: aliases.length })
          runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: true, message, detail })
          break
        }
        case 'getRichMenu': {
          const richMenuId = extra.richMenuId
          if (!richMenuId) {
            runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: false, message: '需配置 richMenuId' })
            break
          }
          const menu = await getRichMenu(config, richMenuId)
          apiLogger.info(item.actionKey, '获取成功', menu)
          runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: true, message: menu.richMenuId, detail: JSON.stringify(menu, null, 2) })
          break
        }
        case 'deleteRichMenu': {
          const richMenuId = extra.richMenuId
          if (!richMenuId) {
            apiLogger.warn(item.actionKey, '跳过（需配置 richMenuId）')
            runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: false, message: '跳过', detail: '需在菜单项中配置 richMenuId' })
            break
          }
          const ok = await deleteRichMenuById(config, richMenuId)
          if (ok) {
            apiLogger.info(item.actionKey, `已删除: ${richMenuId}`, { richMenuId })
            runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: true, message: `已删除 ${richMenuId}` })
          } else {
            apiLogger.error(item.actionKey, `删除失败: ${richMenuId}`, { richMenuId })
            runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: false, message: '删除失败', detail: richMenuId })
          }
          break
        }
        case 'getDefaultRichMenuId': {
          const result = await getDefaultRichMenuId(config)
          const message = result ? `默认菜单: ${result.richMenuId}` : '未设置默认菜单'
          apiLogger.info(item.actionKey, message, result)
          runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: true, message, detail: result ? JSON.stringify(result) : undefined })
          break
        }
        case 'cancelDefaultRichMenu': {
          await cancelDefaultRichMenu(config)
          apiLogger.info(item.actionKey, '已取消默认 Rich Menu')
          runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: true, message: '已取消默认 Rich Menu' })
          break
        }
        case 'getRichMenuAlias': {
          const aliasId = extra.richMenuAliasId
          if (!aliasId) {
            runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: false, message: '需配置 richMenuAliasId' })
            break
          }
          const aliasInfo = await getRichMenuAlias(config, aliasId)
          apiLogger.info(item.actionKey, '获取成功', aliasInfo)
          runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: true, message: `${aliasInfo.alias} -> ${aliasInfo.richMenuId}`, detail: JSON.stringify(aliasInfo, null, 2) })
          break
        }
        case 'setRichMenuImage': {
          const richMenuId = richMenuIdByMenuId.value[item.menuId]?.trim() || extra.richMenuId
          const imageFile = imageFileByMenuId.value[item.menuId]
          if (!richMenuId) {
            runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: false, message: '需配置 Rich Menu ID' })
            break
          }
          if (!imageFile) {
            runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: false, message: '请选择要上传的图片 (JPEG/PNG)' })
            break
          }
          await setRichMenuImage(config, richMenuId, imageFile)
          apiLogger.info(item.actionKey, `已上传图片: ${richMenuId}`, { fileName: imageFile.name })
          runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: true, message: `已上传图片至 ${richMenuId}`, detail: imageFile.name })
          break
        }
        default: {
          const message = `需在业务中配置参数或暂不支持在此执行（actionKey: ${item.actionKey}）`
          apiLogger.warn(item.actionKey, message)
          runLogs.value.push({ time, name: item.name, actionKey: item.actionKey, success: false, message })
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      apiLogger.error(item.actionKey, msg, err)
      runLogs.value.push({
        time,
        name: item.name,
        actionKey: item.actionKey,
        success: false,
        message: msg,
        detail: err instanceof Error ? err.stack : undefined,
      })
    }
  }
  running.value = false
}

function downloadLog() {
  apiLogger.downloadLogFile()
}

init()
</script>

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

.subtitle strong {
  color: #333;
}

.token-section {
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.token-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.token-input {
  width: 100%;
  max-width: 480px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.token-input::placeholder {
  color: #999;
}

.token-hint {
  margin-top: 0.35rem;
  font-size: 0.8rem;
  color: #666;
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

.drag-list-wrap {
  min-height: 120px;
}

.drag-list {
  min-height: 100px;
}

.drag-list-empty {
  padding: 1rem;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  border: 1px dashed #ccc;
  border-radius: 6px;
  background: #fafafa;
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

.item-params {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  align-items: center;
}

.param-input {
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 10rem;
}

.file-label {
  cursor: pointer;
  font-size: 0.8rem;
  color: #06c755;
}

.file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.file-label-text {
  text-decoration: underline;
}

.file-label-text:hover {
  color: #05b04c;
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

.footer-hint {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.footer-hint code {
  background: #eee;
  padding: 0.1em 0.3em;
  border-radius: 4px;
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

.btn-run {
  margin-left: 0.5rem;
}

.btn-run:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  margin-left: 0.5rem;
  background: #666;
}

.btn-secondary:hover {
  background: #555;
}

.btn-submit {
  background: #06c755;
  margin-right: 1rem;
}

.btn-submit:hover {
  background: #05b04c;
}

.btn-modify {
  background: #fff;
  color: #05b04c;
  border: 1px solid #05b04c;
}

.btn-modify:hover {
  background: #e8f5e9;
}

.run-logs {
  margin-top: 1rem;
  padding: 1rem;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.run-logs-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
}

.run-logs-list {
  list-style: none;
}

.run-log-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.35rem;
  border-radius: 6px;
  font-size: 0.85rem;
}

.run-log-success {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.run-log-fail {
  background: #ffebee;
  border-left: 4px solid #f44336;
}

.run-log-time {
  color: #666;
  font-family: monospace;
  min-width: 5rem;
}

.run-log-badge {
  font-weight: 600;
  min-width: 2.5rem;
}

.run-log-success .run-log-badge {
  color: #2e7d32;
}

.run-log-fail .run-log-badge {
  color: #c62828;
}

.run-log-name {
  font-weight: 500;
  color: #333;
}

.run-log-msg {
  color: #555;
}

.run-log-detail {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.35rem;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 8rem;
  overflow-y: auto;
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
