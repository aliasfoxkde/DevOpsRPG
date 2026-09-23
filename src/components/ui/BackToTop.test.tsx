import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BackToTop } from './BackToTop'

// jsdom does not scroll; `scrollY` is a read-only WebIDL attribute, so it is
// replaced with a plain writable property to simulate scroll position.
function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    value,
    configurable: true,
    writable: true,
  })
}

describe('BackToTop', () => {
  beforeEach(() => {
    setScrollY(0)
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    setScrollY(0)
    vi.restoreAllMocks()
  })

  it('renders nothing while the page is at the top', () => {
    render(<BackToTop />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('stays hidden exactly at the 400px threshold (strictly-greater check)', () => {
    render(<BackToTop />)
    setScrollY(400)
    fireEvent.scroll(window)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('appears once the page is scrolled beyond 400px', () => {
    render(<BackToTop />)
    setScrollY(500)
    fireEvent.scroll(window)

    const button = screen.getByRole('button', { name: 'Back to top' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('↑')
  })

  it('hides again after scrolling back to the top', () => {
    render(<BackToTop />)
    setScrollY(900)
    fireEvent.scroll(window)
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument()

    setScrollY(0)
    fireEvent.scroll(window)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('scrolls back to the top when clicked', async () => {
    const user = userEvent.setup()
    render(<BackToTop />)
    setScrollY(1000)
    fireEvent.scroll(window)

    await user.click(screen.getByRole('button', { name: 'Back to top' }))
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('stops listening after unmount (no phantom button on later scroll events)', () => {
    const { unmount } = render(<BackToTop />)
    unmount()

    setScrollY(2000)
    expect(() => fireEvent.scroll(window)).not.toThrow()
    expect(screen.queryByRole('button')).toBeNull()
  })
})
