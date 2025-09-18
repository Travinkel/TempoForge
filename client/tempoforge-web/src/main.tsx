import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import LifeOrb from './components/hud/LifeOrb'
import ManaOrb from './components/hud/ManaOrb'
import QuestPanel from './components/hud/QuestPanel'
import StatsPanel from './components/hud/StatsPanel'
import ActionBar from './components/hud/ActionBar'
import AvatarSprite from './components/AvatarSprite'
import QuickStartCard from './components/daisyui/QuickStartCard'
import StatsCard from './components/daisyui/StatsCard'
import RecentCard from './components/daisyui/RecentCard'
import FavoritesCard from './components/daisyui/FavoritesCard'
import { useSprintSounds } from './hooks/useSprintSounds'
import { usePortalCinematics, type PortalCinematicState } from './hooks/usePortalCinematics'
import './index.css'

console.log('API base:', import.meta.env.VITE_API_BASE_URL)

function DashboardShell({ children, portalState = 'idle' }: { children: React.ReactNode; portalState?: PortalCinematicState }) {
  return (
    <div className="relative min-h-screen bg-black text-base-content">
      <div className="town-porthole" />
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <div className="absolute bottom-[9%] left-1/2 -translate-x-1/2">
          <AvatarSprite state={portalState} />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-black/30 to-black" />

      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-6 max-w-6xl">{children}</main>
      </div>
    </div>
  )
}

import type { Project } from './api/projects'
import { getProjects, addProject, updateProject } from './api/projects'

function TimerCard() {
  return (
    <div className="card bg-neutral text-neutral-content h-full">
      <div className="card-body items-center justify-center text-center">
        <h2 className="card-title mb-2">Timer</h2>
        <div className="text-5xl font-mono">25:00</div>
        <div className="opacity-70">Running sprint placeholder</div>
      </div>
    </div>
  )
}

function ProgressCard() {
  const pct = 42
  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="opacity-70 font-cinzel">Progress</span>
              <span className="text-sm font-cinzel">{pct}%</span>
            </div>
            <div className="w-full h-3 bg-[#1b1b1b] rounded-full overflow-hidden shadow-inner">
              <div className="h-full molten-gold" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="badge badge-primary badge-outline p-3">Standing: Bronze</div>
            <div className="badge badge-secondary p-3">Next: Silver (8 sprints)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const total = 25 * 60
  const [seconds, setSeconds] = React.useState(total)
  const [active, setActive] = React.useState(false)
  const sounds = useSprintSounds()
  const { state: portalState, enterPortal, exitPortal, reset: resetPortal } = usePortalCinematics()
  React.useEffect(() => () => resetPortal(), [resetPortal])


  React.useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [active])

  React.useEffect(() => {
    if (!active) return
    if (seconds === 0) {
      sounds.stopHeartbeat()
      sounds.playComplete()
      setActive(false)
    } else if (seconds === 5 * 60) {
      sounds.playHeartbeatStart()
    }
  }, [seconds, active, sounds])

  React.useEffect(() => {
    if (active && seconds === 0) {
      exitPortal()
    }
  }, [active, seconds, exitPortal])

  const remainingRatio = seconds / total
  const completedRatio = 1 - remainingRatio
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0')
  const ss = (seconds % 60).toString().padStart(2, '0')
  const timerLabel = `${mm}:${ss}`
  const isCritical = active && seconds <= 5 * 60 && seconds > 0

  const start = () => {
    if (active) return
    setSeconds(total)
    setActive(true)
    sounds.playStart()
    enterPortal()
  }
  const cancel = () => {
    if (!active) return
    setActive(false)
    sounds.stopHeartbeat()
    sounds.playCancel()
    exitPortal()
  }
  const complete = () => {
    if (!active) return
    setSeconds(0)
  }

  const questDaily = [
    { label: 'Complete a focus sprint', completed: completedRatio >= 1 },
    { label: 'Review project goals', completed: false },
  ]
  const questWeekly = [
    { label: 'Maintain 5-day streak', completed: false },
    { label: 'Ship one key deliverable', completed: false },
  ]
  const stats = { streakDays: 4, todayMinutes: 50, totalSprints: 2 }

  return (
    <DashboardShell portalState={portalState}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-[280px]">
        <div className="lg:col-span-2 space-y-4">
          <QuickStartCard />
          <StatsCard />
          <ProgressCard />
          <FavoritesCard />
          <RecentCard />
        </div>
        <div className="lg:col-span-1">
          <TimerCard />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <div className="flex items-end justify-between gap-6">
            <div className="flex flex-col gap-4 pointer-events-auto">
              <QuestPanel daily={questDaily} weekly={questWeekly} />
              <LifeOrb progress={remainingRatio} label={timerLabel} pulsing={isCritical} />
            </div>
            <div className="flex flex-col items-center gap-6 pointer-events-auto">
              <ActionBar
                progress={completedRatio}
                timerLabel={timerLabel}
                canStart={!active}
                canCancel={active}
                canComplete={active}
                onStart={start}
                onCancel={cancel}
                onComplete={complete}
                onViewStats={() => {}}
              />
            </div>
            <div className="flex flex-col items-end gap-4 pointer-events-auto">
              <StatsPanel
                streakDays={stats.streakDays}
                todayMinutes={stats.todayMinutes}
                totalSprints={stats.totalSprints}
              />
              <ManaOrb progress={remainingRatio} />
            </div>
          </div>
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-yellow-100">
            <AvatarSprite state={portalState} />
            <div className="font-cinzel text-sm uppercase tracking-[0.35em]">Focus Mode Engaged</div>
            <div className="text-xs md:text-sm text-yellow-100/80 max-w-sm">Stay with the sprint. Use the action bar below if you need to cancel early.</div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

function Projects() {
  const [items, setItems] = React.useState<Project[]>([])
  const [name, setName] = React.useState('')
  const [track, setTrack] = React.useState<number>(1)
  const [error, setError] = React.useState<string | null>(null)

  const load = () =>
    getProjects()
      .then(setItems)
      .catch(err => setError(err?.response?.data?.title ?? 'Failed to load projects'))
  React.useEffect(() => {
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (!name) return
      await addProject(name, track)
      setItems(await getProjects())
      setName('')
    } catch (err: any) {
      setError(err?.response?.data?.title ?? 'Failed to add project')
    }
  }

  return (
    <DashboardShell>
      <h1 className="text-2xl font-bold mb-2">Projects</h1>
      <form className="flex gap-2 mb-4" onSubmit={submit}>
        <input className="input input-bordered w-full" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <select className="select select-bordered" value={track} onChange={e => setTrack(Number(e.target.value))}>
          <option value={1}>Work</option>
          <option value={2}>Study</option>
        </select>
        <button className="btn btn-primary" type="submit">
          Add
        </button>
      </form>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <ul className="space-y-2">
        {items.map(p => (
          <li key={p.id} className="card bg-neutral text-neutral-content p-3">
            <span className="font-semibold">{p.name}</span> <span className="badge ml-2">Track {p.track}</span>
          </li>
        ))}
      </ul>
    </DashboardShell>
  )
}

const Focus = () => (
  <DashboardShell>
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">Focus timer TBD</div>
    </div>
  </DashboardShell>
)
const History = () => (
  <DashboardShell>
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">History TBD</div>
    </div>
  </DashboardShell>
)

const router = createBrowserRouter([
  { path: '/', element: <Dashboard /> },
  { path: '/projects', element: <Projects /> },
  { path: '/focus', element: <Focus /> },
  { path: '/history', element: <History /> },
])

function AppRoot() {
  type Phase = 'loading' | 'slowing' | 'fading' | 'ready'
  const [phase, setPhase] = React.useState<Phase>('loading')

  React.useEffect(() => {
    const timers: number[] = []
    timers.push(window.setTimeout(() => setPhase('slowing'), 800))
    timers.push(window.setTimeout(() => setPhase('fading'), 1100))
    timers.push(window.setTimeout(() => setPhase('ready'), 1400))
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [])

  if (phase !== 'ready') {
    return <LoadingScreen slowing={phase !== 'loading'} fading={phase === 'fading'} />
  }
  return <RouterProvider router={router} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
)





