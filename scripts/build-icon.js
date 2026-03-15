const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const pngPath = path.join(root, 'public', 'sas.png')
const outDir = path.join(root, 'build')
const icoPath = path.join(outDir, 'icon.ico')

const inputPath = fs.existsSync(pngPath)
  ? pngPath
  : fs.existsSync(path.join(root, 'sas.png'))
    ? path.join(root, 'sas.png')
    : null

if (!inputPath) {
  console.error('Icon PNG not found at public/sas.png or sas.png')
  process.exit(1)
}

async function run() {
  const pngToIco = (await import('png-to-ico')).default
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  const buf = await pngToIco(inputPath)
  fs.writeFileSync(icoPath, buf)
  console.log('Created build/icon.ico from', path.basename(inputPath))
}

run().catch((err) => {
  console.error('Failed to create icon.ico:', err)
  process.exit(1)
})
