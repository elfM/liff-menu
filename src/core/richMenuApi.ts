/**
 * LINE Messaging API - Rich Menu 相关接口
 * 参考: https://developers.line.biz/en/reference/messaging-api/#rich-menu
 */
import { apiLogger } from './logger'

/** 开发：localhost:3001；生产：同源（''，由 Express 托管） */
const LINE_BASE =
  (import.meta.env.VITE_API_BASE ??
    (import.meta.env.DEV ? 'http://localhost:3001' : '')) + '/v2/bot'

/** 请求配置：headers 中的 Authorization 由用户输入的 Channel Access Token 填充 */
export interface RichMenuApiConfig {
  headers: HeadersInit
}

/** 根据 token 生成请求配置 */
export function createRichMenuConfig(token: string): RichMenuApiConfig {
  const t = token.trim()
  const auth = t.startsWith('Bearer ') ? t : `Bearer ${t}`
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
    },
  }
}

function createRequest(config: RichMenuApiConfig) {
  return (url: string, init?: RequestInit) =>
    fetch(url, {
      ...init,
      headers: { ...config.headers, ...(init?.headers as Record<string, string>) },
    })
}

function logAndThrow(api: string, message: string, response: Response, body: string): never {
  apiLogger.error(api, message, { status: response.status, body })
  throw new Error(`${message}: ${response.status} ${body}`)
}

function logAndReject(api: string, message: string, err: unknown): never {
  apiLogger.error(api, message, err)
  throw err
}

// ---------- Rich menu 对象类型（与文档一致）----------
export interface RichMenuArea {
  bounds: { x: number; y: number; width: number; height: number }
  action: unknown
}

export interface RichMenuRequestBody {
  size: { width: number; height: number }
  selected: boolean
  name: string
  chatBarText: string
  areas: RichMenuArea[]
}

export interface RichMenuResponse extends RichMenuRequestBody {
  richMenuId: string
}

export interface RichMenuListItem {
  richMenuId: string
  size: { width: number; height: number }
  selected: boolean
  name: string
  chatBarText: string
  areas: unknown[]
}

export interface RichMenuAliasItem {
  richMenuId: string
  alias: string
}

// ========== Rich menu 主接口 ==========

/** POST /v2/bot/richmenu - 创建 Rich Menu */
export async function createRichMenu(
  config: RichMenuApiConfig,
  body: RichMenuRequestBody
): Promise<{ richMenuId: string }> {
  const api = 'createRichMenu'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '创建 Rich Menu 失败', res, text)
    }
    return res.json()
  } catch (err) {
    logAndReject(api, '创建 Rich Menu 异常', err)
  }
}

/** POST /v2/bot/richmenu/validate - 校验 Rich Menu 对象 */
export async function validateRichMenu(
  config: RichMenuApiConfig,
  body: RichMenuRequestBody
): Promise<void> {
  const api = 'validateRichMenu'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/validate`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '校验 Rich Menu 失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '校验 Rich Menu 异常', err)
  }
}

/** POST /v2/bot/richmenu/{richMenuId}/content - 上传 Rich Menu 图片 */
export async function setRichMenuImage(
  config: RichMenuApiConfig,
  richMenuId: string,
  imageBlob: Blob
): Promise<void> {
  const api = 'setRichMenuImage'
  try {
    const headers: Record<string, string> = {}
    const auth = (config.headers as Record<string, string>).Authorization
    if (auth) headers['Authorization'] = auth
    const res = await fetch(`${LINE_BASE}/richmenu/${richMenuId}/content`, {
      method: 'POST',
      headers,
      body: imageBlob,
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, `上传 Rich Menu 图片失败: ${richMenuId}`, res, text)
    }
  } catch (err) {
    logAndReject(api, '上传 Rich Menu 图片异常', err)
  }
}

/** GET /v2/bot/richmenu/{richMenuId}/content - 下载 Rich Menu 图片 */
export async function getRichMenuImage(
  config: RichMenuApiConfig,
  richMenuId: string
): Promise<Blob> {
  const api = 'getRichMenuImage'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/${richMenuId}/content`)
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, `下载 Rich Menu 图片失败: ${richMenuId}`, res, text)
    }
    return res.blob()
  } catch (err) {
    logAndReject(api, '下载 Rich Menu 图片异常', err)
  }
}

/** GET /v2/bot/richmenu/list - 获取 Rich Menu 列表 */
export async function getRichMenuList(config: RichMenuApiConfig): Promise<RichMenuListItem[]> {
  const api = 'getRichMenuList'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/list`)
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '获取 Rich Menu 列表失败', res, text)
    }
    const data = await res.json()
    return data.richmenus ?? []
  } catch (err) {
    logAndReject(api, '获取 Rich Menu 列表异常', err)
  }
}

/** GET /v2/bot/richmenu/{richMenuId} - 获取单个 Rich Menu */
export async function getRichMenu(
  config: RichMenuApiConfig,
  richMenuId: string
): Promise<RichMenuResponse> {
  const api = 'getRichMenu'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/${richMenuId}`)
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, `获取 Rich Menu 失败: ${richMenuId}`, res, text)
    }
    return res.json()
  } catch (err) {
    logAndReject(api, '获取 Rich Menu 异常', err)
  }
}

/** DELETE /v2/bot/richmenu/{richMenuId} - 删除 Rich Menu */
export async function deleteRichMenu(
  config: RichMenuApiConfig,
  richMenuId: string
): Promise<boolean> {
  const api = 'deleteRichMenu'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/${richMenuId}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const text = await res.text()
      apiLogger.error(api, `删除 Rich Menu 失败: ${richMenuId}`, { status: res.status, body: text })
      return false
    }
    return true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    apiLogger.error(api, `删除 Rich Menu 异常: ${richMenuId}`, msg)
    return false
  }
}

/** POST /v2/bot/user/all/richmenu/{richMenuId} - 设为默认 Rich Menu */
export async function setDefaultRichMenu(
  config: RichMenuApiConfig,
  richMenuId: string
): Promise<void> {
  const api = 'setDefaultRichMenu'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/user/all/richmenu/${richMenuId}`, {
      method: 'POST',
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '设置默认 Rich Menu 失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '设置默认 Rich Menu 异常', err)
  }
}

/** GET /v2/bot/user/all/richmenu - 获取默认 Rich Menu ID */
export async function getDefaultRichMenuId(config: RichMenuApiConfig): Promise<{ richMenuId: string } | null> {
  const api = 'getDefaultRichMenuId'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/user/all/richmenu`)
    if (res.status === 204) return null
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '获取默认 Rich Menu ID 失败', res, text)
    }
    return res.json()
  } catch (err) {
    logAndReject(api, '获取默认 Rich Menu ID 异常', err)
  }
}

/** DELETE /v2/bot/user/all/richmenu - 取消默认 Rich Menu */
export async function cancelDefaultRichMenu(config: RichMenuApiConfig): Promise<void> {
  const api = 'cancelDefaultRichMenu'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/user/all/richmenu`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '取消默认 Rich Menu 失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '取消默认 Rich Menu 异常', err)
  }
}

// ========== Per-user rich menu ==========

/** POST /v2/bot/user/{userId}/richmenu/{richMenuId} - 为用户绑定 Rich Menu */
export async function linkRichMenuToUser(
  config: RichMenuApiConfig,
  userId: string,
  richMenuId: string
): Promise<void> {
  const api = 'linkRichMenuToUser'
  try {
    const res = await createRequest(config)(
      `${LINE_BASE}/user/${encodeURIComponent(userId)}/richmenu/${richMenuId}`,
      { method: 'POST' }
    )
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '为用户绑定 Rich Menu 失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '为用户绑定 Rich Menu 异常', err)
  }
}

/** POST /v2/bot/richmenu/bulk/link - 批量绑定（body: { richMenuId, userIds[] }） */
export async function bulkLinkRichMenu(
  config: RichMenuApiConfig,
  richMenuId: string,
  userIds: string[]
): Promise<void> {
  const api = 'bulkLinkRichMenu'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/bulk/link`, {
      method: 'POST',
      body: JSON.stringify({ richMenuId, userIds }),
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '批量绑定 Rich Menu 失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '批量绑定 Rich Menu 异常', err)
  }
}

/** GET /v2/bot/user/{userId}/richmenu - 获取用户当前 Rich Menu ID */
export async function getRichMenuIdOfUser(
  config: RichMenuApiConfig,
  userId: string
): Promise<{ richMenuId: string } | null> {
  const api = 'getRichMenuIdOfUser'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/user/${encodeURIComponent(userId)}/richmenu`)
    if (res.status === 204) return null
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '获取用户 Rich Menu ID 失败', res, text)
    }
    return res.json()
  } catch (err) {
    logAndReject(api, '获取用户 Rich Menu ID 异常', err)
  }
}

/** DELETE /v2/bot/user/{userId}/richmenu - 解除用户 Rich Menu */
export async function unlinkRichMenuFromUser(
  config: RichMenuApiConfig,
  userId: string
): Promise<void> {
  const api = 'unlinkRichMenuFromUser'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/user/${encodeURIComponent(userId)}/richmenu`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '解除用户 Rich Menu 失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '解除用户 Rich Menu 异常', err)
  }
}

/** POST /v2/bot/richmenu/bulk/unlink - 批量解除（body: { userIds[] }） */
export async function bulkUnlinkRichMenu(
  config: RichMenuApiConfig,
  userIds: string[]
): Promise<void> {
  const api = 'bulkUnlinkRichMenu'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/bulk/unlink`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '批量解除 Rich Menu 失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '批量解除 Rich Menu 异常', err)
  }
}

/** POST /v2/bot/richmenu/batch - 批量替换/解除；GET progress/batch 查进度 */
export async function richMenuBatch(
  config: RichMenuApiConfig,
  body: { operations: Array<{ type: 'link' | 'unlink'; userId?: string; richMenuId?: string }> }
): Promise<{ requestId: string }> {
  const api = 'richMenuBatch'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/batch`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, 'Rich Menu 批量操作失败', res, text)
    }
    return res.json()
  } catch (err) {
    logAndReject(api, 'Rich Menu 批量操作异常', err)
  }
}

/** GET /v2/bot/richmenu/progress/batch - 查询批量操作进度 */
export async function getRichMenuBatchProgress(
  config: RichMenuApiConfig,
  requestId: string
): Promise<{ phase: 'succeeded' | 'failed' | 'in_progress'; acceptedTime?: string; completedTime?: string; success?: { count: number }; failed?: { count: number }; details?: unknown[] }> {
  const api = 'getRichMenuBatchProgress'
  try {
    const res = await createRequest(config)(
      `${LINE_BASE}/richmenu/progress/batch?requestId=${encodeURIComponent(requestId)}`
    )
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '查询批量操作进度失败', res, text)
    }
    return res.json()
  } catch (err) {
    logAndReject(api, '查询批量操作进度异常', err)
  }
}

/** POST /v2/bot/richmenu/validate/batch - 校验批量操作请求 */
export async function validateRichMenuBatch(
  config: RichMenuApiConfig,
  body: { operations: Array<{ type: 'link' | 'unlink'; userId?: string; richMenuId?: string }> }
): Promise<void> {
  const api = 'validateRichMenuBatch'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/validate/batch`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '校验 Rich Menu 批量操作失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '校验 Rich Menu 批量操作异常', err)
  }
}

// ========== Rich menu alias ==========

/** POST /v2/bot/richmenu/alias - 创建别名 */
export async function createRichMenuAlias(
  config: RichMenuApiConfig,
  richMenuAliasId: string,
  richMenuId: string
): Promise<void> {
  const api = 'createRichMenuAlias'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/alias`, {
      method: 'POST',
      body: JSON.stringify({ richMenuAliasId, richMenuId }),
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '创建 Rich Menu 别名失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '创建 Rich Menu 别名异常', err)
  }
}

/** DELETE /v2/bot/richmenu/alias/{richMenuAliasId} - 删除别名 */
export async function deleteRichMenuAlias(
  config: RichMenuApiConfig,
  richMenuAliasId: string
): Promise<void> {
  const api = 'deleteRichMenuAlias'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/alias/${encodeURIComponent(richMenuAliasId)}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '删除 Rich Menu 别名失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '删除 Rich Menu 别名异常', err)
  }
}

/** POST /v2/bot/richmenu/alias/{richMenuAliasId} - 更新别名（指向新 richMenuId） */
export async function updateRichMenuAlias(
  config: RichMenuApiConfig,
  richMenuAliasId: string,
  richMenuId: string
): Promise<void> {
  const api = 'updateRichMenuAlias'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/alias/${encodeURIComponent(richMenuAliasId)}`, {
      method: 'POST',
      body: JSON.stringify({ richMenuId }),
    })
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '更新 Rich Menu 别名失败', res, text)
    }
  } catch (err) {
    logAndReject(api, '更新 Rich Menu 别名异常', err)
  }
}

/** GET /v2/bot/richmenu/alias/{richMenuAliasId} - 获取别名信息 */
export async function getRichMenuAlias(
  config: RichMenuApiConfig,
  richMenuAliasId: string
): Promise<RichMenuAliasItem> {
  const api = 'getRichMenuAlias'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/alias/${encodeURIComponent(richMenuAliasId)}`)
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '获取 Rich Menu 别名失败', res, text)
    }
    return res.json()
  } catch (err) {
    logAndReject(api, '获取 Rich Menu 别名异常', err)
  }
}

/** GET /v2/bot/richmenu/alias/list - 获取别名列表 */
export async function getRichMenuAliasList(config: RichMenuApiConfig): Promise<RichMenuAliasItem[]> {
  const api = 'getRichMenuAliasList'
  try {
    const res = await createRequest(config)(`${LINE_BASE}/richmenu/alias/list`)
    if (!res.ok) {
      const text = await res.text()
      logAndThrow(api, '获取 Rich Menu 别名列表失败', res, text)
    }
    const data = await res.json()
    return data.aliases ?? []
  } catch (err) {
    logAndReject(api, '获取 Rich Menu 别名列表异常', err)
  }
}
