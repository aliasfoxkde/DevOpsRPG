import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-card border-b border-border px-4 py-3" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary" aria-label="DevOpsQuest Home">
          DevOpsQuest
        </Link>
        <div className="flex gap-6" role="list">
          <Link
            to="/"
            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-current={location.pathname === '/' ? 'page' : undefined}
            role="listitem"
          >
            Home
          </Link>
          <Link
            to="/learn"
            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-current={location.pathname.startsWith('/learn') ? 'page' : undefined}
            role="listitem"
          >
            Learn
          </Link>
          <Link
            to="/dashboard"
            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-current={location.pathname === '/dashboard' ? 'page' : undefined}
            role="listitem"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}
