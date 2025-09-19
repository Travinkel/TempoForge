import React from 'react'

export type ActionSlotProps = {
  iconClass: string
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'active'
  className?: string
}

export function ActionSlot(
  iconClass: ActionSlotProps['iconClass'],
  label: ActionSlotProps['label'],
  onClick?: ActionSlotProps['onClick'],
  disabled: ActionSlotProps['disabled'] = false,
  options: Pick<ActionSlotProps, 'variant' | 'className'> = {}
) {
  const { variant = 'default', className = '' } = options

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex h-[72px] w-[72px] items-center justify-center transition-transform duration-150 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
      } ${className}`}
    >
      <img
        src="/assets/ui/belt_slot.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full select-none object-contain pointer-events-none"
      />
      <img
        src={variant === 'active' ? '/assets/ui/active_action.png' : '/assets/ui/skill_base.png'}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full select-none object-contain pointer-events-none"
      />
      <span
        aria-hidden="true"
        className={`icon relative z-10 block select-none pointer-events-none ${iconClass}`}
      />
    </button>
  )
}
