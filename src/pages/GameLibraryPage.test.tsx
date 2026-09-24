import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameLibraryPage from './GameLibraryPage'
import { renderSeededPage } from './test-utils'

// Mirrors the page's inline catalogue size so we can assert the unfiltered view.
const TOTAL_GAMES = 34

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
})
