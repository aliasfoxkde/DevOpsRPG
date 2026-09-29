import { useMemo, useState } from 'react'
import { useGame } from '../contexts/GameContext'
import {
  SEASONAL_EVENTS,
  getActiveEvents,
  getNextEvent,
  getCurrentSeason,
  getSeasonalColors,
  isEventActive,
  meetsEventRequirements,
  type SeasonalEvent,
} from '../data/seasonalEvents'

function EventCard({
  event,
  isActive,
  isUpcoming,
  isEnded,
  claimed,
  onClaim,
}: {
  event: SeasonalEvent
  isActive: boolean
  isUpcoming: boolean
  isEnded: boolean
  claimed: boolean
  onClaim: (event: SeasonalEvent) => void
}) {
  const { game } = useGame()
  const meetsRequirements = meetsEventRequirements(
    event,
    game.character.level,
    game.completedQuests.length,
  )

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
            : 'border-slate-700 grayscale'
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
          {isEnded && (
            <div className="px-3 py-1 bg-slate-600/80 rounded-full text-white text-sm font-bold">
              Ended
            </div>
          )}
        </div>
      </div>

      <div className="bg-card p-4">
        <p className="text-slate-300 mb-4">{event.description}</p>

        {/* Date range */}
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
          <div>
            <span className="text-slate-500">Starts:</span> {startDate.toLocaleDateString()}
          </div>
          <div>
            <span className="text-slate-500">Ends:</span> {endDate.toLocaleDateString()}
          </div>
        </div>

        {/* Bonus multiplier */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-amber-400 font-bold text-lg">{event.bonusMultiplier}x</span>
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
            <div className="text-sm font-medium text-slate-300 mb-2">Event Rewards:</div>
            <div className="flex flex-wrap gap-2">
              {event.rewards.bonusXP ? (
                <span className="px-2 py-1 bg-green-600/30 text-green-300 text-xs rounded">
                  +{event.rewards.bonusXP} XP
                </span>
              ) : null}
              {event.rewards.bonusGold ? (
                <span className="px-2 py-1 bg-yellow-600/30 text-yellow-300 text-xs rounded">
                  +{event.rewards.bonusGold} Gold
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* Claim the one-time event bonus while the event is live */}
        {isActive && event.rewards && (
          <div className="mb-4">
            {claimed ? (
              <div className="text-center text-sm text-green-400 font-medium">
                ✓ Event reward claimed
              </div>
            ) : meetsRequirements ? (
              <button
                onClick={() => {
                  onClaim(event)
                }}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-sm font-bold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                🎁 Claim Event Reward
              </button>
            ) : (
              <div className="text-center text-sm text-slate-500">
                Reach the requirements to claim the event reward
              </div>
            )}
          </div>
        )}

        {/* Status */}
        {!isActive && !isEnded && isUpcoming && meetsRequirements && (
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">Event starts in {daysUntilStart} days</div>
          </div>
        )}

        {!meetsRequirements && !isActive && !isEnded && (
          <div className="text-center text-sm text-slate-500">Requirements not met</div>
        )}
      </div>
    </div>
  )
}

export default function SeasonalEventsPage() {
  const { game, claimEventReward } = useGame()
  const [claimFeedback, setClaimFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  const handleClaim = (event: SeasonalEvent) => {
    const rewards = claimEventReward(event.id)
    if (rewards.xp === 0 && rewards.gold === 0) {
      setClaimFeedback({ ok: false, text: `${event.name}: reward unavailable right now.` })
      return
    }
    const parts = [
      rewards.xp > 0 ? `+${rewards.xp} XP` : null,
      rewards.gold > 0 ? `+${rewards.gold} gold` : null,
    ].filter(Boolean)
    setClaimFeedback({ ok: true, text: `${event.name} reward claimed: ${parts.join(', ')}!` })
  }

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

  // Ended events (their window has passed)
  const endedEvents = useMemo(() => {
    const now = new Date()
    return sortedEvents.filter((e) => !isEventActive(e.id, now) && new Date(e.startDate) <= now)
  }, [sortedEvents])

  // Upcoming events (future events)
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return sortedEvents.filter((e) => new Date(e.startDate) > now)
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

      {/* Claim feedback */}
      {claimFeedback && (
        <div
          role="status"
          className={`mb-6 p-3 rounded-lg border text-sm ${
            claimFeedback.ok
              ? 'bg-green-900/30 border-green-700/50 text-green-300'
              : 'bg-red-900/30 border-red-700/50 text-red-300'
          }`}
        >
          {claimFeedback.text}
          <button
            onClick={() => {
              setClaimFeedback(null)
            }}
            className="ml-3 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-current"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🔥 Active Events</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activeEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isActive={true}
                isUpcoming={false}
                isEnded={false}
                claimed={game.claimedEvents.includes(event.id)}
                onClaim={handleClaim}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📅 Upcoming Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.slice(0, 6).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isActive={false}
                isUpcoming={true}
                isEnded={false}
                claimed={game.claimedEvents.includes(event.id)}
                onClaim={handleClaim}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {endedEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🏁 Past Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {endedEvents.slice(0, 6).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isActive={false}
                isUpcoming={false}
                isEnded={true}
                claimed={game.claimedEvents.includes(event.id)}
                onClaim={handleClaim}
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
