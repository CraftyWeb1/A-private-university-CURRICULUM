import { MASTERY } from '../data/curriculum'
import { currentTerm, MAJORS, TERMS, WEEK, YEAR_ONE } from '../data/life'
import { href } from '../lib/route'
import { useStore } from '../lib/store'
import { pct, Progress, Rule } from '../components/ui'

export function SemesterPage() {
  const termId = currentTerm()
  const term = TERMS[termId]
  const { progress, schoolById, courseById } = useStore()

  return (
    <div>
      <span className="kicker">{term.season}</span>
      <h1>{term.name}</h1>
      <p className="lede">
        {term.months}. Two or three serious subjects, one creative project, Islamic studies, and
        personal reading. That is enough.
      </p>

      <Rule>Permanent majors</Rule>
      <div className="grid-3">
        {MAJORS.map((m) => {
          const school = schoolById(m.school)
          if (!school) return null
          const p = progress.school(m.school)
          return (
            <a className={`panel tone-${school.tone}`} href={href(`school/${m.school}`)} key={m.school}>
              <span className="kicker">Major</span>
              <h3>{m.name}</h3>
              <p className="muted">{school.tagline}</p>
              <Progress done={p.done} total={p.total} />
            </a>
          )
        })}
      </div>

      <Rule>This term’s load</Rule>
      <div className="grid-2">
        <article className="panel">
          <span className="kicker">Core</span>
          <ul className="list">
            {term.cores.map((id) => {
              const c = courseById(id)
              if (!c) return null
              return (
                <li key={id}>
                  <a href={href(`course/${id}`)}>
                    {c.code} · {c.title}
                  </a>
                </li>
              )
            })}
          </ul>
          <span className="kicker">Minors</span>
          <ul className="list">
            {term.minors.map((m) => (
              <li key={m.course}>
                <a href={href(`course/${m.course}`)}>
                  {m.name}
                </a>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel dark">
          <span className="kicker" style={{ color: 'var(--gold-2)' }}>
            Make something
          </span>
          <p className="quote">{term.project}</p>
          <p>{term.reading}</p>
          <a className="gold" href={href('projects')}>
            Projects studio
          </a>
        </article>
      </div>
    </div>
  )
}

export function WeekPage() {
  const today = new Date().getDay()
  const todayIndex = today === 0 ? 6 : today - 1
  return (
    <div>
      <span className="kicker">A livable week</span>
      <h1>The hours are small on purpose.</h1>
      <p className="lede">
        School and work take priority when they must. This timetable is a trellis, not a prison.
        The college grid — exams, labs, remises — lives in the{' '}
        <a className="gold" href={href('planner')}>
          planner
        </a>
        .
      </p>
      <div className="week" style={{ marginTop: 24 }}>
        {WEEK.map((d, i) => (
          <article className={i === todayIndex ? 'day today' : 'day'} key={d.day}>
            <h3>{d.day}</h3>
            {d.items.map((item) => (
              <div className="block" key={item.label}>
                <b>{item.label}</b>
                <div className="small muted">{item.minutes} minutes</div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  )
}

export function YearPage() {
  const now = currentTerm()
  const { courseById } = useStore()
  return (
    <div>
      <span className="kicker">Suggested order</span>
      <h1>Year one</h1>
      <p className="lede">
        A path through the garden for the first four seasons — so you do not try to swallow
        seven hundred subjects in a weekend.
      </p>
      <div className="stack" style={{ marginTop: 24 }}>
        {YEAR_ONE.map((row) => {
          const term = TERMS[row.term]
          return (
            <article className="panel" key={row.term}>
              <span className="kicker">
                {term.name} · {term.months}
                {row.term === now ? ' · you are here' : ''}
              </span>
              <h3>{term.season}</h3>
              <p>{row.focus}</p>
              <p className="muted">
                Cores: {term.cores.map((id) => courseById(id)?.code).join(' · ')} · Minors:{' '}
                {term.minors.map((m) => m.name).join(', ')}
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function TranscriptPage() {
  const { store, progress } = useStore()
  return (
    <div>
      <span className="kicker">Record</span>
      <h1>Transcript</h1>
      <p className="lede">Not certificates. A honest picture of where you stand, and where you want to stand.</p>
      <div className="stack" style={{ marginTop: 24 }}>
        {store.schools.map((s) => {
          const p = progress.school(s.id)
          const level = store.mastery[s.id] ?? 0
          return (
            <article className="panel" key={s.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <span className="kicker">School {s.number}</span>
                  <h3>{s.name}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="stat" style={{ fontSize: 28 }}>
                    {(MASTERY[level] ?? MASTERY[0]).name}
                  </div>
                  <div className="small muted">
                    target {(MASTERY[s.targetMastery] ?? MASTERY[3]).name} · {pct(p.done, p.total)}% topics
                  </div>
                </div>
              </div>
              <Progress done={p.done} total={p.total} />
            </article>
          )
        })}
      </div>
    </div>
  )
}
