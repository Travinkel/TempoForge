import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import LoadingScreen from './components/hud/LoadingScreen'
import Navbar from './components/daisyui/Navbar'
import type { Project } from './api/projects'
import { getProjects, addProject } from './api/projects'
import { SprintProvider } from './context/SprintContext'
import { UserSettingsProvider } from './context/UserSettingsContext'
import './index.css'

console.log('API base:', import.meta.env.VITE_API_BASE_URL)

type AppPageProps = {
  children: React.ReactNode
}

function AppPage({ children }: AppPageProps) {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-4">{children}</main>
    </div>
  )
}

function Projects() {
  const [items, setItems] = React.useState<Project[]>([])
  const [name, setName] = React.useState('')
  const [track, setTrack] = React.useState<number>(1)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    getProjects()
      .then(setItems)
      .catch(err => setError(err?.response?.data?.title ?? 'Failed to load projects'))
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

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
    <AppPage>
      <h1 className="text-2xl font-bold mb-2">Projects</h1>
      <form className="flex flex-wrap gap-2 mb-4" onSubmit={submit}>
        <input
          className="input input-bordered flex-1 min-w-[200px]"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
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
    </AppPage>
  )
}

const Focus = () => (
  <AppPage>
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">Focus timer TBD</div>
    </div>
  </AppPage>
)

const History = () => (
  <AppPage>
    <div className="card bg-neutral text-neutral-content">
      <div className="card-body">History TBD</div>
    </div>
  </AppPage>
)

const About = () => (
  <AppPage>
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body space-y-3">
        <h1 className="card-title text-3xl font-semibold">About TempoForge</h1>
        <p>
          TempoForge blends productivity dashboards with game-inspired HUDs. Use the navigation toggle to move between
          layouts and find the presentation that keeps you in the zone.
        </p>
      </div>
    </div>
  </AppPage>
)

const router = createBrowserRouter([
  { path: '/', element: <Dashboard /> },
  { path: '/projects', element: <Projects /> },
  { path: '/focus', element: <Focus /> },
  { path: '/history', element: <History /> },
  { path: '/settings', element: <Settings /> },
  { path: '/about', element: <About /> },
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

  return (
    <UserSettingsProvider>
      <SprintProvider>
        <RouterProvider router={router} />
      </SprintProvider>
    </UserSettingsProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>,
)


