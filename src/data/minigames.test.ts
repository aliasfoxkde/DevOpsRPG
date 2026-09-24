// Behavior tests for the minigame content catalogs (Command Typer pool, Memory
// Match icons, Math Challenge answers, code puzzles) and the getRandomCommands
// picker that deals a play session.
import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import {
  getRandomCommands,
  memoryIcons,
  mathChallenges,
  codePuzzles,
  type Command,
} from './minigames'

const CATEGORIES: Command['category'][] = ['git', 'docker', 'bash', 'kubernetes', 'aws']

const ID_PREFIX_BY_CATEGORY: Record<Command['category'], string> = {
  git: 'git_',
  docker: 'docker_',
  bash: 'bash_',
  kubernetes: 'k8s_',
  aws: 'aws_',
}

function allCommands(): Command[] {
  return CATEGORIES.flatMap((category) => getRandomCommands(1000, category))
}

describe('command catalog', () => {
  it('has unique ids across every category', () => {
    const commands = allCommands()
    const ids = commands.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only uses the five shipped categories, each with a playable pool', () => {
    for (const command of allCommands()) {
      expect(CATEGORIES, `${command.id} category`).toContain(command.category)
    }
    // CommandTyper deals `rounds` (default 5) from one category, so a category
    // with fewer than 4 entries would repeat the same short session.
    for (const category of CATEGORIES) {
      expect(getRandomCommands(1000, category).length, category).toBeGreaterThanOrEqual(4)
    }
  })

  it('keeps ids prefixed by their category and commands clean of stray whitespace', () => {
    for (const command of allCommands()) {
      expect(command.id.startsWith(ID_PREFIX_BY_CATEGORY[command.category]), command.id).toBe(true)
      expect(command.command, command.id).toBe(command.command.trim())
      expect(command.command.length, command.id).toBeGreaterThan(0)
      expect(command.description.length, command.id).toBeGreaterThan(0)
    }
  })

  it('contains the exact canonical commands for one entry per category', () => {
    const byId = new Map(allCommands().map((c) => [c.id, c]))
    expect(byId.get('git_clone')).toEqual({
      id: 'git_clone',
      command: 'git clone',
      description: 'Clone a repository',
      category: 'git',
    })
    expect(byId.get('docker_run')?.command).toBe('docker run')
    expect(byId.get('bash_ls')?.command).toBe('ls -la')
    expect(byId.get('k8s_get_pods')?.command).toBe('kubectl get pods')
    expect(byId.get('aws_s3_ls')?.command).toBe('aws s3 ls')
  })
})

describe('getRandomCommands', () => {
  let randomSpy: MockInstance<() => number>

  beforeEach(() => {
    // The picker shuffles with `[...pool].sort(() => Math.random() - 0.5)`.
    // Pinning Math.random makes the dealt hand fully deterministic.
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    randomSpy.mockRestore()
  })

  it('deals the first N entries of the pool when the shuffle is a no-op (0.5 offset)', () => {
    expect(getRandomCommands(3, 'git').map((c) => c.id)).toEqual([
      'git_clone',
      'git_commit',
      'git_push',
    ])
    expect(getRandomCommands(2).map((c) => c.id)).toEqual(['git_clone', 'git_commit'])
  })

  it('never deals more than the pool holds', () => {
    expect(getRandomCommands(500, 'aws')).toHaveLength(4)
    expect(getRandomCommands(500, 'aws').map((c) => c.id)).toEqual([
      'aws_s3_ls',
      'aws_ec2_desc',
      'aws_s3_cp',
      'aws_lambda',
    ])
  })

  it('deals an empty hand for a zero-round game', () => {
    expect(getRandomCommands(0)).toEqual([])
    expect(getRandomCommands(0, 'docker')).toEqual([])
  })

  it('hands back a fresh array: mutating a deal never corrupts later deals', () => {
    const first = getRandomCommands(5, 'kubernetes')
    first.length = 0
    expect(getRandomCommands(5, 'kubernetes')).toHaveLength(5)
    expect(getRandomCommands(1000, 'kubernetes')).toHaveLength(6)
  })

  it('actually shuffles: a non-uniform random source reorders the pool', () => {
    // Catalog order, then a deliberate alternating comparator.
    randomSpy.mockReturnValue(0.5)
    const pool = getRandomCommands(1000, 'git')
    let call = 0
    randomSpy.mockImplementation(() => (call++ % 2 === 0 ? 0.9 : 0.1))
    const dealt = getRandomCommands(1000, 'git')

    // Same cards, different order: it is a permutation, not a copy.
    expect([...dealt].map((c) => c.id).sort()).toEqual([...pool].map((c) => c.id).sort())
    const moved = dealt.filter((c, index) => c.id !== pool[index].id)
    expect(moved.length, 'cards that changed position').toBeGreaterThanOrEqual(5)
  })

  it('a negative count is outside the contract and slices from the pool tail', () => {
    // Documented quirk: Array.slice treats a negative end as an offset from the
    // end, so a negative count silently drops entries. No caller passes one,
    // and this pins the behaviour so a future change is deliberate.
    expect(getRandomCommands(-1, 'aws').map((c) => c.id)).toEqual([
      'aws_s3_ls',
      'aws_ec2_desc',
      'aws_s3_cp',
    ])
  })
})

describe('memoryIcons', () => {
  it('has unique ids, glyphs and names', () => {
    expect(new Set(memoryIcons.map((i) => i.id)).size).toBe(memoryIcons.length)
    expect(new Set(memoryIcons.map((i) => i.icon)).size).toBe(memoryIcons.length)
    expect(new Set(memoryIcons.map((i) => i.name)).size).toBe(memoryIcons.length)
  })

  it('offers enough distinct icons for a multi-pair board', () => {
    // MemoryMatch deals pairs; 12 distinct icons supports a 6+ pair board
    // without ever repeating a glyph.
    expect(memoryIcons.length).toBeGreaterThanOrEqual(8)
    for (const icon of memoryIcons) {
      expect(icon.icon.length, icon.id).toBeGreaterThan(0)
      expect(icon.name.length, icon.id).toBeGreaterThan(0)
    }
  })

  it('exposes the exact icons the component test fixtures rely on', () => {
    expect(memoryIcons[0]).toEqual({ id: 'html', icon: '📄', name: 'HTML' })
    expect(memoryIcons[1]).toEqual({ id: 'css', icon: '🎨', name: 'CSS' })
    expect(memoryIcons[memoryIcons.length - 1]).toEqual({
      id: 'cloud',
      icon: '⛅',
      name: 'Cloud',
    })
  })
})

describe('mathChallenges', () => {
  it('recomputes every answer from the real arithmetic', () => {
    const answers = Object.fromEntries(mathChallenges.map((c) => [c.id, c.answer]))
    expect(answers).toEqual({
      bits_1: 8, // bits in a byte
      bits_2: 2 ** 10, // bytes in a KB
      bits_3: 1024, // MB in a GB
      docker_tag: 2 ** 3, // 2^3 layers
      port_443: Math.sqrt(81), // square root of 81
      cpu_cores: 2 ** 6, // 2^6 addressable slots
      hex_ff: 8, // ones in 0b11111111
      subnet: 2 ** 16 - 2, // usable hosts in a /16
      memory_1: 1, // 2^10 KB in MB
      container_1: 3 * 512, // 3 pods * 512MB
      replicas_1: 5 - 2, // scale 2 -> 5
      build_time: 3600 / 90, // builds per hour
    })
  })

  it('gives every challenge a unique id, question and hint', () => {
    const ids = mathChallenges.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const challenge of mathChallenges) {
      expect(challenge.question.length, challenge.id).toBeGreaterThan(0)
      expect(challenge.hint.length, challenge.id).toBeGreaterThan(0)
      expect(Number.isFinite(challenge.answer), challenge.id).toBe(true)
      expect(challenge.answer, challenge.id).toBeGreaterThan(0)
    }
  })
})

describe('codePuzzles', () => {
  it('leaves exactly one blank for the player to fill', () => {
    for (const puzzle of codePuzzles) {
      expect(puzzle.code.includes('___'), `${puzzle.id}: ${puzzle.code}`).toBe(true)
      expect(puzzle.code.indexOf('___')).toBe(puzzle.code.lastIndexOf('___'))
    }
  })

  it('offers unique distractors so exactly one option is correct', () => {
    for (const puzzle of codePuzzles) {
      const options = puzzle.options
      expect(options, `${puzzle.id} options`).toBeDefined()
      if (!options) throw new Error(`puzzle ${puzzle.id} has no options`)
      expect(new Set(options).size).toBe(options.length)
      expect(options.filter((option) => option === puzzle.answer)).toHaveLength(1)
    }
  })

  it('stays solvable: every answer is a non-empty string that fits the blank', () => {
    for (const puzzle of codePuzzles) {
      expect(puzzle.answer.length, puzzle.id).toBeGreaterThan(0)
      expect(puzzle.answer, puzzle.id).toBe(puzzle.answer.trim())
      expect(puzzle.title.length, puzzle.id).toBeGreaterThan(0)
      expect(puzzle.description.length, puzzle.id).toBeGreaterThan(0)
    }
  })

  it('covers the shipped puzzle set', () => {
    expect(codePuzzles.map((p) => p.id)).toEqual([
      'html_tag',
      'css_prop',
      'js_var',
      'git_cmd',
      'docker_img',
      'array_idx',
      'python_list',
      'yaml_bool',
      'json_key',
      'sql_select',
    ])
  })
})
