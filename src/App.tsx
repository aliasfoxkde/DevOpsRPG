import { useState, useEffect, lazy, Suspense } from 'react'
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
import { BackToTop } from './components/ui/BackToTop'
import { OfflineIndicator, InstallPrompt } from './components/ui/OfflineIndicator'
import { useKeyboardShortcuts } from './hooks'
import Layout from './components/layout/Layout'
import OnboardingWizard from './components/ui/OnboardingWizard'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const QuestJournalPage = lazy(() => import('./pages/QuestJournalPage'))
const BattleArenaPage = lazy(() => import('./pages/BattleArenaPage'))
const CharacterSheetPage = lazy(() => import('./pages/CharacterSheetPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const RewardsPage = lazy(() => import('./pages/RewardsPage'))
const SideQuestsPage = lazy(() => import('./pages/SideQuestsPage'))
const ChallengesPage = lazy(() => import('./pages/ChallengesPage'))
const SkillsPage = lazy(() => import('./pages/SkillsPage'))
const WorldMapPage = lazy(() => import('./pages/WorldMapPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const BadgesPage = lazy(() => import('./pages/BadgesPage'))
const MilestonesPage = lazy(() => import('./pages/MilestonesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const GameLibraryPage = lazy(() => import('./pages/GameLibraryPage'))
const StorePage = lazy(() => import('./pages/StorePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-6 animate-bounce">⚔️</div>
        <div className="space-y-2">
          <div className="h-4 w-48 mx-auto bg-slate-700/50 rounded animate-pulse" />
          <div className="h-4 w-32 mx-auto bg-slate-700/50 rounded animate-pulse" />
        </div>
        <div className="mt-6 text-amber-400 font-bold">Loading your adventure...</div>
      </div>
    </div>
  )
}

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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="about" element={<AboutPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="games" element={<GameLibraryPage />} />
            <Route path="store" element={<StorePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
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
      <BackToTop />
      <OfflineIndicator />
      <InstallPrompt />
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
