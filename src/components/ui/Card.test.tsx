import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>)

    expect(screen.getByText('Card content')).toBeInTheDocument()
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
})
