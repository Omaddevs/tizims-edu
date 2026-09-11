const fs = require('fs')
const path = require('path')
const jpeg = require('jpeg-js')
const { PNG } = require('pngjs')

const src = process.argv[2]
const dest = process.argv[3]
const mode = process.argv[4] || 'color'

const jpg = jpeg.decode(fs.readFileSync(src), { useTArray: true, formatAsRGBA: true })
const { width, height, data } = jpg

for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const mx = Math.max(r, g, b)
  let a = 0
  if (mx <= 12) a = 0
  else if (mx >= 42) a = 255
  else a = Math.round(((mx - 12) / 30) * 255)
  data[i + 3] = a
  if (mode === 'white' && a > 0) {
    data[i] = 255
    data[i + 1] = 255
    data[i + 2] = 255
  }
}

let minX = width
let minY = height
let maxX = 0
let maxY = 0
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const a = data[(y * width + x) * 4 + 3]
    if (a > 16) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
}

const pad = 6
minX = Math.max(0, minX - pad)
minY = Math.max(0, minY - pad)
maxX = Math.min(width - 1, maxX + pad)
maxY = Math.min(height - 1, maxY + pad)
const cw = maxX - minX + 1
const ch = maxY - minY + 1
const out = new PNG({ width: cw, height: ch, colorType: 6 })
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const si = ((minY + y) * width + (minX + x)) * 4
    const di = (y * cw + x) * 4
    out.data[di] = data[si]
    out.data[di + 1] = data[si + 1]
    out.data[di + 2] = data[si + 2]
    out.data[di + 3] = data[si + 3]
  }
}

fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.writeFileSync(dest, PNG.sync.write(out))
console.log('wrote', dest, cw, 'x', ch)
