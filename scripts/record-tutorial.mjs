/**
 * Records OutGen user tutorial (mobile + desktop). No admin.
 * Usage: DEMO_EMAIL=... DEMO_PASSWORD=... node scripts/record-tutorial.mjs
 */
import { chromium } from 'playwright'
import { copyFile, mkdir, rename, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const BASE = process.env.APP_URL || 'http://127.0.0.1:5173'
const EMAIL = process.env.DEMO_EMAIL
const PASSWORD = process.env.DEMO_PASSWORD
const OUT_DIR = 'artifacts/tutorial'

if (!EMAIL || !PASSWORD) {
  console.error('Set DEMO_EMAIL and DEMO_PASSWORD env vars')
  process.exit(1)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function showStep(page, text) {
  await page.evaluate((msg) => {
    let el = document.getElementById('tutorial-step')
    if (!el) {
      el = document.createElement('div')
      el.id = 'tutorial-step'
      el.style.cssText =
        'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:99999;background:rgba(109,40,217,0.95);color:#fff;padding:10px 18px;border-radius:12px;font:bold 14px/1.3 system-ui,sans-serif;max-width:90vw;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.4)'
      document.body.appendChild(el)
    }
    el.textContent = msg
  }, text)
  await sleep(2200)
}

async function ensureSignedOut(page) {
  const outBtn = page.getByRole('banner').getByRole('button', { name: 'Out', exact: true })
  if (await outBtn.isVisible().catch(() => false)) {
    await outBtn.click()
    await sleep(2000)
  }
}

async function typeSlow(locator, text, delay = 55) {
  await locator.click()
  await locator.fill('')
  await locator.pressSequentially(text, { delay })
}

async function signIn(page) {
  await ensureSignedOut(page)
  await showStep(page, '1. Tap Sign in')
  await page.getByRole('banner').getByRole('button', { name: 'Sign in' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ state: 'visible', timeout: 15000 })
  await sleep(1200)

  await showStep(page, '2. Enter your email')
  const emailInput = dialog.locator('input[type="email"]')
  await typeSlow(emailInput, EMAIL)
  await sleep(1500)

  await showStep(page, '3. Enter your password')
  const passInput = dialog.locator('input[type="password"]')
  await typeSlow(passInput, PASSWORD)
  await sleep(1500)

  await showStep(page, '4. Tap Sign in')
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click()
  await sleep(4500)

  const authError = dialog.locator('text=/invalid|error|wrong|confirm/i')
  if (await authError.isVisible().catch(() => false)) {
    throw new Error('Sign-in failed — check DEMO_EMAIL and DEMO_PASSWORD')
  }

  for (let i = 0; i < 3; i++) {
    const next = page.getByRole('button', { name: /Continue|Save and start/i })
    if (await next.isVisible().catch(() => false)) {
      await next.click()
      await sleep(1800)
    } else break
  }

  const outBtn = page.getByRole('banner').getByRole('button', { name: 'Out', exact: true })
  if (!(await outBtn.isVisible().catch(() => false))) {
    throw new Error('Sign-in did not complete — still guest')
  }
}

async function userFlow(page) {
  await showStep(page, '5. Studio — design your outfit')
  await page.goto(`${BASE}/`)
  await sleep(1500)

  await showStep(page, '6. Tap Pick clothes — choose pieces')
  await page.getByRole('button', { name: 'Pick clothes' }).click()
  await sleep(1200)
  const firstGarment = page.locator('button').filter({ hasText: /Tee|Hoodie|Shorts|Shirt/i }).first()
  if (await firstGarment.isVisible().catch(() => false)) {
    await firstGarment.click()
    await sleep(800)
  }
  await page.getByRole('button', { name: 'Done' }).click()
  await sleep(1000)

  await showStep(page, '7. Make my outfit — AI generates your look')
  const makeBtn = page.getByRole('button', { name: 'Make my outfit' })
  if (await makeBtn.isEnabled().catch(() => false)) {
    await makeBtn.click()
    await sleep(12000)
  } else {
    await sleep(2000)
  }

  await showStep(page, '8. Save outfit — keeps it in the cloud')
  const saveBtn = page.getByRole('button', { name: 'Save outfit' })
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click()
    await sleep(2500)
  }

  await showStep(page, '9. My outfits — your saved history')
  await page.getByRole('link', { name: 'Outfits' }).click()
  await sleep(2500)

  await showStep(page, '10. Order a print — ship to your home')
  await page.getByRole('link', { name: 'Print' }).click()
  await sleep(2500)

  await showStep(page, '11. Track my prints — delivery status')
  await page.goto(`${BASE}/orders`)
  await sleep(2500)

  await showStep(page, '12. Account — credits & home address')
  await page.getByRole('link', { name: 'Account' }).click()
  await sleep(2500)

  await showStep(page, 'Ready to create and print with OutGen')
  await sleep(2000)
}

async function recordViewport({ name, width, height }) {
  const tmpDir = join(OUT_DIR, `tmp-${name}`)
  await mkdir(tmpDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width, height },
    storageState: undefined,
    recordVideo: { dir: tmpDir, size: { width, height } },
    userAgent:
      name === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
        : undefined,
  })
  const page = await context.newPage()
  await page.goto(BASE)
  await sleep(1000)
  await signIn(page)
  await userFlow(page)

  const video = page.video()
  await context.close()
  await browser.close()

  const rawPath = await video.path()
  const outWebm = join(OUT_DIR, `outgen-tutorial-${name}.webm`)
  await rename(rawPath, outWebm)
  await rm(tmpDir, { recursive: true, force: true })
  return outWebm
}

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', args, { stdio: 'inherit' })
    p.on('close', (c) => (c === 0 ? resolve() : reject(new Error(`ffmpeg exit ${c}`))))
  })
}

async function makeTitleCard(text, outPath, size) {
  const [w, h] = size.split('x')
  const safe = text.replace(/'/g, "'\\''")
  await ffmpeg([
    '-y',
    '-f',
    'lavfi',
    '-i',
    `color=c=0x060607:s=${w}x${h}:d=3`,
    '-vf',
    `drawtext=text='${safe}':fontsize=42:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    outPath,
  ])
}

async function webmToMp4(inPath, outPath) {
  await ffmpeg(['-y', '-i', inPath, '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', outPath])
}

async function concatMp4(files, outPath) {
  const list = join(OUT_DIR, 'concat.txt')
  const { writeFile } = await import('node:fs/promises')
  await writeFile(list, files.map((f) => `file '${resolve(f)}'`).join('\n'))
  await ffmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', resolve(outPath)])
}

await mkdir(OUT_DIR, { recursive: true })

console.log('Recording desktop…')
const desktopWebm = await recordViewport({ name: 'desktop', width: 1280, height: 720 })
console.log('Recording mobile…')
const mobileWebm = await recordViewport({ name: 'mobile', width: 390, height: 844 })

const desktopMp4 = join(OUT_DIR, 'desktop-body.mp4')
const mobileMp4 = join(OUT_DIR, 'mobile-body.mp4')
await webmToMp4(desktopWebm, desktopMp4)
await webmToMp4(mobileWebm, mobileMp4)

const introD = join(OUT_DIR, 'intro-desktop.mp4')
const introM = join(OUT_DIR, 'intro-mobile.mp4')
await makeTitleCard('OutGen — Desktop guide', introD, '1280x720')
await makeTitleCard('OutGen — Mobile guide', introM, '390x844')

const finalDesktop = join(OUT_DIR, 'outgen-how-to-desktop.mp4')
const finalMobile = join(OUT_DIR, 'outgen-how-to-mobile.mp4')
await concatMp4([introD, desktopMp4], finalDesktop)
await concatMp4([introM, mobileMp4], finalMobile)

const publicDir = 'public/tutorial'
await mkdir(publicDir, { recursive: true })
const pubDesktop = join(publicDir, 'outgen-how-to-desktop.mp4')
const pubMobile = join(publicDir, 'outgen-how-to-mobile.mp4')
await Promise.all([copyFile(finalDesktop, pubDesktop), copyFile(finalMobile, pubMobile)])

console.log('Done:')
console.log(' ', finalDesktop)
console.log(' ', finalMobile)
console.log(' ', pubDesktop)
console.log(' ', pubMobile)
