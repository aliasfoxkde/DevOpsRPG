import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { GameProvider } from '@/contexts/GameContext'
import TechnologyPage from './TechnologyPage'

function renderWithRouter(entries = ['/learn/html']) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <GameProvider>
        <Routes>
          <Route path="/learn/:technology" element={<TechnologyPage />} />
        </Routes>
      </GameProvider>
    </MemoryRouter>
  )
}

describe('TechnologyPage', () => {
  it('renders technology page', () => {
    renderWithRouter()
    expect(document.body.textContent).toBeTruthy()
  })

  it('renders back link', () => {
    renderWithRouter()
    expect(screen.getByText('Back to Learn')).toBeInTheDocument()
  })

  it('shows not found for invalid technology', () => {
    renderWithRouter(['/learn/invalid-tech'])
    expect(screen.getByText('Technology not found')).toBeInTheDocument()
  })

  it('shows back link on not found page', () => {
    renderWithRouter(['/learn/invalid-tech'])
    expect(screen.getByText('Back to Learn')).toHaveAttribute('href', '/learn')
  })

  it('renders mark complete button', () => {
    renderWithRouter()
    const buttons = screen.getAllByText(/Mark as Complete/)
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('can click mark complete button', async () => {
    renderWithRouter()
    const buttons = screen.getAllByText('Mark as Complete (+25 XP)')
    await act(async () => {
      buttons[0].click()
    })
    // After clicking, button should show "Completed"
    expect(screen.getAllByText(/Completed/)).toBeTruthy()
  })
})
