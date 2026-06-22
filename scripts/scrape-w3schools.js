/**
 * W3Schools Content Scraper
 *
 * This script scrapes W3Schools content and generates static JSON data.
 * Run with: node scripts/scrape-w3schools.js
 *
 * The scraped content is stored in src/data/w3schools-content.ts
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

async function scrapePage(technology, topic) {
  const url = `${BASE_URL}/${technology}/${topic}.asp`
  console.log(`Scraping: ${url}`)

  // This would normally fetch and parse the page
  // For now, return placeholder structure
  return {
    id: topic,
    name: topic.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    sections: [],
    codeExamples: [],
  }
}

async function scrapeAll() {
  console.log('Starting W3Schools content scrape...')

  const data = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    technologies: {},
  }

  for (const [techKey, techInfo] of Object.entries(TECHNOLOGIES)) {
    console.log(`\nScraping ${techInfo.name}...`)
    data.technologies[techKey] = {
      name: techInfo.name,
      icon: techInfo.icon,
      description: techInfo.description,
      topics: [],
    }

    for (const topic of techInfo.topics) {
      try {
        const content = await scrapePage(techKey, topic)
        data.technologies[techKey].topics.push(content)
      } catch (error) {
        console.error(`Error scraping ${topic}: ${error.message}`)
      }
    }
  }

  // Write to file
  const outputPath = resolve(__dirname, '../src/data/w3schools-content-generated.ts')
  const content = `// Auto-generated W3Schools content\n// Generated: ${data.lastUpdated}\n\nexport const w3schoolsContent = ${JSON.stringify(data, null, 2)} as const\n`

  writeFileSync(outputPath, content)
  console.log(`\nContent saved to: ${outputPath}`)
  console.log('Done!')
}

scrapeAll().catch(console.error)
