import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar value={50} />)
    expect(document.querySelector('.bg-muted')).toBeInTheDocument()
  })

  it('renders with value of 0', () => {
    render(<ProgressBar value={0} />)
    expect(document.querySelector('.bg-muted')).toBeInTheDocument()
  })

  it('renders with value at max', () => {
    render(<ProgressBar value={100} max={100} />)
    expect(document.querySelector('.bg-muted')).toBeInTheDocument()
  })

  it('clamps value above max to 100%', () => {
    const { container } = render(<ProgressBar value={150} max={100} />)
    const innerBar = container.querySelector('.bg-primary, .bg-green-500, .bg-yellow-500, .bg-red-500')
    expect(innerBar?.getAttribute('style')).toContain('width: 100%')
  })

  it('clamps negative value to 0%', () => {
    const { container } = render(<ProgressBar value={-10} />)
    const innerBar = container.querySelector('.bg-primary, .bg-green-500, .bg-yellow-500, .bg-red-500')
    expect(innerBar?.getAttribute('style')).toContain('width: 0%')
  })

  it('renders different sizes', () => {
    const { rerender } = render(<ProgressBar value={50} size="sm" />)
    expect(document.querySelector('.h-1')).toBeInTheDocument()

    rerender(<ProgressBar value={50} size="md" />)
    expect(document.querySelector('.h-2')).toBeInTheDocument()

    rerender(<ProgressBar value={50} size="lg" />)
    expect(document.querySelector('.h-3')).toBeInTheDocument()
  })

  it('renders different colors', () => {
    const { rerender } = render(<ProgressBar value={50} color="primary" />)
    expect(document.querySelector('.bg-primary')).toBeInTheDocument()

    rerender(<ProgressBar value={50} color="success" />)
    expect(document.querySelector('.bg-green-500')).toBeInTheDocument()

    rerender(<ProgressBar value={50} color="warning" />)
    expect(document.querySelector('.bg-yellow-500')).toBeInTheDocument()

    rerender(<ProgressBar value={50} color="error" />)
    expect(document.querySelector('.bg-red-500')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ProgressBar value={50} className="custom-class" />)
    expect(document.querySelector('.custom-class')).toBeInTheDocument()
  })
})
