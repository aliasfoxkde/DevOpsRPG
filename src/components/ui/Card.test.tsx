import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Card } from './Card'

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>)

    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('defaults to a region role so the surface is discoverable', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders with custom role', () => {
    render(<Card role="article">Article content</Card>)

    expect(screen.getByRole('article')).toBeInTheDocument()
  })

  it('renders children of different types', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Paragraph</p>
        <button>Button</button>
      </Card>
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('applies the bordered treatment by default and honours the other variants', () => {
    const { rerender } = render(<Card>Bordered</Card>)
    expect(screen.getByText('Bordered')).toHaveClass('border')
    expect(screen.getByText('Bordered')).toHaveClass('bg-card')

    rerender(<Card variant="elevated">Elevated</Card>)
    const elevated = screen.getByText('Elevated')
    expect(elevated).toHaveClass('shadow-md')
    expect(elevated).not.toHaveClass('border')

    rerender(<Card variant="default">Plain</Card>)
    const plain = screen.getByText('Plain')
    expect(plain).not.toHaveClass('border')
    expect(plain).not.toHaveClass('shadow-md')
  })

  it('always rounds the corners', () => {
    const { rerender } = render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toHaveClass('rounded-lg')

    rerender(<Card variant="elevated">Content</Card>)
    expect(screen.getByText('Content')).toHaveClass('rounded-lg')
  })

  it('forwards DOM attributes such as id, data-* and aria-*', () => {
    render(
      <Card id="quest-card" data-testid="quest-card" aria-label="Quest details">
        Content
      </Card>
    )

    const card = screen.getByTestId('quest-card')
    expect(card).toHaveAttribute('id', 'quest-card')
    expect(card).toHaveAttribute('aria-label', 'Quest details')
  })

  it('responds to click handlers attached by callers', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Selectable</Card>)

    await user.click(screen.getByText('Selectable'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('exposes the forwarded ref pointing at the card element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Card ref={ref}>Content</Card>)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.textContent).toBe('Content')
  })
})
