import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'
import './index.css'

console.log("API base:", import.meta.env.VITE_API_BASE_URL);

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-4">
      <div className="navbar bg-base-200 rounded-box mb-4">
        <div className="flex-1"><Link className="btn btn-ghost text-xl" to="/">TempoForge</Link></div>
        <div className="flex-none gap-2">
          <Link className="btn btn-sm" to="/projects">Projects</Link>
          <Link className="btn btn-sm" to="/focus">Focus</Link>
          <Link className="btn btn-sm" to="/history">History</Link>
        </div>
      </div>
      {children}
    </div>
  )
}

function Home() {
  const [data, setData] = React.useState<any>(null)
  React.useEffect(() => {
    fetch(`${API_BASE}/api/health`).then(r => r.json()).then(setData).catch(console.error)
  }, [])
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-2">Health</h1>
      <pre className="bg-base-200 p-3 rounded-box overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </Layout>
  )
}

function Projects() {
  const [items, setItems] = React.useState<any[]>([])
  const [name, setName] = React.useState('')
  const [track, setTrack] = React.useState('Work')

  const load = () => fetch(`${API_BASE}/api/projects`).then(r => r.json()).then(setItems)
  React.useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`${API_BASE}/api/projects`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, track, pinned: false })
    })
    setName(''); load()
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-2">Projects</h1>
      <form className="flex gap-2 mb-4" onSubmit={submit}>
        <input className="input input-bordered" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <select className="select select-bordered" value={track} onChange={e => setTrack(e.target.value)}>
          <option>Work</option>
          <option>Study</option>
        </select>
        <button className="btn" type="submit">Add</button>
      </form>
      <ul className="space-y-2">
        {items.map(p => (
          <li key={p.id} className="card bg-base-200 p-3">{p.name} <span className="badge ml-2">{p.track}</span></li>
        ))}
      </ul>
    </Layout>
  )
}

const Focus = () => <Layout><div>Focus timer TBD</div></Layout>
const History = () => <Layout><div>History TBD</div></Layout>

const router = createBrowserRouter([
  { path: '/', element: <Home/> },
  { path: '/projects', element: <Projects/> },
  { path: '/focus', element: <Focus/> },
  { path: '/history', element: <History/> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
