import React from 'react'\r\nimport forgeStart from '/assets/sfx/forge_start.mp3';\r\nimport heartbeatLoop from '/assets/sfx/heartbeat_loop.mp3';\r\nimport completeSting from '/assets/sfx/complete_sting.mp3';\r\nimport cancelFail from '/assets/sfx/cancel_fail.mp3';

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
    startRef.current = new Audio(forgeStart)
    heartbeatRef.current = new Audio(heartbeatLoop)
    if (heartbeatRef.current) heartbeatRef.current.loop = true
    completeRef.current = new Audio(completeSting)
    cancelRef.current = new Audio(cancelFail)
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

