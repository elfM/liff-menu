export type LogLevel = 'error' | 'warn' | 'info'

export interface LogEntry {
  time: string
  level: LogLevel
  api: string
  message: string
  detail?: string
}

const entries: LogEntry[] = []

function formatTime(): string {
  const now = new Date()
  return now.toISOString()
}

function formatEntry(e: LogEntry): string {
  const detail = e.detail ? `\n  detail: ${e.detail}` : ''
  return `[${e.time}] [${e.level.toUpperCase()}] [${e.api}] ${e.message}${detail}`
}

/**
 * 接口异常日志记录器
 * - 在内存中记录每条日志，可导出为文本或下载为 .log 文件
 */
export const apiLogger = {
  error(api: string, message: string, detail?: string | unknown): void {
    const detailStr =
      typeof detail === 'string' ? detail : detail != null ? JSON.stringify(detail) : undefined
    const entry: LogEntry = {
      time: formatTime(),
      level: 'error',
      api,
      message,
      detail: detailStr,
    }
    entries.push(entry)
    console.error(`[${api}]`, message, detail ?? '')
  },

  warn(api: string, message: string, detail?: string | unknown): void {
    const detailStr =
      typeof detail === 'string' ? detail : detail != null ? JSON.stringify(detail) : undefined
    entries.push({
      time: formatTime(),
      level: 'warn',
      api,
      message,
      detail: detailStr,
    })
  },

  /** 记录成功信息（与 error 一并写入日志文件） */
  info(api: string, message: string, detail?: string | unknown): void {
    const detailStr =
      typeof detail === 'string' ? detail : detail != null ? JSON.stringify(detail) : undefined
    entries.push({
      time: formatTime(),
      level: 'info',
      api,
      message,
      detail: detailStr,
    })
  },

  getEntries(): LogEntry[] {
    return [...entries]
  },

  /** 返回完整日志内容（可写入文件或下载） */
  getLogContent(): string {
    if (entries.length === 0) return ''
    return entries.map(formatEntry).join('\n') + '\n'
  },

  /** 在浏览器中触发下载日志文件（文件名含时间戳） */
  downloadLogFile(filename?: string): void {
    const content = this.getLogContent()
    if (!content) {
      if (typeof window !== 'undefined') alert('暂无日志记录')
      return
    }
    const name =
      filename ?? `api-log-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.log`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    if (typeof window === 'undefined') return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  },

  clear(): void {
    entries.length = 0
  },
}
