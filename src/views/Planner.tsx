import { useMemo, useState } from 'react'
import { topicKey } from '../data/curriculum'
import {
  COLLEGE_COURSES,
  addDays,
  collegeWeekOf,
  eventsOn,
  inSession,
  iso,
  kindLabel,
  minutes,
  parseIso,
  pocketsOn,
  slotsOn,
  startOfMonth,
  startOfWeek,
  upcomingEvents,
} from '../data/planner'
import { href } from '../lib/route'
import { useStore } from '../lib/store'
import type { PlannerKind, PlannerTask } from '../lib/types'
import { Rule } from '../components/ui'

const DAYS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']
const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]
const DAY_START = 8 * 60
const DAY_END = 19 * 60
const PX = 0.78

type Mode = 'week' | 'month' | 'courses'
type Draft = {
  date: string
  start: string
  end: string
  title: string
  note: string
  kind: PlannerKind
  schoolId: string
  courseId: string
  topic: string
}

function emptyDraft(date: string, patch: Partial<Draft> = {}): Draft {
  return {
    date,
    start: '',
    end: '',
    title: '',
    note: '',
    kind: 'life',
    schoolId: '',
    courseId: '',
    topic: '',
    ...patch,
  }
}

function fmtDay(d: Date) {
  return `${DAYS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}.`
}

function top(hhmm: string) {
  return Math.max(0, (minutes(hhmm) - DAY_START) * PX)
}

function height(start: string, end: string) {
  return Math.max(22, (minutes(end) - minutes(start)) * PX)
}

export function PlannerPage() {
  const {
    store,
    addPlannerTask,
    togglePlannerTask,
    removePlannerTask,
    togglePlannerEvent,
    setTopicStatus,
  } = useStore()
  const [mode, setMode] = useState<Mode>('week')
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState(iso(new Date()))
  const [draft, setDraft] = useState<Draft | null>(null)
  const [query, setQuery] = useState('')

  const today = iso(new Date())
  const weekStart = startOfWeek(cursor)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const ped = collegeWeekOf(cursor)
  const coming = upcomingEvents(new Date(), 21)
  const nextExam = coming.find((e) => e.kind === 'exam')
  const tasks = store.plannerTasks ?? []
  const doneMap = store.plannerDone ?? {}

  const monthGrid = useMemo(() => {
    const first = startOfMonth(cursor)
    const start = startOfWeek(first)
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
  }, [cursor])

  const selectedDate = parseIso(selected)
  const selectedSlots = slotsOn(selectedDate)
  const selectedEvents = eventsOn(selectedDate)
  const selectedTasks = tasks.filter((t) => t.date === selected)
  const selectedPockets = pocketsOn(selectedDate)

  const schools = store.schools
  const coursesForSchool = store.courses.filter((c) => !draft?.schoolId || c.school === draft.schoolId)
  const topicChoices = useMemo(() => {
    if (!draft?.courseId) return []
    const course = store.courses.find((c) => c.id === draft.courseId)
    if (!course) return []
    const q = query.trim().toLowerCase()
    return course.topics
      .filter((topic) => !store.checked[topicKey(course.id, topic)])
      .filter((topic) => !q || topic.toLowerCase().includes(q))
      .slice(0, 24)
  }, [draft?.courseId, query, store.courses, store.checked])

  function openDraft(date: string, patch: Partial<Draft> = {}) {
    setSelected(date)
    setDraft(emptyDraft(date, patch))
    setQuery('')
  }

  function saveDraft() {
    if (!draft) return
    const title =
      draft.title.trim() ||
      draft.topic.trim() ||
      (draft.kind === 'curriculum' ? 'Un morceau de curriculum' : 'Nouvelle tâche')
    addPlannerTask({
      date: draft.date,
      start: draft.start || undefined,
      end: draft.end || undefined,
      title,
      note: draft.note,
      kind: draft.kind,
      schoolId: draft.schoolId || undefined,
      courseId: draft.courseId || undefined,
      topic: draft.topic || undefined,
    })
    if (draft.courseId && draft.topic) {
      setTopicStatus(topicKey(draft.courseId, draft.topic), 'doing')
    }
    setSelected(draft.date)
    setDraft(null)
  }

  function flipTask(task: PlannerTask) {
    togglePlannerTask(task.id)
    if (task.courseId && task.topic) {
      setTopicStatus(topicKey(task.courseId, task.topic), task.done ? 'todo' : 'done')
    }
  }

  const heavyWeek = weekDays.some((d) => iso(d) === '2026-10-08')

  return (
    <div>
      <span className="kicker">Maisonneuve · session A2026</span>
      <h1>Planner</h1>
      <p className="lede">
        Tes sept cours, tes travaux, et les petits trous roses où coller du Dar al-Ilm — sans
        prétendre que le collège n’existe pas.
      </p>

      <div className="row planner-toolbar" style={{ marginTop: 18, justifyContent: 'space-between' }}>
        <div className="view-tabs" style={{ margin: 0, border: 0, padding: 0 }}>
          <button className={mode === 'week' ? 'on' : ''} type="button" onClick={() => setMode('week')}>
            Semaine
          </button>
          <button className={mode === 'month' ? 'on' : ''} type="button" onClick={() => setMode('month')}>
            Mois
          </button>
          <button className={mode === 'courses' ? 'on' : ''} type="button" onClick={() => setMode('courses')}>
            Mes cours
          </button>
        </div>
        <div className="row">
          <button
            className="ghost"
            type="button"
            onClick={() =>
              setCursor((d) =>
                mode === 'month' ? new Date(d.getFullYear(), d.getMonth() - 1, 1) : addDays(d, -7),
              )
            }
          >
            ←
          </button>
          <button
            className="ghost"
            type="button"
            onClick={() => {
              const now = new Date()
              setCursor(now)
              setSelected(iso(now))
            }}
          >
            Aujourd’hui
          </button>
          <button
            className="ghost"
            type="button"
            onClick={() =>
              setCursor((d) =>
                mode === 'month' ? new Date(d.getFullYear(), d.getMonth() + 1, 1) : addDays(d, 7),
              )
            }
          >
            →
          </button>
          <button className="gold" type="button" onClick={() => openDraft(selected, { kind: 'life' })}>
            + Tâche
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginTop: 18 }}>
        <article className="panel">
          <span className="kicker">Semaine collège</span>
          <div className="stat">{ped ? `S${ped.n}` : '—'}</div>
          <p className="muted small">{ped?.note || 'Jeudi → mercredi'}</p>
        </article>
        <article className="panel">
          <span className="kicker">Prochain examen</span>
          <h3 style={{ fontSize: 22 }}>{nextExam ? nextExam.title : 'Rien de collé'}</h3>
          <p className="muted small">
            {nextExam ? `${fmtDay(parseIso(nextExam.date))}${nextExam.start ? ` · ${nextExam.start}` : ''}` : 'Respire.'}
          </p>
        </article>
        <article className="panel">
          <span className="kicker">Dans 21 jours</span>
          <div className="stat">{coming.filter((e) => e.kind === 'exam' || e.kind === 'due' || e.kind === 'quiz').length}</div>
          <p className="muted small">examens, remises, quiz</p>
        </article>
        <article className="panel dark">
          <span className="kicker" style={{ color: 'var(--gold-2)' }}>
            Double seuil
          </span>
          <p className="small" style={{ marginBottom: 0 }}>
            Web 2, Hybrides, IoT, Sécurité : 60 % au cours et 50 % aux épreuves surveillées, sinon
            49 % max.
          </p>
        </article>
      </div>

      {heavyWeek ? (
        <div className="callout-pink" style={{ marginTop: 16 }}>
          <strong>8 octobre — deux intras le même jour.</strong>
          Hybrides 09:10–12:10 (30 %) et Sécurité 16:10–18:00 (25 %). Intra Web 2 le 13 oct, jour
          JSR — à confirmer (report probable 15–16 oct).
        </div>
      ) : null}

      {mode === 'week' ? (
        <>
          <Rule>Cette semaine</Rule>
          <p className="muted small">
            {fmtDay(weekDays[0])} → {fmtDay(weekDays[6])}
            {inSession(cursor) ? ' · grille présentielle' : ''}
          </p>
          <div className="planner-week">
            <div className="planner-hours">
              <div className="planner-head" />
              <div className="all-day" />
              {Array.from({ length: 12 }, (_, i) => (
                <div className="hour-label" key={i} style={{ height: 60 * PX }}>
                  {String(8 + i).padStart(2, '0')}:00
                </div>
              ))}
            </div>
            {weekDays.map((day) => {
              const key = iso(day)
              const isToday = key === today
              const slots = slotsOn(day)
              const evs = eventsOn(day)
              const dayTasks = tasks.filter((t) => t.date === key)
              const pockets = pocketsOn(day)
              const timed = [
                ...slots.map((s) => ({
                  key: s.id,
                  start: s.start,
                  end: s.end,
                  title: s.title,
                  meta: [s.room, s.teacher].filter(Boolean).join(' · '),
                  cls: s.kind === 'activity' ? 'blk-activity' : 'blk-class',
                  course: s.course,
                })),
                ...evs
                  .filter((e) => e.start)
                  .map((e) => ({
                    key: e.id,
                    start: e.start!,
                    end: e.end ?? e.start!,
                    title: e.title,
                    meta: [e.percent, kindLabel(e.kind)].filter(Boolean).join(' · '),
                    cls: `blk-${e.kind}`,
                    course: e.course,
                  })),
                ...dayTasks
                  .filter((t) => t.start)
                  .map((t) => ({
                    key: t.id,
                    start: t.start!,
                    end: t.end ?? t.start!,
                    title: t.title,
                    meta: kindLabel(t.kind),
                    cls: t.kind === 'curriculum' ? 'blk-curriculum' : 'blk-life',
                    course: '',
                  })),
              ]
              return (
                <div className={isToday ? 'planner-col today' : 'planner-col'} key={key}>
                  <button className="planner-head" type="button" onClick={() => openDraft(key)}>
                    <b>{DAYS[(day.getDay() + 6) % 7]}</b>
                    <span>{day.getDate()}</span>
                  </button>
                  <div className="all-day">
                    {evs
                      .filter((e) => !e.start)
                      .map((e) => (
                        <button
                          key={e.id}
                          className={`chip-ev ${e.kind} ${doneMap[e.id] ? 'done' : ''}`}
                          type="button"
                          onClick={() => togglePlannerEvent(e.id)}
                        >
                          {e.title}
                        </button>
                      ))}
                    {dayTasks
                      .filter((t) => !t.start)
                      .map((t) => (
                        <button
                          key={t.id}
                          className={`chip-ev ${t.kind} ${t.done ? 'done' : ''}`}
                          type="button"
                          onClick={() => flipTask(t)}
                        >
                          {t.title}
                        </button>
                      ))}
                  </div>
                  <div
                    className="planner-lane"
                    style={{ height: (DAY_END - DAY_START) * PX }}
                    onClick={(e) => {
                      if (e.target !== e.currentTarget) return
                      openDraft(key, { kind: 'curriculum' })
                    }}
                  >
                    {pockets.map((p) => (
                      <button
                        key={`${key}-${p.start}`}
                        className="pocket"
                        type="button"
                        style={{ top: top(p.start), height: height(p.start, p.end) }}
                        onClick={() =>
                          openDraft(key, {
                            kind: 'curriculum',
                            start: p.start,
                            end: p.end,
                            title: '',
                          })
                        }
                      >
                        {p.label}
                      </button>
                    ))}
                    {timed.map((b) => (
                      <div
                        key={b.key}
                        className={`blk ${b.cls}`}
                        style={{ top: top(b.start), height: height(b.start, b.end) }}
                      >
                        <b>{b.title}</b>
                        <span>
                          {b.start}–{b.end}
                          {b.meta ? ` · ${b.meta}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : null}

      {mode === 'month' ? (
        <>
          <Rule>{`${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}</Rule>
          <div className="planner-month-wrap">
            <div className="planner-month">
              {DAYS.map((d) => (
                <div className="month-dow" key={d}>
                  {d}
                </div>
              ))}
              {monthGrid.map((day) => {
                const key = iso(day)
                const outside = day.getMonth() !== cursor.getMonth()
                const evs = eventsOn(day)
                const dayTasks = tasks.filter((t) => t.date === key)
                const chips = [
                  ...evs.map((e) => ({ id: e.id, title: e.title, kind: e.kind })),
                  ...dayTasks.map((t) => ({ id: t.id, title: t.title, kind: t.kind })),
                ]
                return (
                  <button
                    key={key}
                    type="button"
                    className={`month-cell ${outside ? 'out' : ''} ${key === today ? 'today' : ''} ${key === selected ? 'pick' : ''}`}
                    onClick={() => setSelected(key)}
                    onDoubleClick={() => openDraft(key)}
                  >
                    <span className="num">{day.getDate()}</span>
                    {chips.slice(0, 3).map((c) => (
                      <span className={`chip-ev ${c.kind}`} key={c.id}>
                        {c.title}
                      </span>
                    ))}
                    {chips.length > 3 ? <span className="more">+{chips.length - 3}</span> : null}
                  </button>
                )
              })}
            </div>
            <aside className="panel day-sheet">
              <span className="kicker">{fmtDay(selectedDate)}</span>
              <h3>Cette journée</h3>
              {!selectedSlots.length && !selectedEvents.length && !selectedTasks.length ? (
                <p className="muted">Rien de collé. Un trou, donc un cadeau.</p>
              ) : null}
              <ul className="list">
                {selectedSlots.map((s) => (
                  <li key={s.id}>
                    <span>
                      <b>
                        {s.start}–{s.end}
                      </b>{' '}
                      {s.title}
                      <div className="small muted">
                        {s.room} {s.teacher ? `· ${s.teacher}` : ''}
                      </div>
                    </span>
                  </li>
                ))}
                {selectedEvents.map((e) => (
                  <li key={e.id}>
                    <span>
                      <button
                        className={`check ${doneMap[e.id] ? 'filled' : ''}`}
                        type="button"
                        onClick={() => togglePlannerEvent(e.id)}
                        aria-label="Marquer"
                      />{' '}
                      {e.start ? `${e.start} · ` : ''}
                      {e.title}
                      {e.percent ? ` (${e.percent})` : ''}
                      {e.confirm ? ' · à confirmer' : ''}
                      <div className="small muted">
                        {kindLabel(e.kind)} · {e.course}
                      </div>
                    </span>
                  </li>
                ))}
                {selectedTasks.map((t) => (
                  <li key={t.id}>
                    <span className="edit-row">
                      <button
                        className={`check ${t.done ? 'filled' : ''}`}
                        type="button"
                        onClick={() => flipTask(t)}
                      />
                      <span className={t.done ? 'done-text' : ''}>
                        {t.start ? `${t.start} · ` : ''}
                        {t.title}
                        <div className="small muted">
                          {kindLabel(t.kind)}
                          {t.topic ? ` · ${t.topic}` : ''}
                        </div>
                      </span>
                      <button className="icon-x" type="button" onClick={() => removePlannerTask(t.id)}>
                        ×
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              {selectedPockets.length ? (
                <p className="small muted">
                  Trous : {selectedPockets.map((p) => `${p.start}–${p.end}`).join(' · ')}
                </p>
              ) : null}
              <div className="row" style={{ marginTop: 12 }}>
                <button className="gold" type="button" onClick={() => openDraft(selected, { kind: 'life' })}>
                  + Tâche
                </button>
                <button
                  className="ghost"
                  type="button"
                  onClick={() => {
                    const pocket = selectedPockets[0]
                    openDraft(selected, {
                      kind: 'curriculum',
                      start: pocket?.start ?? '',
                      end: pocket?.end ?? '',
                    })
                  }}
                >
                  + Curriculum
                </button>
              </div>
            </aside>
          </div>
        </>
      ) : null}

      {mode === 'courses' ? (
        <>
          <Rule>Les sept cours</Rule>
          <div className="grid-2">
            {COLLEGE_COURSES.map((c) => {
              const next = coming.filter((e) => e.course === c.code).slice(0, 4)
              return (
                <article className="panel" key={c.code}>
                  <span className="kicker" style={{ color: c.color }}>
                    {c.code}
                  </span>
                  <h3>
                    {c.short} · {c.title}
                  </h3>
                  <p className="muted small">
                    {c.teacher} · {c.room}
                  </p>
                  <p>{c.note}</p>
                  <ul className="list">
                    {next.length ? (
                      next.map((e) => (
                        <li key={e.id}>
                          <span>
                            {fmtDay(parseIso(e.date))} · {e.title}
                          </span>
                          <span className="small">{e.percent || kindLabel(e.kind)}</span>
                        </li>
                      ))
                    ) : (
                      <li>
                        <span className="muted">Rien dans les 21 prochains jours.</span>
                      </li>
                    )}
                  </ul>
                  <a className="gold" href={href(`school/${c.schoolHint}`)}>
                    Relier à {c.schoolHint === 'career' ? 'Career' : c.schoolHint === 'literature' ? 'Literature' : 'Intellect'}
                  </a>
                </article>
              )
            })}
          </div>
        </>
      ) : null}

      <Rule>À coller dans la semaine</Rule>
      <p className="lede" style={{ fontSize: 16 }}>
        Clique un trou rose, ou choisis un sujet encore ouvert. Ça devient une tâche sur le jour
        — et le topic passe en « en train ».
      </p>
      <CurriculumTray
        onPlace={(schoolId, courseId, topic) => {
          const pocket = selectedPockets[0]
          openDraft(selected, {
            kind: 'curriculum',
            schoolId,
            courseId,
            topic,
            title: topic,
            start: pocket?.start ?? '',
            end: pocket?.end ?? '',
          })
        }}
      />

      {coming.length ? (
        <>
          <Rule>Les 21 prochains jours</Rule>
          <ul className="list coming-list">
            {coming.slice(0, 12).map((e) => (
              <li key={e.id}>
                <span>
                  <b>{fmtDay(parseIso(e.date))}</b>
                  {e.start ? ` ${e.start}` : ''} — {e.title}
                  <div className="small muted">
                    {e.course} · {kindLabel(e.kind)}
                    {e.confirm ? ' · à confirmer' : ''}
                  </div>
                </span>
                <span>{e.percent || ''}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {draft ? (
        <div className="composer-back" onClick={() => setDraft(null)}>
          <form
            className="panel composer"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault()
              saveDraft()
            }}
          >
            <span className="kicker">Coller dans l’agenda</span>
            <h3>{draft.kind === 'curriculum' ? 'Un morceau de curriculum' : 'Une tâche à toi'}</h3>
            <div className="grid-2">
              <label className="field">
                <span>Quand</span>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Genre</span>
                <select
                  value={draft.kind}
                  onChange={(e) => setDraft({ ...draft, kind: e.target.value as PlannerKind })}
                >
                  <option value="life">Vie / collège</option>
                  <option value="curriculum">Curriculum</option>
                  <option value="school">Travail d’école</option>
                </select>
              </label>
              <label className="field">
                <span>Début</span>
                <input
                  type="time"
                  value={draft.start}
                  onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Fin</span>
                <input
                  type="time"
                  value={draft.end}
                  onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <span>Titre</span>
              <input
                value={draft.title}
                placeholder="Réviser Jonas, atelier Docker, coller un topic…"
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            {draft.kind === 'curriculum' ? (
              <>
                <div className="grid-2">
                  <label className="field">
                    <span>École</span>
                    <select
                      value={draft.schoolId}
                      onChange={(e) =>
                        setDraft({ ...draft, schoolId: e.target.value, courseId: '', topic: '' })
                      }
                    >
                      <option value="">Choisir</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.number} · {s.short}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Cours Dar al-Ilm</span>
                    <select
                      value={draft.courseId}
                      onChange={(e) => setDraft({ ...draft, courseId: e.target.value, topic: '' })}
                    >
                      <option value="">Choisir</option>
                      {coursesForSchool.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} · {c.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {draft.courseId ? (
                  <label className="field">
                    <span>Topic encore ouvert</span>
                    <input
                      value={query}
                      placeholder="Filtrer…"
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="topic-picks">
                      {topicChoices.map((topic) => (
                        <button
                          key={topic}
                          className={draft.topic === topic ? 'chip on' : 'chip'}
                          type="button"
                          onClick={() => setDraft({ ...draft, topic, title: topic })}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </label>
                ) : null}
              </>
            ) : null}
            <label className="field">
              <span>Note</span>
              <textarea
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
            </label>
            <div className="row">
              <button className="gold" type="submit">
                Coller
              </button>
              <button className="ghost" type="button" onClick={() => setDraft(null)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

function CurriculumTray({
  onPlace,
}: {
  onPlace: (schoolId: string, courseId: string, topic: string) => void
}) {
  const { store, progress } = useStore()
  const hints = ['career', 'islam', 'writing', 'literature', 'inner', 'intellect']
  const picks = hints
    .map((id) => store.schools.find((s) => s.id === id))
    .filter(Boolean)
    .map((school) => {
      const course = store.courses.find(
        (c) =>
          c.school === school!.id &&
          c.topics.some((t) => !store.checked[topicKey(c.id, t)]),
      )
      const topic = course?.topics.find((t) => !store.checked[topicKey(course.id, t)])
      return { school: school!, course, topic, p: progress.school(school!.id) }
    })
    .filter((row) => row.topic && row.course)

  return (
    <div className="grid-3">
      {picks.map((row) => (
        <article className={`panel tone-${row.school.tone}`} key={row.school.id}>
          <span className="kicker">{row.school.short}</span>
          <h3 style={{ fontSize: 22 }}>{row.topic}</h3>
          <p className="muted small">
            {row.course?.code} · {row.p.done}/{row.p.total} gardés
          </p>
          <button
            className="gold"
            type="button"
            onClick={() => onPlace(row.school.id, row.course!.id, row.topic!)}
          >
            Coller ici
          </button>
        </article>
      ))}
    </div>
  )
}
