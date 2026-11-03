import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const routes = new Set(['hello', 'tour', 'weather', 'heritage', 'agent', 'benefits'])
const serverKeys = ['DATA_GO_KR_KEY', 'ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'AI_PROVIDER', 'OPENAI_API_KEY', 'OPENAI_MODEL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.slice(1)
        if (!routes.has(name)) return next()
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.status = code => { res.statusCode = code; return res }
        res.json = data => res.end(JSON.stringify(data))
        try {
          // Read the actual project directory, not the shell's current folder.
          // Load in the same Node context that executes the API handlers.
          const env = loadEnv(server.config.mode, server.config.root, '')
          for (const key of serverKeys) {
            if (env[key]) process.env[key] = env[key]
          }
          req.query = Object.fromEntries(url.searchParams)
          if (req.method === 'POST') {
            let body = ''
            for await (const chunk of req) {
              body += chunk
              if (body.length > 32000) return res.status(413).json({ error: '요청이 너무 큽니다.' })
            }
            try { req.body = JSON.parse(body || '{}') }
            catch { return res.status(400).json({ error: '잘못된 JSON 요청입니다.' }) }
          }
          // Native Node imports share process.env with this middleware.
          const handler = await import(pathToFileURL(path.join(server.config.root, 'api', name + '.js')).href)
          await handler.default(req, res)
        } catch (e) {
          let message = e.message || '서버 요청 실패'
          for (const key of serverKeys) {
            const secret = process.env[key]
            if (secret) message = message.split(secret).join('[REDACTED]').split(encodeURIComponent(secret)).join('[REDACTED]')
          }
          res.status(500).json({ error: message })
        }
      })
    }
  }
}

export default defineConfig({
  root: projectRoot,
  plugins: [react(), localApi()],
  server: { host: '127.0.0.1' },
  build: { chunkSizeWarningLimit: 1500 }
})
