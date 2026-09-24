/**
 * W3Schools Content Scraper
 *
 * This script scrapes W3Schools content and generates static TypeScript data.
 * Run with: node scripts/scrape-w3schools.js
 *
 * The scraped content is stored in src/data/w3schools-content.ts and matches
 * the W3SchoolsData schema consumed by the app (Section { heading, content },
 * codeExamples: string[]).
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Technologies to scrape
const TECHNOLOGIES = {
  html: {
    name: 'HTML',
    icon: '📄',
    description: 'The standard markup language for Web pages',
    topics: [
      'html_intro',
      'html_editors',
      'html_basic',
      'html_elements',
      'html_attributes',
      'html_headings',
      'html_paragraphs',
      'html_styles',
      'html_formatting',
      'html_links',
      'html_images',
      'html_lists',
      'html_classes',
      'html_id',
      'html_forms',
    ],
  },
  css: {
    name: 'CSS',
    icon: '🎨',
    description: 'Style sheet language for Web pages',
    topics: [
      'css_intro',
      'css_syntax',
      'css_selectors',
      'css_colors',
      'css_background',
      'css_boxmodel',
      'css_padding',
      'css_margin',
      'css_flexbox',
      'css_grid',
    ],
  },
  javascript: {
    name: 'JavaScript',
    icon: '⚡',
    description: 'The programming language of the Web',
    topics: [
      'js_intro',
      'js_whereto',
      'js_output',
      'js_syntax',
      'js_variables',
      'js_operators',
      'js_datatypes',
      'js_functions',
      'js_objects',
      'js_arrays',
    ],
  },
  python: {
    name: 'Python',
    icon: '🐍',
    description: 'A popular programming language',
    topics: [
      'python_intro',
      'python_syntax',
      'python_variables',
      'python_data_types',
      'python_strings',
      'python_booleans',
      'python_lists',
      'python_functions',
      'python_dictionaries',
    ],
  },
  sql: {
    name: 'SQL',
    icon: '🗄️',
    description: 'Standard language for data manipulation',
    topics: [
      'sql_intro',
      'sql_syntax',
      'sql_select',
      'sql_where',
      'sql_and_or',
      'sql_orderby',
      'sql_insert',
      'sql_update',
      'sql_delete',
    ],
  },
}

const BASE_URL = 'https://www.w3schools.com'

/**
 * @typedef {Object} Section
 * @property {string} heading
 * @property {string} content
 */

/**
 * @typedef {Object} TopicContent
 * @property {string} id
 * @property {string} name
 * @property {Section[]} sections
 * @property {string[]} codeExamples
 */

/**
 * @typedef {Object} TechnologyContent
 * @property {string} name
 * @property {string} icon
 * @property {string} description
 * @property {TopicContent[]} topics
 */

/** Minimal HTML entity decoding for text extracted from scraped pages. */
/**
 * @param {string} text
 * @returns {string}
 */
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/** Removes tags, decodes entities and collapses whitespace. */
/**
 * @param {string} html
 * @returns {string}
 */
function textOf(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

/** Extracts the page's main content column, or the whole document as fallback. */
/**
 * @param {string} html
 * @returns {string}
 */
function mainRegion(html) {
  const start = html.indexOf('id="main"')
  if (start === -1) return html
  const end = html.indexOf('id="footer"', start)
  return html.slice(start, end === -1 ? undefined : end)
}

/**
 * Fetches and parses one W3Schools topic page into the app's TopicContent shape.
 * @param {string} technology
 * @param {string} topic
 * @returns {Promise<TopicContent>}
 */
async function scrapePage(technology, topic) {
  const url = `${BASE_URL}/${technology}/${topic}.asp`
  console.log(`Scraping: ${url}`)

  const response = await fetch(url, {
    headers: { 'User-Agent': 'devopsquest-content-scraper/2.0' },
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${url}`)
  }
  const html = await response.text()

  const main = mainRegion(html)
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(main)
  const name = h1 ? textOf(h1[1]) : topic.replace(/_/g, ' ')

  // Split the main region into sections on <h2> boundaries; the preamble
  // (before the first <h2>) becomes the first section named after the topic.
  const chunks = main.split(/<h2[^>]*>/)
  /** @type {Section[]} */
  const sections = []
  if (chunks[0]) {
    const intro = textOf(chunks[0].replace(/<h1[\s\S]*?<\/h1>/, ''))
    if (intro) sections.push({ heading: name, content: intro })
  }
  for (const chunk of chunks.slice(1)) {
    const headingEnd = chunk.indexOf('</h2>')
    if (headingEnd === -1) continue
    const heading = textOf(chunk.slice(0, headingEnd))
    const body = textOf(chunk.slice(headingEnd + 5))
    if (heading && body) sections.push({ heading, content: body })
  }

  const codeExamples = [...main.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)]
    .map((m) => decodeEntities(m[1].replace(/<[^>]*>/g, '')).trim())
    .filter((code) => code.length > 0)

  if (sections.length === 0) {
    throw new Error(`No readable content extracted from ${url}`)
  }

  return { id: topic, name, sections, codeExamples }
}

async function scrapeAll() {
  console.log('Starting W3Schools content scrape...')

  const data = {
    version: '2.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    /** @type {Record<string, TechnologyContent>} */
    technologies: {},
  }

  for (const [techKey, techInfo] of Object.entries(TECHNOLOGIES)) {
    console.log(`\nScraping ${techInfo.name}...`)
    /** @type {TopicContent[]} */
    const topics = []

    for (const topic of techInfo.topics) {
      try {
        topics.push(await scrapePage(techKey, topic))
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Error scraping ${topic}: ${message}`)
      }
    }

    data.technologies[techKey] = {
      name: techInfo.name,
      icon: techInfo.icon,
      description: techInfo.description,
      topics,
    }
  }

  // Write to file using the exact schema the app imports.
  const outputPath = resolve(__dirname, '../src/data/w3schools-content.ts')
  const content = `// Auto-generated W3Schools content - stored as static data
// Generated by scripts/scrape-w3schools.js on ${data.lastUpdated}
// Regenerate with: npm run scrape

interface Section {
  heading: string
  content: string
}

interface TopicContent {
  id: string
  name: string
  sections: Section[]
  codeExamples: string[]
}

interface TechnologyContent {
  name: string
  icon: string
  description: string
  topics: TopicContent[]
}

export interface W3SchoolsData {
  version: string
  lastUpdated: string
  technologies: Record<string, TechnologyContent>
}

export const w3schoolsContent: W3SchoolsData = ${JSON.stringify(data, null, 2)}
`

  writeFileSync(outputPath, content)
  console.log(`\nContent saved to: ${outputPath}`)
  console.log('Done!')
}

scrapeAll().catch((/** @type {unknown} */ error) => {
  console.error(error)
  process.exitCode = 1
})
