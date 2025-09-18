import React from 'react'
import type { PortalCinematicState } from '../hooks/usePortalCinematics'

type AvatarSpriteProps = {
  state: PortalCinematicState
  className?: string
}

export default function AvatarSprite({ state, className = '' }: AvatarSpriteProps) {
  const isHidden = state === 'adventuring'
  const isWalking = state === 'enteringPortal' || state === 'exitingPortal'
  const spriteClasses = [
    'knight-sprite',
    isWalking ? 'knight-sprite--walk' : '',
    state === 'exitingPortal' ? 'knight-sprite--flip' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const stageClasses = [
    'knight-stage',
    state === 'enteringPortal' ? 'knight-motion--enter' : '',
    state === 'exitingPortal' ? 'knight-motion--exit' : '',
    'transition-opacity',
    'duration-300',
    isHidden ? 'opacity-0' : 'opacity-100',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <div className={stageClasses} aria-hidden={isHidden}>
        <div className={spriteClasses} />
      </div>
    </div>
  )
}
