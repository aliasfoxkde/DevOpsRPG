import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { realms, allQuests } from '../data/quests'
import { worldMapLocations, sdlcPhases, type MapLocation } from '../data/worldmap'

// Realm theme colors
const REALM_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  foundations: { primary: '#22c55e', secondary: '#16a34a', glow: 'rgba(34, 197, 94, 0.5)' },
  scripts: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.5)' },
  frameworks: { primary: '#8b5cf6', secondary: '#7c3aed', glow: 'rgba(139, 92, 246, 0.5)' },
  cloud: { primary: '#06b6d4', secondary: '#0891b2', glow: 'rgba(6, 182, 212, 0.5)' },
  devops: { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239, 68, 68, 0.5)' },
  aiintelligence: { primary: '#ec4899', secondary: '#db2777', glow: 'rgba(236, 72, 153, 0.5)' },
}

// Pre-generated star positions for atmosphere (generated once)
const STARS = [...Array(50)].map(() => ({
  left: Math.random() * 100,
  top: Math.random() * 60,
  delay: Math.random() * 3,
  opacity: Math.random() * 0.5 + 0.2
}))

export default function WorldMapPage() {
  const { game } = useGame()
  const navigate = useNavigate()
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [animatedLocations, setAnimatedLocations] = useState<Set<string>>(new Set())
  const [showSDLC, setShowSDLC] = useState(true)
  const [pathAnimKey, setPathAnimKey] = useState(0)

  const { character, completedQuests } = game

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

  // Animated path component
  const AnimatedPath = ({ x1, y1, x2, y2, color, isHighlighted }: {
    x1: number; y1: number; x2: number; y2: number
    color: string; isHighlighted: boolean
  }) => {
    const dashOffset = useMemo(() => Math.random() * 20, [pathAnimKey])
    return (
      <g>
        {/* Glow effect */}
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color} strokeWidth={isHighlighted ? 6 : 4}
          strokeOpacity={isHighlighted ? 0.4 : 0.2}
          strokeDasharray="8,8"
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        {/* Main path */}
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color} strokeWidth={isHighlighted ? 3 : 2}
          strokeOpacity={isHighlighted ? 0.8 : 0.5}
          strokeDasharray="8,8"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </g>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - Improved */}
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
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                🗺️ World Map
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

      {/* Progress Bar - More prominent */}
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

      {/* SDLC Phase Legend - Cleaner pills */}
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

      {/* Map Container - Full visual redesign */}
      <div className="relative w-full h-[calc(100vh-220px)] overflow-hidden">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950" />

        {/* Animated star field for atmosphere */}
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

        {/* Horizon glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/10 to-transparent" />

        {/* SVG Connections Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            {/* Gradients for different path types */}
            <linearGradient id="realmPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="sdlcPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0.3" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Draw connections */}
          {worldMapLocations.map(location => {
            if (!animatedLocations.has(location.id)) return null
            return location.connectedTo.map(targetId => {
              const target = worldMapLocations.find(l => l.id === targetId)
              if (!target || !animatedLocations.has(targetId)) return null

              const isSDLCPath = location.type === 'sdlc' || target.type === 'sdlc'
              if (!showSDLC && isSDLCPath) return null

              const x1 = location.position.x
              const y1 = location.position.y
              const x2 = target.position.x
              const y2 = target.position.y

              const isHighlighted = hoveredLocation === location.id || hoveredLocation === targetId
              const pathColor = isSDLCPath ? '#22c55e' : '#f59e0b'

              return (
                <AnimatedPath
                  key={`${location.id}-${targetId}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  color={pathColor}
                  isHighlighted={isHighlighted}
                />
              )
            })
          })}
        </svg>

        {/* Map Locations - Significantly improved */}
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
              {/* Location container */}
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

                {/* Main marker */}
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
                  {/* Icon */}
                  <span className="text-2xl drop-shadow-lg">{location.icon}</span>

                  {/* Status badge - redesigned */}
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

                {/* Location name - visible on hover/highlight */}
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

                {/* Connection indicator dots */}
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

        {/* Character Position Card - Redesigned */}
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-lg rounded-xl px-4 py-3 border border-amber-600/30 shadow-2xl shadow-amber-900/20">
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

        {/* Realm Legend - Redesigned */}
        <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur-lg rounded-xl p-4 border border-slate-700/50 shadow-2xl max-w-xs">
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

      {/* Location Detail Modal - Significantly improved */}
      {selectedLocation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedLocation(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
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

              {/* Progress section */}
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

              {/* SDLC Phase indicator */}
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

              {/* Unlock level */}
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

              {/* Action buttons */}
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
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}
