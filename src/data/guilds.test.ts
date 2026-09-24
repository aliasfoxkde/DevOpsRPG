// Behavior tests for the guild social layer: rank permissions, the days-remaining
// formatter the challenge cards render, and cross-references inside the mock data.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  MOCK_GUILD,
  MOCK_GUILD_MEMBERS,
  MOCK_GUILD_CHALLENGES,
  FEATURED_GUILDS,
  getGuildRankInfo,
  formatDaysRemaining,
  type GuildMember,
} from './guilds'

const memberIds = new Set(MOCK_GUILD_MEMBERS.map((member) => member.id))
const challengeIds = new Set(MOCK_GUILD_CHALLENGES.map((challenge) => challenge.id))

describe('guild mock data', () => {
  it('gives every member a unique id and a positive record', () => {
    const ids = MOCK_GUILD_MEMBERS.map((member) => member.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const member of MOCK_GUILD_MEMBERS) {
      expect(member.level, member.id).toBeGreaterThan(0)
      expect(member.weeklyXP, member.id).toBeGreaterThanOrEqual(0)
      expect(member.totalXP, member.id).toBeGreaterThanOrEqual(member.weeklyXP)
      expect(member.questsThisWeek, member.id).toBeGreaterThanOrEqual(0)
      expect(member.streakDays, member.id).toBeGreaterThanOrEqual(0)
      expect(member.contributionPoints, member.id).toBeGreaterThanOrEqual(0)
      expect(member.name.length, member.id).toBeGreaterThan(0)
      expect(member.title.length, member.id).toBeGreaterThan(0)
    }
  })

  it('has exactly one leader, and the guild record points at them', () => {
    const leaders = MOCK_GUILD_MEMBERS.filter((member) => member.role === 'leader')
    expect(leaders.map((leader) => leader.id)).toEqual([MOCK_GUILD.leaderId])
    expect(leaders.map((leader) => leader.name)).toEqual([MOCK_GUILD.leaderName])
  })

  it('advertises more members than the shipped roster shows (documented gap)', () => {
    // The GuildPage header renders "8/20 members" above a roster of six rows.
    // Either the roster is missing two members or the count is stale; fixing it
    // needs a product call, so this pins the current numbers.
    expect(MOCK_GUILD.memberCount).toBe(8)
    expect(MOCK_GUILD_MEMBERS).toHaveLength(6)
    expect(MOCK_GUILD.memberCount).toBeLessThan(MOCK_GUILD.maxMembers)
  })

  it('references only challenges that exist', () => {
    for (const id of MOCK_GUILD.activeChallenges) {
      expect(challengeIds.has(id), `active challenge ${id}`).toBe(true)
    }
    for (const guild of FEATURED_GUILDS) {
      for (const id of guild.activeChallenges) {
        expect(challengeIds.has(id), `${guild.id} challenge ${id}`).toBe(true)
      }
    }
  })

  it('keeps every challenge inside its target with positive rewards', () => {
    const ids = MOCK_GUILD_CHALLENGES.map((challenge) => challenge.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const challenge of MOCK_GUILD_CHALLENGES) {
      expect(challenge.target, challenge.id).toBeGreaterThan(0)
      expect(challenge.progress, challenge.id).toBeGreaterThanOrEqual(0)
      expect(challenge.progress, challenge.id).toBeLessThanOrEqual(challenge.target)
      expect(challenge.rewardXP, challenge.id).toBeGreaterThan(0)
      expect(challenge.rewardGold, challenge.id).toBeGreaterThan(0)
      expect(challenge.participants.length, challenge.id).toBeGreaterThan(0)
      for (const participant of challenge.participants) {
        expect(memberIds.has(participant), `${challenge.id} participant ${participant}`).toBe(true)
      }
    }
  })

  it('keeps challenge deadlines in the future at load time', () => {
    // expiresAt is computed from Date.now() when the module loads.
    for (const challenge of MOCK_GUILD_CHALLENGES) {
      const expiresAt = new Date(challenge.expiresAt).getTime()
      expect(Number.isNaN(expiresAt), challenge.id).toBe(false)
      expect(expiresAt, `${challenge.id} already expired`).toBeGreaterThan(Date.now())
    }
  })

  it('levels every guild past its XP floor and uses unique ids and ranks', () => {
    const guilds = [MOCK_GUILD, ...FEATURED_GUILDS]
    const ids = guilds.map((guild) => guild.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(guilds.map((guild) => guild.rank)).size).toBe(guilds.length)
    for (const guild of guilds) {
      expect(guild.xp, guild.id).toBeGreaterThan(0)
      expect(guild.xpToNextLevel, guild.id).toBeGreaterThan(guild.xp)
      expect(guild.memberCount, guild.id).toBeLessThanOrEqual(guild.maxMembers)
      expect(guild.requirements.minLevel, guild.id).toBeGreaterThan(0)
      expect(guild.requirements.minQuests, guild.id).toBeGreaterThan(0)
    }
  })
})

describe('getGuildRankInfo', () => {
  it('hands the guild master every permission', () => {
    expect(getGuildRankInfo('leader')).toEqual({
      id: 'leader',
      name: 'Guild Master',
      icon: '👑',
      color: '#ffd700',
      permissions: {
        canInvite: true,
        canKick: true,
        canManageChallenges: true,
        canEditGuild: true,
        canPromote: true,
      },
    })
  })

  it('lets officers invite, manage challenges and promote, but not kick or edit', () => {
    expect(getGuildRankInfo('officer').permissions).toEqual({
      canInvite: true,
      canKick: false,
      canManageChallenges: true,
      canEditGuild: false,
      canPromote: true,
    })
  })

  it('gives plain members no permissions at all', () => {
    expect(getGuildRankInfo('member').permissions).toEqual({
      canInvite: false,
      canKick: false,
      canManageChallenges: false,
      canEditGuild: false,
      canPromote: false,
    })
  })

  it('returns the exact rank records the roster renders', () => {
    for (const member of MOCK_GUILD_MEMBERS) {
      expect(getGuildRankInfo(member.role).id).toBe(member.role)
    }
  })

  it('falls back to the lowest rank for a role the table does not know', () => {
    // Role strings come from persisted state, so an unknown future role must
    // degrade to a member rather than crash the page.
    const ROLE_BY_KEY: Record<string, GuildMember['role']> = {
      leader: 'leader',
      officer: 'officer',
      member: 'member',
    }
    expect(getGuildRankInfo(ROLE_BY_KEY['guild_ambassador']).id).toBe('member')
    expect(getGuildRankInfo(ROLE_BY_KEY['guild_ambassador'])).toBe(getGuildRankInfo('member'))
  })
})

describe('formatDaysRemaining', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts whole days until the deadline', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T12:00:00Z'))
    expect(formatDaysRemaining(new Date('2026-09-27T12:00:00Z').toISOString())).toBe('3 days left')
    expect(formatDaysRemaining(new Date('2026-10-04T12:00:00Z').toISOString())).toBe('10 days left')
  })

  it('rounds a partial day up to one day left', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T12:00:00Z'))
    expect(formatDaysRemaining(new Date('2026-09-24T14:00:00Z').toISOString())).toBe('1 day left')
    expect(formatDaysRemaining(new Date('2026-09-24T12:00:01Z').toISOString())).toBe('1 day left')
  })

  it('uses the singular for one day and the plural otherwise', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T00:00:00Z'))
    expect(formatDaysRemaining(new Date('2026-09-25T00:00:00Z').toISOString())).toBe('1 day left')
    expect(formatDaysRemaining(new Date('2026-09-26T00:00:00Z').toISOString())).toBe('2 days left')
  })

  it('reports an expired deadline exactly at or past the wire', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T12:00:00Z'))
    expect(formatDaysRemaining(new Date('2026-09-24T12:00:00Z').toISOString())).toBe('Expired')
    expect(formatDaysRemaining(new Date('2026-09-24T11:59:59Z').toISOString())).toBe('Expired')
    expect(formatDaysRemaining(new Date('2026-09-01T00:00:00Z').toISOString())).toBe('Expired')
  })

  it('agrees with the shipped challenge deadlines', () => {
    // Real clock: the challenge cards on GuildPage must not read "Expired".
    for (const challenge of MOCK_GUILD_CHALLENGES) {
      expect(formatDaysRemaining(challenge.expiresAt)).toMatch(/^\d+ days? left$/)
    }
  })
})
