import React from 'react'

type FavoritesCardProps = {
  items?: string[]
}

export default function FavoritesCard({ items }: FavoritesCardProps) {
  const displayItems = items ?? ['Thesis Article', 'Client Alpha', 'Algorithms Review', 'Personal Site']

  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <div className="flex items-center justify-between mb-2">
          <h2 className="card-title font-cinzel text-primary">Favorites</h2>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {displayItems.map(item => (
            <div
              key={item}
              className="whitespace-nowrap px-4 py-2 rounded-full border border-yellow-700/60 bg-gradient-to-b from-[#3b3b3b] to-[#222] text-yellow-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
