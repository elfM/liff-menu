/**
 * LINE 设置菜单 - 方法项
 * 与 src/core/richMenuApi.ts 导出的接口对应，actionKey 即 API 方法名
 */
export interface MenuMethod {
  id: string
  name: string
  description?: string
  /** 执行逻辑的 key，对应 richMenuApi 中的方法名 */
  actionKey: string
}

/**
 * 已选入当前菜单的项（可含顺序与简单配置）
 * menuId 用于拖拽列表的唯一 key
 */
export interface MenuItem extends MenuMethod {
  menuId: string
}

/** 菜单方法 id / actionKey 与 richMenuApi 方法名一致 */
export type MenuMethodId =
  | 'createRichMenu'
  | 'validateRichMenu'
  | 'setRichMenuImage'
  | 'getRichMenuImage'
  | 'getRichMenuList'
  | 'getRichMenu'
  | 'deleteRichMenu'
  | 'setDefaultRichMenu'
  | 'getDefaultRichMenuId'
  | 'cancelDefaultRichMenu'
  | 'linkRichMenuToUser'
  | 'bulkLinkRichMenu'
  | 'getRichMenuIdOfUser'
  | 'unlinkRichMenuFromUser'
  | 'bulkUnlinkRichMenu'
  | 'richMenuBatch'
  | 'getRichMenuBatchProgress'
  | 'validateRichMenuBatch'
  | 'createRichMenuAlias'
  | 'deleteRichMenuAlias'
  | 'updateRichMenuAlias'
  | 'getRichMenuAlias'
  | 'getRichMenuAliasList'
