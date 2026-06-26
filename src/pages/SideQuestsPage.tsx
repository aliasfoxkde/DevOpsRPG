import { useGame } from '../contexts/GameContext'
import { isQuestExpired } from '../data/sidequests'
import CodePlayground from '../components/games/CodePlayground'
import EmptyState from '../components/ui/EmptyState'

export default function SideQuestsPage() {
  const { game, claimSideQuest } = useGame()

  const dailyQuests = game.sideQuests.filter(q => q.type === 'daily')
  const weeklyQuests = game.sideQuests.filter(q => q.type === 'weekly')
  const secretQuests = game.sideQuests.filter(q => q.type === 'secret')

  const handleClaim = (questId: string) => {
    claimSideQuest(questId)
  }

  const getProgressPercentage = (quest: typeof game.sideQuests[0]) => {
    if (quest.completed) return 100
    const progress = Math.min(100, (quest.progress / quest.requirement.count) * 100)
    return progress
  }

  const QuestCard = ({ quest }: { quest: typeof game.sideQuests[0] }) => {
    const expired = isQuestExpired(quest)
    const canClaim = quest.progress >= quest.requirement.count && !quest.completed && !expired

    return (
      <div
        className={`p-4 rounded-lg border ${
          quest.completed
            ? 'bg-green-900/30 border-green-500/50'
            : expired
            ? 'bg-slate-800/30 border-slate-700'
            : 'bg-card border-border'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`text-3xl ${quest.completed || expired ? 'grayscale opacity-50' : ''}`}>
            {quest.icon}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className={`font-bold ${quest.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                {quest.title}
              </h3>
              {quest.completed && <span className="text-green-400 text-sm">✓ Claimed</span>}
              {expired && <span className="text-red-400 text-sm">Expired</span>}
            </div>
            <p className="text-sm text-slate-400 mb-3">{quest.description}</p>

            {/* Progress bar */}
            {!quest.completed && !expired && (
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-amber-400">
                    {quest.progress} / {quest.requirement.count}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      canClaim ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${getProgressPercentage(quest)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Rewards */}
            <div className="flex gap-4 text-sm">
              <span className="text-amber-400">+{quest.rewards.xp} XP</span>
              <span className="text-orange-400">+{quest.rewards.gold} Gold</span>
              {quest.rewards.badge && (
                <span className="text-blue-400">+ Badge</span>
              )}
            </div>
          </div>

          {/* Claim button */}
          {canClaim && (
            <button
              onClick={() => handleClaim(quest.id)}
              className="py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-sm whitespace-nowrap"
            >
              CLAIM
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">📜 Side Quests</h1>
        <p className="text-slate-400">Complete bonus objectives for extra rewards!</p>
      </div>

      {/* Daily Quests */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>📅</span> Daily Quests
          <span className="text-sm font-normal text-slate-400">
            ({dailyQuests.filter(q => q.completed).length}/{dailyQuests.length} complete)
          </span>
        </h2>
        {dailyQuests.length > 0 ? (
          <div className="space-y-4">
            {dailyQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📅"
            title="No Daily Quests"
            description="Daily quests reset at midnight. Complete regular quests to make progress and check back tomorrow!"
          />
        )}
        <p className="text-xs text-slate-500 mt-2">
          Resets at midnight
        </p>
      </div>

      {/* Weekly Quests */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>📆</span> Weekly Quests
          <span className="text-sm font-normal text-slate-400">
            ({weeklyQuests.filter(q => q.completed).length}/{weeklyQuests.length} complete)
          </span>
        </h2>
        {weeklyQuests.length > 0 ? (
          <div className="space-y-4">
            {weeklyQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📆"
            title="No Weekly Quests"
            description="Weekly quests reset every Monday. Keep playing and completing daily quests to unlock more challenges!"
          />
        )}
        <p className="text-xs text-slate-500 mt-2">
          Resets every Monday
        </p>
      </div>

      {/* Secret Quests */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🔮</span> Secret Quests
          <span className="text-sm font-normal text-slate-400">
            ({secretQuests.filter(q => q.completed).length}/{secretQuests.length} discovered)
          </span>
        </h2>
        {secretQuests.length > 0 ? (
          <div className="space-y-4">
            {secretQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔮"
            title="No Secret Quests Discovered"
            description="Secret quests unlock based on your gameplay. Keep exploring, completing challenges, and achieving milestones to discover hidden quests!"
          />
        )}
        <p className="text-xs text-slate-500 mt-2">
          Secret quests are always available but require specific actions to complete
        </p>
      </div>

      {/* Tips */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-bold mb-2">💡 Tips</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Complete quests to progress daily/weekly quests automatically</li>
          <li>• Keep your streak going for bonus streak rewards</li>
          <li>• Mystery boxes and collectibles can drop from quests</li>
          <li>• Some secret quests unlock based on your playing habits</li>
        </ul>
      </div>

      {/* Code Playground */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>💻</span> Code Playground
        </h2>
        <CodePlayground />
      </div>
    </div>
  )
}
