import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'
import './index.css'

console.log("API base:", import.meta.env.VITE_API_BASE_URL);

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-6xl">{children}</main>
    </div>
  )
}

function QuickStartCard() {
  const [project, setProject] = React.useState('Client Alpha')
  const [duration, setDuration] = React.useState<number | 'custom'>(25)
  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">
        <h2 className="card-title">Quick Start</h2>
        <div className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text text-neutral-content/80">Project</span></label>
            <select className="select select-bordered select-sm w-full max-w-xs" value={project} onChange={e => setProject(e.target.value)}>
              <option>Client Alpha</option>
              <option>Thesis Article</option>
              <option>Algorithms Review</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {[15,25,45,'custom' as const].map(v => (
              <button key={v.toString()} onClick={() => setDuration(v)} className={`btn btn-sm ${duration===v? 'btn-primary' : ''}`}>{v==='custom' ? 'Custom' : `${v}m`}</button>
            ))}
          </div>
          <div>
            <button className="btn btn-secondary">Start Sprint</button>
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
  return (
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="opacity-70">Progress</span>
              <span className="text-sm">42%</span>
            </div>
            <progress className="progress progress-primary w-full" value={42} max={100}></progress>
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
          <h2 className="card-title">Pinned Projects</h2>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {items.map(x => (
            <div key={x} className="badge badge-outline whitespace-nowrap px-4 py-3">{x}</div>
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
        <div className="flex items-center justify-between">
          <h2 className="card-title">Recent</h2>
          <button className="btn btn-ghost btn-sm">View all</button>
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
  return (
    <DashboardShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <QuickStartCard/>
          <StatsRow/>
          <ProgressRow/>
          <PinnedProjects/>
          <RecentHistory/>
        </div>
        <div className="lg:col-span-1">
          <TimerCard/>
        </div>
      </div>
    </DashboardShell>
  )
}

import type { Project } from './api/projects'
import { getProjects, addProject } from './api/projects'

function Projects() {
  const [items, setItems] = React.useState<Project[]>([])
  const [name, setName] = React.useState('')
  const [track, setTrack] = React.useState<number>(1)
  const [error, setError] = React.useState<string | null>(null)

  const load = () => getProjects().then(setItems).catch(err => setError(err?.response?.data?.title ?? 'Failed to load projects'))
  React.useEffect(() => { load() }, [])

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
        <button className="btn btn-primary" type="submit">Add</button>
      </form>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <ul className="space-y-2">
        {items.map(p => (
          <li key={p.id} className="card bg-neutral text-neutral-content p-3"><span className="font-semibold">{p.name}</span> <span className="badge ml-2">Track {p.track}</span></li>
        ))}
      </ul>
    </DashboardShell>
  )
}

const Focus = () => <DashboardShell><div className="card bg-neutral text-neutral-content"><div className="card-body">Focus timer TBD</div></div></DashboardShell>
const History = () => <DashboardShell><div className="card bg-neutral text-neutral-content"><div className="card-body">History TBD</div></div></DashboardShell>

const router = createBrowserRouter([
  { path: '/', element: <Dashboard/> },
  { path: '/projects', element: <Projects/> },
  { path: '/focus', element: <Focus/> },
  { path: '/history', element: <History/> },
])

function AppRoot() {
  type Phase = 'loading' | 'slowing' | 'fading' | 'ready'
  const [phase, setPhase] = React.useState<Phase>('loading')

  React.useEffect(() => {
    const timers: number[] = []
    // Fast spin initially
    timers.push(window.setTimeout(() => setPhase('slowing'), 800))
    // Slow it briefly
    timers.push(window.setTimeout(() => setPhase('fading'), 800 + 300))
    // Fade out complete, mount app
    timers.push(window.setTimeout(() => setPhase('ready'), 800 + 300 + 300))
    return () => { timers.forEach(clearTimeout) }
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
