import { useMemo } from 'react'
import { useGame } from '../contexts/GameContext'
import {
  SEASONAL_EVENTS,
  getActiveEvents,
  getNextEvent,
  getCurrentSeason,
  getSeasonalColors,
  type SeasonalEvent,
} from '../data/seasonalEvents'

function EventCard({ event, isActive, isUpcoming, isCompleted }: {
  event: SeasonalEvent
  isActive: boolean
  isUpcoming: boolean
  isCompleted: boolean
}) {
  const { game } = useGame()
  const meetsRequirements = event.requirements
    ? game.character.level >= (event.requirements.minLevel || 0) &&
      game.completedQuests.length >= (event.requirements.minQuests || 0)
    : true

  // Memoize date calculations to avoid recalculation on every render
  const { startDate, endDate, daysUntilStart } = useMemo(() => {
    const sd = new Date(event.startDate)
    const ed = new Date(event.endDate)
    const now = new Date().getTime()
    const days = Math.ceil((sd.getTime() - now) / (1000 * 60 * 60 * 24))
    return { startDate: sd, endDate: ed, daysUntilStart: days }
  }, [event.startDate, event.endDate])

  const typeColors = {
    holiday: 'from-green-600 to-emerald-500',
    challenge: 'from-purple-600 to-violet-500',
    limited: 'from-amber-600 to-orange-500',
    special: 'from-pink-600 to-rose-500',
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 transition-all ${
        isActive
          ? 'border-amber-500 shadow-lg shadow-amber-500/20'
          : isUpcoming
          ? 'border-slate-600'
          : 'border-slate-700 opacity-60'
      }`}
    >
      {/* Event banner */}
      <div className={`bg-gradient-to-r ${typeColors[event.type]} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{event.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{event.name}</h3>
              <p className="text-white/80 text-sm capitalize">{event.type} Event</p>
            </div>
          </div>
          {isActive && (
            <div className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-bold animate-pulse">
              🔥 LIVE NOW
            </div>
          )}
          {isCompleted && (
            <div className="px-3 py-1 bg-green-600/80 rounded-full text-white text-sm font-bold">
              ✓ Completed
            </div>
          )}
        </div>
      </div>

      <div className="bg-card p-4">
        <p className="text-slate-300 mb-4">{event.description}</p>

        {/* Date range */}
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
          <div>
            <span className="text-slate-500">Starts:</span>{' '}
            {startDate.toLocaleDateString()}
          </div>
          <div>
            <span className="text-slate-500">Ends:</span>{' '}
            {endDate.toLocaleDateString()}
          </div>
        </div>

        {/* Bonus multiplier */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-amber-400 font-bold text-lg">
            {event.bonusMultiplier}x
          </span>
          <span className="text-slate-400">XP & Gold Bonus</span>
        </div>

        {/* Requirements */}
        {event.requirements && (
          <div className="text-sm text-slate-400 mb-4">
            Requirements:{' '}
            {meetsRequirements ? (
              <span className="text-green-400">✓ Met</span>
            ) : (
              <span className="text-amber-400">
                Level {event.requirements.minLevel}
                {event.requirements.minQuests && `, ${event.requirements.minQuests} quests`}
              </span>
            )}
          </div>
        )}

        {/* Rewards */}
        {event.rewards && (
          <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-slate-300 mb-2">Exclusive Rewards:</div>
            <div className="flex flex-wrap gap-2">
              {event.rewards.badgeId && (
                <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded">
                  🏅 Special Badge
                </span>
              )}
              {event.rewards.title && (
                <span className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded">
                  📜 {event.rewards.title}
                </span>
              )}
              {event.rewards.frame && (
                <span className="px-2 py-1 bg-amber-600/30 text-amber-300 text-xs rounded">
                  🖼️ Special Frame
                </span>
              )}
              {event.rewards.bonusXP && (
                <span className="px-2 py-1 bg-green-600/30 text-green-300 text-xs rounded">
                  +{event.rewards.bonusXP} XP
                </span>
              )}
              {event.rewards.bonusGold && (
                <span className="px-2 py-1 bg-yellow-600/30 text-yellow-300 text-xs rounded">
                  +{event.rewards.bonusGold} Gold
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        {!isActive && !isCompleted && isUpcoming && meetsRequirements && (
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">
              Event starts in {daysUntilStart} days
            </div>
          </div>
        )}

        {!meetsRequirements && !isActive && (
          <div className="text-center text-sm text-slate-500">
            Requirements not met
          </div>
        )}
      </div>
    </div>
  )
}

export default function SeasonalEventsPage() {
  const activeEvents = useMemo(() => getActiveEvents(), [])
  const nextEvent = useMemo(() => getNextEvent(), [])
  const currentSeason = useMemo(() => getCurrentSeason(), [])
  const seasonColors = useMemo(() => getSeasonalColors(currentSeason), [currentSeason])

  // Sort events by date
  const sortedEvents = useMemo(() => {
    return [...SEASONAL_EVENTS].sort((a, b) => {
      const aStart = new Date(a.startDate).getTime()
      const bStart = new Date(b.startDate).getTime()
      return bStart - aStart
    })
  }, [])

  // Completed events (past events)
  const completedEvents = useMemo(() => {
    const now = new Date()
    return sortedEvents.filter(e => new Date(e.endDate) < now)
  }, [sortedEvents])

  // Upcoming events (future events)
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return sortedEvents.filter(e => new Date(e.startDate) > now)
  }, [sortedEvents])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎭 Seasonal Events</h1>
        <p className="text-slate-400">Limited-time challenges and exclusive rewards!</p>
      </div>

      {/* Current Season Banner */}
      <div
        className="mb-8 p-6 rounded-xl border border-slate-700"
        style={{
          background: `linear-gradient(135deg, ${seasonColors.primary}20, ${seasonColors.secondary}10)`,
          borderColor: seasonColors.primary,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${seasonColors.primary}40` }}
          >
            {currentSeason === 'spring' && '🌸'}
            {currentSeason === 'summer' && '☀️'}
            {currentSeason === 'autumn' && '🍂'}
            {currentSeason === 'winter' && '❄️'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold capitalize" style={{ color: seasonColors.primary }}>
              {currentSeason} Season
            </h2>
            <p className="text-slate-400">
              {activeEvents.length > 0
                ? `${activeEvents.length} active event${activeEvents.length > 1 ? 's' : ''} this season!`
                : 'No active events right now. Check back soon!'}
            </p>
          </div>
          {nextEvent && (
            <div className="text-right hidden md:block">
              <div className="text-sm text-slate-400">Next Event</div>
              <div className="font-medium">
                {nextEvent.icon} {nextEvent.name}
              </div>
              <div className="text-sm text-slate-500">
                {new Date(nextEvent.startDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🔥 Active Events
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activeEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isActive={true}
                isUpcoming={false}
                isCompleted={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📅 Upcoming Events
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.slice(0, 6).map(event => (
              <EventCard
                key={event.id}
                event={event}
                isActive={false}
                isUpcoming={true}
                isCompleted={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {completedEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            ✅ Past Events
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedEvents.slice(0, 6).map(event => (
              <EventCard
                key={event.id}
                event={event}
                isActive={false}
                isUpcoming={false}
                isCompleted={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* No events message */}
      {activeEvents.length === 0 && upcomingEvents.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <div className="text-6xl mb-4">🎪</div>
          <p>No events available at the moment.</p>
          <p className="text-sm mt-2">Check back soon for exciting seasonal challenges!</p>
        </div>
      )}
    </div>
  )
}
