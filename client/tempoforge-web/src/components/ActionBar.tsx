import React from 'react'
import ActionSlot from './ActionSlot'
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
  const slots: Array<{
    key: string
    label: string
    onClick?: () => void
    disabled: boolean
    variant?: 'default' | 'active'
  }> = [
    {
      key: 'start',
      label: 'Start',
      onClick: onStart,
      disabled: !canStart,
      variant: canStart ? 'active' : 'default',
    },
    {
      key: 'cancel',
      label: 'Cancel',
      onClick: onCancel,
      disabled: !canCancel,
    },
    {
      key: 'complete',
      label: 'Complete',
      onClick: onComplete,
      disabled: !canComplete,
    },
    {
      key: 'stats',
      label: 'Stats',
      onClick: onViewStats,
      disabled: !canViewStats,
    },
  ]

  return (
    <div className={`relative w-full max-w-[640px] pointer-events-auto ${className}`}>
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
                className="h-10 w-[10px] object-contain pointer-events-none select-none"
              />
            )}
            <ActionSlot
              label={slot.label}
              onClick={slot.onClick}
              disabled={slot.disabled}
              variant={slot.variant ?? 'default'}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
