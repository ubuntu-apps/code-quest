import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const svg = readFileSync(join(publicDir, 'favicon.svg'))

const theme = '#0f172a'

/**
 * maskable: Android crops the icon to a circle or squircle, so the artwork sits in the middle 90%
 * on the theme colour (the icon's own tile is that colour, so the edges blend in).
 * opaque: iOS rounds the corners itself and turns transparent ones black, so fill them.
 */
async function writePng(name, size, { maskable = false, opaque = false } = {}) {
  const out = join(publicDir, name)
  if (opaque) {
    await sharp(svg).resize(size, size).flatten({ background: theme }).png().toFile(out)
  } else if (maskable) {
    const iconSize = Math.round(size * 0.9)
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
await writePng('apple-touch-icon.png', 180, { opaque: true })
