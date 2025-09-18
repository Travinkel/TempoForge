import React from 'react'

export type HudPanelProps = {
  side: 'left' | 'right'
  className?: string
  children?: React.ReactNode
}

/*
  HudPanel mounts an image panel (HealthPanel.png for left, ManaPanel.png for right)
  and provides an absolute positioned slot over the circular cutout for content
  (e.g., the BloodOrb). It sticks to bottom and spans width for HUD layout.
*/
export default function HudPanel({ side, className = '', children }: HudPanelProps) {
  const src = side === 'left' ? '/assets/HealthPanel.png' : '/assets/ManaPanel.png'
  return (
    <div className={`relative ${className}`}>
      <img src={src} alt={`${side} panel`} className="w-full h-auto pointer-events-none select-none" />
      {/* Absolute slot positioned roughly where the circular cutout is.
          These offsets may require fine-tuning to match the provided PNGs. */}
      {side === 'left' ? (
        <div className="absolute bottom-[12px] left-[24px]">
          {children}
        </div>
      ) : (
        <div className="absolute bottom-[12px] right-[24px]">
          {children}
        </div>
      )}
    </div>
  )
}
