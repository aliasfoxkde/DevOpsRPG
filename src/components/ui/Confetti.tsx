import { useEffect, useRef, useCallback } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  velocityX: number
  velocityY: number
  rotationSpeed: number
  shape: 'square' | 'circle' | 'triangle'
}

const COLORS = [
  '#f59e0b', // amber
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#14b8a6', // teal
]

export function Confetti({ active, duration = 3000 }: { active: boolean; duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ConfettiPiece[]>([])
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const createParticles = useCallback(() => {
    const particles: ConfettiPiece[] = []
    const shapes: ('square' | 'circle' | 'triangle')[] = ['square', 'circle', 'triangle']

    for (let i = 0; i < 150; i++) {
      particles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        velocityX: (Math.random() - 0.5) * 8,
        velocityY: 3 + Math.random() * 5,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    }

    return particles
  }, [])

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: ConfettiPiece) => {
    ctx.save()
    ctx.translate(particle.x, particle.y)
    ctx.rotate((particle.rotation * Math.PI) / 180)
    ctx.scale(particle.scale, particle.scale)
    ctx.fillStyle = particle.color

    const size = 10

    switch (particle.shape) {
      case 'square':
        ctx.fillRect(-size / 2, -size / 2, size, size)
        break
      case 'circle':
        ctx.beginPath()
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(0, -size / 2)
        ctx.lineTo(size / 2, size / 2)
        ctx.lineTo(-size / 2, size / 2)
        ctx.closePath()
        ctx.fill()
        break
    }

    ctx.restore()
  }, [])

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Initialize particles
    particlesRef.current = createParticles()
    startTimeRef.current = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particlesRef.current) {
        // Update physics
        particle.x += particle.velocityX
        particle.y += particle.velocityY
        particle.velocityY += 0.1 // gravity
        particle.rotation += particle.rotationSpeed
        particle.velocityX *= 0.99 // air resistance

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.velocityX *= -0.5
        }

        // Only draw if on screen
        if (particle.y < canvas.height + 20) {
          drawParticle(ctx, particle)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [active, duration, createParticles, drawParticle])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      aria-hidden="true"
    />
  )
}
