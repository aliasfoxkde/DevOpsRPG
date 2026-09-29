import { Outlet, useLocation } from 'react-router-dom'
import Breadcrumbs from '../ui/Breadcrumbs'
import { ErrorBoundary } from '../ErrorBoundary'

export default function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-amber-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <Breadcrumbs />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {/* Keyed by pathname so navigating away from a crashed route gives the
            next page a fresh boundary instead of a stuck error screen. */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
