import { currentTerm, KINDS, MANIFESTO, TERMS, todayPlan } from '../data/life'
import { href } from '../lib/route'
import { useStore } from '../lib/store'
import { pct, Progress, Ring, Rule } from '../components/ui'

const TILE: Record<string, string> = {
  islam: 'wide',
  career: 'wide',
  intellect: 'span2',
  world: 'span2',
  science: 'span2',
  writing: 'span2',
  literature: 'span2',
  art: 'span2',
  life: 'span3',
  inner: 'span3',
}

export function Home() {
  const { progress, store, addSchool } = useStore()
  const term = TERMS[currentTerm()]
  const today = todayPlan()
  const overall = progress.overall
  const islamCourses = store.courses.filter((c) => c.school === 'islam').length

  return (
    <div>
      <section className="hero">
        <div>
          <span className="kicker">stitched for a whole life</span>
          <div className="arab-hero">روضة العلم</div>
          <h1>A scrapbook, not a grind.</h1>
          <p className="lede">
            Pink pages, serious mind. Click anything and rewrite it. Add schools, courses, little
            notes, washi-tape projects. Islam stays the foundation — the rest you collage into
            the girl you are becoming.
          </p>
        </div>
        <aside className="manifesto">
          <span className="kicker" style={{ color: 'var(--gold-2)' }}>
            The aim
          </span>
          <ol>
            {MANIFESTO.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </aside>
      </section>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <article className="panel">
          <span className="kicker">Curriculum</span>
          <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="stat">{pct(overall.done, overall.total)}%</div>
              <p className="muted small">
                {overall.done} of {overall.total} topics kept.
              </p>
            </div>
            <Ring value={pct(overall.done, overall.total)} label="Overall progress" />
          </div>
        </article>
        <article className="panel">
          <span className="kicker">{term.season}</span>
          <h3>{term.name}</h3>
          <p className="muted">{term.months}</p>
          <p>
            Minors: {term.minors.map((m) => m.name).join(' · ')}
          </p>
          <a className="gold" href={href('semester')} style={{ marginTop: 12 }}>
            Open the term
          </a>
        </article>
        <article className="panel dark">
          <span className="kicker" style={{ color: 'var(--gold-2)' }}>
            Today · {today.day}
          </span>
          <h3>A small honest day</h3>
          <ul className="list">
            {today.items.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <span>{item.minutes} min</span>
              </li>
            ))}
          </ul>
          <p className="small" style={{ opacity: 0.7, marginBottom: 0 }}>
            Work and salah come first. This is enrichment, not another whip.
          </p>
        </article>
      </div>

      <Rule>Four kinds of learning</Rule>
      <div className="kinds">
        {KINDS.map((k) => (
          <div className="kind" key={k.id}>
            <b>{k.name}</b>
            <p className="muted">{k.line}</p>
          </div>
        ))}
      </div>

      <Rule>The schools</Rule>
      <div className="mosaic">
        {store.schools.map((school) => {
          const p = progress.school(school.id)
          return (
            <a
              key={school.id}
              className={`school-tile ${TILE[school.id] || 'span2'} tone-${school.tone}`}
              href={href(`school/${school.id}`)}
            >
              <div>
                <div className="no">School {school.number}{school.major ? ' · Major' : ''}</div>
                <h3>{school.name}</h3>
                <p>{school.tagline}</p>
              </div>
              <div>
                <div className="small muted">
                  {p.done}/{p.total} · mastery {store.mastery[school.id] ?? 0}/6
                </div>
                <Progress done={p.done} total={p.total} />
              </div>
            </a>
          )
        })}
        <button
          type="button"
          className="school-tile span2 add-tile"
          onClick={() => {
            const id = addSchool()
            window.location.hash = `#/school/${id}`
          }}
        >
          <h3>+ New school</h3>
          <p>Another field of your life.</p>
        </button>
      </div>

      <Rule>How a course is actually learned</Rule>
      <div className="grid-4">
        {['Learn', 'Explain', 'Apply', 'Create'].map((step, i) => (
          <article className="panel" key={step}>
            <span className="kicker">0{i + 1}</span>
            <h3>{step}</h3>
            <p className="muted">
              {step === 'Learn' && 'Sit with the thing until it has edges.'}
              {step === 'Explain' && 'Say it without notes. If you cannot, you do not have it yet.'}
              {step === 'Apply' && 'Find it in groceries, salah, code, a quarrel, a map.'}
              {step === 'Create' && 'Leave a page, a product, a timeline, a kit, a book.'}
            </p>
          </article>
        ))}
      </div>

      <p className="footer-note">
        {store.courses.length} courses · {store.schools.length} schools
        {islamCourses ? ` · ${islamCourses} in deen` : ''}.
        Click to edit. Export to keep a copy.
      </p>
    </div>
  )
}
