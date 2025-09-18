import React from 'react'

export type RotatingArmProps = {
  speed?: 'fast' | 'slow'
  visible?: boolean
  className?: string
  armSrc?: string // default to /assets/arm-large-centered.png
  alt?: string
}

/**
 * RotatingArm overlays a centered arm PNG inside a relative parent container.
 * - Assumes the arm image has its pivot exactly at the center of the canvas.
 * - Uses w-full h-full to match the base image size.
 * - Supports fast (1.2s) and slow (5s) spin variants.
 * - Fades out smoothly when not visible.
 */
export default function RotatingArm({
  speed = 'fast',
  visible = true,
  className = '',
  armSrc = '/assets/arm-large-centered.png',
  alt = 'Clock arm'
}: RotatingArmProps) {
  const speedClass = speed === 'fast' ? 'animate-spin-fast' : 'animate-spin-slow'
  return (
    <img
      src={armSrc}
      alt={alt}
      className={[
        'absolute inset-0 w-full h-full select-none pointer-events-none',
        'origin-center',
        speedClass,
        'transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
        className
      ].join(' ')}
      style={{ transformOrigin: '50% 50%' }}
    />
  )
}
