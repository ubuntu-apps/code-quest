import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

const API_PATH = '/__codequest/api/save-curriculum'

interface SaveBody {
  files?: { path: string; json: unknown }[]
}

function isSafeRelativePath(filePath: string): boolean {
  const normalized = path.normalize(filePath)
  return !path.isAbsolute(normalized) && !normalized.split(path.sep).includes('..')
}

async function handleSave(req: import('http').IncomingMessage, res: import('http').ServerResponse, rootDir: string) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method not allowed')
    return
  }

  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(chunk as Buffer)
  }

  let body: SaveBody
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as SaveBody
  } catch {
    res.statusCode = 400
    res.end('Invalid JSON body')
    return
  }

  const files = body.files
  if (!Array.isArray(files) || files.length === 0) {
    res.statusCode = 400
    res.end('Missing files array')
    return
  }

  const contentRoot = path.join(rootDir, 'public', 'content')
  const written: string[] = []

  try {
    for (const file of files) {
      if (!file?.path || typeof file.path !== 'string') {
        throw new Error('Each file must have a path string')
      }
      if (!isSafeRelativePath(file.path)) {
        throw new Error(`Unsafe path: ${file.path}`)
      }
      const dest = path.join(contentRoot, file.path)
      await fs.mkdir(path.dirname(dest), { recursive: true })
      const text = JSON.stringify(file.json, null, 2) + '\n'
      await fs.writeFile(dest, text, 'utf8')
      written.push(file.path)
    }
  } catch (e: unknown) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: e instanceof Error ? e.message : 'Failed to write curriculum files',
        written,
      }),
    )
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ ok: true, written }))
}

export function curriculumSavePlugin(): Plugin {
  return {
    name: 'codequest-curriculum-save',
    configureServer(server: ViteDevServer) {
      const rootDir = server.config.root
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(API_PATH)) {
          next()
          return
        }
        void handleSave(req, res, rootDir)
      })
    },
  }
}
