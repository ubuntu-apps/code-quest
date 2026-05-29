import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const svg = readFileSync(join(publicDir, 'favicon.svg'))

const theme = '#0f172a'

async function writePng(name, size, { maskable = false } = {}) {
  const out = join(publicDir, name)
  if (maskable) {
    const iconSize = Math.round(size * 0.62)
    const icon = await sharp(svg).resize(iconSize, iconSize).png().toBuffer()
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: theme,
      },
    })
      .composite([{ input: icon, gravity: 'centre' }])
      .png()
      .toFile(out)
  } else {
    await sharp(svg).resize(size, size).png().toFile(out)
  }
  console.log(`wrote ${name}`)
}

await writePng('pwa-192x192.png', 192)
await writePng('pwa-512x512.png', 512)
await writePng('pwa-512x512-maskable.png', 512, { maskable: true })
await writePng('apple-touch-icon.png', 180)
