/**
 * MotionProvider - Page Transition Provider with 3D Depth
 *
 * Features:
 * - Subtle 3D page transitions (Linear-style)
 * - Perspective: 1200px for depth effect
 * - Respects prefers-reduced-motion
 * - GPU-accelerated transforms
 * - No layout shifts
 *
 * @component
 */

'use client'

import { AnimatePresence, motion, Variants } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

// Subtle 3D page transition variants (Linear-style)
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    rotateX: -2,
    transformPerspective: 1200,
  },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // Custom easing curve
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    rotateX: 2,
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// Reduced motion variants (accessibility)
const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  const variants = prefersReducedMotion ? reducedMotionVariants : pageVariants

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
