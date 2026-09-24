import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, type MouseEvent as ReactMouseEvent } from 'react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('applies a distinct treatment per variant', () => {
    const variants = [
      { variant: 'primary', className: 'bg-amber-600' },
      { variant: 'secondary', className: 'bg-slate-700' },
      { variant: 'outline', className: 'border-slate-600' },
      { variant: 'ghost', className: 'text-slate-300' },
    ] as const

    for (const { variant, className } of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByRole('button', { name: variant }), variant).toHaveClass(className)
      unmount()
    }
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('sizes the padding per size prop', () => {
    const sizes = [
      { size: 'sm', className: 'px-3' },
      { size: 'md', className: 'px-4' },
      { size: 'lg', className: 'px-6' },
    ] as const

    for (const { size, className } of sizes) {
      const { unmount } = render(<Button size={size}>{size}</Button>)
      expect(screen.getByRole('button', { name: size })).toHaveClass(className)
      unmount()
    }
  })

  it('forwards disabled prop', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('omits aria-disabled when enabled (native disabled carries the state)', () => {
    render(<Button>Enabled</Button>)
    expect(screen.getByRole('button')).toBeEnabled()
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled')
  })

  it('forwards className prop', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('calls onClick with the click event', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn<(event: ReactMouseEvent<HTMLButtonElement>) => void>()
    render(<Button onClick={onClick}>Save run</Button>)

    await user.click(screen.getByRole('button', { name: 'Save run' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick.mock.calls[0][0].type).toBe('click')
  })

  it('does not fire onClick while disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Locked
      </Button>,
    )

    await user.click(screen.getByRole('button', { name: 'Locked' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('activates from the keyboard with Enter and Space', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Attack</Button>)

    const button = screen.getByRole('button', { name: 'Attack' })
    button.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)

    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('forwards native button attributes such as type', () => {
    render(<Button type="submit">Submit run</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('exposes the forwarded ref pointing at the real button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref&apos;d</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toBe("Ref'd")
  })

  it('keeps the visible label in the accessible name', () => {
    render(<Button aria-label="Open settings">⚙️</Button>)
    expect(screen.getByRole('button', { name: 'Open settings' })).toBeInTheDocument()
  })
})
