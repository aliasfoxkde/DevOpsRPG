import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Icon from './Icon'

describe('Icon', () => {
  it('renders an svg with the shared icon geometry defaults', () => {
    const { container } = render(<Icon name="home" />)
    const svg = container.firstElementChild as SVGSVGElement

    expect(svg.tagName).toBe('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('stroke-width', '2')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('is hidden from assistive tech by default', () => {
    const { container } = render(<Icon name="check" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses a 24px box by default and honours a custom size', () => {
    const { rerender } = render(<Icon name="menu" />)
    let svg = document.querySelector('svg') as SVGSVGElement
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')

    rerender(<Icon name="menu" size={48} />)
    svg = document.querySelector('svg') as SVGSVGElement
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
  })

  it('applies a custom className', () => {
    const { container } = render(<Icon name="sword" className="text-amber-400 w-6 h-6" />)
    expect(container.querySelector('svg')).toHaveClass('text-amber-400')
    expect(container.querySelector('svg')).toHaveClass('w-6')
  })

  it('forwards the rest of the SVG props to the svg element', () => {
    const { container } = render(
      <Icon
        name="shield"
        data-testid="shield-icon"
        style={{ color: 'rgb(251, 191, 36)' }}
        strokeWidth={1.5}
      />
    )
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg).toHaveAttribute('data-testid', 'shield-icon')
    expect(svg).toHaveAttribute('stroke-width', '1.5')
  })

  it('lets callers override the default aria-hidden', () => {
    const { container } = render(<Icon name="info" aria-hidden={false} aria-label="Information" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'false')
  })

  it('renders a path for every icon name', () => {
    const names = [
      'home', 'quests', 'map', 'challenges', 'career', 'leaderboard', 'character',
      'settings', 'chevronRight', 'chevronLeft', 'close', 'menu', 'sun', 'moon',
      'computer', 'volume', 'volumeOff', 'search', 'filter', 'sort', 'check', 'x',
      'plus', 'minus', 'edit', 'delete', 'share', 'copy', 'download', 'upload',
      'external', 'info', 'help', 'warning', 'error', 'success', 'star', 'starFilled',
      'heart', 'heartFilled', 'bookmark', 'bookmarkFilled', 'flag', 'trophy', 'medal',
      'badge', 'crown', 'fire', 'lightning', 'shield', 'sword', 'target', 'clock',
      'calendar', 'user', 'users', 'mail', 'chat', 'bell', 'gear', 'link', 'unlink',
      'globe', 'mapPin', 'code', 'terminal', 'database', 'server', 'cloud', 'storage',
    ] as const

    for (const name of names) {
      const { container } = render(<Icon name={name} />)
      const path = container.querySelector('path')
      expect(path, `icon "${name}" should render a path`).not.toBeNull()
      expect(path?.getAttribute('d'), `icon "${name}" should have geometry`).toBeTruthy()
    }
  })

  it('renders different geometry per name', () => {
    const menu = render(<Icon name="menu" />).container.querySelector('path')
    const close = render(<Icon name="close" />).container.querySelector('path')
    expect(menu?.getAttribute('d')).not.toBe(close?.getAttribute('d'))
  })

  it('renders the known menu glyph path', () => {
    const { container } = render(<Icon name="menu" />)
    expect(container.querySelector('path')).toHaveAttribute(
      'd',
      'M4 6h16M4 12h16M4 18h16'
    )
  })

  it('fills filled variants with currentColor instead of none', () => {
    const outline = render(<Icon name="star" />).container.querySelector('path')
    const filled = render(<Icon name="starFilled" />).container.querySelector('path')

    expect(outline).not.toHaveAttribute('fill')
    expect(filled).toHaveAttribute('fill', 'currentColor')
  })
})
