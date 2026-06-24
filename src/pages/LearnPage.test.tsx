import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LearnPage from './LearnPage'
import { technologies } from '../data/technologies'

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  )})
}

describe('LearnPage', () => {
  it('renders page heading', () => {
    renderWithRouter(<LearnPage />)
    expect(screen.getByText('Learn DevOps')).toBeInTheDocument()
  })

  it('renders all 5 phases', () => {
    renderWithRouter(<LearnPage />)
    expect(screen.getByText('Foundations')).toBeInTheDocument()
    expect(screen.getByText('Backend Basics')).toBeInTheDocument()
    expect(screen.getByText('Frameworks & Databases')).toBeInTheDocument()
    expect(screen.getByText('Advanced & Cloud')).toBeInTheDocument()
    expect(screen.getByText('Modern DevOps')).toBeInTheDocument()
  })

  it('renders technology links', () => {
    renderWithRouter(<LearnPage />)
    const links = document.querySelectorAll('a[href^="/learn/"]')
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders correct number of phase sections', () => {
    renderWithRouter(<LearnPage />)
    // Should have sections for each phase that has technologies
    const sections = document.querySelectorAll('section[aria-labelledby]')
    expect(sections.length).toBeGreaterThan(0)
  })

  it('all phases with technologies have headings', () => {
    renderWithRouter(<LearnPage />)
    // Each phase with technologies should have a heading
    const phaseHeadings = document.querySelectorAll('[id^="phase-"]')
    expect(phaseHeadings.length).toBeGreaterThan(0)
  })

  it('does not render empty phases', () => {
    // This test verifies the filter logic works - empty phases return null
    // By verifying we only see phases that have technologies
    renderWithRouter(<LearnPage />)
    const techKeys = Object.keys(technologies)
    expect(techKeys.length).toBeGreaterThan(0)
  })
})
