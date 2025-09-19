import React from 'react'

export type BloodOrbProps = {
  /** 0..1 progress remaining. 1 = full, 0 = empty */
  progress: number
  /** Timer text, e.g., 25:00 */
  label?: string
  className?: string
  pulsing?: boolean
}

/*
  BloodOrb uses DarkOrbBorder.png as the frame. The liquid is a red gradient div
  with a wave overlay that animates horizontally. The liquid drains upward as
  progress decreases. We use a circular mask to confine the liquid.
*/
export default function BloodOrb({ progress, label = '25:00', className = '', pulsing }: BloodOrbProps) {
  const pct = Math.max(0, Math.min(1, progress))
  return (
    <div
      className={`relative aspect-square w-[20vw] min-w-[12vh] max-w-[24vh] select-none ${className}`}
    >
      {/* Liquid container (masked circle) */}
      <div className={`absolute inset-0 rounded-full overflow-hidden ${pulsing ? 'orb-glow' : ''}`}>
        {/* Fill height based on progress; transitions smooth */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
          style={{ height: `${pct * 100}%` }}
        >
          {/* Base red gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#b71c1c] via-[#8a0e0e] to-[#520909]" />
          {/* Wave overlay */}
          <div className="absolute -top-4 left-0 right-0 h-6 wave-mask opacity-70" />
        </div>
      </div>

      {/* Timer text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="font-cinzel text-yellow-200 drop-shadow-[0_0_6px_rgba(0,0,0,0.8)] text-2xl tracking-wider">
          {label}
        </div>
      </div>

      {/* Frame */}
      <img
        src="/assets/DarkOrbBorder.png"
        alt="Orb frame"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  )
}

