import React from 'react'

type Control = {
  playStart: () => void
  playHeartbeatStart: () => void
  stopHeartbeat: () => void
  playComplete: () => void
  playCancel: () => void
}

/**
 * Simple sound hook using HTMLAudioElement.
 * Provide your audio files at /assets/sfx/*.mp3. The hook is resilient if files are missing.
 */
export function useSprintSounds(): Control {
  const startRef = React.useRef<HTMLAudioElement | null>(null)
  const heartbeatRef = React.useRef<HTMLAudioElement | null>(null)
  const completeRef = React.useRef<HTMLAudioElement | null>(null)
  const cancelRef = React.useRef<HTMLAudioElement | null>(null)

  React.useEffect(() => {
    startRef.current = new Audio('/assets/sfx/forge_start.mp3')
    heartbeatRef.current = new Audio('/assets/sfx/heartbeat_loop.mp3')
    if (heartbeatRef.current) heartbeatRef.current.loop = true
    completeRef.current = new Audio('/assets/sfx/complete_sting.mp3')
    cancelRef.current = new Audio('/assets/sfx/cancel_fail.mp3')
    return () => {
      heartbeatRef.current?.pause()
    }
  }, [])

  const safePlay = (a: HTMLAudioElement | null) => {
    try {
      if (a) {
        a.currentTime = 0;
        // Avoid unhandled promise rejections in some browsers
        const p = a.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } catch {
      /* ignore */
    }
  }

  return {
    playStart: () => safePlay(startRef.current),
    playHeartbeatStart: () => safePlay(heartbeatRef.current),
    stopHeartbeat: () => { try { if (heartbeatRef.current) { heartbeatRef.current.pause() } } catch {} },
    playComplete: () => safePlay(completeRef.current),
    playCancel: () => safePlay(cancelRef.current),
  }
}
