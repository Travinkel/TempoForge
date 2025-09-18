import React from 'react'

type QuestListItem = {
  label: string
  completed?: boolean
}

export type QuestPanelProps = {
  daily: QuestListItem[]
  weekly: QuestListItem[]
  className?: string
}

const List = ({ title, items }: { title: string; items: QuestListItem[] }) => (
  <div>
    <div className="font-cinzel text-xs uppercase tracking-[0.3em] text-amber-200/90 mb-2">{title}</div>
    <ul className="space-y-1.5 text-[13px]">
      {items.map(item => (
        <li key={item.label} className="flex items-center gap-2 text-yellow-100/90">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${
              item.completed ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-red-500/80'
            }`}
          />
          <span className={item.completed ? 'line-through opacity-70' : ''}>{item.label}</span>
        </li>
      ))}
    </ul>
  </div>
)

export default function QuestPanel({ daily, weekly, className = '' }: QuestPanelProps) {
  return (
    <div className={`relative w-[280px] text-yellow-50 ${className}`}>
      <img
        src="/assets/ui/orb_panel.png"
        alt="Quest log panel"
        className="w-full h-auto pointer-events-none select-none drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)]"
      />
      <div className="absolute inset-0 px-8 py-6 space-y-4">
        <List title="Daily Goals" items={daily} />
        <div className="h-px w-full bg-white/15" />
        <List title="Weekly" items={weekly} />
      </div>
    </div>
  )
}
