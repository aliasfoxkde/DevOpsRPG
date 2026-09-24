import { chromium } from 'playwright'
import fs from 'fs'
import { asArray, asRecord, numField, strField } from './lib/json.mjs'

/**
 * Resource timing entry as exposed by Chromium, which adds the non-standard
 * `responseStatus` field on top of the standard resource timing fields.
 * @typedef {{ name: string, responseStatus?: number }} ResourceEntry
 */

// Target app origin; override with AUDIT_URL when auditing a non-local deploy.
// Paths are appended to BASE_URL below, so strip any trailing slash.
const BASE_URL = (process.env.AUDIT_URL ?? 'http://localhost:5173').replace(/\/+$/, '')

void (async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await context.newPage()

  const issues = []

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
    // First, let's load the game
    console.log('Loading game and extracting state...')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)

    // Extract game state from localStorage
    const gameState = await page.evaluate(() => {
      const data = localStorage.getItem('devopsquest_game')
      if (!data) return null
      /** @type {unknown} */
      const parsed = JSON.parse(data)
      return parsed
    })
    const state = asRecord(gameState)
    const character = state ? asRecord(state.character) : null

    if (state) {
      console.log('\n=== GAME STATE ANALYSIS ===')

      // Character analysis
      if (character) {
        const currentXP = numField(character, 'currentXP') ?? 0
        const xpToNextLevel = numField(character, 'xpToNextLevel')
        console.log('\n--- Character ---')
        console.log('Level:', numField(character, 'level') ?? '?')
        console.log('XP:', currentXP, '/', xpToNextLevel ?? '?')
        console.log('Gold:', numField(character, 'gold') ?? '?')
        console.log('Streak:', numField(character, 'streakDays') ?? '?')
        console.log('Class:', strField(character, 'class') ?? '?')

        // Check XP calculation
        if (xpToNextLevel !== undefined && xpToNextLevel > 0) {
          const xpPercent = (currentXP / xpToNextLevel) * 100
          console.log('XP Progress:', `${xpPercent.toFixed(1)}%`)
        }
      }

      // Completed quests analysis
      const completedQuests = state.completedQuests ? asArray(state.completedQuests) : null
      if (completedQuests) {
        console.log('\n--- Completed Quests ---')
        console.log('Total completed:', completedQuests.length)

        // Analyze difficulty distribution
        /** @type {Record<string, number>} */
        const difficulties = { beginner: 0, intermediate: 0, advanced: 0 }
        completedQuests.forEach((q) => {
          const difficulty =
            q !== null && typeof q === 'object'
              ? strField(asRecord(q) ?? {}, 'difficulty')
              : undefined
          if (difficulty) difficulties[difficulty]++
        })
        console.log('By difficulty:', difficulties)
      }

      // Check for badges
      const badges = state.badges ? asArray(state.badges) : null
      if (badges) {
        console.log('\n--- Badges ---')
        console.log('Unlocked badges:', badges.length)
      }

      // Analyze topic/quest data
      console.log('\n--- Game Data Analysis ---')

      // Count total quests available
      const questsResponse = await page.evaluate(() => {
        // Try to find quest counts in the DOM
        const questCards = document.querySelectorAll(
          '[class*="quest-card"], [class*="QuestCard"], [class*="quest"]',
        )
        return {
          questCardCount: questCards.length,
          bodyText: document.body.innerText.substring(0, 500),
        }
      })
      console.log('Quest cards in DOM:', questsResponse.questCardCount)
    }

    // Now check specific pages for issues
    const pages = [
      { name: 'Home', url: '/' },
      { name: 'Quests', url: '/quests' },
      { name: 'WorldMap', url: '/worldmap' },
      { name: 'Character', url: '/character' },
      { name: 'Badges', url: '/badges' },
      { name: 'Rewards', url: '/rewards' },
      { name: 'Leaderboard', url: '/leaderboard' },
      { name: 'Social', url: '/social' },
      { name: 'Guild', url: '/guild' },
      { name: 'CareerPath', url: '/career-path' },
      { name: 'Storylines', url: '/storylines' },
      { name: 'BattleArena', url: '/quest/first-quest' },
    ]

    for (const p of pages) {
      console.log(`\nAnalyzing ${p.name}...`)
      try {
        await page.goto(`${BASE_URL}${p.url}`, {
          waitUntil: 'networkidle',
          timeout: 10000,
        })
        await page.waitForTimeout(2000)

        // Check for horizontal scroll
        const hasHScroll = await page.evaluate(
          () => document.body.scrollWidth > document.documentElement.clientWidth,
        )
        if (hasHScroll) {
          issues.push(`[${p.name}] Horizontal scrollbar detected`)
        }

        // Check for visible errors in UI
        const errorTexts = await page.evaluate(() => {
          const errors = []
          // Look for common error patterns
          const body = document.body.innerText
          if (body.includes('undefined')) errors.push('Contains "undefined"')
          if (body.includes('null')) errors.push('Contains "null"')
          if (body.includes('NaN')) errors.push('Contains "NaN"')
          if (body.includes('Error')) errors.push('Contains "Error"')
          return errors
        })
        if (errorTexts.length > 0) {
          issues.push(`[${p.name}] UI Text Issues: ${errorTexts.join(', ')}`)
        }

        // Check for broken images/resources
        const failedResources = await page.evaluate(() => {
          return performance
            .getEntriesByType('resource')
            .map((r) => /** @type {ResourceEntry} */ (r))
            .filter((r) => typeof r.responseStatus === 'number' && r.responseStatus >= 400)
            .map((r) => ({ url: r.name, status: r.responseStatus }))
        })
        if (failedResources.length > 0) {
          issues.push(
            `[${p.name}] Failed resources: ${JSON.stringify(failedResources.slice(0, 3))}`,
          )
        }
      } catch (e) {
        issues.push(`[${p.name}] Navigation error: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    // Check quests data file for difficulty ratings
    console.log('\n=== ANALYZING QUEST DATA ===')
    // The specifier is built at runtime: Node only resolves .ts sources when a
    // loader is installed, so this import is expected to fail harmlessly.
    const questsModuleUrl = new URL('../src/data/quests.ts', import.meta.url).href
    /** @type {unknown} */
    let questsModule = null
    try {
      questsModule = await import(questsModuleUrl)
    } catch {
      // Node only resolves .ts sources when a loader is installed, so this
      // import is expected to fail harmlessly under plain Node.
      questsModule = null
    }
    if (questsModule) {
      console.log('Quests module loaded')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? (error.stack ?? '') : ''
    issues.push(`[Fatal] ${message}\n${stack}`)
  }

  // Print all issues
  console.log(`\n\n=== AUDIT ISSUES FOUND (${issues.length}) ===`)
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`)
  })

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    issues,
    summary: {
      totalIssues: issues.length,
      /** @type {Record<string, number>} */
      categories: {},
    },
  }

  issues.forEach((issue) => {
    const category = issue.match(/^\[([^\]]+)\]/)?.[1] || 'Unknown'
    report.summary.categories[category] = (report.summary.categories[category] || 0) + 1
  })

  fs.writeFileSync('./audit-report.json', JSON.stringify(report, null, 2))
  console.log('\nReport saved to audit-report.json')

  await browser.close()
  console.log('\nDeep audit complete!')
})()
