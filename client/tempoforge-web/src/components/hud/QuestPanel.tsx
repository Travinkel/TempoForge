import React from 'react'
import { Check } from 'lucide-react'

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
    <div className="font-cinzel text-xs uppercase tracking-[0.3em] text-base-content/70 mb-2">{title}</div>
    <ul className="space-y-1.5 text-[13px]">
      {items.map(item => (
        <li
          key={item.label}
          className="group flex items-center gap-3 text-base-content/80"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
              item.completed
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.45)]'
                : 'border-red-400/70 bg-red-500/25 text-transparent group-hover:border-red-300/80 group-hover:text-red-200/80'
            }`}
            aria-hidden="true"
          >
            <Check
              className={`h-3 w-3 transition-transform duration-300 ${item.completed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
            />
          </span>
          <span className="relative inline-flex">
            <span
              className={`transition-colors duration-300 ${item.completed ? 'text-emerald-200' : ''}`}
            >
              {item.label}
            </span>
            <span
              className={`absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-emerald-300/80 transition-all duration-300 ${
                item.completed ? 'w-full opacity-100' : 'w-0 opacity-0'
              }`}
              aria-hidden="true"
            />
          </span>
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




