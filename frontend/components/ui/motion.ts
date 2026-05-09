const motionDurations = {
  fast: 0.12,
  base: 0.18,
  slow: 0.26,
} as const

const motionEasings = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.16, 1, 0.3, 1],
} as const

const motionClasses = {
  standard:
    "motion-standard transition-[background-color,border-color,color,box-shadow,transform]",
  emphasized: "motion-emphasized transition-[opacity,transform]",
  tactile: "motion-standard transition-transform active:translate-y-px",
} as const

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: motionDurations.slow,
    ease: motionEasings.emphasized,
  },
} as const

export { fadeUp, motionClasses, motionDurations, motionEasings }
