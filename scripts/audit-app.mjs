import { chromium } from 'playwright'

// Target app origin; override with AUDIT_URL when auditing a non-local deploy.
// Paths are appended to BASE_URL below, so strip any trailing slash.
const BASE_URL = (process.env.AUDIT_URL ?? 'http://localhost:5173').replace(/\/+$/, '')

void (async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await context.newPage()

  const issues = []
  const screenshots = {}

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      issues.push(`[Console Error] ${msg.text()}`)
    }
  })

  page.on('pageerror', (err) => {
    issues.push(`[Page Error] ${err.message}`)
  })

  try {
    // Home Page
    console.log('Analyzing Home Page...')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    screenshots.home = await page.screenshot({ fullPage: true })

    // Check for horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(
      () => document.body.scrollWidth > window.innerWidth,
    )
    if (hasHorizontalScroll) {
      issues.push('[Layout] Horizontal scrollbar detected on Home Page')
    }

    // Check HUD visibility and overflow
    const hudElement = await page.$('header')
    if (hudElement) {
      const hudBox = await hudElement.boundingBox()
      console.log(`HUD dimensions: ${JSON.stringify(hudBox)}`)
    }

    // Check navigation items
    const navLinks = await page.$$('header nav a')
    console.log(`Navigation links found: ${navLinks.length}`)

    // Quest Journal
    console.log('\nAnalyzing Quest Journal...')
    await page.goto(`${BASE_URL}/quests`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    screenshots.quests = await page.screenshot({ fullPage: true })

    // Check for quests
    const questItems = await page.$$('[class*="quest"]')
    console.log(`Quest items found: ${questItems.length}`)

    // World Map
    console.log('\nAnalyzing World Map...')
    await page.goto(`${BASE_URL}/worldmap`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    screenshots.worldmap = await page.screenshot({ fullPage: true })

    // Check if map renders
    const mapContent = (await page.textContent('body')) ?? ''
    if (mapContent.includes('Loading') || mapContent.includes('undefined')) {
      issues.push('[WorldMap] Potential loading or undefined content issue')
    }

    // Character Sheet
    console.log('\nAnalyzing Character Sheet...')
    await page.goto(`${BASE_URL}/character`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    screenshots.character = await page.screenshot({ fullPage: true })

    // Badges Page
    console.log('\nAnalyzing Badges Page...')
    await page.goto(`${BASE_URL}/badges`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    screenshots.badges = await page.screenshot({ fullPage: true })

    // Rewards Page
    console.log('\nAnalyzing Rewards Page...')
    await page.goto(`${BASE_URL}/rewards`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    screenshots.rewards = await page.screenshot({ fullPage: true })

    // Battle Arena
    console.log('\nAnalyzing Battle Arena (Quest)...')
    await page.goto(`${BASE_URL}/quests`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Try to click on a quest to enter battle arena
    const firstQuest = await page.$('button:has-text("Start")')
    if (firstQuest) {
      await firstQuest.click()
      await page.waitForTimeout(2000)
      screenshots.battleArena = await page.screenshot({ fullPage: true })
    }

    // Check game state values
    console.log('\nChecking Game State...')
    const gameState = await page.evaluate(() => {
      // Try to find game context values
      const root = document.getElementById('root')
      return {
        rootExists: !!root,
        rootChildren: root?.children.length,
      }
    })
    console.log('Game state:', JSON.stringify(gameState))

    // Check localStorage for game data
    const localStorageData = await page.evaluate(() => {
      const keys = Object.keys(localStorage)
      /** @type {Record<string, unknown>} */
      const gameData = {}
      keys.forEach((k) => {
        if (k.includes('devops') || k.includes('game') || k.includes('quest')) {
          const raw = localStorage.getItem(k)
          if (raw === null) return
          try {
            gameData[k] = JSON.parse(raw)
          } catch {
            gameData[k] = raw
          }
        }
      })
      return gameData
    })
    console.log('LocalStorage keys:', Object.keys(localStorageData))
  } catch (error) {
    issues.push(`[Fatal] ${error instanceof Error ? error.message : String(error)}`)
  }

  // Print all issues
  console.log('\n\n=== AUDIT ISSUES FOUND ===')
  if (issues.length === 0) {
    console.log('No issues found!')
  } else {
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`)
    })
  }

  await browser.close()
  console.log('\nAudit complete!')
})()
