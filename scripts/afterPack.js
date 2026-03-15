const path = require('path')

/**
 * electron-builder afterPack hook: embed icon into Windows .exe
 * so the app and shortcuts show the custom icon (sas) instead of default Electron icon.
 */
module.exports = async function (context) {
  if (context.electronPlatformName !== 'win32') return

  const { rcedit } = await import('rcedit')
  const exeName = `${context.packager.appInfo.productFilename}.exe`
  const exePath = path.join(context.appOutDir, exeName)
  const iconPath = path.join(context.packager.projectDir, 'build', 'icon.ico')

  const fs = require('fs')
  if (!fs.existsSync(iconPath)) {
    console.warn('afterPack: build/icon.ico not found, skipping icon embed')
    return
  }
  await rcedit(exePath, { icon: iconPath })
  console.log('afterPack: embedded icon into', exeName)
}
