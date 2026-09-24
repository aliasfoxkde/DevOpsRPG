import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import AboutPage from './AboutPage'
import { renderSeededPage } from './test-utils'

describe('AboutPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page hero heading and tagline', () => {
    renderSeededPage(<AboutPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'DevOpsQuest' })).toBeInTheDocument()
    expect(
      screen.getByText('An Open Source Gamified DevOps Learning Experience'),
    ).toBeInTheDocument()
  })

  it('explains the game loop in three steps', () => {
    renderSeededPage(<AboutPage />)
    expect(screen.getByRole('heading', { name: 'Choose Your Quest' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Battle & Learn' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Level Up' })).toBeInTheDocument()
  })

  it('links out to the GitHub repository and the live game', () => {
    renderSeededPage(<AboutPage />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('https://github.com/aliasfoxkde/DevOpsRPG')
    expect(hrefs).toContain('https://f7b4e42f.devopsquest.pages.dev')
  })

  it('lists the contributing paths', () => {
    renderSeededPage(<AboutPage />)
    expect(screen.getByText(/Report bugs via GitHub Issues/)).toBeInTheDocument()
    expect(screen.getByText(/Add new quiz topics or questions/)).toBeInTheDocument()
  })
})
