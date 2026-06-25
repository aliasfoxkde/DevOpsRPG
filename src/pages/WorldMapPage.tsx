import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { realms, allQuests } from '../data/quests'
import { worldMapLocations, sdlcPhases, type MapLocation } from '../data/worldmap'

export default function WorldMapPage() {
  const { game } = useGame()
  const navigate = useNavigate()
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [animatedLocations, setAnimatedLocations] = useState<Set<string>>(new Set())
  const [showSDLC, setShowSDLC] = useState(true)

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
          }, index * 100)
        }
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [character.level, isLocationUnlocked])

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 border-b border-slate-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              ← Home
            </Link>
            <h1 className="text-xl font-bold text-white">🗺️ World Map</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSDLC(!showSDLC)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  showSDLC
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                SDLC Path {showSDLC ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400">Overall Journey Progress</span>
            <span className="text-amber-400 font-bold">{totalProgress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* SDLC Phase Legend */}
      <div className="bg-slate-800/30 border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 whitespace-nowrap">SDLC Phases:</span>
            {sdlcPhases.map(phase => (
              <div
                key={phase.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full whitespace-nowrap"
                style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
              >
                <span>{phase.icon}</span>
                <span>{phase.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[calc(100vh-180px)] overflow-hidden">
        {/* Background with terrain */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-slate-800 to-slate-900" />

        {/* Decorative terrain elements - Mountains in background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* Mountain range 1 */}
          <polygon points="0,100% 15%,60% 30%,100%" fill="url(#mountainGrad)" />
          <polygon points="20%,100% 35%,55% 50%,100%" fill="url(#mountainGrad)" />
          <polygon points="40%,100% 55%,50% 70%,100%" fill="url(#mountainGrad)" />
          {/* Mountain range 2 */}
          <polygon points="60%,100% 75%,45% 90%,100%" fill="url(#mountainGrad)" />
          <polygon points="80%,100% 92%,55% 100%,80% 100%,100%" fill="url(#mountainGrad)" />
          {/* Snow caps */}
          <polygon points="35%,55% 33%,60% 37%,60%" fill="white" opacity="0.5" />
          <polygon points="55%,50% 53%,55% 57%,55%" fill="white" opacity="0.5" />
          <polygon points="75%,45% 73%,50% 77%,50%" fill="white" opacity="0.5" />
        </svg>

        {/* Water/Ocean at bottom */}
        <svg className="absolute bottom-0 left-0 w-full h-24 pointer-events-none">
          <defs>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#waterGrad)" />
          {/* Waves */}
          <path d="M0,10 Q25,5 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10 T400,10 T450,10 T500,10" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M0,20 Q25,15 50,20 T100,20 T150,20 T200,20 T250,20 T300,20 T350,20 T400,20 T450,20 T500,20" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.2" />
        </svg>

        {/* Trees/Forest decorations */}
        <div className="absolute bottom-20 left-10 text-4xl opacity-30 pointer-events-none">🌲</div>
        <div className="absolute bottom-24 left-20 text-3xl opacity-20 pointer-events-none">🌲</div>
        <div className="absolute bottom-16 right-20 text-4xl opacity-25 pointer-events-none">🌲</div>
        <div className="absolute bottom-28 right-32 text-2xl opacity-20 pointer-events-none">🌴</div>

        {/* Rocks decoration */}
        <div className="absolute bottom-32 left-1/4 text-2xl opacity-20 pointer-events-none">🪨</div>
        <div className="absolute bottom-24 right-1/3 text-xl opacity-15 pointer-events-none">🪨</div>

        {/* Clouds */}
        <div className="absolute top-10 left-20 text-4xl opacity-20 pointer-events-none animate-bounce" style={{animationDuration: '3s'}}>☁️</div>
        <div className="absolute top-20 right-1/4 text-3xl opacity-15 pointer-events-none animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>☁️</div>
        <div className="absolute top-5 right-1/3 text-2xl opacity-10 pointer-events-none animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}}>☁️</div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTYsMjU2LDI1NiwxLjApIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10" />

        {/* SVG Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
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

              const x1 = `${location.position.x}%`
              const y1 = `${location.position.y}%`
              const x2 = `${target.position.x}%`
              const y2 = `${target.position.y}%`

              return (
                <line
                  key={`${location.id}-${targetId}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isSDLCPath ? '#22c55e' : '#6366f1'}
                  strokeWidth="2"
                  strokeOpacity="0.4"
                  strokeDasharray="5,5"
                  className="transition-all duration-1000"
                />
              )
            })
          })}
        </svg>

        {/* Map Locations */}
        {worldMapLocations.map((location, index) => {
          const unlocked = isLocationUnlocked(location)
          const animated = animatedLocations.has(location.id)
          const status = getLocationStatus(location)

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
              }}
            >
              <button
                onClick={() => handleLocationClick(location)}
                className={`relative group ${
                  !unlocked ? 'filter grayscale opacity-50' : ''
                }`}
                disabled={!unlocked}
              >
                {/* Glow effect for unlocked locations */}
                {unlocked && (
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                )}

                {/* Location marker */}
                <div
                  className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                    selectedLocation?.id === location.id
                      ? 'bg-amber-600 border-amber-400 scale-110 ring-4 ring-amber-400/50'
                      : unlocked
                        ? 'bg-slate-800 border-slate-600 hover:border-amber-500 hover:bg-slate-700'
                        : 'bg-slate-900 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <span className="text-2xl">{location.icon}</span>
                  {status && status.total > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs px-1.5 rounded-full font-bold">
                      {Math.round(status.total > 0 ? (status.completed / status.total) * 100 : 0)}%
                    </div>
                  )}
                  {location.unlocksAtLevel && character.level < location.unlocksAtLevel && (
                    <div className="absolute -bottom-1 -right-1 bg-slate-600 text-white text-xs px-1.5 rounded-full font-bold">
                      Lv{location.unlocksAtLevel}
                    </div>
                  )}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-center whitespace-nowrap">
                    <p className="text-white font-bold text-sm">{location.name}</p>
                    {status && status.total > 0 && (
                      <p className="text-green-400 text-xs">
                        {status.completed}/{status.total} quests
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )
        })}

        {/* Current Position Indicator */}
        <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur rounded-lg px-4 py-3 border border-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-xl">
              ⚔️
            </div>
            <div>
              <p className="text-white font-bold">{character.name}</p>
              <p className="text-amber-400 text-sm">Level {character.level} {character.class}</p>
            </div>
          </div>
        </div>

        {/* Minimap / Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur rounded-lg p-3 border border-slate-600">
          <p className="text-slate-400 text-xs mb-2 font-bold">REALMS</p>
          <div className="space-y-1">
            {Object.values(realms).map(realm => {
              const isUnlocked = character.level >= realm.requiredLevel
              return (
                <div
                  key={realm.id}
                  className={`flex items-center gap-2 text-xs ${!isUnlocked ? 'text-slate-600' : 'text-slate-300'}`}
                >
                  <span>{realm.icon}</span>
                  <span>{realm.name}</span>
                  <span className="text-slate-500 ml-auto">Lv{realm.requiredLevel}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-amber-600/50 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-900/30 via-slate-800 to-amber-900/30 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedLocation.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedLocation.name}</h2>
                  <p className="text-amber-400 text-sm capitalize">{selectedLocation.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-300 mb-4">{selectedLocation.description}</p>

              {selectedLocation.type === 'realm' && (
                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-2">Quest Completion</p>
                  {(() => {
                    const status = getLocationStatus(selectedLocation)
                    if (!status) return null
                    return (
                      <>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-green-400 font-bold">
                            {status.completed}/{status.total}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400"
                            style={{ width: `${status.total > 0 ? (status.completed / status.total) * 100 : 0}%` }}
                          />
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              {selectedLocation.type === 'sdlc' && selectedLocation.sdlcPhase && (
                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-2">SDLC Phase {selectedLocation.sdlcPhase}</p>
                  <div className="flex items-center gap-2">
                    {sdlcPhases.map(phase => {
                      const currentPhase = selectedLocation.sdlcPhase!
                      return (
                        <div
                          key={phase.id}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            phase.id === currentPhase
                              ? 'ring-2 ring-white'
                              : phase.id < currentPhase
                                ? 'opacity-50'
                                : 'opacity-30'
                          }`}
                          style={{ backgroundColor: phase.color }}
                        >
                          {phase.id}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                {selectedLocation.type === 'realm' && (
                  <button
                    onClick={handleTravel}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg transition-colors"
                  >
                    ⚔️ Enter Realm
                  </button>
                )}
                {selectedLocation.type === 'milestone' && (
                  <button
                    onClick={handleTravel}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-lg transition-colors"
                  >
                    🏆 View Rewards
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
