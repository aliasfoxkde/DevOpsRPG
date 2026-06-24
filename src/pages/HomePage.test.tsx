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
    expect(screen.getByText('Quest Journal')).toBeInTheDocument()
  })

  it('renders character sheet link', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText('Character Sheet')).toBeInTheDocument()
  })

  it('renders realm preview', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText('Your Journey')).toBeInTheDocument()
  })

  it('renders chronicle section', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText(/Chronicle/i)).toBeInTheDocument()
  })
})
