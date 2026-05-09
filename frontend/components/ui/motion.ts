/**
 * Shared motion tokens — calm, premium pacing. Pair with `MotionConfig reducedMotion="user"`
 * in app providers so system “reduce motion” is honoured app-wide.
 */
const motionDurations = {
  fast: 0.12,
  base: 0.18,
  slow: 0.26,
  leisurely: 0.4,
} as const

const motionEasings = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  emphasized: [0.16, 1, 0.3, 1] as [number, number, number, number],
} as const

const transitions = {
  panel: {
    duration: motionDurations.slow,
    ease: motionEasings.emphasized,
  },
  quick: {
    duration: motionDurations.base,
    ease: motionEasings.emphasized,
  },
  snap: {
    duration: motionDurations.fast,
    ease: motionEasings.standard,
  },
} as const

/** Subtle spring for checkmarks and small pops — high damping keeps motion calm. */
const springTactile = {
  type: "spring" as const,
  stiffness: 480,
  damping: 36,
  mass: 0.82,
}

/** Primary `AnimatePresence` cross-fade for switching layout modes (e.g. browse vs cooking). */
const panelCrossfade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: transitions.panel,
} as const

const tactilePointer = {
  whileHover: { scale: 1.006 },
  whileTap: { scale: 0.992 },
  transition: transitions.quick,
} as const

const skeletonShimmer = {
  duration: 2.1,
  repeat: Infinity,
  ease: "linear" as const,
  repeatDelay: 0.35,
} as const

export {
  motionEasings,
  panelCrossfade,
  skeletonShimmer,
  springTactile,
  tactilePointer,
  transitions,
}
