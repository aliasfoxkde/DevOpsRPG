import { useState, useCallback, useEffect, useRef } from 'react'

interface VoiceSettings {
  enabled: boolean
  volume: number // 0-1
  rate: number // 0.1-10
  pitch: number // 0.1-2
  voiceURI: string | null
}

const STORAGE_KEY = 'devopsquest_voice_settings'

export function useVoiceNarration() {
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return {
            enabled: false,
            volume: 1,
            rate: 1,
            pitch: 1,
            voiceURI: null,
          }
        }
      }
    }
    return {
      enabled: false,
      volume: 1,
      rate: 1,
      pitch: 1,
      voiceURI: null,
    }
  })
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      // Set default English voice if available
      if (!settings.voiceURI) {
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en'))
        if (englishVoice) {
          setSettings(prev => ({ ...prev, voiceURI: englishVoice.voiceURI }))
        }
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  // Save settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const speak = useCallback((text: string, priority: 'high' | 'normal' = 'normal') => {
    if (!settings.enabled || !text) return

    // Cancel any ongoing speech if high priority
    if (priority === 'high') {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.volume = settings.volume
    utterance.rate = settings.rate
    utterance.pitch = settings.pitch

    if (settings.voiceURI) {
      const voice = voices.find(v => v.voiceURI === settings.voiceURI)
      if (voice) {
        utterance.voice = voice
      }
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [settings, voices])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const toggleEnabled = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }))
  }, [])

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  return {
    settings,
    voices,
    isSpeaking,
    speak,
    stop,
    toggleEnabled,
    updateSettings,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  }
}

// Pre-defined narration texts
export const NARRATIONS = {
  questStart: (questTitle: string) => `Starting quest: ${questTitle}. Answer the questions correctly to earn XP and gold!`,
  correctAnswer: () => `Correct!`,
  wrongAnswer: () => `That's not quite right. Try again!`,
  questComplete: (xp: number, gold: number) => `Quest complete! You earned ${xp} XP and ${gold} gold!`,
  levelUp: (newLevel: number) => `Congratulations! You reached level ${newLevel}!`,
  newBadge: (badgeName: string) => `New badge unlocked: ${badgeName}!`,
  streakMilestone: (days: number) => `${days} day streak! Keep up the great work!`,
  realmComplete: (realmName: string) => `You conquered the ${realmName} realm!`,
  dailyReward: (day: number) => `Day ${day} reward claimed!`,
  battleStart: () => `Battle begins!`,
  gameOver: () => `Game over. Try again to improve your score!`,
}
