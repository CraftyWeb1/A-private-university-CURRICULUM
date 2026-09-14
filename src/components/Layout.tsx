import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { href, type Path } from '../lib/route'
import { useStore } from '../lib/store'

const PLAN = [
  { href: href('planner'), label: 'Planner', view: 'planner' },
  { href: href('semester'), label: 'This semester', view: 'semester' },
  { href: href('week'), label: 'This week', view: 'week' },
  { href: href('year'), label: 'Year one', view: 'year' },
  { href: href('transcript'), label: 'Transcript', view: 'transcript' },
]

const STUDIO = [
  { href: href('library'), label: 'Library', view: 'library' },
  { href: href('author'), label: 'Author’s room', view: 'author' },
  { href: href('quran'), label: 'Qur’an journal', view: 'quran' },
  { href: href('curiosity'), label: 'Curiosity', view: 'curiosity' },
  { href: href('daily'), label: 'Daily knowledge', view: 'daily' },
  { href: href('projects'), label: 'Projects', view: 'projects' },
]

export function Layout({ path, children }: { path: Path; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { store, download, upload, addSchool, addPage, courseById } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const active = path.view
  const schoolId =
    path.view === 'school' ? path.id : path.view === 'course' ? courseById(path.id)?.school : undefined
  const pageId = path.view === 'page' ? path.id : undefined

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const q = String(data.get('q') || '').trim()
    window.location.hash = q ? `/search?q=${encodeURIComponent(q)}` : '/search'
  }

  return (
    <div className="shell">
      {open ? <div className="backdrop" onClick={() => setOpen(false)} /> : null}
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <a className="brand" href={href('')} onClick={() => setOpen(false)}>
          <span className="arab">دار العلم</span>
          <strong>Dar al-Ilm</strong>
          <small>a handmade university</small>
        </a>
        <nav className="nav" onClick={() => setOpen(false)}>
          <a className={active === 'home' ? 'active' : ''} href={href('')}>
            The journal
          </a>
          <div className="nav-label">Schools</div>
          {store.schools.map((s) => (
            <a
              key={s.id}
              className={schoolId === s.id ? 'active' : ''}
              href={href(`school/${s.id}`)}
            >
              <span className="num">{s.number}</span>
              {s.short}
            </a>
          ))}
          <button
            className="linkish"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              const id = addSchool()
              setOpen(false)
              window.location.hash = `#/school/${id}`
            }}
          >
            + New school
          </button>
          <div className="nav-label">Pages</div>
          {store.pages.map((p) => (
            <a key={p.id} className={pageId === p.id ? 'active' : ''} href={href(`page/${p.id}`)}>
              {p.title || 'Untitled'}
            </a>
          ))}
          <button
            className="linkish"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              const id = addPage()
              setOpen(false)
              window.location.hash = `#/page/${id}`
            }}
          >
            + New page
          </button>
          <div className="nav-label">Plan</div>
          {PLAN.map((item) => (
            <a key={item.view} className={active === item.view ? 'active' : ''} href={item.href}>
              {item.label}
            </a>
          ))}
          <div className="nav-label">Studio</div>
          {STUDIO.map((item) => (
            <a key={item.view} className={active === item.view ? 'active' : ''} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="nav-label">Keep it</div>
        <div className="nav">
          <button className="linkish" type="button" onClick={download}>
            Export notebook
          </button>
          <button className="linkish" type="button" onClick={() => fileRef.current?.click()}>
            Import notebook
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              file.text().then(upload)
              e.target.value = ''
            }}
          />
        </div>
      </aside>
      <div className="stage">
        <header className="topbar">
          <button className="ghost menu-btn" type="button" onClick={() => setOpen(true)}>
            Menu
          </button>
          <form className="search" onSubmit={onSearch}>
            <input
              name="q"
              placeholder="Search a subject, a thinker, a skill…"
              defaultValue={path.view === 'search' ? path.q : ''}
            />
            <button className="gold" type="submit">
              Look
            </button>
          </form>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  )
}
