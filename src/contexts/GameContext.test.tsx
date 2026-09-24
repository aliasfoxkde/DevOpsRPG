// Behavior tests for the core game state context: XP/level transitions,
// quest completion, persistence with backup recovery, and cross-tab sync.
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, act } from '@testing-library/react'
import { STORAGE_KEYS, XP_PER_LEVEL, GOLD_XP_RATIO } from '@/utils/gameUtils'
import { allQuests } from '@/data/quests'
import { BADGES } from '@/data/badges'
import { click, renderGame } from './test-utils'
import { useGame } from './GameContext'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSavedState(value: unknown): value is { character: { xp: number; level: number } } {
  return (
    isRecord(value) &&
    isRecord(value.character) &&
    typeof value.character.xp === 'number' &&
    typeof value.character.level === 'number'
  )
}

function Harness() {
  const game = useGame()
  return (
    <div>
      <span data-testid="name">{game.game.character.name}</span>
      <span data-testid="level">{game.game.character.level}</span>
      <span data-testid="xp">{game.game.character.xp}</span>
      <span data-testid="gold">{game.game.character.gold}</span>
      <span data-testid="xp-to-next">{game.game.character.xpToNextLevel}</span>
      <span data-testid="quest-count">{game.game.completedQuests.length}</span>
      <span data-testid="victory">{String(game.game.showVictory)}</span>
      <span data-testid="shields">{game.game.character.streakShields}</span>
      <span data-testid="completed-ids">
        {game.game.completedQuests.map((q) => q.questId).join(',')}
      </span>
      <button
        onClick={() => {
          game.addXP(XP_PER_LEVEL)
        }}
      >
        add-level-xp
      </button>
      <button
        onClick={() => {
          game.addGold(42)
        }}
      >
        add-gold
      </button>
      <button
        onClick={() => {
          game.completeOnboarding('Ada', 'Data Mage')
        }}
      >
        onboard
      </button>
      <button
        onClick={() => {
          game.grantBadge('perfectionist')
        }}
      >
        grant-badge
      </button>
      <button
        onClick={() => {
          game.grantBadge('no_such_badge')
        }}
      >
        grant-bad-badge
      </button>
      <button
        onClick={() => {
          game.dismissRecentUnlocks()
        }}
      >
        dismiss-unlocks
      </button>
      <button
        onClick={() => {
          game.addStreakShield(2)
        }}
      >
        add-shield
      </button>
      <button
        onClick={() => {
          screen.getByTestId('shield-result').textContent = String(game.useStreakShield())
        }}
      >
        use-shield
      </button>
      <button
        onClick={() => {
          game.completeQuest('quest_html_intro')
        }}
      >
        complete-first-quest
      </button>
      <button
        onClick={() => {
          game.completeQuest('quest_missing_topic')
        }}
      >
        complete-missing-quest
      </button>
      <button
        onClick={() => {
          game.completeLearningTopic('css_flexbox', 'css', 30)
        }}
      >
        learn-topic
      </button>
      <button
        onClick={() => {
          game.claimDailyReward(1)
        }}
      >
        claim-daily
      </button>
      <span data-testid="learned">
        {String(game.game.completedTopics.some((t) => t.topicId === 'css_flexbox'))}
      </span>
      <span data-testid="daily-claimed">{game.game.dailyRewardsClaimed.join(',')}</span>
      <span data-testid="recent-unlocks">{game.game.recentBadgeUnlocks.length}</span>
      <span data-testid="badge-perfectionist">
        {game.game.badges.find((b) => b.id === 'perfectionist')?.unlockedAt ?? 'locked'}
      </span>
      <span data-testid="shield-result" />
    </div>
  )
}

const firstQuest = allQuests.find((q) => q.id === 'quest_html_intro')
if (!firstQuest) {
  throw new Error('quest_html_intro is missing from allQuests')
}

describe('GameContext fresh state', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts a new player at level 1 with the default character', () => {
    renderGame(<Harness />)
    expect(screen.getByTestId('name')).toHaveTextContent('Hero')
    expect(screen.getByTestId('level')).toHaveTextContent('1')
    expect(screen.getByTestId('xp')).toHaveTextContent('0')
    expect(screen.getByTestId('gold')).toHaveTextContent('0')
    expect(screen.getByTestId('xp-to-next')).toHaveTextContent(String(XP_PER_LEVEL))
    expect(screen.getByTestId('quest-count')).toHaveTextContent('0')
  })

  it('seeds the full badge and milestone catalogs', () => {
    const getGame = renderGame(<Harness />)
    expect(getGame().game.badges.map((b) => b.id)).toEqual(BADGES.map((b) => b.id))
    expect(getGame().game.milestones.every((m) => !m.unlocked)).toBe(true)
  })
})

describe('GameContext progression', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('levels up when XP crosses the threshold', async () => {
    renderGame(<Harness />)
    await click('add-level-xp')
    expect(screen.getByTestId('level')).toHaveTextContent('2')
    expect(screen.getByTestId('xp')).toHaveTextContent(String(XP_PER_LEVEL))
  })

  it('accumulates gold', async () => {
    renderGame(<Harness />)
    await click('add-gold')
    await click('add-gold')
    expect(screen.getByTestId('gold')).toHaveTextContent('84')
  })

  it('records onboarding choices on the character', async () => {
    renderGame(<Harness />)
    await click('onboard')
    expect(screen.getByTestId('name')).toHaveTextContent('Ada')
    const getGame = renderGame(<Harness />)
    expect(getGame().game.character.class).toBe('Data Mage')
    expect(getGame().game.hasSeenOnboarding).toBe(true)
  })

  it('completes a quest once: awards XP, gold and shows victory', async () => {
    renderGame(<Harness />)
    await click('complete-first-quest')
    expect(screen.getByTestId('quest-count')).toHaveTextContent('1')
    expect(screen.getByTestId('victory')).toHaveTextContent('true')
    expect(screen.getByTestId('xp')).toHaveTextContent(String(firstQuest.xpReward))
    expect(screen.getByTestId('gold')).toHaveTextContent(
      String(Math.floor(firstQuest.xpReward * GOLD_XP_RATIO)),
    )
  })

  it('ignores repeated completion of the same quest', async () => {
    renderGame(<Harness />)
    await click('complete-first-quest')
    await click('complete-first-quest')
    expect(screen.getByTestId('quest-count')).toHaveTextContent('1')
    expect(screen.getByTestId('xp')).toHaveTextContent(String(firstQuest.xpReward))
  })

  it('ignores unknown quest ids', async () => {
    renderGame(<Harness />)
    await click('complete-missing-quest')
    expect(screen.getByTestId('quest-count')).toHaveTextContent('0')
    expect(screen.getByTestId('victory')).toHaveTextContent('false')
  })

  it('grants a known badge and queues the unlock notification once', async () => {
    renderGame(<Harness />)
    await click('grant-badge')
    await click('grant-badge')
    expect(screen.getByTestId('badge-perfectionist')).toHaveTextContent(/^\d{4}-\d{2}-\d{2}T/)
    expect(screen.getByTestId('recent-unlocks')).toHaveTextContent('1')
  })

  it('does not grant unknown badge ids', async () => {
    renderGame(<Harness />)
    await click('grant-bad-badge')
    expect(screen.getByTestId('recent-unlocks')).toHaveTextContent('0')
  })

  it('clears unlock notifications on dismiss', async () => {
    renderGame(<Harness />)
    await click('grant-badge')
    await click('dismiss-unlocks')
    expect(screen.getByTestId('recent-unlocks')).toHaveTextContent('0')
  })

  it('consumes streak shields and reports when none are available', async () => {
    renderGame(<Harness />)
    await click('use-shield')
    expect(screen.getByTestId('shield-result')).toHaveTextContent('false')
    await click('add-shield')
    expect(screen.getByTestId('shields')).toHaveTextContent('2')
    await click('use-shield')
    expect(screen.getByTestId('shield-result')).toHaveTextContent('true')
    expect(screen.getByTestId('shields')).toHaveTextContent('1')
  })
})

describe('GameContext learning topics and daily rewards', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('records a learning topic once with its XP', async () => {
    const getGame = renderGame(<Harness />)
    await click('learn-topic')
    expect(screen.getByTestId('learned')).toHaveTextContent('true')
    expect(screen.getByTestId('xp')).toHaveTextContent('30')
    expect(getGame().game.completedTopics[0]).toMatchObject({
      topicId: 'css_flexbox',
      technologyId: 'css',
      completed: true,
      xpEarned: 30,
    })
    await click('learn-topic')
    expect(screen.getByTestId('xp')).toHaveTextContent('30')
  })

  it('claims a daily reward once per cycle', async () => {
    const getGame = renderGame(<Harness />)
    await click('claim-daily')
    expect(screen.getByTestId('daily-claimed')).toHaveTextContent('1')
    expect(getGame().game.character.xp).toBeGreaterThan(0)
    await click('claim-daily')
    expect(screen.getByTestId('daily-claimed')).toHaveTextContent('1')
  })

  it('ignores unknown daily reward days', () => {
    const getGame = renderGame(<Harness />)
    const reward = getGame().claimDailyReward(99)
    expect(reward.type).toBe('xp')
    expect(getGame().game.dailyRewardsClaimed).toEqual([])
  })
})

describe('GameContext persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('persists state to the main and backup keys after an action', async () => {
    renderGame(<Harness />)
    await click('add-level-xp')
    for (const key of [STORAGE_KEYS.GAME, STORAGE_KEYS.BACKUP]) {
      const raw = localStorage.getItem(key)
      if (!raw) {
        throw new Error(`expected a persisted save under ${key}`)
      }
      const stored: unknown = JSON.parse(raw)
      if (!isSavedState(stored)) {
        throw new Error(`the save under ${key} did not match the persisted shape`)
      }
      expect(stored.character.xp).toBe(XP_PER_LEVEL)
      expect(stored.character.level).toBe(2)
    }
  })

  it('restores a previously saved state on mount', () => {
    const saved = {
      character: { name: 'SavedHero', xp: 250, level: 3 },
      badges: BADGES.slice(0, 2).map((b) => ({ ...b })),
      completedQuests: [
        { questId: 'quest_html_intro', topicId: 'html_intro', completedAt: '2026-01-01' },
      ],
    }
    localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify(saved))
    renderGame(<Harness />)
    expect(screen.getByTestId('name')).toHaveTextContent('SavedHero')
    expect(screen.getByTestId('level')).toHaveTextContent('3')
    expect(screen.getByTestId('quest-count')).toHaveTextContent('1')
  })

  it('recovers from the backup when the main save is corrupted', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem(STORAGE_KEYS.GAME, '{not valid json')
    const saved = {
      character: { name: 'BackupHero', xp: 10, level: 1 },
      badges: BADGES.slice(0, 1).map((b) => ({ ...b })),
      completedQuests: [],
    }
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(saved))
    renderGame(<Harness />)
    expect(screen.getByTestId('name')).toHaveTextContent('BackupHero')
    warn.mockRestore()
  })

  it('starts fresh when neither key holds a valid save', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ garbage: true }))
    renderGame(<Harness />)
    expect(screen.getByTestId('name')).toHaveTextContent('Hero')
    expect(screen.getByTestId('level')).toHaveTextContent('1')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('merges state pushed by another tab via the storage event', () => {
    renderGame(<Harness />)
    const otherTab = {
      character: { name: 'TabTwo', xp: 55, level: 1 },
      badges: BADGES.slice(0, 3).map((b) => ({ ...b })),
      completedQuests: [],
    }
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEYS.GAME,
          newValue: JSON.stringify(otherTab),
        }),
      )
    })
    expect(screen.getByTestId('name')).toHaveTextContent('TabTwo')
    expect(screen.getByTestId('xp')).toHaveTextContent('55')
  })

  it('ignores storage events for unrelated keys', () => {
    renderGame(<Harness />)
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'some_other_key',
          newValue: JSON.stringify({ character: { name: 'Ghost' } }),
        }),
      )
    })
    expect(screen.getByTestId('name')).toHaveTextContent('Hero')
  })
})
