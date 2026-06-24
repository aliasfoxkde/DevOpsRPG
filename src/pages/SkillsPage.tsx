import { useGame } from '../contexts/GameContext'
import { SKILL_TREES, getXpForLevel, type Skill } from '../data/skills'

export default function SkillsPage() {
  const { allocateSkillPoint, getSkillLevel, getAvailableSkillPoints } = useGame()
  const availablePoints = getAvailableSkillPoints()

  const canLevelUp = (skill: Skill, currentLevel: number) => {
    if (availablePoints <= 0) return false
    if (currentLevel >= skill.maxLevel) return false
    return true
  }

  const getXpCost = (_skill: Skill, currentLevel: number) => {
    return getXpForLevel(currentLevel)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">⚡ Skill Tree</h1>
        <p className="text-slate-400">Spend skill points to unlock abilities and enhance your powers</p>
      </div>

      {/* Skill Points Available */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="text-5xl font-bold text-amber-400">{availablePoints}</div>
          <div className="text-left">
            <div className="text-lg font-bold text-white">Skill Points Available</div>
            <div className="text-sm text-slate-400">
              {availablePoints === 0
                ? 'Complete more quests to earn skill points!'
                : availablePoints === 1
                ? 'Spend your point to unlock a new ability!'
                : 'Spend your points to unlock new abilities!'}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Trees */}
      <div className="space-y-8">
        {SKILL_TREES.map(tree => (
          <div key={tree.id} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">{tree.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">{tree.name}</h2>
                <p className="text-sm text-slate-400">{tree.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tree.skills.map(skill => {
                const currentLevel = getSkillLevel(skill.id)
                const isMaxed = currentLevel >= skill.maxLevel
                const xpCost = isMaxed ? 0 : getXpCost(skill, currentLevel)
                const canUpgrade = canLevelUp(skill, currentLevel)

                return (
                  <div
                    key={skill.id}
                    className={`p-4 rounded-lg border ${
                      isMaxed
                        ? 'bg-amber-900/30 border-amber-500/50'
                        : currentLevel > 0
                        ? 'bg-slate-800/50 border-slate-600'
                        : 'bg-slate-800/30 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl ${isMaxed ? '' : currentLevel > 0 ? '' : 'grayscale opacity-50'}`}>
                          {skill.icon}
                        </div>
                        <div>
                          <h3 className={`font-bold ${isMaxed ? 'text-amber-400' : 'text-white'}`}>
                            {skill.name}
                          </h3>
                          <p className="text-sm text-slate-400 mb-2">{skill.description}</p>

                          {/* Level indicator */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-slate-500">LVL</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: skill.maxLevel }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 rounded-sm ${
                                    i < currentLevel
                                      ? 'bg-amber-500'
                                      : 'bg-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-amber-400 font-medium">
                              {currentLevel}/{skill.maxLevel}
                            </span>
                          </div>

                          {/* XP invested */}
                          {currentLevel > 0 && (
                            <p className="text-xs text-slate-500">
                              XP invested: {skill.xpInvested || currentLevel * xpCost}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Upgrade button */}
                      <div>
                        {isMaxed ? (
                          <div className="text-amber-400 text-sm font-bold px-3 py-1">
                            ✨ MAX
                          </div>
                        ) : (
                          <button
                            onClick={() => allocateSkillPoint(skill.id)}
                            disabled={!canUpgrade}
                            className={`px-3 py-1 rounded font-bold text-sm transition-all ${
                              canUpgrade
                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            +1
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-card rounded-xl border border-border p-6">
        <h3 className="font-bold mb-2">💡 Tips</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• You earn 1 skill point for each level you gain</li>
          <li>• Each skill can be leveled up to its max level</li>
          <li>• Higher levels provide greater bonuses in related quests</li>
          <li>• Balance your skills across different trees for versatility</li>
        </ul>
      </div>
    </div>
  )
}
