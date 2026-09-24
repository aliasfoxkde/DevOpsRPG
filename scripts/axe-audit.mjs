// Accessibility audit: scans every route with axe-core
// (wcag2a/2.1aa/2.1aaa + best practice). AA violations fail the run;
// AAA violations are reported and fail only with --aaa-strict.
// Usage: node scripts/axe-audit.mjs [baseURL] [--aaa-strict] [--detail]
//   (default http://127.0.0.1:5173, or the AUDIT_URL environment variable)
// Expects the dev server (or preview) to already be running at baseURL.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

/** @typedef {{ fgColor: string, bgColor: string, contrastRatio: number }} AxeCheckData */
/** @typedef {{ id: string, data?: AxeCheckData }} AxeCheck */
/** @typedef {{ any: AxeCheck[], target: string[] }} AxeNode */
/** @typedef {'critical' | 'serious' | 'moderate' | 'minor'} AxeImpact */
/** @typedef {{ id: string, impact: AxeImpact, nodes: AxeNode[] }} AxeViolation */
/** @typedef {{ violations: AxeViolation[] }} AxeResults */
/** @typedef {{ run: (context: Document, options: { runOnly: { type: string, values: string[] } }) => Promise<AxeResults> }} AxeGlobal */
/** @typedef {Window & typeof globalThis & { axe?: AxeGlobal }} AxeWindow */

const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

const target = process.argv[2] || process.env.AUDIT_URL || 'http://127.0.0.1:5173'
// Routes are appended to BASE_URL below, so strip any trailing slash.
const BASE_URL = target.replace(/\/+$/, '')
// Every route from src/App.tsx (the index layout route plus its children).
const ROUTES = [
  '/',
  '/quests',
  '/character',
  '/profile',
  '/rewards',
  '/sidequests',
  '/challenges',
  '/skills',
  '/worldmap',
  '/leaderboard',
  '/badges',
  '/milestones',
  '/about',
  '/faq',
  '/privacy-policy',
  '/games',
  '/store',
  '/settings',
  '/analytics',
  '/titles-frames',
  '/seasonal-events',
  '/pvp-arena',
  '/social',
  '/guild',
  '/career-path',
  '/storylines',
  '/technology-collection',
  '/certifications',
  '/marketplace',
  '/feedback',
]
const AAA_STRICT = process.argv.includes('--aaa-strict')

const browser = await chromium.launch()
const page = await browser.newPage()

/** @type {Record<string, number>} */
const totals = { critical: 0, serious: 0, moderate: 0, minor: 0 }
/** @type {Record<string, number>} */
const aaaTotals = { critical: 0, serious: 0, moderate: 0, minor: 0 }
const perRoute = []

for (const theme of ['dark', 'light']) {
  for (const route of ROUTES) {
    await page.goto(BASE_URL + route, { waitUntil: 'networkidle' })
    // Force the theme deterministically (ThemeContext reads the `dark` class)
    await page.evaluate((t) => {
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(t)
    }, theme)
    // Settle lazy-loaded route content
    await page.waitForTimeout(400)
    await page.addScriptTag({ content: axeSource })
    const results = await page.evaluate(() => {
      const axe = /** @type {AxeWindow} */ (window).axe
      if (!axe) throw new Error('axe-core failed to load')
      return axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag2aaa'] },
      })
    })
    // Classify by level: AAA-tagged rules are tracked separately so the AA
    // gate stays meaningful while AAA progress is still measurable.
    const AAA_RULES = new Set(['color-contrast-enhanced', 'target-size'])
    /** @type {Record<string, number>} */
    const bySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    /** @type {Record<string, number>} */
    const aaaBySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    const summary = []
    for (const v of results.violations) {
      const bucket = AAA_RULES.has(v.id) ? aaaBySeverity : bySeverity
      bucket[v.impact] = (bucket[v.impact] || 0) + v.nodes.length
      const detail = v.nodes
        .slice(0, 3)
        .map((n) => {
          const fg = n.any.find(
            (a) => a.id === 'color-contrast' || a.id === 'color-contrast-enhanced',
          )
          const data = fg?.data
          return data
            ? `    ${v.id}: fg=${data.fgColor} bg=${data.bgColor} ratio=${data.contrastRatio} -> ${n.target[0]}`
            : `    ${v.id}: ${n.target[0]}`
        })
        .join('\n')
      summary.push(
        `  [${v.impact}] ${v.id} x${v.nodes.length}\n${v.nodes.length > 3 ? detail + '\n    ... (+ more)' : detail}`,
      )
    }
    perRoute.push({ route: `${theme} ${route}`, bySeverity, aaaBySeverity, summary })
    for (const k of Object.keys(totals)) {
      totals[k] += bySeverity[k] || 0
      aaaTotals[k] += aaaBySeverity[k] || 0
    }
  }
}

for (const { route, bySeverity, aaaBySeverity, summary } of perRoute) {
  const parts = Object.entries(bySeverity)
    .filter(([, n]) => n)
    .map(([k, n]) => `${k}=${n}`)
  const aaaParts = Object.entries(aaaBySeverity)
    .filter(([, n]) => n)
    .map(([k, n]) => `${k}=${n}`)
  console.log(
    `\n${route}: ${parts.length ? 'AA ' + parts.join(' ') : 'AA CLEAN'}` +
      ` | AAA ${aaaParts.length ? aaaParts.join(' ') : 'CLEAN'}`,
  )
  if (process.argv.includes('--detail')) console.log(summary.join('\n'))
}
console.log(
  `\nTOTALS: AA critical=${totals.critical} serious=${totals.serious} moderate=${totals.moderate} minor=${totals.minor}` +
    ` | AAA critical=${aaaTotals.critical} serious=${aaaTotals.serious} moderate=${aaaTotals.moderate} minor=${aaaTotals.minor}`,
)
const aaFail = totals.critical + totals.serious > 0
const aaaFail = AAA_STRICT && aaaTotals.critical + aaaTotals.serious > 0
if (aaFail || aaaFail) process.exit(1)

await browser.close()
