import { useState } from 'react'
import { useGame } from '../contexts/GameContext'
import {
  MOCK_GUILD,
  MOCK_GUILD_MEMBERS,
  MOCK_GUILD_CHALLENGES,
  FEATURED_GUILDS,
  getGuildRankInfo,
  formatDaysRemaining,
  type GuildMember,
  type GuildChallenge,
  type Guild,
} from '../data/guilds'

type Tab = 'overview' | 'members' | 'challenges' | 'discover'

export default function GuildPage() {
  const { game } = useGame()
  const { character } = game

  // State
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [joinedGuild] = useState<Guild | null>(MOCK_GUILD)
  const [members] = useState<GuildMember[]>(MOCK_GUILD_MEMBERS)
  const [challenges] = useState<GuildChallenge[]>(MOCK_GUILD_CHALLENGES)
  const [showJoinConfirm, setShowJoinConfirm] = useState<string | null>(null)

  // Player's guild role (would come from game state in real implementation)
  const playerRole: GuildMember['role'] = 'member'
  const playerRank = getGuildRankInfo(playerRole)

  // Check if player meets guild requirements
  const canJoinGuild = (guild: Guild): boolean => {
    return character.level >= guild.requirements.minLevel &&
           game.completedQuests.length >= guild.requirements.minQuests
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🏰 Guild Hall</h1>
        <p className="text-slate-400">Team up with other adventurers!</p>
      </div>

      {/* Current Guild Banner */}
      {joinedGuild ? (
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl border border-purple-500/30 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{joinedGuild.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{joinedGuild.name}</h2>
                <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded">
                  Rank #{joinedGuild.rank}
                </span>
              </div>
              <p className="text-slate-300">{joinedGuild.description}</p>
              <div className="flex gap-4 mt-2 text-sm text-slate-400">
                <span>Level {joinedGuild.level}</span>
                <span>•</span>
                <span>{joinedGuild.memberCount}/{joinedGuild.maxMembers} members</span>
                <span>•</span>
                <span>🏆 {joinedGuild.totalQuests} total quests</span>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{playerRank.icon}</span>
                <span className="font-bold" style={{ color: playerRank.color }}>{playerRank.name}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Your Role</p>
            </div>
          </div>

          {/* Guild XP Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Guild XP</span>
              <span className="text-purple-400">{joinedGuild.xp} / {joinedGuild.xpToNextLevel}</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all"
                style={{ width: `${(joinedGuild.xp / joinedGuild.xpToNextLevel) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🏰</div>
          <h2 className="text-2xl font-bold mb-2">Join a Guild!</h2>
          <p className="text-slate-400 mb-4">
            Team up with other players to complete group challenges and earn guild rewards.
          </p>
          <p className="text-sm text-slate-500">
            Your Level: {character.level} | Quests: {game.completedQuests.length}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'overview' as Tab, label: '📊 Overview' },
          { id: 'members' as Tab, label: '👥 Members' },
          { id: 'challenges' as Tab, label: '⚔️ Challenges' },
          { id: 'discover' as Tab, label: '🔍 Discover' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && joinedGuild && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Guild Stats */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4">📊 Guild Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Total XP</span>
                <span className="font-bold text-purple-400">{joinedGuild.xp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Total Quests</span>
                <span className="font-bold text-green-400">{joinedGuild.totalQuests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">This Week</span>
                <span className="font-bold text-amber-400">{joinedGuild.weeklyQuests} quests</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Guild Rank</span>
                <span className="font-bold text-yellow-400">#{joinedGuild.rank}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Member Count</span>
                <span className="font-bold text-blue-400">{joinedGuild.memberCount}/{joinedGuild.maxMembers}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4">🏆 Achievements</h3>
            <div className="space-y-2">
              {['🏅 Guild Founded', '🔥 30-Day Streak', '⚔️ 1000 Quests Completed', '👑 Weekly Champion'].map((achievement, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-2xl">{achievement.includes('Guild') ? '🏅' : achievement.includes('30') ? '🔥' : achievement.includes('1000') ? '⚔️' : '👑'}</span>
                  <span className="text-slate-300">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-slate-400">
            <div className="col-span-4">Member</div>
            <div className="col-span-2 text-center">Role</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-center">Weekly XP</div>
            <div className="col-span-2 text-right">Quests</div>
          </div>

          {members.map(member => {
            const rank = getGuildRankInfo(member.role)
            return (
              <div
                key={member.id}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
              >
                {/* Avatar & Name */}
                <div className="flex items-center gap-3 col-span-4">
                  <div className="text-3xl">{member.avatar}</div>
                  <div>
                    <div className="font-medium text-white">{member.name}</div>
                    <div className="text-xs text-slate-400">{member.title}</div>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2 text-center">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `${rank.color}30`, color: rank.color }}
                  >
                    {rank.icon} {rank.name}
                  </span>
                </div>

                {/* Level */}
                <div className="col-span-2 text-center">
                  <span className="text-lg font-bold text-amber-400">Lv.{member.level}</span>
                </div>

                {/* Weekly XP */}
                <div className="col-span-2 text-center">
                  <span className="text-green-400">{member.weeklyXP.toLocaleString()}</span>
                </div>

                {/* Quests */}
                <div className="col-span-2 text-right">
                  <span className="text-slate-300">{member.questsThisWeek} this week</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">⚔️ Active Challenges</h3>
            <span className="text-sm text-slate-400">Complete challenges to earn guild XP & Gold!</span>
          </div>

          {challenges.map(challenge => {
            const progress = Math.min(100, (challenge.progress / challenge.target) * 100)
            const isComplete = challenge.progress >= challenge.target
            const typeIcons: Record<string, string> = {
              quest_marathon: '🏃',
              quiz_master: '🧠',
              streak_champion: '🔥',
              xp_grind: '⚡',
              tech_specific: '💻',
            }

            return (
              <div
                key={challenge.id}
                className={`rounded-xl border-2 p-4 ${
                  isComplete
                    ? 'border-green-500/50 bg-green-900/20'
                    : 'border-slate-700 bg-card'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{typeIcons[challenge.type]}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white">{challenge.title}</h4>
                      {isComplete && (
                        <span className="px-3 py-1 bg-green-600/30 text-green-400 text-sm rounded-full">
                          ✓ Complete!
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{challenge.description}</p>

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className={isComplete ? 'text-green-400' : 'text-amber-400'}>
                          {challenge.progress}/{challenge.target}
                        </span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-amber-600 to-amber-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        ⏰ {formatDaysRemaining(challenge.expiresAt)}
                      </span>
                      <div className="flex gap-4">
                        <span className="text-amber-400">+{challenge.rewardXP} XP</span>
                        <span className="text-yellow-400">+{challenge.rewardGold} Gold</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div>
          <h3 className="text-lg font-bold mb-4">🔍 Featured Guilds</h3>
          <p className="text-slate-400 mb-6">
            Join a guild to team up with other players and earn guild rewards!
          </p>

          <div className="space-y-4">
            {FEATURED_GUILDS.map(guild => {
              const meetsRequirements = canJoinGuild(guild)

              return (
                <div
                  key={guild.id}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{guild.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white">{guild.name}</h4>
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">
                          Rank #{guild.rank}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{guild.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>Level {guild.level}</span>
                        <span>•</span>
                        <span>{guild.memberCount}/{guild.maxMembers} members</span>
                        <span>•</span>
                        <span>Requires: Lv.{guild.requirements.minLevel}, {guild.requirements.minQuests} quests</span>
                      </div>
                    </div>
                    <div>
                      {joinedGuild ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-slate-700 text-slate-500 rounded-lg cursor-not-allowed"
                        >
                          Already in Guild
                        </button>
                      ) : meetsRequirements ? (
                        <button
                          onClick={() => setShowJoinConfirm(guild.id)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                        >
                          Join Guild
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-slate-700 text-slate-500 rounded-lg cursor-not-allowed"
                          title={`Requires Level ${guild.requirements.minLevel} and ${guild.requirements.minQuests} quests`}
                        >
                          Requirements Not Met
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Join Confirmation */}
                  {showJoinConfirm === guild.id && (
                    <div className="mt-4 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                      <p className="text-center mb-4">
                        Are you sure you want to join <strong>{guild.name}</strong>?
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setShowJoinConfirm(null)}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // Would handle join in real implementation
                            setShowJoinConfirm(null)
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                        >
                          Confirm Join
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!joinedGuild && activeTab === 'overview' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏰</div>
          <h2 className="text-xl font-bold mb-2">You're not in a guild yet!</h2>
          <p className="text-slate-400 mb-6">
            Visit the Discover tab to find and join a guild.
          </p>
          <button
            onClick={() => setActiveTab('discover')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
          >
            Find a Guild
          </button>
        </div>
      )}
    </div>
  )
}
