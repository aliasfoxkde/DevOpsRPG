import { useState, useCallback, useEffect, useRef } from 'react'

interface VoiceSettings {
  enabled: boolean
  volume: number // 0-1
  rate: number // 0.1-10
  pitch: number // 0.1-2
  voiceURI: string | null
}

const STORAGE_KEY = 'devopsquest_voice_settings'

/** Whether the Web Speech API is present in the current runtime. Evaluated per
 * hook call so both the voices effect and the exported flag agree, and so a
 * browser without support skips the API entirely instead of throwing on
 * mount. */
function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: false,
  volume: 1,
  rate: 1,
  pitch: 1,
  voiceURI: null,
}

function isVoiceSettings(value: unknown): value is VoiceSettings {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.enabled === 'boolean' &&
    typeof candidate.volume === 'number' &&
    typeof candidate.rate === 'number' &&
    typeof candidate.pitch === 'number' &&
    (typeof candidate.voiceURI === 'string' || candidate.voiceURI === null)
  )
}

function parseStoredSettings(stored: string): VoiceSettings {
  try {
    const parsed: unknown = JSON.parse(stored)
    if (isVoiceSettings(parsed)) return parsed
  } catch {
    // Corrupt payload falls through to the defaults below.
  }
  return DEFAULT_SETTINGS
}

export function useVoiceNarration() {
  const isSupported = isSpeechSupported()
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return parseStoredSettings(stored)
      }
    }
    return DEFAULT_SETTINGS
  })
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load available voices
  useEffect(() => {
    if (!isSupported) return undefined
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      // Set default English voice if available
      if (!settings.voiceURI) {
        const englishVoice = availableVoices.find((v) => v.lang.startsWith('en'))
        if (englishVoice) {
          setSettings((prev) => ({ ...prev, voiceURI: englishVoice.voiceURI }))
        }
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [isSupported, settings.voiceURI])

  // Save settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const speak = useCallback(
    (text: string, priority: 'high' | 'normal' = 'normal') => {
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
        const voice = voices.find((v) => v.voiceURI === settings.voiceURI)
        if (voice) {
          utterance.voice = voice
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [settings, voices],
  )

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const toggleEnabled = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
  }, [])

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  return {
    settings,
    voices,
    isSpeaking,
    speak,
    stop,
    toggleEnabled,
    updateSettings,
    isSupported,
  }
}
