import React from 'react'

export type MoltenProgressBarProps = {
  progress: number // 0..1
  label?: string
}

export default function MoltenProgressBar({ progress, label }: MoltenProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress))
  return (
    <div className="absolute left-1/2 -top-[7vh] w-[70%] -translate-x-1/2">
      <div className="relative h-[3vh] min-h-[2.4vh] rounded-full border border-yellow-700/60 bg-black/70 shadow-[0_6px_18px_rgba(0,0,0,0.6)] overflow-hidden">
        <div
          className="molten-gold h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped * 100}%` }}
        />
        {label && (
          <div className="absolute inset-0 flex items-center justify-center text-[1.2vh] uppercase tracking-[0.35em] text-yellow-100/90 font-cinzel">
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

