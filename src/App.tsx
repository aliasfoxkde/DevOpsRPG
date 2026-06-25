import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts'
import { GameProvider, useGame } from './contexts/GameContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HUD } from './components/ui/HUD'
import { VictoryModal } from './components/ui/VictoryModal'
import { RealmCompletionModal } from './components/ui/RealmCompletionModal'
import { ToastManager } from './components/ui/CelebrationToast'
import MentorChat from './components/ui/MentorChat'
import KeyboardShortcutsHelp from './components/ui/KeyboardShortcutsHelp'
import { useKeyboardShortcuts } from './hooks'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import QuestJournalPage from './pages/QuestJournalPage'
import BattleArenaPage from './pages/BattleArenaPage'
import CharacterSheetPage from './pages/CharacterSheetPage'
import ProfilePage from './pages/ProfilePage'
import RewardsPage from './pages/RewardsPage'
import SideQuestsPage from './pages/SideQuestsPage'
import ChallengesPage from './pages/ChallengesPage'
import SkillsPage from './pages/SkillsPage'
import WorldMapPage from './pages/WorldMapPage'
import LeaderboardPage from './pages/LeaderboardPage'
import BadgesPage from './pages/BadgesPage'
import MilestonesPage from './pages/MilestonesPage'
import OnboardingWizard from './components/ui/OnboardingWizard'

// Toast types
interface Toast {
  id: string
  message: string
  type: 'milestone' | 'encouragement' | 'achievement' | 'levelup'
  icon?: string
  xpGained?: number
}

function AppContent() {
  const { game, dismissRealmCompletion, dismissRecentUnlocks } = useGame()
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showOnboarding, setShowOnboarding] = useState(!game.hasSeenOnboarding)
  useKeyboardShortcuts()

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const addToast = (toast: Toast) => {
    setToasts(prev => [...prev, toast])
  }

  // Show toasts for recent badge unlocks
  useEffect(() => {
    game.recentBadgeUnlocks.forEach((badge) => {
      const toast: Toast = {
        id: `badge-${badge.id}-${Date.now()}`,
        message: `🏅 Badge Unlocked: ${badge.name}!`,
        type: 'achievement',
        icon: badge.icon,
      }
      addToast(toast)
    })
    if (game.recentBadgeUnlocks.length > 0) {
      dismissRecentUnlocks()
    }
  }, [game.recentBadgeUnlocks, dismissRecentUnlocks])

  // Show toasts for recent milestone unlocks
  useEffect(() => {
    game.recentMilestoneUnlocks.forEach((milestone) => {
      const toast: Toast = {
        id: `milestone-${milestone.id}-${Date.now()}`,
        message: `🏆 Milestone Reached: ${milestone.title}!`,
        type: 'milestone',
        icon: '🏆',
        xpGained: milestone.xpBonus,
      }
      addToast(toast)
    })
    if (game.recentMilestoneUnlocks.length > 0) {
      dismissRecentUnlocks()
    }
  }, [game.recentMilestoneUnlocks, dismissRecentUnlocks])

  // Expose toast function globally for other components
  useEffect(() => {
    (window as unknown as { addToast?: (t: Toast) => void }).addToast = addToast
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {showOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}
      <HUD />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="quests" element={<QuestJournalPage />} />
          <Route path="quest/:questId" element={<BattleArenaPage />} />
          <Route path="character" element={<CharacterSheetPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="sidequests" element={<SideQuestsPage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="worldmap" element={<WorldMapPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="milestones" element={<MilestonesPage />} />
        </Route>
      </Routes>
      <VictoryModal />
      {game.showRealmCompletion && (
        <RealmCompletionModal
          realmId={game.showRealmCompletion}
          onClose={dismissRealmCompletion}
        />
      )}
      <ToastManager toasts={toasts} onRemove={removeToast} />
      <MentorChat />
      <KeyboardShortcutsHelp />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </GameProvider>
    </ThemeProvider>
  )
}

export default App
