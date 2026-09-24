import { chromium } from 'playwright'

// Target app origin; override with AUDIT_URL when auditing a non-local deploy.
// Paths are appended to BASE_URL below, so strip any trailing slash.
const BASE_URL = (process.env.AUDIT_URL ?? 'http://localhost:5173').replace(/\/+$/, '')

void (async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await context.newPage()

  await page.goto(`${BASE_URL}/quests`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  // Extract quest data from the page
  const questAnalysis = await page.evaluate(() => {
    // Find all quest cards
    const cards = document.querySelectorAll('[class*="bg-slate"]')
    /** @type {string[]} */
    const quests = []

    cards.forEach((card) => {
      if (!(card instanceof HTMLElement)) return
      const text = card.innerText
      if (text.includes('⭐') || text.includes('difficulty') || text.includes('XP')) {
        quests.push(text.substring(0, 150))
      }
    })

    return {
      questCardCount: quests.length,
      samples: quests.slice(0, 10),
    }
  })

  console.log('=== QUEST ANALYSIS ===')
  console.log('Quest cards found:', questAnalysis.questCardCount)
  console.log('\nSample quest cards:')
  questAnalysis.samples.forEach((s, i) => {
    console.log(`${i + 1}. ${s.replace(/\n/g, ' | ')}`)
  })

  await browser.close()
})()
