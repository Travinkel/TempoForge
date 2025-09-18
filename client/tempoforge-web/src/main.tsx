import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Droplet } from 'lucide-react'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import LifeOrb from './components/LifeOrb'
import ManaOrb from './components/ManaOrb'
import QuestPanel from './components/QuestPanel'
import StatsPanel from './components/StatsPanel'
import ActionBar from './components/ActionBar'
import { useSprintSounds } from './hooks/useSprintSounds'
import './index.css'

console.log('API base:', import.meta.env.VITE_API_BASE_URL)

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black text-base-content">
      <div className="town-porthole" />
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

function QuickStartCard() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null)
  const [duration, setDuration] = React.useState<number | 'custom'>(25)

  const favorites = projects.filter(p => p.isFavorite)

  React.useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  const onAddProject = async () => {
    const name = window.prompt('Project name')?.trim()
    if (!name) return
    const trackStr = window.prompt('Track (1=Work, 2=Study)', '1') || '1'
    const track = Number(trackStr) === 2 ? 2 : 1
    const fav = window.confirm('Mark as favorite?')
    await addProject(name, track, fav)
    setProjects(await getProjects())
  }

  const toggleFavorite = async (p: Project) => {
    await updateProject(p.id, { isFavorite: !p.isFavorite })
    setProjects(await getProjects())
  }

  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <h2 className="card-title font-cinzel text-primary">Quick Start</h2>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex gap-2 flex-wrap items-center">
              {favorites.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`px-3 py-1 rounded-full border transition-colors ${
                    selectedProjectId === p.id
                      ? 'bg-yellow-600 text-black border-yellow-700'
                      : 'bg-gray-800 text-gray-200 border-gray-600'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button onClick={onAddProject} className="px-3 py-1 rounded-full bg-gray-600 text-white hover:bg-gray-500">+ Add</button>
            </div>
            {favorites.length === 0 && (
              <div className="mt-3 text-sm opacity-80">
                Forge your first favorite ??
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {[15, 25, 45, 'custom' as const].map(v => (
              <button key={v.toString()} onClick={() => setDuration(v)} className={`btn btn-sm ${duration === v ? 'btn-primary' : ''}`}>
                {v === 'custom' ? 'Custom' : `${v}m`}
              </button>
            ))}
          </div>

          <div>
            <button className="btn bg-red-700 text-white border-red-800 hover:bg-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] btn-lg">
              Start Sprint
            </button>
          </div>

          <div className="mt-2">
            <div className="text-sm mb-1 opacity-70">Favorites</div>
            <ul className="divide-y divide-base-100/20">
              {projects.map(p => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>{p.name}</span>
                  <button onClick={() => toggleFavorite(p)} aria-label="Toggle favorite">
                    <Droplet className={p.isFavorite ? 'text-red-600' : 'text-gray-500 hover:text-red-500'} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

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

function StatsRow() {
  const stats = [
    { label: 'Minutes today', value: '50' },
    { label: 'Sprints', value: '2' },
    { label: 'Streak', value: '4 days' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map(s => (
        <div key={s.label} className="card bg-neutral text-neutral-content">
          <div className="card-body p-4">
            <div className="text-sm opacity-70">{s.label}</div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProgressRow() {
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

function PinnedProjects() {
  const items = ['Thesis Article', 'Client Alpha', 'Algorithms Review', 'Personal Site']
  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <div className="flex items-center justify-between mb-2">
          <h2 className="card-title font-cinzel text-primary">Favorites</h2>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {items.map(x => (
            <div key={x} className="whitespace-nowrap px-4 py-2 rounded-full border border-yellow-700/60 bg-gradient-to-b from-[#3b3b3b] to-[#222] text-yellow-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">{x}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecentHistory() {
  const items = [
    { project: 'Client Alpha', duration: '25m', when: 'Today 14:10' },
    { project: 'Thesis Article', duration: '45m', when: 'Yesterday 19:20' },
    { project: 'Algorithms Review', duration: '15m', when: 'Yesterday 08:40' },
  ]
  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <div className="flex items-center justify-between mb-2">
          <h2 className="card-title font-cinzel text-primary">Recent History</h2>
          <button className="btn btn-xs">Export</button>
        </div>
        <ul className="mt-2">
          {items.map((i, idx) => (
            <li key={idx} className="flex items-center justify-between py-2 border-b border-base-100/20 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div>
                  <div className="font-medium">{i.project}</div>
                  <div className="text-sm opacity-70">{i.when}</div>
                </div>
              </div>
              <div className="badge badge-secondary">{i.duration}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Dashboard() {
  const total = 25 * 60
  const [seconds, setSeconds] = React.useState(total)
  const [active, setActive] = React.useState(false)
  const sounds = useSprintSounds()

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
  }
  const cancel = () => {
    if (!active) return
    setActive(false)
    sounds.stopHeartbeat()
    sounds.playCancel()
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
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-[280px]">
        <div className="lg:col-span-2 space-y-4">
          <QuickStartCard />
          <StatsRow />
          <ProgressRow />
          <PinnedProjects />
          <RecentHistory />
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
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="space-y-6 text-center text-yellow-100">
            <LifeOrb progress={remainingRatio} label={timerLabel} pulsing />
            <ActionBar
              progress={completedRatio}
              timerLabel={timerLabel}
              canStart={false}
              canCancel
              canComplete
              onCancel={cancel}
              onComplete={complete}
              onViewStats={() => {}}
              className="mx-auto"
            />
            <div className="text-sm opacity-80">Press Cancel to forfeit this sprint</div>
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
