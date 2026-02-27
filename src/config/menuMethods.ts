import type { MenuMethod } from '@/types/menu'

/**
 * 预设的 LINE 设置菜单方法
 * 在此维护所有可拖拽的「方法」，后续在 LIFF/业务中根据 actionKey 实现具体逻辑
 */
export const defaultMenuMethods: MenuMethod[] = [
  {
    id: 'openLiff',
    name: '打开 LIFF',
    description: '打开指定 LIFF 应用',
    actionKey: 'openLiff',
    icon: '📱',
  },
  {
    id: 'shareMessage',
    name: '分享讯息',
    description: '分享文字或图文到聊天',
    actionKey: 'shareMessage',
    icon: '💬',
  },
  {
    id: 'openSettings',
    name: '打开设定',
    description: '跳转至设定页',
    actionKey: 'openSettings',
    icon: '⚙️',
  },
  {
    id: 'scanQR',
    name: '扫 QR Code',
    description: '开启扫码',
    actionKey: 'scanQR',
    icon: '📷',
  },
  {
    id: 'openExternal',
    name: '开启外部连结',
    description: '在浏览器打开连结',
    actionKey: 'openExternal',
    icon: '🔗',
  },
]
