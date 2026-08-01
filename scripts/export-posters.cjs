// Renders marketing/posters.html artboards to PNGs in marketing/exports/.
// Needs playwright-core + a Chromium binary (set CHROMIUM_PATH if elsewhere).
const { chromium } = require('playwright-core')
;(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
  const page = await browser.newPage({ viewport: { width: 1400, height: 2000 }, deviceScaleFactor: 2 })
  await page.goto('file:///home/user/magic_hands_pizza/marketing/posters.html', { waitUntil: 'load' })
  await page.waitForTimeout(3000)
  for (const [id, name] of [['story', 'story-1080x1920'], ['post', 'post-1080x1080'], ['a3', 'hostel-wall-a3']]) {
    const el = await page.$('#' + id)
    if (!el) { console.log('MISSING', id); continue }
    await el.screenshot({ path: '/home/user/magic_hands_pizza/marketing/exports/' + name + '.png' })
    console.log('exported', name)
  }
  await browser.close()
})()
