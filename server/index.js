/**
 * Express 后端：代理 LINE Messaging API (Rich Menu)
 * - 开发：仅代理 /v2/bot/*（前端单独 pnpm dev）
 * - 生产：代理 + 托管 dist/ 静态文件，单服务部署
 */
import express from 'express'
import path from 'path'
import { createServer } from 'http'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LINE_ORIGIN = 'https://api.line.me'
const PORT = Number(process.env.PORT) || 3001

const app = express()

// CORS：允许前端 localhost:5173 跨域请求（开发时前后端分离）
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

// 1. 代理 LINE API（/v2/bot 转发到 api.line.me）
// 不解析 body，由代理中间件按需读取并转发（支持 JSON 与二进制图片）
app.use('/v2/bot', express.raw({ type: () => true }), async (req, res) => {
  const path = req.originalUrl.slice('/v2/bot'.length) || '/'
  const url = `${LINE_ORIGIN}/v2/bot${path}`
  const auth = req.headers.authorization

  if (!auth) {
    res.status(401).json({ error: 'Missing Authorization header' })
    return
  }

  const headers = {
    Authorization: auth,
  }
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type']
  }

  let body = req.body
  if (req.method !== 'GET' && req.method !== 'HEAD' && body === undefined && req.readable) {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    body = chunks.length ? Buffer.concat(chunks) : undefined
  }

  try {
    const response = await fetch(url, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    })

    const contentType = response.headers.get('content-type')
    if (contentType) res.setHeader('Content-Type', contentType)

    res.status(response.status)

    if (response.status === 204) {
      res.end()
      return
    }

    const contentTypeLine = response.headers.get('content-type') || ''
    const responseBody = contentTypeLine.includes('application/json')
      ? await response.json()
      : await response.arrayBuffer()

    if (Buffer.isBuffer(responseBody)) {
      res.send(responseBody)
    } else if (responseBody instanceof ArrayBuffer) {
      res.send(Buffer.from(responseBody))
    } else {
      res.json(responseBody)
    }
  } catch (err) {
    console.error('[proxy]', err.message)
    res.status(502).json({ error: 'Proxy to LINE failed', message: err.message })
  }
})

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// 2. 生产环境：托管 dist 静态文件 + SPA 回退
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const server = createServer(app)
server.listen(PORT, () => {
  console.log(`LIFF Menu: http://localhost:${PORT}`)
  console.log(`  - 静态/页面: 根路径`)
  console.log(`  - LINE 代理: /v2/bot`)
})
