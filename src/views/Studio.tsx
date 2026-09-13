import { useState, type FormEvent } from 'react'
import { NewId, Rule } from '../components/ui'
import { topicKey } from '../data/curriculum'
import { MANUSCRIPT_STAGES, READING_SLOTS } from '../data/life'
import { href } from '../lib/route'
import { useStore } from '../lib/store'
import type { Book, BookSlot, BookStatus, Manuscript, ManuscriptStage, Project } from '../lib/types'

export function LibraryPage() {
  const { store, upsertBook, removeBook } = useStore()
  const [draft, setDraft] = useState({
    title: '',
    author: '',
    topic: '',
    slot: 'knowledge' as BookSlot,
    why: '',
  })

  function add(e: FormEvent) {
    e.preventDefault()
    if (!draft.title.trim()) return
    upsertBook({
      id: NewId(),
      title: draft.title.trim(),
      author: draft.author.trim(),
      topic: draft.topic.trim(),
      slot: draft.slot,
      status: 'want',
      rating: 0,
      why: draft.why.trim(),
      notes: '',
    })
    setDraft({ title: '', author: '', topic: '', slot: 'knowledge', why: '' })
  }

  return (
    <div>
      <span className="kicker">Four books at once, at most</span>
      <h1>Library</h1>
      <p className="lede">
        An Islamic book. A knowledge book. A novel. A book for the course you are actually taking.
        A personal library is a conversation you keep.
      </p>

      <div className="grid-2" style={{ margin: '24px 0' }}>
        {READING_SLOTS.map((slot) => {
          const current = store.books.find((b) => b.slot === slot.id && b.status === 'reading')
          return (
            <article className="panel" key={slot.id}>
              <span className="kicker">{slot.label}</span>
              <h3>{current ? current.title : 'Empty chair'}</h3>
              <p className="muted">{current ? current.author : slot.note}</p>
            </article>
          )
        })}
      </div>

      <form className="panel" onSubmit={add}>
        <h3>Add a book</h3>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <label className="field">
            <span>Title</span>
            <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </label>
          <label className="field">
            <span>Author</span>
            <input value={draft.author} onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))} />
          </label>
          <label className="field">
            <span>Topic</span>
            <input value={draft.topic} onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))} />
          </label>
          <label className="field">
            <span>Slot</span>
            <select
              value={draft.slot}
              onChange={(e) => setDraft((d) => ({ ...d, slot: e.target.value as BookSlot }))}
            >
              {READING_SLOTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field" style={{ marginTop: 12 }}>
          <span>Why this book</span>
          <input value={draft.why} onChange={(e) => setDraft((d) => ({ ...d, why: e.target.value }))} />
        </label>
        <button className="gold" type="submit" style={{ marginTop: 14 }}>
          Shelve it
        </button>
      </form>

      <Rule>The shelves</Rule>
      <div className="stack">
        {store.books.map((book) => (
          <BookCard key={book.id} book={book} onSave={upsertBook} onRemove={() => removeBook(book.id)} />
        ))}
      </div>
    </div>
  )
}

function BookCard({
  book,
  onSave,
  onRemove,
}: {
  book: Book
  onSave: (b: Book) => void
  onRemove: () => void
}) {
  return (
    <article className="panel">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <span className="kicker">{book.slot} · {book.topic || 'unfiled'}</span>
          <h3>{book.title}</h3>
          <p className="muted">{book.author}</p>
        </div>
        <div className="row">
          {(['want', 'reading', 'finished'] as BookStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              className={book.status === status ? 'chip on' : 'chip'}
              onClick={() => onSave({ ...book, status })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      {book.why ? <p>{book.why}</p> : null}
      <label className="field">
        <span>Notes · ideas · disagreements · what to research next</span>
        <textarea value={book.notes} onChange={(e) => onSave({ ...book, notes: e.target.value })} />
      </label>
      <div className="row" style={{ marginTop: 10 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={book.rating >= n ? 'chip on' : 'chip'}
            onClick={() => onSave({ ...book, rating: n })}
          >
            {n}
          </button>
        ))}
        <button className="ghost danger" type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
    </article>
  )
}

export function AuthorPage() {
  const { store, addIdea, removeIdea, upsertManuscript, removeManuscript } = useStore()
  const [idea, setIdea] = useState('')
  const [m, setM] = useState({
    title: '',
    genre: '',
    premise: '',
    theme: '',
  })

  function addBook(e: FormEvent) {
    e.preventDefault()
    if (!m.title.trim()) return
    upsertManuscript({
      id: NewId(),
      title: m.title.trim(),
      genre: m.genre.trim(),
      premise: m.premise.trim(),
      theme: m.theme.trim(),
      stage: 'idea',
      notes: '',
    })
    setM({ title: '', genre: '', premise: '', theme: '' })
  }

  return (
    <div>
      <span className="kicker">Write the actual books</span>
      <h1>Author’s room</h1>
      <p className="lede">
        Idea vault first. Then a manuscript with stages. Revision is structure; editing is polish.
        Do not confuse the two.
      </p>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault()
            if (!idea.trim()) return
            addIdea(idea.trim())
            setIdea('')
          }}
        >
          <h3>Idea vault</h3>
          <label className="field">
            <span>A sentence is enough</span>
            <textarea value={idea} onChange={(e) => setIdea(e.target.value)} />
          </label>
          <button className="gold" type="submit">
            Keep
          </button>
          <ul className="list" style={{ marginTop: 16 }}>
            {store.ideas.map((item) => (
              <li key={item.id}>
                <span>{item.text}</span>
                <button className="danger" type="button" onClick={() => removeIdea(item.id)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </form>
        <form className="panel" onSubmit={addBook}>
          <h3>New manuscript</h3>
          <label className="field">
            <span>Title</span>
            <input value={m.title} onChange={(e) => setM((d) => ({ ...d, title: e.target.value }))} />
          </label>
          <label className="field">
            <span>Genre</span>
            <input value={m.genre} onChange={(e) => setM((d) => ({ ...d, genre: e.target.value }))} />
          </label>
          <label className="field">
            <span>Premise</span>
            <textarea value={m.premise} onChange={(e) => setM((d) => ({ ...d, premise: e.target.value }))} />
          </label>
          <label className="field">
            <span>Theme</span>
            <input value={m.theme} onChange={(e) => setM((d) => ({ ...d, theme: e.target.value }))} />
          </label>
          <button className="gold" type="submit">
            Open a book
          </button>
        </form>
      </div>

      <Rule>On the desk</Rule>
      <div className="stack">
        {store.manuscripts.map((book) => (
          <ManuscriptCard
            key={book.id}
            book={book}
            onSave={upsertManuscript}
            onRemove={() => removeManuscript(book.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ManuscriptCard({
  book,
  onSave,
  onRemove,
}: {
  book: Manuscript
  onSave: (m: Manuscript) => void
  onRemove: () => void
}) {
  return (
    <article className="panel">
      <span className="kicker">{book.genre || 'manuscript'}</span>
      <h3>{book.title}</h3>
      <p>{book.premise}</p>
      {book.theme ? <p className="muted">Theme · {book.theme}</p> : null}
      <div className="row">
        {MANUSCRIPT_STAGES.map((stage) => (
          <button
            key={stage.id}
            type="button"
            className={book.stage === stage.id ? 'chip on' : 'chip'}
            onClick={() => onSave({ ...book, stage: stage.id as ManuscriptStage })}
          >
            {stage.label}
          </button>
        ))}
      </div>
      <label className="field" style={{ marginTop: 12 }}>
        <span>Notes · characters · setting · conflict · ending</span>
        <textarea value={book.notes} onChange={(e) => onSave({ ...book, notes: e.target.value })} />
      </label>
      <button className="ghost danger" type="button" onClick={onRemove} style={{ marginTop: 10 }}>
        Remove
      </button>
    </article>
  )
}

export function CuriosityPage() {
  const { store, addCuriosity, toggleCuriosity, removeCuriosity, addDaily } = useStore()
  const [text, setText] = useState('')

  return (
    <div>
      <span className="kicker">Things I want to know just because</span>
      <h1>The infinite list</h1>
      <p className="lede">
        Whenever you hear something and think <i>wait… what is that?</i> — it belongs here.
      </p>
      <form
        className="panel"
        style={{ margin: '24px 0' }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          addCuriosity(text.trim())
          setText('')
        }}
      >
        <label className="field">
          <span>A new curiosity</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="How stained glass is made…" />
        </label>
        <button className="gold" type="submit" style={{ marginTop: 12 }}>
          Add
        </button>
      </form>
      <div className="stack">
        {store.curiosity.map((item) => (
          <article className="panel" key={item.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className={item.learned ? 'topic on' : 'topic'}
                onClick={() => toggleCuriosity(item.id)}
                style={{ flex: 1 }}
              >
                <span className="check" />
                <span>{item.text}</span>
              </button>
              <div className="row">
                <button
                  className="ghost"
                  type="button"
                  onClick={() =>
                    addDaily({
                      date: new Date().toISOString().slice(0, 10),
                      what: item.text,
                      why: 'It was on the curiosity list.',
                      connect: '',
                      more: true,
                    })
                  }
                >
                  Log as learned
                </button>
                <button className="danger" type="button" onClick={() => removeCuriosity(item.id)}>
                  ×
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function DailyPage() {
  const { store, addDaily, removeDaily } = useStore()
  const [form, setForm] = useState({
    what: '',
    why: '',
    connect: '',
    more: false,
  })

  return (
    <div>
      <span className="kicker">One tiny thing a day</span>
      <h1>Today I learned</h1>
      <p className="lede">
        After a year you will have three hundred and sixty-five things you understand better than
        you did before — even on the days the rest of the university is asleep.
      </p>
      <form
        className="panel"
        style={{ margin: '24px 0' }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.what.trim()) return
          addDaily({
            date: new Date().toISOString().slice(0, 10),
            what: form.what.trim(),
            why: form.why.trim(),
            connect: form.connect.trim(),
            more: form.more,
          })
          setForm({ what: '', why: '', connect: '', more: false })
        }}
      >
        <label className="field">
          <span>What?</span>
          <input value={form.what} onChange={(e) => setForm((f) => ({ ...f, what: e.target.value }))} />
        </label>
        <label className="field">
          <span>Why is it interesting?</span>
          <input value={form.why} onChange={(e) => setForm((f) => ({ ...f, why: e.target.value }))} />
        </label>
        <label className="field">
          <span>What does it connect to?</span>
          <input value={form.connect} onChange={(e) => setForm((f) => ({ ...f, connect: e.target.value }))} />
        </label>
        <label className="row" style={{ marginTop: 10 }}>
          <input
            type="checkbox"
            checked={form.more}
            onChange={(e) => setForm((f) => ({ ...f, more: e.target.checked }))}
          />
          I want to learn more
        </label>
        <button className="gold" type="submit">
          Keep this day
        </button>
      </form>
      <div className="stack">
        {store.daily.map((entry) => (
          <article className="panel" key={entry.id}>
            <span className="kicker">{entry.date}</span>
            <h3>{entry.what}</h3>
            {entry.why ? <p>{entry.why}</p> : null}
            {entry.connect ? <p className="muted">Connects to · {entry.connect}</p> : null}
            {entry.more ? <span className="chip on">learn more</span> : null}
            <div>
              <button className="ghost danger" type="button" onClick={() => removeDaily(entry.id)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function ProjectsPage() {
  const { store, upsertProject, removeProject } = useStore()
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('software')

  return (
    <div>
      <span className="kicker">Semester proof</span>
      <h1>Projects</h1>
      <p className="lede">
        A subject is finished when something exists: an app, a kit, a timeline, a notebook, a book.
      </p>
      <form
        className="panel"
        style={{ margin: '24px 0' }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          upsertProject({ id: NewId(), title: title.trim(), kind, status: 'seed', notes: '' })
          setTitle('')
        }}
      >
        <div className="grid-2">
          <label className="field">
            <span>Project</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="field">
            <span>Kind</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="software">Software</option>
              <option value="craft">Craft</option>
              <option value="writing">Writing</option>
              <option value="deen">Deen</option>
              <option value="life">Life</option>
              <option value="literature">Literature</option>
            </select>
          </label>
        </div>
        <button className="gold" type="submit" style={{ marginTop: 12 }}>
          Plant
        </button>
      </form>
      <div className="grid-2">
        {store.projects.map((p) => (
          <ProjectCard key={p.id} project={p} onSave={upsertProject} onRemove={() => removeProject(p.id)} />
        ))}
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  onSave,
  onRemove,
}: {
  project: Project
  onSave: (p: Project) => void
  onRemove: () => void
}) {
  return (
    <article className="panel">
      <span className="kicker">{project.kind}</span>
      <h3>{project.title}</h3>
      <div className="row">
        {(['seed', 'active', 'resting', 'made'] as const).map((status) => (
          <button
            key={status}
            type="button"
            className={project.status === status ? 'chip on' : 'chip'}
            onClick={() => onSave({ ...project, status })}
          >
            {status}
          </button>
        ))}
      </div>
      <label className="field" style={{ marginTop: 12 }}>
        <span>Notes</span>
        <textarea value={project.notes} onChange={(e) => onSave({ ...project, notes: e.target.value })} />
      </label>
      <button className="ghost danger" type="button" onClick={onRemove} style={{ marginTop: 10 }}>
        Remove
      </button>
    </article>
  )
}

export function QuranPage() {
  const { store, addQuran, removeQuran } = useStore()
  const [note, setNote] = useState({
    surah: '',
    ayah: '',
    translation: '',
    vocabulary: '',
    context: '',
    tafsir: '',
    learned: '',
    applies: '',
    action: '',
  })

  return (
    <div>
      <span className="kicker">Company with the Book</span>
      <h1>Qur’an journal</h1>
      <p className="lede">
        Ayah, meaning, words, context, tafsir, what you learned, how it applies, and one action.
        Quran.com is a good study table. A teacher is still the door.
      </p>
      <form
        className="panel"
        style={{ margin: '24px 0' }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!note.surah.trim() && !note.translation.trim()) return
          addQuran({ ...note, date: new Date().toISOString().slice(0, 10) })
          setNote({
            surah: '',
            ayah: '',
            translation: '',
            vocabulary: '',
            context: '',
            tafsir: '',
            learned: '',
            applies: '',
            action: '',
          })
        }}
      >
        <div className="grid-2">
          <label className="field">
            <span>Surah</span>
            <input value={note.surah} onChange={(e) => setNote((n) => ({ ...n, surah: e.target.value }))} />
          </label>
          <label className="field">
            <span>Ayah</span>
            <input value={note.ayah} onChange={(e) => setNote((n) => ({ ...n, ayah: e.target.value }))} />
          </label>
        </div>
        {(
          [
            ['translation', 'Translation'],
            ['vocabulary', 'Important vocabulary'],
            ['context', 'Context'],
            ['tafsir', 'Tafsir'],
            ['learned', 'What I learned'],
            ['applies', 'How it applies to my life'],
            ['action', 'Action I want to take'],
          ] as const
        ).map(([key, label]) => (
          <label className="field" key={key} style={{ marginTop: 10 }}>
            <span>{label}</span>
            <textarea value={note[key]} onChange={(e) => setNote((n) => ({ ...n, [key]: e.target.value }))} />
          </label>
        ))}
        <button className="gold" type="submit" style={{ marginTop: 14 }}>
          Keep this ayah
        </button>
      </form>
      <div className="stack">
        {store.quran.map((q) => (
          <article className="panel" key={q.id}>
            <span className="kicker">{q.date}</span>
            <h3>
              {q.surah} {q.ayah}
            </h3>
            <p className="quote">{q.translation}</p>
            {q.learned ? <p>{q.learned}</p> : null}
            {q.action ? <p className="muted">Action · {q.action}</p> : null}
            <button className="ghost danger" type="button" onClick={() => removeQuran(q.id)}>
              Remove
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}

export function SearchPage({ q }: { q: string }) {
  const { store, schoolById } = useStore()
  const query = q.trim().toLowerCase()
  const courses = query
    ? store.courses.filter((c) =>
        `${c.title} ${c.code} ${c.summary} ${c.topics.join(' ')}`.toLowerCase().includes(query),
      )
    : []
  const topics = query
    ? store.courses.flatMap((course) =>
        course.topics
          .filter((topic) => topic.toLowerCase().includes(query))
          .map((topic) => ({ course, topic, key: topicKey(course.id, topic) })),
      )
    : []

  return (
    <div>
      <span className="kicker">Look through the garden</span>
      <h1>{query ? `“${q}”` : 'Search'}</h1>
      {!query ? <p className="lede">Type a word in the bar above — philosophy, salah, inflation, scrapbooking.</p> : null}
      {query && courses.length === 0 && topics.length === 0 ? (
        <p className="lede">Nothing by that name yet. Add it to curiosity if it should exist.</p>
      ) : null}
      {courses.length ? (
        <>
          <Rule>Courses</Rule>
          <div className="stack">
            {courses.map((c) => {
              const school = schoolById(c.school)
              return (
                <a className="panel" href={href(`course/${c.id}`)} key={c.id}>
                  <span className="kicker">{c.code} · {school?.name}</span>
                  <h3>{c.title}</h3>
                  <p className="muted">{c.summary}</p>
                </a>
              )
            })}
          </div>
        </>
      ) : null}
      {topics.length ? (
        <>
          <Rule>Topics</Rule>
          <ul className="list">
            {topics.slice(0, 40).map((t) => (
              <li key={t.key}>
                <a href={href(`course/${t.course.id}`)}>
                  {t.topic} · {t.course.code}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
