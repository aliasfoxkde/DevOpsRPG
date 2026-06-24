import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders with fallback text when no src', () => {
    render(<Avatar fallback="JD">John Doe</Avatar>)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders image when src provided', () => {
    render(<Avatar src="https://example.com/avatar.png" fallback="JD">John Doe</Avatar>)
    const img = document.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png')
  })

  it('shows default fallback when no fallback prop provided', () => {
    render(<Avatar>John Doe</Avatar>)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach(size => {
      const { container } = render(<Avatar size={size} fallback="JD">John Doe</Avatar>)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    const { container } = render(<Avatar className="custom-avatar" fallback="JD">John Doe</Avatar>)
    expect(container.firstChild).toHaveClass('custom-avatar')
  })
})
