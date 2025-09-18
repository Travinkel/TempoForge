import React from 'react'

export type ActionSlotProps = {
  label: string
  onClick?: () => void
  disabled?: boolean
  title?: string
  variant?: 'default' | 'active'
  className?: string
}

export default function ActionSlot({
  label,
  onClick,
  disabled = false,
  title,
  variant = 'default',
  className = '',
}: ActionSlotProps) {
  return (
    <button
      type="button"
      title={title ?? label}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-[72px] h-[72px] uppercase tracking-[0.3em] font-cinzel text-[11px] text-yellow-100 transition-transform duration-150 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
      } ${className}`}
    >
      <img
        src="/assets/ui/belt_slot.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
      />
      <img
        src={variant === 'active' ? '/assets/ui/active_action.png' : '/assets/ui/skill_base.png'}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
      />
      <span className="relative z-10 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">{label}</span>
    </button>
  )
}
