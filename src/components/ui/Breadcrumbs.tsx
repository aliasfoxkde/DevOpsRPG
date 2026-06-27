// Breadcrumbs component for navigation context
// Shows current location hierarchy with clickable links

import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  path: string
  icon?: string
}

// Map of routes to breadcrumb labels
const BREADCRUMB_MAP: Record<string, BreadcrumbItem> = {
  '/': { label: 'Home', path: '/', icon: '🏠' },
  '/quests': { label: 'Quests', path: '/quests', icon: '📜' },
  '/quest/:questId': { label: 'Battle Arena', path: '/quests', icon: '⚔️' },
  '/worldmap': { label: 'World Map', path: '/worldmap', icon: '🗺️' },
  '/challenges': { label: 'Challenges', path: '/challenges', icon: '🎯' },
  '/career-path': { label: 'Career Path', path: '/career-path', icon: '🛤️' },
  '/leaderboard': { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
  '/character': { label: 'Character', path: '/character', icon: '👤' },
  '/profile': { label: 'Profile', path: '/profile', icon: '👤' },
  '/rewards': { label: 'Rewards', path: '/rewards', icon: '🎁' },
  '/sidequests': { label: 'Side Quests', path: '/sidequests', icon: '⚔️' },
  '/skills': { label: 'Skills', path: '/skills', icon: '⚡' },
  '/badges': { label: 'Badges', path: '/badges', icon: '🏅' },
  '/milestones': { label: 'Milestones', path: '/milestones', icon: '🎯' },
  '/store': { label: 'Shop', path: '/store', icon: '🏪' },
  '/marketplace': { label: 'Marketplace', path: '/marketplace', icon: '🏪' },
  '/technology-collection': { label: 'Tech Cards', path: '/technology-collection', icon: '📚' },
  '/certifications': { label: 'Certifications', path: '/certifications', icon: '🏆' },
  '/titles-frames': { label: 'Titles & Frames', path: '/titles-frames', icon: '✨' },
  '/seasonal-events': { label: 'Seasonal Events', path: '/seasonal-events', icon: '🎭' },
  '/storylines': { label: 'Storylines', path: '/storylines', icon: '📖' },
  '/guild': { label: 'Guild Hall', path: '/guild', icon: '🏰' },
  '/social': { label: 'Social', path: '/social', icon: '👥' },
  '/analytics': { label: 'Analytics', path: '/analytics', icon: '📊' },
  '/settings': { label: 'Settings', path: '/settings', icon: '⚙️' },
  '/about': { label: 'About', path: '/about', icon: 'ℹ️' },
  '/faq': { label: 'FAQ', path: '/faq', icon: '❓' },
  '/privacy-policy': { label: 'Privacy Policy', path: '/privacy-policy', icon: '🔒' },
  '/games': { label: 'Game Library', path: '/games', icon: '🎮' },
  '/pvp-arena': { label: 'PvP Arena', path: '/pvp-arena', icon: '⚔️' },
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = []

  // Home is always first
  breadcrumbs.push(BREADCRUMB_MAP['/'])

  // Handle specific routes
  if (pathname === '/quests' || pathname.startsWith('/quest/')) {
    breadcrumbs.push(BREADCRUMB_MAP['/quests'])
    if (pathname.startsWith('/quest/')) {
      breadcrumbs.push(BREADCRUMB_MAP['/quest/:questId'])
    }
  } else if (pathname.startsWith('/worldmap')) {
    breadcrumbs.push(BREADCRUMB_MAP['/worldmap'])
  } else {
    // Try to find exact match
    const exactMatch = BREADCRUMB_MAP[pathname]
    if (exactMatch && exactMatch.path !== '/') {
      breadcrumbs.push(exactMatch)
    }
  }

  return breadcrumbs
}

export default function Breadcrumbs() {
  const location = useLocation()
  const breadcrumbs = getBreadcrumbs(location.pathname)

  // Don't show on home page
  if (location.pathname === '/') {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-slate-800/50 border-b border-slate-700 px-4 py-2"
    >
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <li key={crumb.path} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-slate-600" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast ? (
                  <span
                    className="text-amber-400 font-medium"
                    aria-current="page"
                  >
                    {crumb.icon && <span className="mr-1">{crumb.icon}</span>}
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
                  >
                    {crumb.icon && <span>{crumb.icon}</span>}
                    {crumb.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
