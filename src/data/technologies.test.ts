import { describe, it, expect } from 'vitest'
import { technologies } from './technologies'

describe('technologies', () => {
  it('exports technologies object', () => {
    expect(technologies).toBeDefined()
    expect(typeof technologies).toBe('object')
  })

  it('has technologies for all phases', () => {
    const techArray = Object.values(technologies)
    expect(techArray.length).toBeGreaterThan(0)

    // Check all have required fields
    techArray.forEach(tech => {
      expect(tech.name).toBeDefined()
      expect(tech.description).toBeDefined()
      expect(tech.topics).toBeDefined()
      expect(Array.isArray(tech.topics)).toBe(true)
    })
  })

  it('all topic IDs are non-empty strings', () => {
    const techArray = Object.values(technologies)
    techArray.forEach(tech => {
      tech.topics.forEach(topic => {
        expect(topic.id).toBeTruthy()
        expect(typeof topic.id).toBe('string')
      })
    })
  })

  it('no duplicate topic IDs across technologies', () => {
    const allTopicIds: string[] = []
    const techArray = Object.values(technologies)
    techArray.forEach(tech => {
      tech.topics.forEach(topic => {
        allTopicIds.push(topic.id)
      })
    })

    const uniqueIds = new Set(allTopicIds)
    expect(uniqueIds.size).toBe(allTopicIds.length)
  })

  it('all topics have required fields', () => {
    const techArray = Object.values(technologies)
    techArray.forEach(tech => {
      tech.topics.forEach(topic => {
        expect(topic.id).toBeTruthy()
        expect(topic.name).toBeTruthy()
        expect(topic.slug).toBeTruthy()
        expect(topic.url).toBeTruthy()
        expect(typeof topic.order).toBe('number')
      })
    })
  })

  it('html technology has correct structure', () => {
    const html = technologies.html
    expect(html.name).toBe('HTML')
    expect(html.icon).toBeDefined()
    expect(html.topics.length).toBeGreaterThan(0)
  })
})
