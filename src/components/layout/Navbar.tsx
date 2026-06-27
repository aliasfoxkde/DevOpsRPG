import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-card border-b border-border px-4 py-3" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary" aria-label="DevOpsQuest Home">
          DevOpsQuest
        </Link>
        <div className="flex gap-6 overflow-x-auto scrollbar-thin" role="list">
          <Link
            to="/"
            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-current={location.pathname === '/' ? 'page' : undefined}
            role="listitem"
          >
            Home
          </Link>
          <Link
            to="/quests"
            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-current={location.pathname.startsWith('/quests') ? 'page' : undefined}
            role="listitem"
          >
            Quests
          </Link>
          <Link
            to="/rewards"
            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-current={location.pathname === '/rewards' ? 'page' : undefined}
            role="listitem"
          >
            🎁 Rewards
          </Link>
          <Link
            to="/sidequests"
            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-current={location.pathname === '/sidequests' ? 'page' : undefined}
            role="listitem"
          >
            📜 Side Quests
          </Link>
          <Link
            to="/profile"
            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-current={location.pathname === '/profile' ? 'page' : undefined}
            role="listitem"
          >
            📊 Profile
          </Link>
          <Link
            to="/skills"
            className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-current={location.pathname === '/skills' ? 'page' : undefined}
            role="listitem"
          >
            ⚡ Skills
          </Link>
        </div>
      </div>
    </nav>
  )
}
