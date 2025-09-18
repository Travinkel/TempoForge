import React from 'react'

export type PortalPhase = 'idle' | 'enteringPortal' | 'adventuring' | 'exitingPortal'

type Options = {
  entryDuration?: number
  exitDuration?: number
}

/**
 * Controls a simple three-beat portal cinematic (enter ? adventure ? exit).
 * Call `beginEntry` when the avatar steps into the portal and `beginExit` when
 * the sprint concludes or is cancelled.
 */
export function usePortalCinematics(options: Options = {}) {
  const entryDuration = options.entryDuration ?? 1200
  const exitDuration = options.exitDuration ?? 1200
  const [phase, setPhase] = React.useState<PortalPhase>('idle')
  const timers = React.useRef<number[]>([])

  const clearTimers = React.useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }, [])

  const beginEntry = React.useCallback(() => {
    clearTimers()
    setPhase('enteringPortal')
    timers.current.push(
      window.setTimeout(() => setPhase('adventuring'), entryDuration)
    )
  }, [clearTimers, entryDuration])

  const beginExit = React.useCallback(() => {
    clearTimers()
    setPhase('exitingPortal')
    timers.current.push(
      window.setTimeout(() => setPhase('idle'), exitDuration)
    )
  }, [clearTimers, exitDuration])

  const reset = React.useCallback(() => {
    clearTimers()
    setPhase('idle')
  }, [clearTimers])

  React.useEffect(() => () => reset(), [reset])

  const isInPortal =
    phase === 'enteringPortal' ||
    phase === 'adventuring' ||
    phase === 'exitingPortal'

  return { phase, beginEntry, beginExit, reset, isInPortal }
}
