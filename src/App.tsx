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
import { useKeyboardShortcuts } from './hooks'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import QuestJournalPage from './pages/QuestJournalPage'
import BattleArenaPage from './pages/BattleArenaPage'
import CharacterSheetPage from './pages/CharacterSheetPage'
import ProfilePage from './pages/ProfilePage'
import RewardsPage from './pages/RewardsPage'
import SideQuestsPage from './pages/SideQuestsPage'
import SkillsPage from './pages/SkillsPage'
import WorldMapPage from './pages/WorldMapPage'
import LeaderboardPage from './pages/LeaderboardPage'

// Toast types
interface Toast {
  id: string
  message: string
  type: 'milestone' | 'encouragement' | 'achievement' | 'levelup'
  icon?: string
  xpGained?: number
}

function AppContent() {
  const { game, dismissRealmCompletion } = useGame()
  const [toasts, setToasts] = useState<Toast[]>([])
  useKeyboardShortcuts()

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const addToast = (toast: Toast) => {
    setToasts(prev => [...prev, toast])
  }

  // Expose toast function globally for other components
  useEffect(() => {
    (window as unknown as { addToast?: (t: Toast) => void }).addToast = addToast
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
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
          <Route path="skills" element={<SkillsPage />} />
          <Route path="worldmap" element={<WorldMapPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
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
