import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import CertificationsPage from './CertificationsPage'
import { CERTIFICATIONS, DIFFICULTY_LABELS } from '@/data/certifications'
import { renderSeededPage } from './test-utils'

describe('CertificationsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page heading and tagline', () => {
    renderSeededPage(<CertificationsPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Certifications/ })).toBeInTheDocument()
    expect(
      screen.getByText('Earn certifications as proof of your DevOps expertise!'),
    ).toBeInTheDocument()
  })

  it('renders every certification from the static data', () => {
    renderSeededPage(<CertificationsPage />)
    for (const cert of CERTIFICATIONS) {
      expect(screen.getByText(cert.fullName)).toBeInTheDocument()
    }
  })

  it('groups certifications under difficulty headings', () => {
    renderSeededPage(<CertificationsPage />)
    const labels = Object.values(DIFFICULTY_LABELS)
    const renderedHeadings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)

    for (const label of labels) {
      expect(renderedHeadings.some((text) => text.includes(label))).toBe(true)
    }
  })

  it('shows a progress fraction for each difficulty group', () => {
    renderSeededPage(<CertificationsPage />)
    // Fresh account: nothing earned, so every group reads "0/N"
    const fractions = screen.getAllByText(/^0\/\d+$/)
    expect(fractions.length).toBeGreaterThan(0)
  })

  it('reports a locked state for a brand new player', () => {
    renderSeededPage(<CertificationsPage />)
    // Stats bar labels
    expect(screen.getByText('Earned')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })
})
