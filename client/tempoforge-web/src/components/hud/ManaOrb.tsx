import React from 'react'

interface ManaOrbProps {
  progress: number // 0-1
  pulsing?: boolean
  className?: string
  mirror?: boolean
}

const maskStyle: React.CSSProperties = {
  WebkitMaskImage: "url('/assets/ui/orb_mask.png')",
  maskImage: "url('/assets/ui/orb_mask.png')",
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
}

export default function ManaOrb({ progress, pulsing = false, className = '', mirror = true }: ManaOrbProps) {
  const fillHeight = Math.max(0, Math.min(100, progress * 100))
  const transformStyle = mirror ? ({ transform: 'scaleX(-1)' } as React.CSSProperties) : undefined

  return (
    <div className={`relative w-[150px] h-[150px] ${className}`} style={transformStyle}>
      <div className="absolute inset-0" style={maskStyle}>
        <div
          className="absolute bottom-0 left-0 right-0 overflow-hidden transition-all duration-700"
          style={{ height: `${fillHeight}%` }}
        >
          <img
            src="/assets/ui/orb_fill_1.png"
            className="absolute bottom-0 left-0 right-0 w-full h-full object-cover"
            alt="Mana essence"
          />
        </div>
      </div>

      <img
        src="/assets/ui/orb_mask.png"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        alt="Mana orb mask"
      />
      <img
        src="/assets/ui/orb_glass.png"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        alt="Mana orb glass"
      />
      <img
        src="/assets/ui/orb_angel.png"
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none ${
          pulsing ? 'animate-pulse' : ''
        }`}
        alt="Mana orb frame"
      />

      {pulsing && (
        <div className="absolute inset-0 rounded-full bg-sky-500/15 animate-pulse" />
      )}
    </div>
  )
}
