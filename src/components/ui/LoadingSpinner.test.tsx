import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingPage } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders small size', () => {
    render(<LoadingSpinner size="sm" />)
    const svg = document.querySelector('svg')
    expect(svg?.classList).toContain('w-4')
  })

  it('renders medium size', () => {
    render(<LoadingSpinner size="md" />)
    const svg = document.querySelector('svg')
    expect(svg?.classList).toContain('w-8')
  })

  it('renders large size', () => {
    render(<LoadingSpinner size="lg" />)
    const svg = document.querySelector('svg')
    expect(svg?.classList).toContain('w-12')
  })

  it('has accessible label via aria-label', () => {
    render(<LoadingSpinner label="Loading data..." />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data...')
  })
})

describe('LoadingPage', () => {
  it('renders with default props', () => {
    render(<LoadingPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    render(<LoadingPage label="Loading your content..." />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading your content...')
  })

  it('contains spinner', () => {
    render(<LoadingPage />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})
