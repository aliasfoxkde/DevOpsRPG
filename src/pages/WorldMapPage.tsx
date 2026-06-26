import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { realms, allQuests } from '../data/quests'
import { worldMapLocations, sdlcPhases, type MapLocation } from '../data/worldmap'

// Hidden secret locations that can be discovered
const SECRET_LOCATIONS: MapLocation[] = [
  {
    id: 'lost_library',
    name: 'Lost Library of Code',
    description: 'An ancient library containing the wisdom of DevOps masters. Here you can review previously failed questions and strengthen your knowledge.',
    icon: '📚',
    position: { x: 12, y: 45 },
    type: 'secret',
    realmId: 'foundations',
    unlocksAtLevel: 5,
    connectedTo: [],
  },
  {
    id: 'dragon_lair',
    name: 'Elder Dragon\'s Lair',
    description: 'The legendary lair where ancient dragonsguard DevOps secrets. Only those who have mastered multiple companions may enter.',
    icon: '🐲',
    position: { x: 75, y: 35 },
    type: 'secret',
    realmId: 'cloud',
    unlocksAtLevel: 20,
    connectedTo: [],
  },
  {
    id: 'phoenix_nest',
    name: 'Phoenix Nest',
    description: 'A mystical nest where Phoenix companions are reborn. Complete a 30-day streak to discover this hidden location.',
    icon: '🔥',
    position: { x: 88, y: 65 },
    type: 'secret',
    realmId: 'devops',
    unlocksAtLevel: 15,
    connectedTo: [],
  },
  {
    id: 'code_shrine',
    name: 'Shrine of Clean Code',
    description: 'A sacred shrine where developers pray for code clarity. Complete 100 quests with no mistakes to unlock.',
    icon: '⛩️',
    position: { x: 45, y: 75 },
    type: 'secret',
    realmId: 'frameworks',
    unlocksAtLevel: 10,
    connectedTo: [],
  },
]

// Konami code sequence
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

// Realm theme colors
const REALM_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  foundations: { primary: '#22c55e', secondary: '#16a34a', glow: 'rgba(34, 197, 94, 0.5)' },
  scripts: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.5)' },
  frameworks: { primary: '#8b5cf6', secondary: '#7c3aed', glow: 'rgba(139, 92, 246, 0.5)' },
  cloud: { primary: '#06b6d4', secondary: '#0891b2', glow: 'rgba(6, 182, 212, 0.5)' },
  devops: { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239, 68, 68, 0.5)' },
  aiintelligence: { primary: '#ec4899', secondary: '#db2777', glow: 'rgba(236, 72, 153, 0.5)' },
}

// Pre-generated star positions for atmosphere
const STARS = [...Array(50)].map(() => ({
  left: Math.random() * 100,
  top: Math.random() * 40,
  delay: Math.random() * 3,
  opacity: Math.random() * 0.5 + 0.2
}))

// Map terrain decorations
const TERRAIN_DECORATIONS = [
  // Mountains (background)
  { id: 'mt1', type: 'mountain', x: 8, y: 72, scale: 1.4 },
  { id: 'mt2', type: 'mountain', x: 18, y: 68, scale: 1.0 },
  { id: 'mt3', type: 'mountain', x: 82, y: 70, scale: 1.2 },
  { id: 'mt4', type: 'mountain', x: 92, y: 74, scale: 0.9 },
  { id: 'mt5', type: 'mountain', x: 40, y: 22, scale: 0.7 },
  { id: 'mt6', type: 'mountain', x: 60, y: 28, scale: 0.65 },

  // Hills
  { id: 'hl1', type: 'hill', x: 3, y: 82, scale: 1.0 },
  { id: 'hl2', type: 'hill', x: 14, y: 80, scale: 0.8 },
  { id: 'hl3', type: 'hill', x: 86, y: 84, scale: 1.1 },

  // Forests
  { id: 'fr1', type: 'forest', x: 82, y: 52, scale: 1.3 },
  { id: 'fr2', type: 'forest', x: 15, y: 70, scale: 1.0 },
  { id: 'fr3', type: 'forest', x: 3, y: 58, scale: 0.8 },
  { id: 'fr4', type: 'forest', x: 96, y: 48, scale: 0.9 },

  // Lakes
  { id: 'lk1', type: 'lake', x: 6, y: 88, scale: 1.0 },
  { id: 'lk2', type: 'lake', x: 88, y: 90, scale: 0.7 },

  // Structures
  { id: 'bld1', type: 'tower', x: 76, y: 36, scale: 0.6 },
  { id: 'bld2', type: 'windmill', x: 22, y: 46, scale: 0.5 },
  { id: 'bld3', type: 'castle_small', x: 68, y: 50, scale: 0.5 },

  // Trees
  { id: 'tr1', type: 'tree', x: 2, y: 92, scale: 0.9 },
  { id: 'tr2', type: 'tree', x: 96, y: 94, scale: 1.0 },
  { id: 'tr3', type: 'tree', x: 42, y: 96, scale: 0.8 },
  { id: 'tr4', type: 'tree', x: 58, y: 94, scale: 0.75 },

  // Rocks
  { id: 'rk1', type: 'rock', x: 28, y: 90, scale: 0.6 },
  { id: 'rk2', type: 'rock', x: 70, y: 88, scale: 0.5 },

  // Clouds (animated)
  { id: 'cloud1', type: 'cloud', x: 12, y: 12, scale: 1.0 },
  { id: 'cloud2', type: 'cloud', x: 42, y: 6, scale: 0.8 },
  { id: 'cloud3', type: 'cloud', x: 72, y: 10, scale: 1.1 },
  { id: 'cloud4', type: 'cloud', x: 88, y: 18, scale: 0.7 },
]

// Trail control points for winding paths
const TRAIL_PATHS = [
  // Village to Forest
  { from: 'village_center', to: 'forest_entrance', cp: [
    { x: 50, y: 85 }, { x: 55, y: 83 }, { x: 62, y: 80 }, { x: 68, y: 75 },
    { x: 72, y: 70 }, { x: 75, y: 65 }, { x: 75, y: 60 }
  ]},
  // Forest to Castle
  { from: 'forest_entrance', to: 'castle_grounds', cp: [
    { x: 75, y: 60 }, { x: 70, y: 56 }, { x: 64, y: 52 }, { x: 58, y: 48 },
    { x: 54, y: 44 }, { x: 50, y: 40 }
  ]},
  // Castle to Cloud
  { from: 'castle_grounds', to: 'cloud_base_camp', cp: [
    { x: 50, y: 40 }, { x: 46, y: 44 }, { x: 40, y: 48 }, { x: 34, y: 51 },
    { x: 28, y: 53 }, { x: 25, y: 55 }
  ]},
  // Cloud to Citadel
  { from: 'cloud_base_camp', to: 'citadel_entrance', cp: [
    { x: 25, y: 55 }, { x: 28, y: 50 }, { x: 32, y: 45 }, { x: 36, y: 40 },
    { x: 42, y: 35 }, { x: 48, y: 30 }, { x: 50, y: 25 }
  ]},
  // Citadel to AI Nexus
  { from: 'citadel_entrance', to: 'ai_nexus', cp: [
    { x: 50, y: 25 }, { x: 50, y: 22 }, { x: 50, y: 18 }, { x: 50, y: 15 }, { x: 50, y: 10 }
  ]},
  // AI Nexus to Summit
  { from: 'ai_nexus', to: 'summit', cp: [
    { x: 50, y: 10 }, { x: 50, y: 6 }, { x: 50, y: 2 }
  ]},
]

// Terrain SVG Components
const MountainSVG = ({ scale = 1, color = '#475569' }: { scale?: number; color?: string }) => (
  <svg width={`${80 * scale}`} height={`${60 * scale}`} viewBox="0 0 80 60" fill="none">
    <path d="M5 55 L25 15 L40 35 L55 10 L75 55 Z" fill={color} opacity="0.9"/>
    <path d="M5 55 L25 15 L40 35 L55 10 L75 55 Z" fill="url(#snowGrad)" opacity="0.4"/>
    <defs>
      <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="white"/>
        <stop offset="100%" stopColor="transparent"/>
      </linearGradient>
    </defs>
  </svg>
)

const HillSVG = ({ scale = 1 }: { scale?: number }) => (
  <svg width={`${100 * scale}`} height={`${40 * scale}`} viewBox="0 0 100 40" fill="none">
    <ellipse cx="50" cy="35" rx="48" ry="20" fill="#374151" opacity="0.8"/>
    <ellipse cx="50" cy="32" rx="45" ry="18" fill="#4b5563" opacity="0.6"/>
  </svg>
)

const ForestSVG = ({ scale = 1 }: { scale?: number }) => (
  <svg width={`${80 * scale}`} height={`${70 * scale}`} viewBox="0 0 80 70" fill="none">
    {/* Tree 1 */}
    <polygon points="15,65 25,20 35,65" fill="#166534"/>
    <polygon points="18,55 25,28 32,55" fill="#15803d"/>
    <rect x="22" y="65" width="6" height="8" fill="#78350f"/>
    {/* Tree 2 */}
    <polygon points="35,65 48,10 61,65" fill="#14532d"/>
    <polygon points="38,55 48,20 58,55" fill="#166534"/>
    <polygon points="42,45 48,25 54,45" fill="#15803d"/>
    <rect x="45" y="65" width="7" height="8" fill="#92400e"/>
    {/* Tree 3 */}
    <polygon points="55,65 65,25 75,65" fill="#166534"/>
    <polygon points="58,55 65,32 72,55" fill="#15803d"/>
    <rect x="62" y="65" width="5" height="8" fill="#78350f"/>
  </svg>
)

const LakeSVG = ({ scale = 1 }: { scale?: number }) => (
  <svg width={`${120 * scale}`} height={`${40 * scale}`} viewBox="0 0 120 40" fill="none">
    <ellipse cx="60" cy="25" rx="55" ry="18" fill="#0369a1" opacity="0.6"/>
    <ellipse cx="60" cy="23" rx="50" ry="15" fill="#0ea5e9" opacity="0.4"/>
    <ellipse cx="55" cy="20" rx="20" ry="6" fill="#38bdf8" opacity="0.3"/>
  </svg>
)

const TowerSVG = ({ scale = 1 }: { scale?: number }) => (
  <svg width={`${40 * scale}`} height={`${80 * scale}`} viewBox="0 0 40 80" fill="none">
    <rect x="10" y="20" width="20" height="55" fill="#6b7280"/>
    <rect x="8" y="15" width="24" height="10" fill="#4b5563"/>
    <polygon points="5,15 20,0 35,15" fill="#374151"/>
    <rect x="15" y="60" width="10" height="15" fill="#1f2937"/>
    <rect x="14" y="35" width="6" height="8" fill="#fbbf24" opacity="0.6"/>
    <rect x="24" y="35" width="6" height="8" fill="#fbbf24" opacity="0.6"/>
  </svg>
)

const WindmillSVG = ({ scale = 1 }: { scale?: number }) => (
  <svg width={`${60 * scale}`} height={`${80 * scale}`} viewBox="0 0 60 80" fill="none">
    <rect x="22" y="30" width="16" height="45" fill="#9ca3af"/>
    <circle cx="30" cy="25" r="20" fill="#d1d5db" opacity="0.3"/>
    {/* Blades */}
    <rect x="28" y="5" width="4" height="40" fill="#e5e7eb" transform="rotate(0 30 25)"/>
    <rect x="28" y="5" width="4" height="40" fill="#e5e7eb" transform="rotate(90 30 25)"/>
    <rect x="28" y="5" width="4" height="40" fill="#e5e7eb" transform="rotate(180 30 25)"/>
    <rect x="28" y="5" width="4" height="40" fill="#e5e7eb" transform="rotate(270 30 25)"/>
    <circle cx="30" cy="25" r="5" fill="#6b7280"/>
    <rect x="26" y="70" width="8" height="10" fill="#78350f"/>
  </svg>
)

const CastleSmallSVG = ({ scale = 1 }: { scale?: number }) => (
  <svg width={`${70 * scale}`} height={`${60 * scale}`} viewBox="0 0 70 60" fill="none">
    <rect x="10" y="25" width="50" height="35" fill="#6b7280"/>
    <rect x="5" y="20" width="12" height="40" fill="#4b5563"/>
    <rect x="53" y="20" width="12" height="40" fill="#4b5563"/>
    <rect x="5" y="10" width="12" height="15" fill="#374151"/>
    <rect x="53" y="10" width="12" height="15" fill="#374151"/>
    {/* Battlements */}
    {[0,1,2].map(i => <rect key={i} x={`${8 + i*4}`} y="5" width="3" height="10" fill="#4b5563"/>) }
    {[0,1,2].map(i => <rect key={i} x={`${55 + i*4}`} y="5" width="3" height="10" fill="#4b5563"/>) }
    <rect x="28" y="45" width="14" height="15" fill="#1f2937"/>
    <rect x="25" y="30" width="6" height="6" fill="#fbbf24" opacity="0.5"/>
    <rect x="39" y="30" width="6" height="6" fill="#fbbf24" opacity="0.5"/>
  </svg>
)

const TreeSVG = ({ scale = 1 }: { scale?: number }) => (
  <svg width={`${50 * scale}`} height={`${70 * scale}`} viewBox="0 0 50 70" fill="none">
    <polygon points="25,5 40,40 10,40" fill="#15803d"/>
    <polygon points="25,15 38,45 12,45" fill="#166534"/>
    <rect x="20" y="40" width="10" height="25" fill="#78350f"/>
  </svg>
)

const RockSVG = ({ scale = 1 }: { scale?: number }) => (
  <svg width={`${40 * scale}`} height={`${30 * scale}`} viewBox="0 0 40 30" fill="none">
    <path d="M5 28 L12 10 L20 20 L28 8 L35 28 Z" fill="#6b7280"/>
    <path d="M8 26 L14 14 L22 22 L30 12 L33 26 Z" fill="#9ca3af"/>
  </svg>
)

const CloudSVG = ({ scale = 1 }: { scale?: number }) => (
  <svg width={`${100 * scale}`} height={`${50 * scale}`} viewBox="0 0 100 50" fill="none" className="animate-drift">
    <ellipse cx="30" cy="30" rx="25" ry="15" fill="#e2e8f0" opacity="0.6"/>
    <ellipse cx="55" cy="25" rx="30" ry="18" fill="#f1f5f9" opacity="0.5"/>
    <ellipse cx="75" cy="30" rx="20" ry="12" fill="#e2e8f0" opacity="0.6"/>
    <ellipse cx="45" cy="35" rx="20" ry="10" fill="#f8fafc" opacity="0.4"/>
  </svg>
)

const CompassSVG = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-lg">
    <circle cx="30" cy="30" r="28" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
    <circle cx="30" cy="30" r="24" fill="none" stroke="#334155" strokeWidth="1"/>
    {/* Cardinal directions */}
    <text x="30" y="12" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">N</text>
    <text x="30" y="52" textAnchor="middle" fill="#94a3b8" fontSize="10">S</text>
    <text x="10" y="33" textAnchor="middle" fill="#94a3b8" fontSize="10">W</text>
    <text x="50" y="33" textAnchor="middle" fill="#94a3b8" fontSize="10">E</text>
    {/* Needle */}
    <polygon points="30,10 33,28 30,25 27,28" fill="#ef4444"/>
    <polygon points="30,50 33,32 30,35 27,32" fill="#e2e8f0"/>
    <circle cx="30" cy="30" r="4" fill="#475569"/>
  </svg>
)

// Render terrain decoration based on type
function TerrainDecoration({ decoration, layerIndex }: { decoration: typeof TERRAIN_DECORATIONS[0]; layerIndex: number }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${decoration.x}%`,
    top: `${decoration.y}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: layerIndex,
    pointerEvents: 'none',
    opacity: 0.9,
  }

  switch (decoration.type) {
    case 'mountain':
      return <div style={style}><MountainSVG scale={decoration.scale} /></div>
    case 'hill':
      return <div style={style}><HillSVG scale={decoration.scale} /></div>
    case 'forest':
      return <div style={style}><ForestSVG scale={decoration.scale} /></div>
    case 'lake':
      return <div style={style}><LakeSVG scale={decoration.scale} /></div>
    case 'tower':
      return <div style={style}><TowerSVG scale={decoration.scale} /></div>
    case 'windmill':
      return <div style={style}><WindmillSVG scale={decoration.scale} /></div>
    case 'castle_small':
      return <div style={style}><CastleSmallSVG scale={decoration.scale} /></div>
    case 'tree':
      return <div style={style}><TreeSVG scale={decoration.scale} /></div>
    case 'rock':
      return <div style={style}><RockSVG scale={decoration.scale} /></div>
    case 'cloud':
      return <div style={{ ...style, animation: `drift ${15 + decoration.x % 10}s linear infinite`, animationDelay: `${decoration.x % 5}s` }}><CloudSVG scale={decoration.scale} /></div>
    default:
      return null
  }
}

export default function WorldMapPage() {
  const { game } = useGame()
  const navigate = useNavigate()
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [animatedLocations, setAnimatedLocations] = useState<Set<string>>(new Set())
  const [showSDLC, setShowSDLC] = useState(true)
  const [pathAnimKey, setPathAnimKey] = useState(0)
  const [discoveredSecrets, setDiscoveredSecrets] = useState<Set<string>>(new Set())
  const [showKonamiReward, setShowKonamiReward] = useState(false)
  const konamiIndexRef = useRef(0)

  const { character, completedQuests, stats } = game

  const isLocationUnlocked = useCallback((location: MapLocation) => {
    if (location.type === 'sdlc' && !showSDLC) return false
    if (location.unlocksAtLevel) {
      return character.level >= location.unlocksAtLevel
    }
    return true
  }, [character.level, showSDLC])

  // Animate locations appearing
  useEffect(() => {
    const timer = setTimeout(() => {
      worldMapLocations.forEach((loc, index) => {
        if (isLocationUnlocked(loc)) {
          setTimeout(() => {
            setAnimatedLocations(prev => new Set([...prev, loc.id]))
          }, index * 80)
        }
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [character.level, isLocationUnlocked, showSDLC])

  // Check for secret location unlocks
  useEffect(() => {
    const newDiscoveries = new Set<string>()
    // Lost Library: 5+ quests completed
    if (completedQuests.length >= 5 && !discoveredSecrets.has('lost_library')) {
      newDiscoveries.add('lost_library')
    }
    // Elder Dragon's Lair: 50+ quests and 2+ companions
    if (completedQuests.length >= 50 && game.companions.length >= 2 && !discoveredSecrets.has('dragon_lair')) {
      newDiscoveries.add('dragon_lair')
    }
    // Phoenix Nest: 30+ day streak
    if (character.streakDays >= 30 && !discoveredSecrets.has('phoenix_nest')) {
      newDiscoveries.add('phoenix_nest')
    }
    // Code Shrine: 100 quests with no mistakes
    if (stats.perfectQuestCount >= 100 && !discoveredSecrets.has('code_shrine')) {
      newDiscoveries.add('code_shrine')
    }
    if (newDiscoveries.size > 0) {
      setDiscoveredSecrets(prev => new Set([...prev, ...newDiscoveries]))
    }
  }, [completedQuests.length, character.streakDays, stats.perfectQuestCount, game.companions.length, discoveredSecrets])

  // Konami code detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KONAMI_CODE[konamiIndexRef.current]) {
        konamiIndexRef.current++
        if (konamiIndexRef.current === KONAMI_CODE.length) {
          konamiIndexRef.current = 0
          setShowKonamiReward(true)
          setTimeout(() => setShowKonamiReward(false), 5000)
          // Grant a bonus XP boost (just for show - would need proper state update in production)
        }
      } else {
        konamiIndexRef.current = 0
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Animate paths periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPathAnimKey(k => k + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const getLocationStatus = (location: MapLocation) => {
    if (location.type === 'realm' && location.realmId) {
      const realmQuests = allQuests.filter(q => q.realmId === location.realmId)
      const completed = realmQuests.filter(q =>
        completedQuests.some(cp => cp.topicId === q.topicId && cp.completed)
      ).length
      return { completed, total: realmQuests.length }
    }
    if (location.type === 'milestone') {
      const totalQuests = allQuests.length
      const completedCount = completedQuests.filter(cp => cp.completed).length
      return { completed: completedCount, total: totalQuests }
    }
    return null
  }

  const handleLocationClick = (location: MapLocation) => {
    if (!isLocationUnlocked(location)) return
    setSelectedLocation(location)
  }

  const handleTravel = () => {
    if (!selectedLocation) return
    if (selectedLocation.type === 'realm' && selectedLocation.realmId) {
      navigate('/quests', { state: { realmId: selectedLocation.realmId } })
    } else if (selectedLocation.type === 'milestone') {
      navigate('/rewards')
    }
    setSelectedLocation(null)
  }

  const completedCount = completedQuests.filter(cp => cp.completed).length
  const totalProgress = allQuests.length > 0
    ? Math.round((completedCount / allQuests.length) * 100)
    : 0

  // Get realm color
  const getRealmColor = (realmId?: string) => {
    if (!realmId) return { primary: '#6366f1', secondary: '#4f46e5', glow: 'rgba(99, 102, 241, 0.5)' }
    return REALM_COLORS[realmId] || { primary: '#6366f1', secondary: '#4f46e5', glow: 'rgba(99, 102, 241, 0.5)' }
  }

  // Generate smooth path using bezier curves
  const generateSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return ''
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      path += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`
    }
    // Last point
    const last = points[points.length - 1]
    path += ` L ${last.x} ${last.y}`
    return path
  }

  // Animated trail path component
  const TrailPath = ({ trail, isHighlighted, color }: {
    trail: typeof TRAIL_PATHS[0]; isHighlighted: boolean; color: string
  }) => {
    const dashOffset = useMemo(() => Math.random() * 20, [pathAnimKey])
    const pathD = generateSmoothPath(trail.cp)

    return (
      <g>
        {/* Path shadow/glow */}
        <path
          d={pathD}
          stroke={color}
          strokeWidth={isHighlighted ? 12 : 8}
          strokeOpacity={isHighlighted ? 0.3 : 0.15}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="transition-all duration-500"
        />
        {/* Main path */}
        <path
          d={pathD}
          stroke={color}
          strokeWidth={isHighlighted ? 6 : 4}
          strokeOpacity={isHighlighted ? 0.7 : 0.4}
          strokeDasharray="12,8"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="transition-all duration-300"
        />
        {/* Path dots pattern */}
        <path
          d={pathD}
          stroke={color}
          strokeWidth={2}
          strokeOpacity={isHighlighted ? 0.5 : 0.25}
          strokeDasharray="4,12"
          strokeDashoffset={dashOffset * 2}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    )
  }

  // Get location by id helper
  const getLocationById = (id: string) => worldMapLocations.find(l => l.id === id)

  // Check if trail is highlighted
  const isTrailHighlighted = (trail: typeof TRAIL_PATHS[0]) => {
    return hoveredLocation === trail.from || hoveredLocation === trail.to
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 sticky top-0 z-20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 transition-all"
            >
              <span>←</span>
              <span>Home</span>
            </Link>
            {/* Map Title Cartouche */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-lg border border-amber-600/30">
              <span className="text-xl">🗺️</span>
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Realm of DevOps
              </h1>
            </div>
            <button
              onClick={() => setShowSDLC(!showSDLC)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                showSDLC
                  ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-600/30'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              SDLC {showSDLC ? '✓' : ''}
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-slate-900/80 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Overall Journey Progress
            </span>
            <span className="text-lg font-bold text-amber-400">{totalProgress}%</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-green-600 via-emerald-500 to-amber-500 transition-all duration-700 ease-out relative"
              style={{ width: `${totalProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{completedCount} quests completed</span>
            <span>{allQuests.length - completedCount} remaining</span>
          </div>
        </div>
      </div>

      {/* SDLC Phase Legend */}
      <div className="bg-slate-900/50 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">SDLC:</span>
            {sdlcPhases.map(phase => (
              <button
                key={phase.id}
                onClick={() => setShowSDLC(!showSDLC)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all hover:scale-105"
                style={{
                  backgroundColor: `${phase.color}25`,
                  color: phase.color,
                  border: `1px solid ${phase.color}40`
                }}
              >
                <span className="text-sm">{phase.icon}</span>
                <span>{phase.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[calc(100vh-220px)] overflow-hidden">
        {/* Layer 0: Sky gradient with stars */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950 via-indigo-950/50 to-slate-900" />

        {/* Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {STARS.map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
                opacity: star.opacity
              }}
            />
          ))}
        </div>

        {/* Layer 1: Background mountains */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {TERRAIN_DECORATIONS.filter(d => ['mountain', 'cloud'].includes(d.type)).map(dec => (
            <TerrainDecoration key={dec.id} decoration={dec} layerIndex={1} />
          ))}
        </div>

        {/* Layer 2: Mid-ground terrain (hills, forests, lakes) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {TERRAIN_DECORATIONS.filter(d => ['hill', 'forest', 'lake', 'tower', 'windmill', 'castle_small'].includes(d.type)).map(dec => (
            <TerrainDecoration key={dec.id} decoration={dec} layerIndex={2} />
          ))}
        </div>

        {/* Layer 3: Trail/Path SVG Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 3 }}>
          <defs>
            {/* Path gradients */}
            <linearGradient id="realmTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="sdlcTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.5" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="trailGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Draw realm trails */}
          {TRAIL_PATHS.map(trail => {
            const fromLoc = getLocationById(trail.from)
            const toLoc = getLocationById(trail.to)
            if (!fromLoc || !toLoc) return null
            if (!animatedLocations.has(trail.from) || !animatedLocations.has(trail.to)) return null

            const isHighlighted = isTrailHighlighted(trail)
            const color = '#f59e0b' // Realm path color

            return (
              <TrailPath
                key={`${trail.from}-${trail.to}`}
                trail={trail}
                isHighlighted={isHighlighted}
                color={color}
              />
            )
          })}
        </svg>

        {/* Layer 4: Location markers */}
        {worldMapLocations.map((location, index) => {
          const unlocked = isLocationUnlocked(location)
          const animated = animatedLocations.has(location.id)
          const status = getLocationStatus(location)
          const isHighlighted = hoveredLocation === location.id || selectedLocation?.id === location.id
          const realmColor = getRealmColor(location.realmId)
          const isRealm = location.type === 'realm'
          const isMilestone = location.type === 'milestone'

          return (
            <div
              key={location.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                animated ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              style={{
                left: `${location.position.x}%`,
                top: `${location.position.y}%`,
                transitionDelay: `${index * 50}ms`,
                zIndex: isHighlighted ? 30 : 10
              }}
              onMouseEnter={() => setHoveredLocation(location.id)}
              onMouseLeave={() => setHoveredLocation(null)}
            >
              <button
                onClick={() => handleLocationClick(location)}
                className={`relative group transition-transform duration-300 ${
                  !unlocked ? 'filter grayscale opacity-40' : ''
                } ${isHighlighted ? 'scale-125' : 'hover:scale-110'}`}
                disabled={!unlocked}
              >
                {/* Outer glow ring */}
                {unlocked && (
                  <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      background: `radial-gradient(circle, ${realmColor.glow} 0%, transparent 70%)`,
                      transform: 'scale(1.8)',
                    }}
                  />
                )}

                {/* Main marker with realm-specific styling */}
                <div
                  className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all shadow-xl ${
                    selectedLocation?.id === location.id
                      ? 'bg-amber-600 border-amber-400 shadow-amber-500/50 shadow-2xl'
                      : isMilestone
                        ? 'bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400'
                        : isRealm
                          ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 hover:border-amber-500'
                          : 'bg-gradient-to-br from-green-800/80 to-green-900/80 border-green-600/50'
                  }`}
                  style={{
                    boxShadow: isHighlighted
                      ? `0 0 30px ${realmColor.glow}, 0 0 60px ${realmColor.glow}`
                      : `0 4px 20px rgba(0,0,0,0.5)`,
                    borderColor: isRealm && unlocked ? realmColor.primary : undefined
                  }}
                >
                  <span className="text-2xl drop-shadow-lg">{location.icon}</span>

                  {/* Progress badge */}
                  {status && status.total > 0 && (
                    <div
                      className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg"
                      style={{ backgroundColor: realmColor.primary }}
                    >
                      <span className="text-white">{Math.round((status.completed / status.total) * 100)}%</span>
                    </div>
                  )}

                  {/* Lock badge */}
                  {location.unlocksAtLevel && character.level < location.unlocksAtLevel && (
                    <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-600 text-white shadow-lg">
                      Lv{location.unlocksAtLevel}
                    </div>
                  )}
                </div>

                {/* Location tooltip */}
                <div
                  className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-all duration-300 ${
                    isHighlighted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                >
                  <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-1.5 shadow-xl">
                    <p className="text-white font-semibold text-sm">{location.name}</p>
                    {status && status.total > 0 && (
                      <p className="text-center text-xs" style={{ color: realmColor.primary }}>
                        {status.completed}/{status.total} quests
                      </p>
                    )}
                    {location.unlocksAtLevel && character.level < location.unlocksAtLevel && (
                      <p className="text-xs text-slate-400">Unlocks at Level {location.unlocksAtLevel}</p>
                    )}
                  </div>
                </div>

                {/* Connection dots when highlighted */}
                {unlocked && isHighlighted && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </button>
            </div>
          )
        })}

        {/* Secret locations (discovered based on achievements) */}
        {SECRET_LOCATIONS.map((location) => {
          const discovered = discoveredSecrets.has(location.id)
          const unlocked = isLocationUnlocked(location) || discovered
          const animated = animatedLocations.has(location.id) || discovered
          const isHighlighted = hoveredLocation === location.id || selectedLocation?.id === location.id

          if (!discovered && !unlocked) return null

          return (
            <div
              key={location.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
                animated ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              style={{
                left: `${location.position.x}%`,
                top: `${location.position.y}%`,
                zIndex: isHighlighted ? 30 : 15
              }}
              onMouseEnter={() => setHoveredLocation(location.id)}
              onMouseLeave={() => setHoveredLocation(null)}
            >
              <button
                onClick={() => {
                  if (location.id === 'lost_library') {
                    // Navigate to review mode
                    navigate('/quests', { state: { filter: 'review' } })
                  } else if (location.id === 'dragon_lair' || location.id === 'phoenix_nest') {
                    // Grant bonus XP
                    navigate('/rewards')
                  } else if (location.id === 'code_shrine') {
                    // Show stats
                    setSelectedLocation(location)
                  }
                }}
                className={`relative group transition-transform duration-300 ${
                  isHighlighted ? 'scale-125' : 'hover:scale-110'
                }`}
              >
                {/* Mysterious glow */}
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
                    transform: 'scale(2)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                {/* Secret marker */}
                <div
                  className="relative w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all shadow-xl bg-gradient-to-br from-pink-900/80 to-purple-900/80 border-pink-500/70"
                  style={{
                    boxShadow: isHighlighted
                      ? '0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(236, 72, 153, 0.4)'
                      : '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <span className="text-2xl">{location.icon}</span>
                </div>
                {/* Tooltip */}
                <div
                  className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-all duration-300 ${
                    isHighlighted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                >
                  <div className="bg-slate-900/95 backdrop-blur-sm border border-pink-700 rounded-lg px-3 py-1.5 shadow-xl">
                    <p className="text-white font-semibold text-sm">{location.name}</p>
                    <p className="text-xs text-pink-400">✨ Secret Location</p>
                  </div>
                </div>
              </button>
            </div>
          )
        })}

        {/* Layer 5: Foreground elements (trees, rocks) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {TERRAIN_DECORATIONS.filter(d => ['tree', 'rock'].includes(d.type)).map(dec => (
            <TerrainDecoration key={dec.id} decoration={dec} layerIndex={5} />
          ))}
        </div>

        {/* Konami Code Reward Popup */}
        {showKonamiReward && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-gradient-to-br from-purple-900 via-pink-900 to-slate-900 border-4 border-pink-500 rounded-2xl p-8 text-center shadow-2xl animate-bounce pointer-events-auto">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                KONAMI CODE ACTIVATED!
              </h2>
              <p className="text-pink-300 text-lg mb-4">
                You discovered a secret power-up!
              </p>
              <div className="bg-slate-800/80 rounded-lg px-4 py-2 inline-block">
                <span className="text-amber-400 font-bold">+1 XP Boost Added to Inventory!</span>
              </div>
            </div>
          </div>
        )}

        {/* Map UI: Compass */}
        <div className="absolute top-4 right-4" style={{ zIndex: 15 }}>
          <CompassSVG />
        </div>

        {/* Map UI: Title Cartouche (mobile) */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 md:hidden" style={{ zIndex: 15 }}>
          <div className="bg-slate-900/90 px-4 py-2 rounded-lg border border-amber-600/30 shadow-xl">
            <h1 className="text-lg font-bold text-amber-400">🗺️ Realm of DevOps</h1>
          </div>
        </div>

        {/* Character Position Card */}
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-lg rounded-xl px-4 py-3 border border-amber-600/30 shadow-2xl shadow-amber-900/20" style={{ zIndex: 15 }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-600/30">
                {character.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold">{character.name}</p>
              <p className="text-amber-400 text-sm font-medium">{character.title}</p>
              <p className="text-slate-400 text-xs">Level {character.level}</p>
            </div>
          </div>
        </div>

        {/* Realm Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50 shadow-2xl max-w-xs" style={{ zIndex: 15 }}>
          <p className="text-slate-400 text-xs mb-3 font-semibold uppercase tracking-wider">Realms</p>
          <div className="space-y-2">
            {Object.values(realms).map(realm => {
              const isUnlocked = character.level >= realm.requiredLevel
              const color = getRealmColor(realm.id)
              return (
                <div
                  key={realm.id}
                  className={`flex items-center gap-2 text-sm ${!isUnlocked ? 'opacity-40' : ''}`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: isUnlocked ? color.primary : '#4b5563' }}
                  />
                  <span className={`${isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>{realm.name}</span>
                  <span className="text-slate-500 text-xs ml-auto">Lv{realm.requiredLevel}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedLocation(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-6 py-5 border-b border-slate-800"
              style={{
                background: `linear-gradient(135deg, ${getRealmColor(selectedLocation.realmId).primary}20 0%, transparent 50%)`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${getRealmColor(selectedLocation.realmId).primary}30 0%, ${getRealmColor(selectedLocation.realmId).secondary}30 100%)`,
                      border: `2px solid ${getRealmColor(selectedLocation.realmId).primary}50`
                    }}
                  >
                    {selectedLocation.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedLocation.name}</h2>
                    <p
                      className="text-sm font-medium capitalize"
                      style={{ color: getRealmColor(selectedLocation.realmId).primary }}
                    >
                      {selectedLocation.type} {selectedLocation.sdlcPhase && `• Phase ${selectedLocation.sdlcPhase}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-slate-300 mb-6 leading-relaxed">{selectedLocation.description}</p>

              {selectedLocation.type === 'realm' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm font-medium">Quest Progress</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: getRealmColor(selectedLocation.realmId).primary }}
                    >
                      {getLocationStatus(selectedLocation)?.completed || 0}/{getLocationStatus(selectedLocation)?.total || 0}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${getLocationStatus(selectedLocation)?.total ?
                          (getLocationStatus(selectedLocation)!.completed / getLocationStatus(selectedLocation)!.total) * 100 : 0}%`,
                        background: `linear-gradient(90deg, ${getRealmColor(selectedLocation.realmId).primary} 0%, ${getRealmColor(selectedLocation.realmId).secondary} 100%)`
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedLocation.type === 'sdlc' && selectedLocation.sdlcPhase && (
                <div className="mb-6">
                  <span className="text-slate-400 text-sm font-medium block mb-3">SDLC Pipeline</span>
                  <div className="flex items-center gap-2">
                    {sdlcPhases.map((phase, idx) => (
                      <div key={phase.id} className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                            phase.id === selectedLocation.sdlcPhase
                              ? 'ring-2 ring-white shadow-lg scale-110'
                              : phase.id < selectedLocation.sdlcPhase!
                                ? 'opacity-100'
                                : 'opacity-30 grayscale'
                          }`}
                          style={{ backgroundColor: `${phase.color}40` }}
                          title={phase.name}
                        >
                          {phase.icon}
                        </div>
                        {idx < sdlcPhases.length - 1 && (
                          <div
                            className={`w-8 h-0.5 ${
                              phase.id < selectedLocation.sdlcPhase! ? '' : 'opacity-30'
                            }`}
                            style={{ backgroundColor: phase.color }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLocation.unlocksAtLevel && (
                <div className="flex items-center gap-2 mb-6 p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-amber-400">🔒</span>
                  <span className="text-slate-300 text-sm">
                    Unlocks at Level {selectedLocation.unlocksAtLevel}
                  </span>
                  {character.level >= selectedLocation.unlocksAtLevel && (
                    <span className="ml-auto text-green-400 text-sm font-medium">✓ Unlocked</span>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
                >
                  Close
                </button>
                {selectedLocation.type === 'realm' && character.level >= (selectedLocation.unlocksAtLevel || 1) && (
                  <button
                    onClick={handleTravel}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-600/30 hover:shadow-amber-500/50"
                  >
                    ⚔️ Enter Realm
                  </button>
                )}
                {selectedLocation.type === 'milestone' && (
                  <button
                    onClick={handleTravel}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30"
                  >
                    🏆 View Rewards
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes drift {
          0% { transform: translate(-50%, -50%) translateX(0px); }
          50% { transform: translate(-50%, -50%) translateX(30px); }
          100% { transform: translate(-50%, -50%) translateX(0px); }
        }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-drift { animation: drift 15s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
