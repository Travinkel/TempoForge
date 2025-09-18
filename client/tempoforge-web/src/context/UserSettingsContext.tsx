import React from 'react'

type LayoutPreference = 'daisyui' | 'hud'

type UserSettingsContextValue = {
  layout: LayoutPreference
  setLayout: (layout: LayoutPreference) => void
  toggleLayout: () => void
}

const LAYOUT_STORAGE_KEY = 'tempoforge:layout-preference'

const UserSettingsContext = React.createContext<UserSettingsContextValue | undefined>(undefined)

const resolveInitialLayout = (): LayoutPreference => {
  if (typeof window === 'undefined') {
    return 'daisyui'
  }
  const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY)
  return stored === 'hud' ? 'hud' : 'daisyui'
}

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = React.useState<LayoutPreference>(resolveInitialLayout)

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, layout)
  }, [layout])

  const toggleLayout = React.useCallback(() => {
    setLayout(prev => (prev === 'daisyui' ? 'hud' : 'daisyui'))
  }, [])

  const value = React.useMemo(
    () => ({
      layout,
      setLayout,
      toggleLayout,
    }),
    [layout, toggleLayout],
  )

  return <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>
}

export function useUserSettings(): UserSettingsContextValue {
  const context = React.useContext(UserSettingsContext)
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider')
  }
  return context
}
