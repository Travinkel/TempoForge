import React from "react";

import cancelFail from "/assets/sfx/cancel_fail.mp3";
import completeSting from "/assets/sfx/complete_sting.mp3";
import forgeStart from "/assets/sfx/forge_start.mp3";
import heartbeatLoop from "/assets/sfx/heartbeat_loop.mp3";

type SprintSoundController = {
  playStart: () => void;
  playHeartbeatStart: () => void;
  stopHeartbeat: () => void;
  playComplete: () => void;
  playCancel: () => void;
};

const canUseAudio = typeof Audio !== "undefined";

function setupAudio(src: string, options: { loop?: boolean } = {}): HTMLAudioElement | null {
  if (!canUseAudio) {
    return null;
  }

  const audio = new Audio(src);
  audio.preload = "auto";
  audio.loop = Boolean(options.loop);
  audio.currentTime = 0;
  return audio;
}

function safePlay(audio: HTMLAudioElement | null) {
  if (!audio) {
    return;
  }

  try {
    audio.currentTime = 0;
    const maybePromise = audio.play();

    if (maybePromise && typeof maybePromise.catch === "function") {
      maybePromise.catch(() => undefined);
    }
  } catch {
    // Ignore playback failures (can happen without user interaction)
  }
}

export function useSprintSounds(): SprintSoundController {
  const startRef = React.useRef<HTMLAudioElement | null>(null);
  const heartbeatRef = React.useRef<HTMLAudioElement | null>(null);
  const completeRef = React.useRef<HTMLAudioElement | null>(null);
  const cancelRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (!canUseAudio) {
      return;
    }

    startRef.current = setupAudio(forgeStart);
    heartbeatRef.current = setupAudio(heartbeatLoop, { loop: true });
    completeRef.current = setupAudio(completeSting);
    cancelRef.current = setupAudio(cancelFail);

    return () => {
      startRef.current?.pause();
      heartbeatRef.current?.pause();
      completeRef.current?.pause();
      cancelRef.current?.pause();

      startRef.current = null;
      heartbeatRef.current = null;
      completeRef.current = null;
      cancelRef.current = null;
    };
  }, []);

  const stopHeartbeat = React.useCallback(() => {
    if (!heartbeatRef.current) {
      return;
    }

    try {
      heartbeatRef.current.pause();
      heartbeatRef.current.currentTime = 0;
    } catch {
      // Ignore pause failures
    }
  }, []);

  return {
    playStart: () => safePlay(startRef.current),
    playHeartbeatStart: () => safePlay(heartbeatRef.current),
    stopHeartbeat,
    playComplete: () => safePlay(completeRef.current),
    playCancel: () => safePlay(cancelRef.current),
  };
}
