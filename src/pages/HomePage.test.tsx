import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GameProvider } from '../contexts/GameContext'
import HomePage from './HomePage'

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: ({ children }) => (
    <MemoryRouter>
      <GameProvider>{children}</GameProvider>
    </MemoryRouter>
  )})
}

describe('HomePage', () => {
  it('renders character avatar', () => {
    renderWithRouter(<HomePage />)
    expect(document.querySelector('.animate-bounce')).toBeInTheDocument()
  })

  it('renders quest journal link', () => {
    renderWithRouter(<HomePage />)
    // Use getAllByText since "Quest Journal" appears in multiple places
    expect(screen.getAllByText('Quest Journal').length).toBeGreaterThan(0)
  })

  it('renders character sheet link', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText('Character Sheet')).toBeInTheDocument()
  })

  it('renders realm preview', () => {
    renderWithRouter(<HomePage />)
    // Text includes emoji prefix: "⚔️ Your Journey" - use getAllByText and check first match
    const matches = screen.getAllByText(/Your Journey/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders chronicle section', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText(/Chronicle/i)).toBeInTheDocument()
  })
})
