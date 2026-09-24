// Behavior tests for the quiz lookup helpers: direct topic lookups, alias
// fallbacks for mismatched naming conventions, and question integrity.
import { describe, it, expect } from 'vitest'
import { getQuizForTopic, quizzes } from './quizzes'

describe('quizzes catalog', () => {
  it('holds a non-empty question list for every topic key', () => {
    const keys = Object.keys(quizzes)
    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) {
      expect(quizzes[key].length, `${key} should have questions`).toBeGreaterThan(0)
    }
  })

  it('returns the exact question list for a known topic', () => {
    expect(getQuizForTopic('html_intro')).toEqual(quizzes.html_intro)
    expect(getQuizForTopic('html_intro').map((q) => q.id)).toEqual([
      'html_intro_q1',
      'html_intro_q2',
    ])
  })

  it('resolves every catalog key through getQuizForTopic', () => {
    for (const key of Object.keys(quizzes)) {
      expect(getQuizForTopic(key)).toBe(quizzes[key])
    }
  })
})

describe('getQuizForTopic alias fallback', () => {
  // Mirrors QUIZ_ALIASES in quizzes.ts: a few quizzes are stored under short
  // keys, so the canonical topic id resolves through its alias list.
  const aliasCases: Array<[topicId: string, storedKey: string]> = [
    ['python_intro', 'py_intro'],
    ['python_syntax', 'py_syntax'],
    ['python_variables', 'py_variables'],
    ['python_lists', 'py_lists'],
    ['python_functions', 'py_functions'],
    ['css_boxmodel', 'css_box_model'],
  ]

  it('each documented pair resolves to a stored quiz', () => {
    for (const [, storedKey] of aliasCases) {
      expect(quizzes[storedKey], `${storedKey} should exist`).toBeDefined()
    }
  })

  it.each(aliasCases)('resolves the %s topic to the %s quiz', (topicId, storedKey) => {
    expect(getQuizForTopic(topicId)).toBe(quizzes[storedKey])
  })

  it('ignores alias entries that are not catalog keys', () => {
    // QUIZ_ALIASES also lists short forms ('py_var', 'py_list', 'py_func') as
    // second aliases; those are never stored, so the short id yields nothing.
    expect(quizzes.py_var).toBeUndefined()
    expect(getQuizForTopic('py_var')).toEqual([])
  })

  it('returns the stored quiz directly when the topic id is a catalog key', () => {
    expect(getQuizForTopic('py_intro')).toBe(quizzes.py_intro)
  })

  it('returns no questions for an unknown topic', () => {
    expect(getQuizForTopic('definitely_not_a_topic')).toEqual([])
  })
})

describe('quiz question integrity', () => {
  it('gives every question a unique id, topicId and explanation within its quiz', () => {
    for (const [key, questions] of Object.entries(quizzes)) {
      const ids = new Set(questions.map((q) => q.id))
      expect(ids.size, `${key} duplicate question ids`).toBe(questions.length)
      for (const question of questions) {
        expect(question.topicId).toBe(key)
        expect(question.question.length).toBeGreaterThan(0)
        expect(question.explanation.length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps multiple choice answers inside their option list', () => {
    for (const [key, questions] of Object.entries(quizzes)) {
      for (const question of questions) {
        if (!question.correctIndex) continue
        expect(question.options, `${key}/${question.id} needs options`).toBeDefined()
        expect(
          question.correctIndex,
          `${key}/${question.id} correctIndex out of range`,
        ).toBeLessThan(question.options?.length ?? 0)
        expect(question.correctIndex).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
