import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts'
import { GameProvider } from './contexts/GameContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HUD } from './components/ui/HUD'
import { VictoryModal } from './components/ui/VictoryModal'
import { useKeyboardShortcuts } from './hooks'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import QuestJournalPage from './pages/QuestJournalPage'
import BattleArenaPage from './pages/BattleArenaPage'
import CharacterSheetPage from './pages/CharacterSheetPage'

function App() {
  useKeyboardShortcuts()

  return (
    <ThemeProvider>
      <GameProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-slate-900 text-white">
            <HUD />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="quests" element={<QuestJournalPage />} />
                <Route path="quest/:questId" element={<BattleArenaPage />} />
                <Route path="character" element={<CharacterSheetPage />} />
              </Route>
            </Routes>
            <VictoryModal />
          </div>
        </ErrorBoundary>
      </GameProvider>
    </ThemeProvider>
  )
}

export default App
