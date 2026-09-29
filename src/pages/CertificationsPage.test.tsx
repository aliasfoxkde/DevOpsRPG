import { describe, it, expect, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CertificationsPage from './CertificationsPage'
import { CERTIFICATIONS, DIFFICULTY_LABELS } from '@/data/certifications'
import { CLASS_BONUSES } from '@/contexts/game/bonusEngine'
import { allQuests } from '@/data/quests'
import { closestContainer, renderPage, renderSeededPage, seedDefaultGame } from './test-utils'
import { STORAGE_KEYS } from '@/utils/gameUtils'
import type { GameState } from '@/contexts/GameContext'

/** A quest-completion record shaped like the provider's own `TopicProgress`. */
function completedQuest(questId: string, index: number): GameState['completedQuests'][number] {
  return {
    topicId: `topic-${index}`,
    technologyId: 'terraform',
    questId,
    completed: true,
    xpEarned: 10,
    completedAt: new Date().toISOString(),
  }
}

/** Seeds the default save with `overrides` applied on top of it. */
function seedWith(overrides: Partial<GameState>): void {
  const base = seedDefaultGame()
  localStorage.setItem(STORAGE_KEYS.GAME, JSON.stringify({ ...base, ...overrides }))
}

describe('CertificationsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the page heading and tagline', () => {
    renderSeededPage(<CertificationsPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Certifications/ })).toBeInTheDocument()
    expect(
      screen.getByText('Earn certifications as proof of your DevOps expertise!'),
    ).toBeInTheDocument()
  })

  it('renders every certification from the static data', () => {
    renderSeededPage(<CertificationsPage />)
    for (const cert of CERTIFICATIONS) {
      expect(screen.getByText(cert.fullName)).toBeInTheDocument()
    }
  })

  it('groups certifications under difficulty headings', () => {
    renderSeededPage(<CertificationsPage />)
    const labels = Object.values(DIFFICULTY_LABELS)
    const renderedHeadings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)

    for (const label of labels) {
      expect(renderedHeadings.some((text) => text.includes(label))).toBe(true)
    }
  })

  it('shows a progress fraction for each difficulty group', () => {
    renderSeededPage(<CertificationsPage />)
    // Fresh account: nothing earned, so every group reads "0/N"
    const fractions = screen.getAllByText(/^0\/\d+$/)
    expect(fractions.length).toBeGreaterThan(0)
  })

  it('reports a locked state for a brand new player', () => {
    renderSeededPage(<CertificationsPage />)
    // Stats bar labels
    expect(screen.getByText('Earned')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })

  it('breaks down every unmet requirement of a locked certification', () => {
    renderSeededPage(<CertificationsPage />)

    const cert = CERTIFICATIONS.find((entry) => entry.id === 'aws_cloud_practitioner')
    if (!cert) throw new Error('aws_cloud_practitioner missing from CERTIFICATIONS')
    const card = closestContainer(screen.getByText(cert.fullName), 'div.rounded-lg')

    expect(within(card).getByText('Complete requirements to unlock')).toBeInTheDocument()
    expect(within(card).getByText('Lv 5 ✗')).toBeInTheDocument()
    expect(within(card).getByText('0/10 ✗')).toBeInTheDocument()
    expect(within(card).getByText('aws:')).toBeInTheDocument()
    const awsTotal = allQuests.filter((quest) => quest.technologyId === 'aws').length
    expect(within(card).getByText(`0/${awsTotal} ✗`)).toBeInTheDocument()
    expect(within(card).getByText(`+${cert.xpReward} XP`)).toBeInTheDocument()
    expect(within(card).getByText(`+${cert.goldReward} Gold`)).toBeInTheDocument()
    expect(within(card).queryByText('⭐')).not.toBeInTheDocument()

    // Nothing is earned yet, so the whole board counts as locked
    expect(screen.getByText('Locked').previousElementSibling).toHaveTextContent(
      String(CERTIFICATIONS.length),
    )
    expect(screen.getByText('Earned').previousElementSibling).toHaveTextContent('0')
    expect(screen.getByText('Available').previousElementSibling).toHaveTextContent('0')
  })

  it('offers a certification whose level, quest and technology gates are all cleared', () => {
    const cert = CERTIFICATIONS.find((entry) => entry.id === 'terraform_associate')
    if (!cert) throw new Error('terraform_associate missing from CERTIFICATIONS')

    // Four real Terraform quests clear the three-quest technology gate and
    // four synthetic records top the log up to the eight-quest requirement.
    const terraformQuests = allQuests
      .filter((quest) => quest.technologyId === 'terraform')
      .map((quest) => quest.id)
    expect(terraformQuests.length).toBeGreaterThanOrEqual(3)

    const filler = Array.from({ length: cert.requiredQuests - terraformQuests.length }, (_, i) =>
      completedQuest(`side-quest-${i}`, i),
    )
    const base = seedDefaultGame()
    seedWith({
      character: { ...base.character, level: cert.level },
      completedQuests: [
        ...terraformQuests.map((questId, index) => completedQuest(questId, index)),
        ...filler,
      ],
    })
    renderPage(<CertificationsPage />)

    const card = closestContainer(screen.getByText(cert.fullName), 'div.rounded-lg')
    expect(within(card).getByRole('button', { name: /Claim Certification/ })).toBeInTheDocument()
    expect(within(card).getByText('⭐')).toBeInTheDocument()
    expect(within(card).getByText(`Lv ${cert.level} ✓`)).toBeInTheDocument()
    expect(
      within(card).getByText(`${cert.requiredQuests}/${cert.requiredQuests} ✓`),
    ).toBeInTheDocument()
    expect(within(card).getByText('terraform:')).toBeInTheDocument()
    expect(within(card).getByText(/^4\/4 ✓$/)).toBeInTheDocument()

    // The stats bar moves the certification from locked to available
    expect(screen.getByText('Available').previousElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Earned').previousElementSibling).toHaveTextContent('0')
  })

  it('pays out the advertised rewards when the player claims an available certification', async () => {
    const user = userEvent.setup()
    const cert = CERTIFICATIONS.find((entry) => entry.id === 'terraform_associate')
    if (!cert) throw new Error('terraform_associate missing from CERTIFICATIONS')

    const terraformQuests = allQuests
      .filter((quest) => quest.technologyId === 'terraform')
      .map((quest) => quest.id)
    const filler = Array.from({ length: cert.requiredQuests - terraformQuests.length }, (_, i) =>
      completedQuest(`side-quest-${i}`, i),
    )
    const base = seedDefaultGame()
    seedWith({
      character: { ...base.character, level: cert.level },
      completedQuests: [
        ...terraformQuests.map((questId, index) => completedQuest(questId, index)),
        ...filler,
      ],
    })
    renderPage(<CertificationsPage />)

    const card = closestContainer(screen.getByText(cert.fullName), 'div.rounded-lg')
    await user.click(within(card).getByRole('button', { name: /Claim Certification/ }))

    // Rewards are announced (the default DevOps Sage class adds +10% XP) and
    // the card flips to the earned state
    const classBonus = CLASS_BONUSES[base.character.class].bonus
    const expectedXp = Math.floor(cert.xpReward * (1 + classBonus))
    expect(
      await screen.findByText(
        new RegExp(`${cert.fullName} earned: \\+${expectedXp} XP, \\+${cert.goldReward} gold`),
      ),
    ).toBeInTheDocument()
    expect(within(card).getByText('✓ Certification Earned!')).toBeInTheDocument()
    expect(within(card).getByText('✅')).toBeInTheDocument()
    expect(
      within(card).queryByRole('button', { name: /Claim Certification/ }),
    ).not.toBeInTheDocument()

    // The stats bar moves the certification from available to earned
    expect(screen.getByText('Earned').previousElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Available').previousElementSibling).toHaveTextContent('0')
  })

  it('marks a certification earned once it is in the claimed list', () => {
    const cert = CERTIFICATIONS.find((entry) => entry.id === 'devops_master')
    if (!cert) throw new Error('devops_master missing from CERTIFICATIONS')

    const base = seedDefaultGame()
    localStorage.setItem(
      STORAGE_KEYS.GAME,
      JSON.stringify({
        ...base,
        claimedCertifications: [cert.id],
      }),
    )
    renderPage(<CertificationsPage />)

    const card = closestContainer(screen.getByText(cert.fullName), 'div.rounded-lg')
    expect(within(card).getByText('✓ Certification Earned!')).toBeInTheDocument()
    expect(within(card).getByText('✅')).toBeInTheDocument()
    // A brand new player otherwise misses every requirement
    expect(within(card).getByText('Lv 15 ✗')).toBeInTheDocument()
    expect(within(card).getByText('0/20 ✗')).toBeInTheDocument()

    expect(screen.getByText('Earned').previousElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Professional').closest('h2')?.textContent ?? '').toMatch(
      new RegExp(`1/${CERTIFICATIONS.filter((c) => c.difficulty === 'professional').length}`),
    )
  })
})
