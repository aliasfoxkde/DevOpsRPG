import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { GameProvider } from '../../contexts/GameContext'
import MentorChat from './MentorChat'
import { STORAGE_KEYS } from '../../utils/gameUtils'

interface SeedOptions {
  xp?: number
  level?: number
  streakDays?: number
  completedQuests?: number
  quizCount?: number
  minigameCount?: number
}

function seedGame({
  xp = 500,
  level = 4,
  streakDays = 3,
  completedQuests = 0,
  quizCount = 7,
  minigameCount = 2,
}: SeedOptions = {}) {
  localStorage.setItem(
    STORAGE_KEYS.GAME,
    JSON.stringify({
      badges: [], // required by the provider's save validation
      character: { xp, level, streakDays },
      completedQuests: Array.from({ length: completedQuests }, (_, i) => ({
        questId: `quest-${i}`,
        topicId: `topic-${i}`,
        technologyId: 'html',
        completed: true,
        xpEarned: 50,
      })),
      stats: { quizCount, minigameCount },
    }),
  )
}

function renderChat() {
  return render(
    <GameProvider>
      <MentorChat />
    </GameProvider>,
  )
}

function openChat() {
  fireEvent.click(screen.getByRole('button', { name: 'Open mentor chat' }))
}

function chatInput() {
  return screen.getByLabelText('Type your question')
}

function sendButton() {
  return screen.getByRole('button', { name: 'Send message' })
}

function sendMessage(text: string) {
  fireEvent.change(chatInput(), { target: { value: text } })
  fireEvent.click(sendButton())
}

/** The mentor "thinks" for 800-1200ms before answering. */
function flushMentorReply() {
  act(() => {
    vi.advanceTimersByTime(1200)
  })
}

function messageTexts(): string[] {
  const log = screen.getByRole('log', { name: 'Chat messages' })
  return Array.from(log.querySelectorAll('p')).map((p) => p.textContent)
}

function lastMentorReply(): string {
  const replies = messageTexts()
  return replies[replies.length - 1]
}

// The status bar renders label and value as sibling text nodes inside a span.
function statusChip(text: string) {
  return screen.getByText((_, element) => {
    if (element?.tagName !== 'SPAN') return false
    return element.textContent.replace(/\s+/g, ' ').trim() === text
  })
}

/** The three bouncing dots that appear while the mentor is "thinking". */
function typingDots() {
  return document.querySelectorAll('.animate-bounce')
}

// jsdom has no layout engine, so the auto-scroll target is stubbed out. The
// prototype is reached through a widened view so the stub can be removed again.
const scrollIntoView = vi.fn<(options?: { behavior?: ScrollBehavior }) => void>()
const htmlPrototype = window.HTMLElement.prototype as Omit<HTMLElement, 'scrollIntoView'> & {
  scrollIntoView?: (options?: { behavior?: ScrollBehavior }) => void
}

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  htmlPrototype.scrollIntoView = scrollIntoView
  scrollIntoView.mockClear()
})

afterEach(() => {
  delete htmlPrototype.scrollIntoView
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('MentorChat', () => {
  it('starts collapsed with only the floating mentor button visible', () => {
    renderChat()

    const toggle = screen.getByRole('button', { name: 'Open mentor chat' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('title', 'Chat with your Mentor')
    expect(toggle).toHaveClass('animate-bounce')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  describe('open panel', () => {
    it('opens a labelled dialog showing the character status', () => {
      seedGame()
      renderChat()
      openChat()

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'mentor-chat-title')
      expect(dialog).toHaveAttribute('aria-modal', 'false')
      expect(screen.getByText('DevOps Mentor')).toBeInTheDocument()
      expect(statusChip('⚔️ Lvl 4')).toBeInTheDocument()
      expect(statusChip('✨ 500 XP')).toBeInTheDocument()
      expect(statusChip('🔥 3 Day Streak')).toBeInTheDocument()

      const toggle = screen.getByRole('button', { name: 'Close mentor chat' })
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
      expect(toggle).toHaveTextContent('✕')
    })

    it('greets the player with their current level and xp', () => {
      seedGame({ level: 9, xp: 870 })
      renderChat()
      openChat()

      expect(messageTexts()[0]).toContain('Currently at Level 9 with 870 XP')
    })

    it('closes from the panel button and from the floating toggle', () => {
      renderChat()
      openChat()

      fireEvent.click(screen.getByRole('button', { name: 'Close chat' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getByRole('button', { name: 'Open mentor chat' })).toHaveTextContent('🧙‍♂️')

      openChat()
      fireEvent.click(screen.getByRole('button', { name: 'Close mentor chat' }))
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  describe('composer', () => {
    it('disables sending while the input is blank', () => {
      renderChat()
      openChat()

      expect(sendButton()).toBeDisabled()
      expect(sendButton()).toHaveClass('cursor-not-allowed')

      fireEvent.change(chatInput(), { target: { value: '   ' } })
      expect(sendButton()).toBeDisabled()

      fireEvent.change(chatInput(), { target: { value: 'How do I earn XP?' } })
      expect(sendButton()).toBeEnabled()
      expect(sendButton()).toHaveClass('bg-amber-600')
    })

    it('fills the input from the quick prompts without sending', () => {
      renderChat()
      openChat()

      fireEvent.click(screen.getByRole('button', { name: 'Ask about XP' }))
      expect(chatInput()).toHaveValue('How do I earn XP?')

      fireEvent.click(screen.getByRole('button', { name: 'Ask for guidance' }))
      expect(chatInput()).toHaveValue('Where should I go next?')

      fireEvent.click(screen.getByRole('button', { name: 'Show my progress' }))
      expect(chatInput()).toHaveValue('Show me my progress')
      expect(messageTexts()).toHaveLength(1)
    })

    it('sends on Enter and clears the input, then answers after a pause', () => {
      seedGame()
      renderChat()
      openChat()

      fireEvent.change(chatInput(), { target: { value: 'How do I earn XP?' } })
      fireEvent.keyDown(chatInput(), { key: 'Enter' })

      expect(chatInput()).toHaveValue('')
      expect(messageTexts()).toContain('How do I earn XP?')
      expect(screen.getByText('🧙‍♂️ Mentor')).toBeInTheDocument()

      flushMentorReply()
      expect(lastMentorReply()).toContain('You currently have 500 XP at Level 4')
    })

    it('keeps the typing indicator up until the mentor has replied', () => {
      renderChat()
      openChat()
      sendMessage('hello')

      expect(typingDots()).toHaveLength(3)

      act(() => {
        vi.advanceTimersByTime(799)
      })
      expect(messageTexts()).toHaveLength(2)
      expect(typingDots()).toHaveLength(3)

      flushMentorReply()
      expect(messageTexts()).toHaveLength(3)
      expect(typingDots()).toHaveLength(0)
    })

    it('does not send empty or whitespace messages', () => {
      renderChat()
      openChat()

      fireEvent.keyDown(chatInput(), { key: 'Enter' })
      fireEvent.change(chatInput(), { target: { value: '   ' } })
      fireEvent.keyDown(chatInput(), { key: 'Enter' })

      expect(messageTexts()).toHaveLength(1)
    })

    it('keeps the draft when Enter is pressed with shift held', () => {
      renderChat()
      openChat()

      fireEvent.change(chatInput(), { target: { value: 'half a thought' } })
      fireEvent.keyDown(chatInput(), { key: 'Enter', shiftKey: true })

      expect(chatInput()).toHaveValue('half a thought')
      expect(messageTexts()).toHaveLength(1)
    })
  })

  describe('mentor answers', () => {
    it('describes a brand new character for progress questions', () => {
      seedGame({ completedQuests: 0, streakDays: 0 })
      renderChat()
      openChat()
      sendMessage('how am I doing?')

      flushMentorReply()
      expect(lastMentorReply()).toContain("You're just starting your journey!")
    })

    it('reports early progress with the streak', () => {
      seedGame({ completedQuests: 3, streakDays: 2 })
      renderChat()
      openChat()
      sendMessage('show me my stats')

      flushMentorReply()
      expect(lastMentorReply()).toContain("You've completed 3 quests so far!")
      expect(lastMentorReply()).toContain('Your 2-day streak shows real dedication!')
    })

    it('reports mid progress with the level', () => {
      seedGame({ completedQuests: 7, level: 6, streakDays: 9 })
      renderChat()
      openChat()
      sendMessage('progress?')

      flushMentorReply()
      expect(lastMentorReply()).toContain('Impressive progress! 7 quests conquered, Level 6')
    })

    it('champions a long record with quiz and mini-game counts', () => {
      seedGame({ completedQuests: 25, quizCount: 12, minigameCount: 5, streakDays: 30 })
      renderChat()
      openChat()
      sendMessage('how am I doing?')

      flushMentorReply()
      expect(lastMentorReply()).toContain('Champion status! 25 quests, 12 quizzes passed,')
      expect(lastMentorReply()).toContain('5 mini-games played')
    })

    it('points a new player at the first realm', () => {
      seedGame({ completedQuests: 0 })
      renderChat()
      openChat()
      sendMessage('where should I go next?')

      flushMentorReply()
      expect(lastMentorReply()).toContain('Start your adventure in the Village of Foundations!')
    })

    it('sends exploring players to the world map once they have started', () => {
      seedGame({ completedQuests: 5 })
      renderChat()
      openChat()
      sendMessage('what is next?')

      flushMentorReply()
      expect(lastMentorReply()).toContain("You've got the basics down!")
    })

    it('recommends harder realms to experienced players', () => {
      seedGame({ completedQuests: 15 })
      renderChat()
      openChat()
      sendMessage('where to?')

      flushMentorReply()
      expect(lastMentorReply()).toContain("You're ready for intermediate challenges!")
    })

    it('quotes the current xp and level for xp questions', () => {
      seedGame({ xp: 1234, level: 13 })
      renderChat()
      openChat()
      sendMessage('how do I earn xp?')

      flushMentorReply()
      expect(lastMentorReply()).toContain('You currently have 1234 XP at Level 13!')
    })

    it.each([
      [0, 'No active streak yet!'],
      [3, 'Amazing! 3-day streak! Just 4 more days'],
      [12, 'Incredible 12-day streak!'],
      [45, 'LEGENDARY 45-day streak!'],
    ] as [number, string][])('answers streak questions at %i days', (streakDays, expected) => {
      seedGame({ streakDays })
      renderChat()
      openChat()
      sendMessage('what about my streak?')

      flushMentorReply()
      expect(lastMentorReply()).toContain(expected)
    })

    it('explains quizzes and points stuck players at their journal', () => {
      seedGame()
      renderChat()
      openChat()

      sendMessage('how do quizzes work?')
      flushMentorReply()
      expect(lastMentorReply()).toContain('Quizzes test your knowledge and award bonus XP')

      sendMessage('I am stuck')
      flushMentorReply()
      expect(lastMentorReply()).toContain("Every expert was once a beginner! If you're stuck:")
    })

    it('draws personality replies from the keyword bank', () => {
      seedGame()
      renderChat()
      openChat()

      // 'hello' has no contextual handler, so the reply comes from the
      // greeting bank; pinning Math.random picks its first entry.
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
      sendMessage('hello')
      flushMentorReply()

      expect(lastMentorReply()).toBe(
        'Greetings, brave adventurer! Your journey into DevOps mastery begins now!',
      )
      randomSpy.mockRestore()
    })

    it('falls back to a general answer when nothing matches', () => {
      seedGame()
      renderChat()
      openChat()

      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
      sendMessage('zzz qqq')
      flushMentorReply()

      expect(lastMentorReply()).toBe(
        'Interesting question! The path of DevOps mastery has many facets. Keep exploring!',
      )
      randomSpy.mockRestore()
    })
  })

  it('shows markup typed by the player as text instead of rendering it', () => {
    seedGame()
    renderChat()
    openChat()

    sendMessage('<img src=x onerror=alert(1)> & <b>bold</b>')
    flushMentorReply()

    // Rendered verbatim as text, never injected as elements or HTML entities.
    expect(messageTexts()).toContain('<img src=x onerror=alert(1)> & <b>bold</b>')
    expect(document.body.querySelector('img')).toBeNull()
    expect(document.body.querySelector('b')).toBeNull()
  })

  it('keeps the transcript scrolled to the newest message', () => {
    seedGame()
    renderChat()
    openChat()

    // The scroll target only exists once the panel is open, and the scroll
    // effect keys off the message list, so nothing has scrolled yet.
    expect(scrollIntoView).not.toHaveBeenCalled()

    sendMessage('hello')
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth' })

    flushMentorReply()
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth' })
  })
})
