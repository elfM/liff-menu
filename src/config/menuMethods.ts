import type { MenuMethod } from '@/types/menu'

/**
 * 菜单方法配置：与 src/core/richMenuApi.ts 导出的接口一一对应
 * actionKey 即 API 方法名，用于按顺序执行时调用
 */
export const defaultMenuMethods: MenuMethod[] = [
  // ---------- Rich menu 主接口 ----------
  {
    id: 'createRichMenu',
    name: '创建 Rich Menu',
    description: 'POST /v2/bot/richmenu',
    actionKey: 'createRichMenu',
  },
  {
    id: 'validateRichMenu',
    name: '校验 Rich Menu 对象',
    description: 'POST /v2/bot/richmenu/validate',
    actionKey: 'validateRichMenu',
  },
  {
    id: 'setRichMenuImage',
    name: '上传 Rich Menu 图片',
    description: 'POST /v2/bot/richmenu/[id]/content',
    actionKey: 'setRichMenuImage',
  },
  {
    id: 'getRichMenuImage',
    name: '下载 Rich Menu 图片',
    description: 'GET /v2/bot/richmenu/[id]/content',
    actionKey: 'getRichMenuImage',
  },
  {
    id: 'getRichMenuList',
    name: '获取 Rich Menu 列表',
    description: 'GET /v2/bot/richmenu/list',
    actionKey: 'getRichMenuList',
  },
  {
    id: 'getRichMenu',
    name: '获取单个 Rich Menu',
    description: 'GET /v2/bot/richmenu/[id]',
    actionKey: 'getRichMenu',
  },
  {
    id: 'deleteRichMenu',
    name: '删除 Rich Menu',
    description: 'DELETE /v2/bot/richmenu/[id]',
    actionKey: 'deleteRichMenu',
  },
  {
    id: 'setDefaultRichMenu',
    name: '设为默认 Rich Menu',
    description: 'POST /v2/bot/user/all/richmenu/[id]',
    actionKey: 'setDefaultRichMenu',
  },
  {
    id: 'getDefaultRichMenuId',
    name: '获取默认 Rich Menu ID',
    description: 'GET /v2/bot/user/all/richmenu',
    actionKey: 'getDefaultRichMenuId',
  },
  {
    id: 'cancelDefaultRichMenu',
    name: '取消默认 Rich Menu',
    description: 'DELETE /v2/bot/user/all/richmenu',
    actionKey: 'cancelDefaultRichMenu',
  },
  // ---------- Per-user rich menu ----------
  {
    id: 'linkRichMenuToUser',
    name: '为用户绑定 Rich Menu',
    description: 'POST /v2/bot/user/[userId]/richmenu/[richMenuId]',
    actionKey: 'linkRichMenuToUser',
  },
  {
    id: 'bulkLinkRichMenu',
    name: '批量绑定 Rich Menu',
    description: 'POST /v2/bot/richmenu/bulk/link',
    actionKey: 'bulkLinkRichMenu',
  },
  {
    id: 'getRichMenuIdOfUser',
    name: '获取用户当前 Rich Menu ID',
    description: 'GET /v2/bot/user/[userId]/richmenu',
    actionKey: 'getRichMenuIdOfUser',
  },
  {
    id: 'unlinkRichMenuFromUser',
    name: '解除用户 Rich Menu',
    description: 'DELETE /v2/bot/user/[userId]/richmenu',
    actionKey: 'unlinkRichMenuFromUser',
  },
  {
    id: 'bulkUnlinkRichMenu',
    name: '批量解除 Rich Menu',
    description: 'POST /v2/bot/richmenu/bulk/unlink',
    actionKey: 'bulkUnlinkRichMenu',
  },
  {
    id: 'richMenuBatch',
    name: 'Rich Menu 批量操作',
    description: 'POST /v2/bot/richmenu/batch',
    actionKey: 'richMenuBatch',
  },
  {
    id: 'getRichMenuBatchProgress',
    name: '查询批量操作进度',
    description: 'GET /v2/bot/richmenu/progress/batch',
    actionKey: 'getRichMenuBatchProgress',
  },
  {
    id: 'validateRichMenuBatch',
    name: '校验批量操作请求',
    description: 'POST /v2/bot/richmenu/validate/batch',
    actionKey: 'validateRichMenuBatch',
  },
  // ---------- Rich menu alias ----------
  {
    id: 'createRichMenuAlias',
    name: '创建 Rich Menu 别名',
    description: 'POST /v2/bot/richmenu/alias',
    actionKey: 'createRichMenuAlias',
  },
  {
    id: 'deleteRichMenuAlias',
    name: '删除 Rich Menu 别名',
    description: 'DELETE /v2/bot/richmenu/alias/[aliasId]',
    actionKey: 'deleteRichMenuAlias',
  },
  {
    id: 'updateRichMenuAlias',
    name: '更新 Rich Menu 别名',
    description: 'POST /v2/bot/richmenu/alias/[aliasId]',
    actionKey: 'updateRichMenuAlias',
  },
  {
    id: 'getRichMenuAlias',
    name: '获取 Rich Menu 别名信息',
    description: 'GET /v2/bot/richmenu/alias/[aliasId]',
    actionKey: 'getRichMenuAlias',
  },
  {
    id: 'getRichMenuAliasList',
    name: '获取 Rich Menu 别名列表',
    description: 'GET /v2/bot/richmenu/alias/list',
    actionKey: 'getRichMenuAliasList',
  },
]
