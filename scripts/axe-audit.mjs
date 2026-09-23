// Accessibility audit: scans key routes with axe-core (wcag2a/2.1 aa + best practice)
// Usage: node scripts/axe-audit.mjs [baseURL]   (default http://127.0.0.1:5173)
// Expects the dev server (or preview) to already be running at baseURL.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

const base = process.argv[2] || 'http://127.0.0.1:5173'
const ROUTES = ['/', '/quests', '/worldmap', '/store', '/settings', '/rewards']

const browser = await chromium.launch()
const page = await browser.newPage()

let totals = { critical: 0, serious: 0, moderate: 0, minor: 0 }
const perRoute = []

for (const theme of ['dark', 'light']) {
for (const route of ROUTES) {
  await page.goto(base + route, { waitUntil: 'networkidle' })
  // Force the theme deterministically (ThemeContext reads the `dark` class)
  await page.evaluate(t => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(t)
  }, theme)
  // Settle lazy-loaded route content
  await page.waitForTimeout(400)
  await page.addScriptTag({ content: axeSource })
  const results = await page.evaluate(() =>
    /** @type {any} */ (window).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    })
  )
  const bySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 }
  const summary = []
  for (const v of results.violations) {
    bySeverity[v.impact] = (bySeverity[v.impact] || 0) + v.nodes.length
    const detail = v.nodes
      .slice(0, 3)
      .map(n => {
        const fg = n.any.find(a => a.id === 'color-contrast')
        const data = fg?.data
        return data
          ? `    ${v.id}: fg=${data.fgColor} bg=${data.bgColor} ratio=${data.contrastRatio} -> ${n.target[0]}`
          : `    ${v.id}: ${n.target[0]}`
      })
      .join('\n')
    summary.push(`  [${v.impact}] ${v.id} x${v.nodes.length}\n${v.nodes.length > 3 ? detail + '\n    ... (+ more)' : detail}`)
  }
  perRoute.push({ route: `${theme} ${route}`, bySeverity, summary })
  for (const k of Object.keys(totals)) totals[k] += bySeverity[k] || 0
}
}

for (const { route, bySeverity, summary } of perRoute) {
  const parts = Object.entries(bySeverity).filter(([, n]) => n).map(([k, n]) => `${k}=${n}`)
  console.log(`\n${route}: ${parts.length ? parts.join(' ') : 'CLEAN'}`)
  if (process.argv.includes('--detail')) console.log(summary.join('\n'))
}
console.log(`\nTOTALS: critical=${totals.critical} serious=${totals.serious} moderate=${totals.moderate} minor=${totals.minor}`)
if (totals.critical + totals.serious > 0) process.exit(1)

await browser.close()
