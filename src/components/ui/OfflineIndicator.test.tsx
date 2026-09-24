import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OfflineIndicator, InstallPrompt } from './OfflineIndicator'

// jsdom has no matchMedia; InstallPrompt reads it on first render to detect an
// already-installed PWA. `matches: false` means "not installed".
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    })),
  })
})

afterAll(() => {
  delete (window as unknown as { matchMedia?: unknown }).matchMedia
})

// Browser connectivity/install events arrive outside React's knowledge, so
// each dispatch is wrapped in act() to flush the resulting state update.
function fireWindowEvent(name: string) {
  act(() => {
    window.dispatchEvent(new Event(name))
  })
}

function fireInstallAvailable(prompt: () => void) {
  act(() => {
    window.dispatchEvent(
      Object.assign(new Event('beforeinstallprompt'), {
        prompt,
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      }),
    )
  })
}

describe('OfflineIndicator', () => {
  it('renders nothing while the browser reports it is online', () => {
    const { container } = render(<OfflineIndicator />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the offline banner when the browser goes offline', () => {
    render(<OfflineIndicator />)

    fireWindowEvent('offline')

    expect(screen.getByText("You're offline")).toBeInTheDocument()
    expect(screen.getByText('- Your progress is saved locally')).toBeInTheDocument()
  })

  it('hides the banner again once connectivity returns', () => {
    render(<OfflineIndicator />)

    fireWindowEvent('offline')
    expect(screen.getByText("You're offline")).toBeInTheDocument()

    fireWindowEvent('online')
    expect(screen.queryByText("You're offline")).toBeNull()
  })

  it('survives repeated connectivity flaps', () => {
    render(<OfflineIndicator />)

    fireWindowEvent('offline')
    fireWindowEvent('online')
    fireWindowEvent('offline')

    expect(screen.getByText("You're offline")).toBeInTheDocument()
  })

  it('removes its listeners on unmount', () => {
    const { unmount } = render(<OfflineIndicator />)
    unmount()

    expect(() => {
      fireWindowEvent('offline')
    }).not.toThrow()
    expect(screen.queryByText("You're offline")).toBeNull()
  })
})

describe('InstallPrompt', () => {
  it('renders nothing until the browser offers installation', () => {
    const { container } = render(<InstallPrompt />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the install UI on beforeinstallprompt', () => {
    render(<InstallPrompt />)

    fireInstallAvailable(() => {})

    expect(screen.getByText('Install DevOpsQuest')).toBeInTheDocument()
    expect(screen.getByText('Add to home screen for the best experience!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Later' })).toBeInTheDocument()
  })

  it('dismisses without prompting when Later is clicked', async () => {
    const user = userEvent.setup()
    const prompt = vi.fn()
    render(<InstallPrompt />)

    fireInstallAvailable(prompt)

    await user.click(screen.getByRole('button', { name: 'Later' }))

    expect(screen.queryByText('Install DevOpsQuest')).toBeNull()
    expect(prompt).not.toHaveBeenCalled()
  })

  it('triggers the native prompt and hides itself when Install is clicked', async () => {
    const user = userEvent.setup()
    const prompt = vi.fn()
    render(<InstallPrompt />)

    fireInstallAvailable(prompt)

    await user.click(screen.getByRole('button', { name: 'Install' }))

    expect(prompt).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.queryByText('Install DevOpsQuest')).toBeNull()
    })
  })
})
