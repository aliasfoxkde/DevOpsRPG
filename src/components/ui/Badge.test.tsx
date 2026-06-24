import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Badge text</Badge>)
    expect(screen.getByText('Badge text')).toBeInTheDocument()
  })

  it('renders all variants', () => {
    const variants: Array<'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = [
      'default', 'primary', 'secondary', 'success', 'warning', 'error'
    ]
    variants.forEach(variant => {
      const { container } = render(<Badge variant={variant}>{variant}</Badge>)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('renders small size', () => {
    render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small')).toBeInTheDocument()
  })

  it('renders medium size', () => {
    render(<Badge size="md">Medium</Badge>)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-badge">Content</Badge>)
    expect(container.firstChild).toHaveClass('custom-badge')
  })
})
