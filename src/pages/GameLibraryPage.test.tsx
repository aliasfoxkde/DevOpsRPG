import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameLibraryPage from './GameLibraryPage'
import { closestContainer, renderSeededPage } from './test-utils'

// Mirrors the page's inline catalogue size so we can assert the unfiltered view.
const TOTAL_GAMES = 34

/** The game cards currently on the grid, in display order. */
function cards(): HTMLElement[] {
  return screen
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.closest('div.rounded-xl'))
    .filter((card): card is HTMLElement => card !== null)
}

/** The card name heading. */
const nameOf = (card: HTMLElement) => {
  const heading = card.querySelector('h3')
  if (!heading) throw new Error(`Card "${card.textContent}" has no name heading`)
  return heading.textContent
}

/** The [category, difficulty] chip labels of a card, in DOM order. */
function chips(card: HTMLElement): string[] {
  const body = card.querySelector('div.p-4')
  if (!body) throw new Error(`Card "${card.textContent}" has no content block`)
  return Array.from(body.querySelectorAll('span'))
    .filter((el) => (el.getAttribute('class') ?? '').includes('py-1'))
    .map((el) => el.textContent)
}

/** The class list of the chip labelled `label` inside a card. */
function chipClass(card: HTMLElement, label: string): string {
  const chip = Array.from(card.querySelectorAll('span')).find(
    (el) => el.textContent === label && (el.getAttribute('class') ?? '').includes('rounded'),
  )
  if (!chip) throw new Error(`No chip labelled "${label}" in card "${card.textContent}"`)
  return chip.getAttribute('class') ?? ''
}

/** The category tint the page maps each category to. */
const CATEGORY_TINTS: Record<string, string> = {
  DevOps: 'bg-amber-600/30 text-amber-400',
  Math: 'bg-blue-600/30 text-blue-400',
  Science: 'bg-green-600/30 text-green-400',
  Reading: 'bg-pink-600/30 text-pink-400',
  Robotics: 'bg-slate-600/30 text-slate-300',
  Trivia: 'bg-yellow-600/30 text-yellow-400',
  Puzzle: 'bg-purple-600/30 text-purple-400',
}
const OTHER_CATEGORY_TINT = 'bg-slate-600/30 text-slate-400'

/** The difficulty tint the page maps each difficulty to. */
const DIFFICULTY_TINTS: Record<string, string> = {
  Beginner: 'bg-green-600/30 text-green-400',
  Intermediate: 'bg-yellow-600/30 text-yellow-400',
  Advanced: 'bg-orange-600/30 text-orange-400',
  Expert: 'bg-red-600/30 text-red-400',
}
const OTHER_DIFFICULTY_TINT = 'bg-gray-600/30 text-gray-400'

describe('GameLibraryPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page heading and tagline', () => {
    renderSeededPage(<GameLibraryPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Game Library/ })).toBeInTheDocument()
    expect(screen.getByText('Browse and discover all our learning games')).toBeInTheDocument()
  })

  it('lists the full catalogue with a matching result count', () => {
    renderSeededPage(<GameLibraryPage />)
    expect(screen.getByText(`${TOTAL_GAMES} games found`)).toBeInTheDocument()
    expect(screen.getByText('DevOpsQuest')).toBeInTheDocument()
    expect(screen.getByText('K8s Kingdom')).toBeInTheDocument()
    expect(screen.getByText('Word Wizard')).toBeInTheDocument()
  })

  it('narrows the catalogue when searching', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GameLibraryPage />)

    await user.type(screen.getByPlaceholderText('Search games...'), 'kubernetes')

    expect(screen.getByText('1 games found')).toBeInTheDocument()
    expect(screen.getByText('K8s Kingdom')).toBeInTheDocument()
    expect(screen.queryByText('Docker Dash')).not.toBeInTheDocument()
  })

  it('has category and difficulty filters populated with options', () => {
    renderSeededPage(<GameLibraryPage />)
    const categorySelect = screen.getAllByRole('combobox')[0]
    const difficultySelect = screen.getAllByRole('combobox')[1]

    expect(categorySelect).toHaveDisplayValue('All')
    expect(difficultySelect).toHaveDisplayValue('All')
    expect(screen.getByRole('option', { name: 'DevOps' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Expert' })).toBeInTheDocument()
  })

  it('offers name and category sorting toggles', () => {
    renderSeededPage(<GameLibraryPage />)
    expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByText('Sort by:')).toBeInTheDocument()
  })

  it('tints every category and difficulty chip the catalogue can produce', () => {
    renderSeededPage(<GameLibraryPage />)

    const grid = cards()
    expect(grid).toHaveLength(TOTAL_GAMES)
    for (const card of grid) {
      const [category, difficulty] = chips(card)
      expect(chipClass(card, category)).toContain(CATEGORY_TINTS[category] ?? OTHER_CATEGORY_TINT)
      expect(chipClass(card, difficulty)).toContain(
        DIFFICULTY_TINTS[difficulty] ?? OTHER_DIFFICULTY_TINT,
      )
    }

    // Every band of both colour maps occurs in the catalogue, so the assertions
    // above really did walk each branch
    const seenCategories = new Set(grid.map((card) => chips(card)[0]))
    for (const category of [
      ...Object.keys(CATEGORY_TINTS),
      'AI',
      'Engineering',
      'Programming',
      'Security',
    ]) {
      expect(seenCategories.has(category)).toBe(true)
    }
    const seenDifficulties = new Set(grid.map((card) => chips(card)[1]))
    for (const difficulty of [...Object.keys(DIFFICULTY_TINTS), 'Mixed']) {
      expect(seenDifficulties.has(difficulty)).toBe(true)
    }
  })

  it('flags the unreleased games and links the flagship out', () => {
    renderSeededPage(<GameLibraryPage />)

    // Every game except the flagship advertises "Coming Soon": the two TBA
    // entries badge their header, the other 31 label their footer slot
    expect(screen.getAllByText('Coming Soon')).toHaveLength(TOTAL_GAMES - 1)
    expect(screen.getAllByText('TBA')).toHaveLength(2)

    const flagship = closestContainer(screen.getByText('DevOpsQuest'), 'div.rounded-xl')
    expect(within(flagship).getByRole('link', { name: 'Play Now →' })).toHaveAttribute('href', '/')

    // Every other released game only advertises a coming-soon slot
    for (const card of cards()) {
      if (nameOf(card) !== 'DevOpsQuest') {
        expect(within(card).queryByRole('link')).not.toBeInTheDocument()
      }
    }
  })

  it('narrows the catalogue from the category dropdown', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GameLibraryPage />)

    await user.selectOptions(screen.getAllByRole('combobox')[0], 'Math')

    expect(screen.getByText('6 games found')).toBeInTheDocument()
    for (const card of cards()) {
      expect(chips(card)[0]).toBe('Math')
    }
    expect(screen.queryByText('K8s Kingdom')).not.toBeInTheDocument()
    expect(nameOf(cards()[0])).toBe('Algebra Assault')
  })

  it('narrows the catalogue from the difficulty dropdown', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GameLibraryPage />)

    await user.selectOptions(screen.getAllByRole('combobox')[1], 'Expert')

    expect(screen.getByText('2 games found')).toBeInTheDocument()
    for (const card of cards()) {
      expect(chips(card)[1]).toBe('Expert')
    }
    expect(screen.getByText('Quantum Quest')).toBeInTheDocument()
    expect(screen.getByText('Cyber Defense')).toBeInTheDocument()
  })

  it('matches game descriptions as well as names', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GameLibraryPage />)

    // "arithmetic" only appears in a description, never in a title
    await user.type(screen.getByPlaceholderText('Search games...'), 'arithmetic')

    expect(screen.getByText('1 games found')).toBeInTheDocument()
    expect(screen.getByText('Number Storm')).toBeInTheDocument()
    expect(screen.queryByText('Algebra Assault')).not.toBeInTheDocument()
  })

  it('combines filters and offers an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GameLibraryPage />)

    await user.selectOptions(screen.getAllByRole('combobox')[0], 'Robotics')
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'Expert')
    expect(screen.getByText('0 games found')).toBeInTheDocument()
    expect(screen.getByText('No games found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument()
    expect(cards()).toHaveLength(0)

    // Searching inside the narrowed view keeps it empty
    await user.type(screen.getByPlaceholderText('Search games...'), 'docker')
    expect(screen.getByText('0 games found')).toBeInTheDocument()
  })

  it('orders the grid by name and then by category', async () => {
    const user = userEvent.setup()
    renderSeededPage(<GameLibraryPage />)

    const nameOrder = cards().map(nameOf)
    expect(nameOrder[0]).toBe('AI Trainer')
    expect(nameOrder[nameOrder.length - 1]).toBe('Word Wizard')

    await user.click(screen.getByRole('button', { name: 'Category' }))
    const grouped = cards().map((card) => chips(card)[0])
    for (let i = 1; i < grouped.length; i++) {
      expect(grouped[i - 1].localeCompare(grouped[i])).toBeLessThanOrEqual(0)
    }
    expect(grouped[0]).toBe('AI')
    expect(screen.getByRole('button', { name: 'Category' })).toHaveClass('bg-amber-600')
    expect(screen.getByRole('button', { name: 'Name' })).toHaveClass('bg-slate-700')

    await user.click(screen.getByRole('button', { name: 'Name' }))
    expect(cards().map(nameOf)).toEqual(nameOrder)
    expect(screen.getByRole('button', { name: 'Name' })).toHaveClass('bg-amber-600')
  })
})
