import React from 'react'

interface LifeOrbProps {
  progress: number // 0-1
  pulsing?: boolean
  className?: string
  label?: string
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

export default function LifeOrb({ progress, pulsing = false, className = '', label }: LifeOrbProps) {
  const fillHeight = Math.max(0, Math.min(100, progress * 100))

  return (
    <div className={`relative w-[150px] h-[150px] ${className}`}>
      <div className="absolute inset-0" style={maskStyle}>
        <div
          className="absolute bottom-0 left-0 right-0 overflow-hidden transition-all duration-700"
          style={{ height: `${fillHeight}%` }}
        >
          <img
            src="/assets/ui/orb_fill_0.png"
            className="absolute bottom-0 left-0 right-0 w-full h-full object-cover"
            alt="Life essence"
          />
        </div>
      </div>

      <img
        src="/assets/ui/orb_mask.png"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        alt="Life orb mask"
      />
      <img
        src="/assets/ui/orb_glass.png"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        alt="Life orb glass"
      />
      <img
        src="/assets/ui/orb_angel.png"
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none ${
          pulsing ? 'animate-pulse' : ''
        }`}
        alt="Life orb frame"
      />

      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-cinzel text-yellow-100 text-2xl tracking-[0.3em] drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
            {label}
          </div>
        </div>
      )}

      {pulsing && (
        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
      )}
    </div>
  )
}
