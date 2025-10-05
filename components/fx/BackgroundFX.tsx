/**
 * BackgroundFX Component - Decorative Background Layer
 *
 * Design Principles:
 * - Lightweight, performance-first (no WebGL, no heavy libs)
 * - Multiple modes: image, mesh gradient, noise
 * - Controlled intensity for subtle effects
 * - Absolutely positioned, pointer-events-none (non-interactive)
 * - Stateless, no data fetching
 *
 * @component
 */

'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface BackgroundFXProps {
  mode?: 'image' | 'mesh' | 'noise'
  imageSrc?: string
  intensity?: number // 0.15 to 0.35, controls animation strength
  className?: string
  safeForPerf?: boolean // Always true by default
}

export function BackgroundFX({
  mode = 'mesh',
  imageSrc = '/backgrounds/hero.svg',
  intensity = 0.25,
  className,
  safeForPerf = true,
}: BackgroundFXProps) {
  // Animation variants based on intensity
  const animationDuration = safeForPerf ? 20 : 15 // slower = safer
  const scale = 1 + intensity * 0.1 // subtle scale
  const translateY = intensity * 20 // subtle movement

  return (
    <div
      className={cn(
        'absolute inset-0 w-full h-full pointer-events-none overflow-hidden',
        className
      )}
    >
      {/* Image Mode */}
      {mode === 'image' && imageSrc && (
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{
            scale: [1, scale, 1],
            y: [0, translateY, 0],
          }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover opacity-50 blur-sm"
            quality={60}
          />
        </motion.div>
      )}

      {/* Mesh Gradient Mode - Pure CSS */}
      {mode === 'mesh' && (
        <motion.div
          className="absolute inset-0 w-full h-full mesh-gradient"
          animate={{
            x: [0, translateY, 0],
            y: [0, -translateY, 0],
            scale: [1, scale, 1],
          }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(94, 106, 210, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)
            `,
          }}
        />
      )}

      {/* Noise Mode - Subtle texture */}
      {mode === 'noise' && (
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: animationDuration / 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />
      )}
    </div>
  )
}
