/**
 * LINE 设置菜单 - 方法项
 * 在此定义所有可被拖拽到菜单中的「方法」
 */
export interface MenuMethod {
  id: string
  name: string
  description?: string
  /** 执行逻辑的 key，后续在 liff 或业务里根据此 key 调用对应实现 */
  actionKey: string
  /** 可选：图标或排序用 */
  icon?: string
}

/**
 * 已选入当前菜单的项（可含顺序与简单配置）
 * menuId 用于拖拽列表的唯一 key
 */
export interface MenuItem extends MenuMethod {
  menuId: string
  order: number
}

/**
 * 预设的菜单方法池 - 你可以在 src/config/menuMethods.ts 中扩展
 */
export type MenuMethodId = 'openLiff' | 'shareMessage' | 'openSettings' | 'scanQR' | 'openExternal'
