import { useGame } from '../contexts/GameContext'
import { SKILL_TREES, type Skill } from '../data/skills'

export default function SkillsPage() {
  const { game, allocateSkillPoint, getSkillLevel, getAvailableSkillPoints, getSkillXp, getSkillLevelFromXp } = useGame()
  const availablePoints = getAvailableSkillPoints()

  const canLevelUp = (skill: Skill, currentLevel: number) => {
    if (availablePoints <= 0) return false
    if (currentLevel >= skill.maxLevel) return false
    return true
  }

  // XP thresholds for each level (0-10)
  const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250]

  const getXpProgress = (skillId: string) => {
    const xp = getSkillXp(skillId)
    const level = getSkillLevelFromXp(xp)
    const currentThreshold = XP_THRESHOLDS[level] || 0
    const nextThreshold = XP_THRESHOLDS[level + 1] || XP_THRESHOLDS[10]
    const progress = level >= 10 ? 100 : Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    return { xp, level, progress }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-slate-100">Skill Tree</h1>
        <p className="text-slate-400">Spend skill points to unlock abilities and enhance your powers</p>
      </div>

      {/* Skill Points Available */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8 text-center">
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
          <div key={tree.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">{tree.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">{tree.name}</h2>
                <p className="text-sm text-slate-400">{tree.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tree.skills.map(skill => {
                const currentLevel = getSkillLevel(skill.id)
                const { xp, level } = getXpProgress(skill.id)
                const isMaxed = level >= skill.maxLevel
                const canUpgrade = canLevelUp(skill, currentLevel)
                const xpProgress = isMaxed ? 100 : Math.round(((xp - XP_THRESHOLDS[level]) / (XP_THRESHOLDS[level + 1] - XP_THRESHOLDS[level])) * 100)

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

                          {/* XP Progress Bar */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500">XP Progress</span>
                              <span className="text-amber-400 font-medium">{xp} XP</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isMaxed ? 'bg-amber-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(100, xpProgress)}%` }}
                              />
                            </div>
                          </div>

                          {/* Level indicator */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-slate-500">LVL</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: skill.maxLevel }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 rounded-sm ${
                                    i < level
                                      ? 'bg-amber-500'
                                      : 'bg-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-amber-400 font-medium">
                              {level}/{skill.maxLevel}
                            </span>
                          </div>

                          {/* XP invested */}
                          {level > 0 && (
                            <p className="text-xs text-slate-500">
                              XP earned: {xp} | Level {level}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Upgrade button */}
                      <div>
                        {isMaxed ? (
                          <div className="text-amber-400 text-sm font-bold px-3 py-1">
                            MAX
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

      {/* Technology XP Section */}
      <div className="mt-8 bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-xl font-bold text-slate-100 mb-4">Technology Mastery</h3>
        <p className="text-sm text-slate-400 mb-4">
          Earn XP by completing quests in each technology. Higher XP unlocks higher skill levels.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(game.skillXp || {}).map(([techId, xp]) => {
            const typedXp = xp as number
            const level = getSkillLevelFromXp(typedXp)
            const techName = techId.charAt(0).toUpperCase() + techId.slice(1)
            return (
              <div key={techId} className="bg-slate-700/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-200">{techName}</span>
                  <span className="text-xs text-amber-400">Lv {level}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${Math.min(100, (typedXp / 1000) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{typedXp} XP</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="font-bold text-slate-100 mb-2">Tips</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• You earn 1 skill point for each level you gain</li>
          <li>• Each skill can be leveled up to its max level</li>
          <li>• Higher levels provide greater bonuses in related quests</li>
          <li>• Balance your skills across different trees for versatility</li>
          <li>• Technology XP is earned by completing quests in each technology</li>
        </ul>
      </div>
    </div>
  )
}
