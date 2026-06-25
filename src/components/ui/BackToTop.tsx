import { useState, useEffect } from 'react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full shadow-lg shadow-amber-600/30 transition-all hover:scale-110"
      aria-label="Back to top"
    >
      <span className="text-xl">↑</span>
    </button>
  )
}
