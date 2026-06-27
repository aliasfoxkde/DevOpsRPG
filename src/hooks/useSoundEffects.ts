import { useCallback, useState, useEffect } from 'react'

// Sound effect types
export type SoundType =
  | 'correct'
  | 'incorrect'
  | 'levelUp'
  | 'questComplete'
  | 'badge'
  | 'milestone'
  | 'click'
  | 'success'
  | 'achievement'
  | 'coin'

interface UseSoundEffectsReturn {
  playSound: (sound: SoundType) => void
  isMuted: boolean
  toggleMute: () => void
  setMuted: (muted: boolean) => void
  initAudio: () => void
}

// Simple audio context for generating sounds
class SoundGenerator {
  private audioContext: AudioContext | null = null
  private needsInit = true

  private getContext(): AudioContext | null {
    if (!this.audioContext) {
      // AudioContext requires user gesture to create - return null if not initialized
      if (this.needsInit) return null
      try {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      } catch {
        return null
      }
    }
    return this.audioContext
  }

  // Call this on user interaction to initialize audio context
  initialize(): boolean {
    if (this.needsInit) {
      try {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        // Resume if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume()
        }
        this.needsInit = false
        return true
      } catch {
        return false
      }
    }
    return true
  }

  play(type: SoundType) {
    try {
      const ctx = this.getContext()
      if (!ctx) return // Audio not initialized (needs user gesture)
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      const now = ctx.currentTime

      switch (type) {
        case 'correct':
          oscillator.frequency.setValueAtTime(523.25, now) // C5
          oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
          gainNode.gain.setValueAtTime(0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
          oscillator.start(now)
          oscillator.stop(now + 0.3)
          break

        case 'incorrect':
          oscillator.frequency.setValueAtTime(200, now)
          oscillator.frequency.setValueAtTime(150, now + 0.1)
          gainNode.gain.setValueAtTime(0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
          oscillator.start(now)
          oscillator.stop(now + 0.3)
          break

        case 'levelUp':
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(523.25, now) // C5
          oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
          oscillator.frequency.setValueAtTime(783.99, now + 0.2) // G5
          oscillator.frequency.setValueAtTime(1046.50, now + 0.3) // C6
          gainNode.gain.setValueAtTime(0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
          oscillator.start(now)
          oscillator.stop(now + 0.5)
          break

        case 'questComplete':
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(392, now) // G4
          oscillator.frequency.setValueAtTime(523.25, now + 0.15) // C5
          oscillator.frequency.setValueAtTime(659.25, now + 0.3) // E5
          gainNode.gain.setValueAtTime(0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
          oscillator.start(now)
          oscillator.stop(now + 0.5)
          break

        case 'badge':
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(800, now)
          oscillator.frequency.setValueAtTime(1000, now + 0.05)
          oscillator.frequency.setValueAtTime(1200, now + 0.1)
          gainNode.gain.setValueAtTime(0.2, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
          oscillator.start(now)
          oscillator.stop(now + 0.2)
          break

        case 'milestone':
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(523.25, now) // C5
          oscillator.frequency.setValueAtTime(659.25, now + 0.1)
          oscillator.frequency.setValueAtTime(783.99, now + 0.2)
          oscillator.frequency.setValueAtTime(1046.50, now + 0.3)
          oscillator.frequency.setValueAtTime(783.99, now + 0.4)
          oscillator.frequency.setValueAtTime(1046.50, now + 0.5)
          gainNode.gain.setValueAtTime(0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7)
          oscillator.start(now)
          oscillator.stop(now + 0.7)
          break

        case 'click':
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(600, now)
          gainNode.gain.setValueAtTime(0.1, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
          oscillator.start(now)
          oscillator.stop(now + 0.05)
          break

        case 'success':
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(523.25, now) // C5
          oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
          oscillator.frequency.setValueAtTime(783.99, now + 0.2) // G5
          gainNode.gain.setValueAtTime(0.3, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
          oscillator.start(now)
          oscillator.stop(now + 0.4)
          break

        case 'achievement':
          oscillator.type = 'triangle'
          oscillator.frequency.setValueAtTime(587.33, now) // D5
          oscillator.frequency.setValueAtTime(739.99, now + 0.1) // F#5
          oscillator.frequency.setValueAtTime(880, now + 0.2) // A5
          oscillator.frequency.setValueAtTime(987.77, now + 0.3) // B5
          gainNode.gain.setValueAtTime(0.25, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
          oscillator.start(now)
          oscillator.stop(now + 0.5)
          break

        case 'coin':
          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(988, now) // B5
          oscillator.frequency.setValueAtTime(1319, now + 0.05) // E6
          gainNode.gain.setValueAtTime(0.2, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
          oscillator.start(now)
          oscillator.stop(now + 0.15)
          break

        default:
          oscillator.frequency.setValueAtTime(440, now)
          gainNode.gain.setValueAtTime(0.1, now)
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
          oscillator.start(now)
          oscillator.stop(now + 0.1)
      }
    } catch {
      // Silently fail if audio not supported
    }
  }
}

// Singleton instance
const soundGenerator = new SoundGenerator()

export function useSoundEffects(): UseSoundEffectsReturn {
  const [isMuted, setIsMuted] = useState(() => {
    // Check localStorage for preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('soundEnabled')
      if (stored !== null) {
        return stored === 'false'
      }
    }
    return true // Default to muted (user must opt-in)
  })

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('soundEnabled', String(!isMuted))
  }, [isMuted])

  const playSound = useCallback((sound: SoundType) => {
    if (!isMuted) {
      soundGenerator.play(sound)
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  // Initialize audio on user interaction (required by browsers)
  const initAudio = useCallback(() => {
    soundGenerator.initialize()
  }, [])

  return {
    playSound,
    isMuted,
    toggleMute,
    setMuted: setIsMuted,
    initAudio
  }
}

// Global sound instance for use outside of React components
export const globalSound = {
  play: (type: SoundType) => {
    try {
      const stored = localStorage.getItem('soundEnabled')
      if (stored === 'false') return
      soundGenerator.initialize() // Ensure audio context is ready
      soundGenerator.play(type)
    } catch {
      // Silently fail
    }
  },
  init: () => soundGenerator.initialize()
}
