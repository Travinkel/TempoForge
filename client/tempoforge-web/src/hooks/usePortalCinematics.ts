import React from 'react'

export type PortalCinematicState = 'idle' | 'enteringPortal' | 'adventuring' | 'exitingPortal'

type Options = {
  entryDuration?: number
  exitDuration?: number
}

/**
 * Controls a simple three-beat portal cinematic (enter ? adventure ? exit).
 * Call `enterPortal` when the avatar steps into the portal and `exitPortal`
 * when the sprint concludes or is cancelled.
 */
export function usePortalCinematics(options: Options = {}) {
  const entryDuration = options.entryDuration ?? 1200
  const exitDuration = options.exitDuration ?? 1200
  const [state, setState] = React.useState<PortalCinematicState>('idle')
  const timers = React.useRef<number[]>([])

  const clearTimers = React.useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }, [])

  const enterPortal = React.useCallback(() => {
    clearTimers()
    setState('enteringPortal')
    timers.current.push(
      window.setTimeout(() => setState('adventuring'), entryDuration)
    )
  }, [clearTimers, entryDuration])

  const exitPortal = React.useCallback(() => {
    clearTimers()
    setState('exitingPortal')
    timers.current.push(
      window.setTimeout(() => setState('idle'), exitDuration)
    )
  }, [clearTimers, exitDuration])

  const reset = React.useCallback(() => {
    clearTimers()
    setState('idle')
  }, [clearTimers])

  React.useEffect(() => () => reset(), [reset])

  const isInPortal =
    state === 'enteringPortal' ||
    state === 'adventuring' ||
    state === 'exitingPortal'

  return { state, enterPortal, exitPortal, reset, isInPortal }
}
