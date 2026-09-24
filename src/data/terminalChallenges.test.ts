// Behavior tests for the Terminal Simulator challenge bank: catalog shape, the
// category/color pairing the UI styles with, and the getRandomChallenges picker.
import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { getRandomChallenges, CATEGORY_COLORS, type TerminalChallenge } from './terminalChallenges'

const CATEGORIES: TerminalChallenge['category'][] = [
  'git',
  'docker',
  'kubernetes',
  'bash',
  'terraform',
  'aws',
]

const DIFFICULTIES: TerminalChallenge['difficulty'][] = ['beginner', 'intermediate', 'advanced']

/** The picker shuffles with `[...pool].sort(() => Math.random() - 0.5)`. */
let randomSpy: MockInstance<() => number>

function allChallenges(): TerminalChallenge[] {
  return CATEGORIES.flatMap((category) => getRandomChallenges(1000, category))
}

beforeEach(() => {
  // Pinning Math.random makes every ordered assertion below deterministic.
  randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterEach(() => {
  randomSpy.mockRestore()
})

describe('terminal challenge catalog', () => {
  it('has unique ids', () => {
    const challenges = allChallenges()
    const ids = challenges.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only uses the six shipped categories, each with a playable bank', () => {
    for (const challenge of allChallenges()) {
      expect(CATEGORIES, `${challenge.id} category`).toContain(challenge.category)
    }
    // TerminalSimulator plays a fixed number of rounds from one category, so a
    // thin bank means the same challenge twice in one run.
    for (const category of CATEGORIES) {
      expect(getRandomChallenges(1000, category).length, category).toBeGreaterThanOrEqual(3)
    }
  })

  it('stays within the three shipped difficulties', () => {
    for (const challenge of allChallenges()) {
      expect(DIFFICULTIES, `${challenge.id} difficulty`).toContain(challenge.difficulty)
    }
  })

  it('gives every challenge a runnable command, an explanation and a hint', () => {
    for (const challenge of allChallenges()) {
      expect(challenge.command.length, challenge.id).toBeGreaterThan(0)
      expect(challenge.command, challenge.id).toBe(challenge.command.trim())
      expect(challenge.description.length, challenge.id).toBeGreaterThan(0)
      expect(challenge.explanation.length, challenge.id).toBeGreaterThan(0)
      // `hint` is optional in the type but the pedagogy needs one: a challenge
      // without a hint leaves the player stranded with no way forward.
      expect(challenge.hint, `${challenge.id} hint`).toBeDefined()
      expect(challenge.hint?.length ?? 0, challenge.id).toBeGreaterThan(0)
    }
  })

  it('keeps every command inside its category tool', () => {
    const LEAD_TOKEN: Record<TerminalChallenge['category'], string[]> = {
      git: ['git'],
      docker: ['docker', 'docker-compose'],
      kubernetes: ['kubectl'],
      bash: [],
      terraform: ['terraform'],
      aws: ['aws'],
    }
    for (const challenge of allChallenges()) {
      const prefixes = LEAD_TOKEN[challenge.category]
      if (prefixes.length > 0) {
        expect(
          prefixes.some((prefix) => challenge.command.startsWith(`${prefix} `)),
          `${challenge.id}: ${challenge.command}`,
        ).toBe(true)
      }
    }
    // Bash challenges are shell built-ins/coreutils, so none of them may be a
    // different tool's command (e.g. `kubectl` filed under bash).
    expect(getRandomChallenges(1000, 'bash').map((c) => c.command)).toEqual([
      'ls -la',
      'cd ~',
      'grep -r "error" ./logs',
      'chmod +x script.sh',
      'cat file.txt | wc -l',
    ])
  })

  it('ships one color per category, keyed by exact category names', () => {
    expect(CATEGORY_COLORS).toEqual({
      git: '#f05032',
      docker: '#2496ed',
      kubernetes: '#326ce5',
      bash: '#4eaa25',
      terraform: '#7b42bc',
      aws: '#ff9900',
    })
    expect(Object.keys(CATEGORY_COLORS).sort()).toEqual([...CATEGORIES].sort())
    for (const color of Object.values(CATEGORY_COLORS)) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('ships the exact bank for one spot-checked category', () => {
    expect(getRandomChallenges(1000, 'terraform').map((c) => c.id)).toEqual([
      'tf_init',
      'tf_plan',
      'tf_apply',
    ])
  })
})

describe('getRandomChallenges', () => {
  it('deals the first N entries of the pool when the shuffle is a no-op (0.5 offset)', () => {
    expect(getRandomChallenges(3).map((c) => c.id)).toEqual([
      'git_status',
      'git_add_all',
      'git_commit',
    ])
    expect(getRandomChallenges(2, 'kubernetes').map((c) => c.id)).toEqual([
      'k8s_get_pods',
      'k8s_get_all',
    ])
  })

  it('only ever deals from the requested category', () => {
    for (const challenge of getRandomChallenges(1000, 'docker')) {
      expect(challenge.category).toBe('docker')
    }
  })

  it('caps the deal at the pool size instead of repeating challenges', () => {
    const dealt = getRandomChallenges(500, 'git')
    expect(dealt).toHaveLength(8)
    expect(new Set(dealt.map((c) => c.id)).size).toBe(8)
  })

  it('deals an empty run when no rounds are requested', () => {
    expect(getRandomChallenges(0)).toEqual([])
    expect(getRandomChallenges(0, 'aws')).toEqual([])
  })

  it('actually shuffles: a non-uniform random source reorders the pool', () => {
    // Catalog order, then a deliberate alternating comparator.
    randomSpy.mockReturnValue(0.5)
    const pool = getRandomChallenges(1000, 'git')
    let call = 0
    randomSpy.mockImplementation(() => (call++ % 2 === 0 ? 0.9 : 0.1))
    const dealt = getRandomChallenges(1000, 'git')

    expect([...dealt].map((c) => c.id).sort()).toEqual([...pool].map((c) => c.id).sort())
    const moved = dealt.filter((c, index) => c.id !== pool[index].id)
    expect(moved.length, 'challenges that changed position').toBeGreaterThanOrEqual(3)
  })

  it('hands back a fresh array: mutating a deal never corrupts later deals', () => {
    const first = getRandomChallenges(4, 'aws')
    first.length = 0
    expect(getRandomChallenges(1000, 'aws')).toHaveLength(3)
  })
})
