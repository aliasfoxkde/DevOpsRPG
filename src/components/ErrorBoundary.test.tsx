import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

// Throw an error for testing
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <p>No error</p>
}

/** Broken until the test flips the flag, so a retry really can succeed. */
let shouldThrow = true

function FlakyChild() {
  if (shouldThrow) {
    throw new Error('boom')
  }
  return <p>Recovered content</p>
}

/** The thrown error has no message, so the UI must fall back to copy. */
function MessagelessError(): null {
  throw new Error('')
}

const originalLocation = window.location

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
    vi.restoreAllMocks()
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <p>Content</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders fallback UI on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('announces the failure to assistive tech and shows the error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    // The message is machine-readable text, not decoration.
    expect(alert).toHaveTextContent('Test error')
    expect(screen.getByText(/unexpected error/i)).toHaveTextContent(
      "We encountered an unexpected error. This has been logged and we'll work to fix it.",
    )
  })

  it('shows error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('falls back to a generic line when the thrown error carries no message', () => {
    render(
      <ErrorBoundary>
        <MessagelessError />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Unknown error')).toBeInTheDocument()
    expect(screen.queryByText('Test error')).toBeNull()
  })

  it('has retry button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('has home button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
  })

  it('renders custom fallback', () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.queryByText(/something went wrong/i)).toBeNull()
  })

  it('logs error to console on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    // componentDidCatch logs to console.error
    expect(console.error).toHaveBeenCalled()
  })

  it('clears the recorded error and renders children again after a retry', () => {
    render(
      <ErrorBoundary>
        <FlakyChild />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByText('Recovered content')).toBeInTheDocument()
    expect(screen.queryByText(/something went wrong/i)).toBeNull()
    expect(screen.queryByText('boom')).toBeNull()
  })

  it('sends the Go Home button to the app root', () => {
    const stub = { href: 'http://localhost/quests' }
    Object.defineProperty(window, 'location', { configurable: true, value: stub })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )
    fireEvent.click(screen.getByRole('button', { name: /go home/i }))

    expect(stub.href).toBe('/')
  })

  it('home button navigates to root path', () => {
    // The home button uses window.location.href which we cannot easily test in jsdom
    // This test exists for completeness but the actual navigation is tested elsewhere
    const { getByRole } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    // Verify the Go Home button is rendered
    const homeButton = getByRole('button', { name: /go home/i })
    expect(homeButton).toBeInTheDocument()
  })

  it('logs the caught error together with the component stack', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    // React logs its own recovery noise first; the boundary's own entry is
    // prefixed, carries the thrown error, and ends with the component stack.
    const boundaryCall = vi
      .mocked(console.error)
      .mock.calls.find(
        ([prefix, error, stack]) =>
          prefix === 'ErrorBoundary caught an error:' &&
          error instanceof Error &&
          error.message === 'Test error' &&
          typeof stack === 'string' &&
          stack.includes('ThrowError'),
      )
    expect(boundaryCall).toBeDefined()
  })
})
