import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Badge text</Badge>)
    expect(screen.getByText('Badge text')).toBeInTheDocument()
  })

  it('renders all variants', () => {
    const variants: Array<'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = [
      'default',
      'primary',
      'secondary',
      'success',
      'warning',
      'error',
    ]
    variants.forEach((variant) => {
      const { container } = render(<Badge variant={variant}>{variant}</Badge>)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  it('colours each variant distinctly', () => {
    const cases = [
      { variant: 'default', className: 'bg-muted' },
      { variant: 'primary', className: 'text-primary' },
      { variant: 'secondary', className: 'text-secondary' },
      { variant: 'success', className: 'text-green-400' },
      { variant: 'warning', className: 'text-yellow-500' },
      { variant: 'error', className: 'text-red-500' },
    ] as const

    for (const { variant, className } of cases) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>)
      expect(screen.getByText(variant), variant).toHaveClass(className)
      unmount()
    }
  })

  it('renders small size', () => {
    render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Small')).toHaveClass('text-xs')
  })

  it('renders medium size', () => {
    render(<Badge size="md">Medium</Badge>)
    expect(screen.getByText('Medium')).toHaveClass('text-sm')
  })

  it('stays pill shaped and inline', () => {
    render(<Badge>Active</Badge>)
    const badge = screen.getByText('Active')
    expect(badge).toHaveClass('rounded-full')
    expect(badge).toHaveClass('inline-flex')
  })

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-badge">Content</Badge>)
    expect(container.firstChild).toHaveClass('custom-badge')
  })

  it('forwards DOM attributes to the underlying span', () => {
    render(
      <Badge data-testid="xp-badge" title="Experience" aria-label="500 experience">
        500 XP
      </Badge>,
    )

    const badge = screen.getByTestId('xp-badge')
    expect(badge).toHaveAttribute('title', 'Experience')
    expect(badge).toHaveAttribute('aria-label', '500 experience')
    expect(badge.tagName).toBe('SPAN')
  })

  it('supports caller click handlers', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Badge onClick={onClick} role="button">
        Filter: docker
      </Badge>,
    )

    await user.click(screen.getByText('Filter: docker'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('keeps sibling content queryable alongside the badge', () => {
    render(
      <div>
        <Badge>Active</Badge>
        <span>Quest complete</span>
      </div>,
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Quest complete')).toBeInTheDocument()
  })
})
