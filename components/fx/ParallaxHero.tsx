/**
 * ParallaxHero Component - Linear-inspired Hero with Parallax Effect
 *
 * Design Principles:
 * - Subtle parallax scroll effect using Framer Motion
 * - Soft background image with gradient overlay for readability
 * - Performance-optimized with useScroll and useTransform
 * - No heavy libraries, minimal bundle impact
 *
 * @component
 */

'use client'

import { ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface ParallaxHeroProps {
  children: ReactNode
  image?: string
  intensity?: number // 0.1 to 0.5, controls parallax strength
  height?: string // e.g., "60vh", "70vh", "500px"
  overlay?: boolean // gradient overlay for readability
  className?: string
}

export function ParallaxHero({
  children,
  image = '/backgrounds/hero.svg',
  intensity = 0.22,
  height = '65vh',
  overlay = true,
  className,
}: ParallaxHeroProps) {
  const { scrollY } = useScroll()

  // Transform scroll position to parallax offset
  // Intensity controls how much the background moves
  const yOffset = useTransform(
    scrollY,
    [0, 1000],
    [0, 1000 * intensity]
  )

  return (
    <section
      className={cn('relative overflow-hidden', className)}
      style={{ height }}
    >
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 w-full h-[120%]"
        style={{ y: yOffset }}
      >
        {image && (
          <div className="relative w-full h-full">
            <Image
              src={image}
              alt="Hero background"
              fill
              className="object-cover opacity-60"
              priority
              quality={85}
            />
          </div>
        )}
      </motion.div>

      {/* Gradient Overlay for Readability */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-ui-bg/40 via-ui-bg/60 to-ui-bg pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>
    </section>
  )
}
