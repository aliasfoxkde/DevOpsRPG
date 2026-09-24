import { chromium } from 'playwright'
import { asArray, asRecord, numField } from './lib/json.mjs'

// Target app origin; override with AUDIT_URL when auditing a non-local deploy.
// Paths are appended to BASE_URL below, so strip any trailing slash.
const BASE_URL = (process.env.AUDIT_URL ?? 'http://localhost:5173').replace(/\/+$/, '')

void (async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  const page = await context.newPage()

  const issues = []

  // Clear localStorage first
  console.log('Clearing localStorage and reloading...')
  await page.goto(`${BASE_URL}/`)
  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    localStorage.removeItem('devopsquest_game')
  })
  await page.reload()
  await page.waitForTimeout(3000)

  console.log('\n=== FRESH GAME STATE ANALYSIS ===\n')

  // Extract fresh game state
  const gameState = await page.evaluate(() => {
    const data = localStorage.getItem('devopsquest_game')
    if (!data) return null
    /** @type {unknown} */
    const parsed = JSON.parse(data)
    return parsed
  })

  const state = asRecord(gameState)
  const character = state ? asRecord(state.character) : null
  const completedQuests = state?.completedQuests ? asArray(state.completedQuests) : null
  const badges = state?.badges ? asArray(state.badges) : null
  const sideQuests = state?.sideQuests ? asArray(state.sideQuests) : null
  const badgesUnlocked =
    badges?.filter((b) => {
      const badge = asRecord(b)
      return badge !== null && badge.unlockedAt !== undefined
    }).length || 0

  if (state) {
    console.log('Character:', JSON.stringify(character, null, 2))
    console.log('\nCompleted Quests:', completedQuests?.length || 0)
    console.log('Badges Unlocked:', badgesUnlocked, '/', badges?.length || 0)
    console.log('Side Quests:', sideQuests?.length || 0)

    // Check if XP calculation is correct
    const level = character ? numField(character, 'level') : undefined
    const xp = character ? numField(character, 'xp') : undefined
    const xpToNextLevel = character ? numField(character, 'xpToNextLevel') : undefined
    if (level !== undefined && xp !== undefined && xpToNextLevel !== undefined) {
      const XP_PER_LEVEL = 100
      const xpInCurrentLevel = xp - (level - 1) * XP_PER_LEVEL
      console.log('\n=== XP CALCULATION CHECK ===')
      console.log('Total XP:', xp)
      console.log('Level:', level)
      console.log('XP to next level:', xpToNextLevel)
      console.log('XP in current level:', xpInCurrentLevel)
      const progress =
        xpInCurrentLevel >= 0 ? ((xpInCurrentLevel / XP_PER_LEVEL) * 100).toFixed(1) : 'INVALID'
      console.log('Progress %:', progress)
    }
  } else {
    console.log('No game state found in localStorage')
  }

  // Now check the XP bar on the page
  console.log('\n=== XP BAR UI CHECK ===')
  const xpBarText = await page.textContent('header')
  console.log('XP Bar text:', xpBarText?.replace(/\s+/g, ' ').substring(0, 150))

  // Check for horizontal scroll
  const hasHScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  console.log('\nHorizontal scrollbar:', hasHScroll)

  if (hasHScroll) {
    const scrollAmount = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    issues.push(`[Layout] Horizontal scrollbar - overflows by ${scrollAmount}px`)
  }

  // Check HUD nav overflow
  const navInfo = await page.evaluate(() => {
    const nav = document.querySelector('header nav')
    if (!nav) return { error: 'No nav found' }
    const rect = nav.getBoundingClientRect()
    return {
      width: Math.round(rect.width),
      right: Math.round(rect.right),
      windowWidth: window.innerWidth,
      overflow: Math.round(rect.right - window.innerWidth),
    }
  })
  console.log('Nav info:', JSON.stringify(navInfo))

  if (navInfo.overflow !== undefined && navInfo.overflow > 0) {
    issues.push(`[Layout] Navigation overflows by ${navInfo.overflow}px`)
  }

  // Test completing a quest - go to quests page
  console.log('\n=== QUEST PAGE CHECK ===')
  await page.goto(`${BASE_URL}/quests`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const questInfo = await page.evaluate(() => {
    return {
      url: window.location.href,
      bodyText: document.body.innerText.substring(0, 400),
    }
  })
  console.log('Quest page URL:', questInfo.url)
  console.log('Quest page text:', questInfo.bodyText.replace(/\s+/g, ' '))

  // Check world map
  console.log('\n=== WORLD MAP CHECK ===')
  await page.goto(`${BASE_URL}/worldmap`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const mapInfo = await page.evaluate(() => {
    return {
      url: window.location.href,
      bodyText: document.body.innerText.substring(0, 300),
    }
  })
  console.log('World map URL:', mapInfo.url)
  console.log('World map text:', mapInfo.bodyText.replace(/\s+/g, ' '))

  // Check leaderboard
  console.log('\n=== LEADERBOARD CHECK ===')
  try {
    await page.goto(`${BASE_URL}/leaderboard`, {
      waitUntil: 'networkidle',
      timeout: 10000,
    })
    await page.waitForTimeout(2000)
    const lbInfo = await page.evaluate(() => ({
      url: window.location.href,
      bodyText: document.body.innerText.substring(0, 300),
    }))
    console.log('Leaderboard URL:', lbInfo.url)
    console.log('Leaderboard text:', lbInfo.bodyText.replace(/\s+/g, ' '))
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    issues.push(`[Leaderboard] Failed to load: ${message}`)
    console.log('Leaderboard error:', message)
  }

  // Check storylines
  console.log('\n=== STORYLINES CHECK ===')
  try {
    await page.goto(`${BASE_URL}/storylines`, {
      waitUntil: 'networkidle',
      timeout: 10000,
    })
    await page.waitForTimeout(2000)
    const slInfo = await page.evaluate(() => ({
      url: window.location.href,
      bodyText: document.body.innerText.substring(0, 300),
    }))
    console.log('Storylines URL:', slInfo.url)
    console.log('Storylines text:', slInfo.bodyText.replace(/\s+/g, ' '))
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    issues.push(`[Storylines] Failed to load: ${message}`)
    console.log('Storylines error:', message)
  }

  // Print issues
  console.log('\n\n=== ISSUES FOUND ===')
  if (issues.length === 0) {
    console.log('No critical issues found!')
  } else {
    issues.forEach((i) => {
      console.log(`- ${i}`)
    })
  }

  await browser.close()
})()
