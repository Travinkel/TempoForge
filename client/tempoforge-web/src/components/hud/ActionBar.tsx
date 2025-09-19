import React from 'react'
import { ActionSlot } from './ActionSlot'
import MoltenProgressBar from './MoltenProgressBar'

export type ActionBarProps = {
  canStart?: boolean
  canCancel?: boolean
  canComplete?: boolean
  canViewStats?: boolean
  onStart?: () => void
  onCancel?: () => void
  onComplete?: () => void
  onViewStats?: () => void
  progress?: number // 0-1 fill for the molten bar
  timerLabel?: string
  className?: string
}

export default function ActionBar({
  canStart = true,
  canCancel = false,
  canComplete = true,
  canViewStats = true,
  onStart,
  onCancel,
  onComplete,
  onViewStats,
  progress,
  timerLabel,
  className = '',
}: ActionBarProps) {
  const slots = [
    {
      key: 'start',
      label: 'Start',
      iconClass: 'icon-swords',
      onClick: onStart,
      disabled: !canStart,
      variant: canStart ? 'active' : 'default',
    },
    {
      key: 'cancel',
      label: 'Cancel',
      iconClass: 'icon-skull',
      onClick: onCancel,
      disabled: !canCancel,
      variant: 'default',
    },
    {
      key: 'complete',
      label: 'Complete',
      iconClass: 'icon-shield',
      onClick: onComplete,
      disabled: !canComplete,
      variant: 'default',
    },
    {
      key: 'stats',
      label: 'Stats',
      iconClass: 'icon-eye',
      onClick: onViewStats,
      disabled: !canViewStats,
      variant: 'default',
    },
  ] as const

  return (
    <div className={`relative w-full pointer-events-auto ${className}`} style={{ maxWidth: 'min(70vw, 68vh)' }}>
      {typeof progress === 'number' && (
        <MoltenProgressBar progress={progress} label={timerLabel} />
      )}
      <img
        src="/assets/ui/panel.png"
        alt="HUD bar"
        className="w-full h-auto pointer-events-none select-none drop-shadow-[0_18px_28px_rgba(0,0,0,0.65)]"
      />
      <div className="absolute inset-0 flex items-center justify-center gap-3 px-12">
        {slots.map((slot, index) => (
          <React.Fragment key={slot.key}>
            {index > 0 && (
              <img
                src="/assets/ui/divider.png"
                alt=""
                aria-hidden="true"
                className="h-[5vh] w-[0.9vw] min-w-[0.6vh] object-contain pointer-events-none select-none"
              />
            )}
            {ActionSlot(
              slot.iconClass,
              slot.label,
              slot.onClick,
              slot.disabled,
              {
                variant: slot.variant,
              }
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
