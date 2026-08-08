// Regenerates the ordering QR and rewrites the URL printed on every poster.
//
//   node scripts/make-qr.cjs https://your-site.vercel.app
//   node scripts/export-posters.cjs
//
// Keeping this in one command matters because a QR and a printed URL that
// disagree is the kind of thing nobody notices until the posters are on a wall.
const fs = require('fs')
const path = require('path')
const QRCode = require('qrcode')

const ROOT = path.join(__dirname, '..')
const POSTERS = path.join(ROOT, 'marketing/posters.html')
const SVG = path.join(ROOT, 'marketing/qr-order.svg')
const PLACEHOLDER = 'DEMO_URL'

const url = process.argv[2]
if (!url || !/^https?:\/\//.test(url)) {
  console.error('usage: node scripts/make-qr.cjs https://your-site.example')
  process.exit(1)
}
const shown = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

;(async () => {
  await QRCode.toFile(SVG, url, {
    type: 'svg',
    margin: 0,
    // H survives WhatsApp recompression and a phone camera at an angle
    errorCorrectionLevel: 'H',
    color: { dark: '#0c0a09', light: '#f5efe6' },
  })

  const html = fs.readFileSync(POSTERS, 'utf8')
  const previous = html.match(/[a-z0-9-]+\.vercel\.app|DEMO_URL/g)
  const next = previous
    ? html.split(new RegExp(previous.map(escapeRe).join('|'))).join(shown)
    : html
  fs.writeFileSync(POSTERS, next)

  console.log(`QR → ${url}`)
  console.log(`posters now print → ${shown}`)
  console.log('now run: node scripts/export-posters.cjs')
})()

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
