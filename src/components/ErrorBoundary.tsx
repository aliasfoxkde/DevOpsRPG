import { Component, ReactNode, ErrorInfo } from 'react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  /* istanbul ignore next - componentDidCatch is not triggered in jsdom tests */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="container mx-auto px-4 py-8">
          <div
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
            role="alert"
            aria-live="assertive"
          >
            <div className="text-6xl mb-4" aria-hidden="true">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              We encountered an unexpected error. This has been logged and we'll work to fix it.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 max-w-lg w-full">
              <p className="text-sm font-mono text-destructive text-left break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={this.handleRetry}>
                Try Again
              </Button>
              <Button variant="outline" onClick={/* istanbul ignore next */ () => window.location.href = '/'}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
