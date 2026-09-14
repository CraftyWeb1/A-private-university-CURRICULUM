import { useMemo, useState } from 'react'
import { AddLine, Editable, IconX } from '../components/Editable'
import { topicKey } from '../data/curriculum'
import {
  EVENT_KINDS,
  WEEKDAYS,
  addDays,
  collegeWeekOf,
  eventsOn,
  inSession,
  iso,
  kindLabel,
  minutes,
  parseIso,
  pocketsOn,
  seedCollege,
  slotsOn,
  startOfMonth,
  startOfWeek,
  upcomingEvents,
} from '../data/planner'
import { href } from '../lib/route'
import { useStore } from '../lib/store'
import type { CollegeEvent, CollegeKind, PlannerKind, PlannerTask, WeeklySlot } from '../lib/types'
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
  id?: string
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
type Sheet =
  | { type: 'slot'; slot: WeeklySlot }
  | { type: 'event'; event: CollegeEvent }

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
    updatePlannerTask,
    togglePlannerTask,
    removePlannerTask,
    togglePlannerEvent,
    setTopicStatus,
    updateCollegeSession,
    addCollegeCourse,
    updateCollegeCourse,
    removeCollegeCourse,
    addCollegeSlot,
    updateCollegeSlot,
    removeCollegeSlot,
    addCollegeEvent,
    updateCollegeEvent,
    removeCollegeEvent,
    resetCollege,
  } = useStore()
  const college = store.college ?? seedCollege()
  const [mode, setMode] = useState<Mode>('week')
  const [editing, setEditing] = useState(false)
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState(iso(new Date()))
  const [draft, setDraft] = useState<Draft | null>(null)
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [query, setQuery] = useState('')

  const today = iso(new Date())
  const weekStart = startOfWeek(cursor)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const ped = collegeWeekOf(cursor)
  const coming = upcomingEvents(college.events, new Date(), 21)
  const nextExam = coming.find((e) => e.kind === 'exam')
  const tasks = store.plannerTasks ?? []
  const doneMap = store.plannerDone ?? {}

  const monthGrid = useMemo(() => {
    const first = startOfMonth(cursor)
    const start = startOfWeek(first)
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
  }, [cursor])

  const selectedDate = parseIso(selected)
  const selectedSlots = slotsOn(selectedDate, college.slots, college.events, college.session)
  const selectedEvents = eventsOn(selectedDate, college.events)
  const selectedTasks = tasks.filter((t) => t.date === selected)
  const selectedPockets = pocketsOn(selectedDate, college.slots, college.events, college.session)

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
    const payload = {
      date: draft.date,
      start: draft.start || undefined,
      end: draft.end || undefined,
      title,
      note: draft.note,
      kind: draft.kind,
      schoolId: draft.schoolId || undefined,
      courseId: draft.courseId || undefined,
      topic: draft.topic || undefined,
    }
    if (draft.id) updatePlannerTask(draft.id, payload)
    else addPlannerTask(payload)
    if (!draft.id && draft.courseId && draft.topic) {
      setTopicStatus(topicKey(draft.courseId, draft.topic), 'doing')
    }
    setSelected(draft.date)
    setDraft(null)
  }

  function openTask(task: PlannerTask) {
    setDraft({
      id: task.id,
      date: task.date,
      start: task.start ?? '',
      end: task.end ?? '',
      title: task.title,
      note: task.note,
      kind: task.kind,
      schoolId: task.schoolId ?? '',
      courseId: task.courseId ?? '',
      topic: task.topic ?? '',
    })
  }

  function onClassClick(slotId: string) {
    if (!editing) return
    const slot = college.slots.find((s) => s.id === slotId)
    if (slot) setSheet({ type: 'slot', slot: { ...slot } })
  }

  function onEventClick(event: CollegeEvent) {
    if (editing) setSheet({ type: 'event', event: { ...event } })
    else togglePlannerEvent(event.id)
  }

  const doubleDays = weekDays.filter((d) => eventsOn(d, college.events).filter((e) => e.kind === 'exam').length >= 2)

  function flipTask(task: PlannerTask) {
    togglePlannerTask(task.id)
    if (task.courseId && task.topic) {
      setTopicStatus(topicKey(task.courseId, task.topic), task.done ? 'todo' : 'done')
    }
  }

  const heavyWeek = doubleDays.length > 0

  return (
    <div>
      <span className="kicker">{college.session.college} · {college.session.name}</span>
      <h1>Planner</h1>
      <p className="lede">
        Tes cours, tes travaux, et les petits trous roses où coller du Dar al-Ilm. Tout se
        modifie — un intra déplacé, un lab trop long, une erreur : tu corriges, l’agenda suit.
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
          <button
            className={editing ? 'gold' : 'ghost'}
            type="button"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? 'Terminé' : 'Modifier'}
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
            {college.session.start} → {college.session.end}. Clique Modifier si une date de session
            a bougé.
          </p>
        </article>
      </div>

      {editing ? (
        <div className="callout-pink" style={{ marginTop: 16 }}>
          <strong>Mode crayon.</strong>
          Clique un cours, une éval ou une tâche pour la corriger. Les trous roses se recollent
          tout seuls. Tu peux aussi ajouter un bloc d’horaire ou une remise.
          <div className="grid-2" style={{ marginTop: 10 }}>
            <label className="field">
              <span>Début de session</span>
              <input
                type="date"
                value={college.session.start}
                onChange={(e) => updateCollegeSession({ start: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Fin de session</span>
              <input
                type="date"
                value={college.session.end}
                onChange={(e) => updateCollegeSession({ end: e.target.value })}
              />
            </label>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button
              className="ghost"
              type="button"
              onClick={() => {
                const weekday =
                  selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? 1 : selectedDate.getDay()
                const id = addCollegeSlot({ weekday })
                setSheet({
                  type: 'slot',
                  slot: {
                    id,
                    weekday,
                    start: '09:10',
                    end: '12:10',
                    course: college.courses[0]?.code ?? 'Collège',
                    title: 'Nouveau bloc',
                    room: '',
                    teacher: '',
                    kind: 'T',
                  },
                })
              }}
            >
              + Horaire
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => {
                const id = addCollegeEvent({ date: selected, kind: 'due', title: 'Nouvelle remise' })
                setSheet({
                  type: 'event',
                  event: {
                    id,
                    date: selected,
                    course: college.courses[0]?.code ?? 'Collège',
                    title: 'Nouvelle remise',
                    kind: 'due',
                  },
                })
              }}
            >
              + Éval
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => {
                if (!window.confirm('Revenir au planner PDF d’origine ? Tes corrections collège seront effacées, pas tes tâches.')) return
                resetCollege()
              }}
            >
              Revenir au PDF
            </button>
          </div>
        </div>
      ) : null}

      {heavyWeek ? (
        <div className="callout-pink" style={{ marginTop: 16 }}>
          <strong>Jour chargé — deux examens le même jour.</strong>
          {doubleDays.map((d) => {
            const exams = eventsOn(d, college.events).filter((e) => e.kind === 'exam')
            return (
              <span key={iso(d)}>
                {' '}
                {fmtDay(d)} : {exams.map((e) => e.title).join(' · ')}.
              </span>
            )
          })}
        </div>
      ) : null}

      {mode === 'week' ? (
        <>
          <Rule>Cette semaine</Rule>
          <p className="muted small">
            {fmtDay(weekDays[0])} → {fmtDay(weekDays[6])}
            {inSession(cursor, college.session) ? ' · grille présentielle' : ''}
          </p>
          <div className={editing ? 'planner-week planner-editing' : 'planner-week'}>
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
              const slots = slotsOn(day, college.slots, college.events, college.session)
              const evs = eventsOn(day, college.events)
              const dayTasks = tasks.filter((t) => t.date === key)
              const pockets = pocketsOn(day, college.slots, college.events, college.session)
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
                          onClick={() => onEventClick(e)}
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
                          onClick={() => (editing ? openTask(t) : flipTask(t))}
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
                      <button
                        key={b.key}
                        className={`blk ${b.cls}`}
                        type="button"
                        style={{ top: top(b.start), height: height(b.start, b.end) }}
                        onClick={() => {
                          const slot = college.slots.find((s) => s.id === b.key)
                          if (slot) {
                            onClassClick(slot.id)
                            return
                          }
                          const ev = college.events.find((e) => e.id === b.key)
                          if (ev) {
                            onEventClick(ev)
                            return
                          }
                          const task = dayTasks.find((t) => t.id === b.key)
                          if (task) {
                            if (editing) openTask(task)
                            else flipTask(task)
                          }
                        }}
                      >
                        <b>{b.title}</b>
                        <span>
                          {b.start}–{b.end}
                          {b.meta ? ` · ${b.meta}` : ''}
                        </span>
                      </button>
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
                const evs = eventsOn(day, college.events)
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
                    <span className="edit-row">
                      <span>
                        <b>
                          {s.start}–{s.end}
                        </b>{' '}
                        {s.title}
                        <div className="small muted">
                          {s.room} {s.teacher ? `· ${s.teacher}` : ''}
                        </div>
                      </span>
                      {editing ? (
                        <button className="ghost" type="button" onClick={() => onClassClick(s.id)}>
                          Modifier
                        </button>
                      ) : null}
                    </span>
                  </li>
                ))}
                {selectedEvents.map((e) => (
                  <li key={e.id}>
                    <span className="edit-row">
                      <button
                        className={`check ${doneMap[e.id] ? 'filled' : ''}`}
                        type="button"
                        onClick={() => togglePlannerEvent(e.id)}
                        aria-label="Marquer"
                      />
                      <span>
                        {e.start ? `${e.start} · ` : ''}
                        {e.title}
                        {e.percent ? ` (${e.percent})` : ''}
                        {e.confirm ? ' · à confirmer' : ''}
                        <div className="small muted">
                          {kindLabel(e.kind)} · {e.course}
                        </div>
                      </span>
                      {editing ? (
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => setSheet({ type: 'event', event: { ...e } })}
                        >
                          Modifier
                        </button>
                      ) : null}
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
                      <button className="ghost" type="button" onClick={() => openTask(t)}>
                        Modifier
                      </button>
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
          <Rule>Tes cours</Rule>
          <div className="grid-2">
            {college.courses.map((c) => {
              const next = coming.filter((e) => e.course === c.code).slice(0, 4)
              return (
                <article className="panel" key={c.code}>
                  <div className="edit-row">
                    <span className="kicker" style={{ color: c.color }}>
                      <Editable value={c.code} onChange={(code) => updateCollegeCourse(c.code, { code })} />
                    </span>
                    {editing ? <IconX onClick={() => removeCollegeCourse(c.code)} /> : null}
                  </div>
                  <h3>
                    <Editable value={c.short} onChange={(short) => updateCollegeCourse(c.code, { short })} />
                    {' · '}
                    <Editable value={c.title} onChange={(title) => updateCollegeCourse(c.code, { title })} />
                  </h3>
                  <p className="muted small">
                    <Editable value={c.teacher} onChange={(teacher) => updateCollegeCourse(c.code, { teacher })} placeholder="Prof" />
                    {' · '}
                    <Editable value={c.room} onChange={(room) => updateCollegeCourse(c.code, { room })} placeholder="Local" />
                  </p>
                  <Editable
                    multiline
                    value={c.note}
                    onChange={(note) => updateCollegeCourse(c.code, { note })}
                    placeholder="Notes du plan de cours"
                  />
                  <ul className="list">
                    {next.length ? (
                      next.map((e) => (
                        <li key={e.id}>
                          <span>
                            {fmtDay(parseIso(e.date))} · {e.title}
                          </span>
                          <span className="row">
                            <span className="small">{e.percent || kindLabel(e.kind)}</span>
                            {editing ? (
                              <button
                                className="ghost"
                                type="button"
                                onClick={() => setSheet({ type: 'event', event: { ...e } })}
                              >
                                Modifier
                              </button>
                            ) : null}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li>
                        <span className="muted">Rien dans les 21 prochains jours.</span>
                      </li>
                    )}
                  </ul>
                  <a className="gold" href={href(`school/${c.schoolHint}`)}>
                    Relier à{' '}
                    {c.schoolHint === 'career'
                      ? 'Career'
                      : c.schoolHint === 'literature'
                        ? 'Literature'
                        : c.schoolHint === 'islam'
                          ? 'Deen'
                          : 'Intellect'}
                  </a>
                </article>
              )
            })}
          </div>
          <AddLine
            label="Ajouter un cours"
            onClick={() => {
              addCollegeCourse()
              setEditing(true)
            }}
          />
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
                <span className="row">
                  <span>{e.percent || ''}</span>
                  {editing ? (
                    <button className="ghost" type="button" onClick={() => setSheet({ type: 'event', event: { ...e } })}>
                      Modifier
                    </button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {sheet ? (
        <div className="composer-back" onClick={() => setSheet(null)}>
          {sheet.type === 'slot' ? (
            <form
              className="panel composer"
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault()
                updateCollegeSlot(sheet.slot.id, sheet.slot)
                setSheet(null)
              }}
            >
              <span className="kicker">Horaire de semaine</span>
              <h3>Ce bloc de cours</h3>
              <p className="muted small">Change l’heure ou le jour : la grille et les trous se recollent.</p>
              <div className="grid-2">
                <label className="field">
                  <span>Jour</span>
                  <select
                    value={sheet.slot.weekday}
                    onChange={(e) => {
                      const weekday = Number(e.target.value)
                      const next = { ...sheet.slot, weekday }
                      setSheet({ type: 'slot', slot: next })
                      updateCollegeSlot(next.id, { weekday })
                    }}
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d.n} value={d.n}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Cours</span>
                  <select
                    value={sheet.slot.course}
                    onChange={(e) => {
                      const course = e.target.value
                      const meta = college.courses.find((c) => c.code === course)
                      const next = {
                        ...sheet.slot,
                        course,
                        title: meta ? `${meta.short} · ${sheet.slot.kind === 'L' ? 'lab' : sheet.slot.kind === 'T' ? 'théorie' : 'activité'}` : sheet.slot.title,
                        room: meta?.room ?? sheet.slot.room,
                        teacher: meta?.teacher ?? sheet.slot.teacher,
                      }
                      setSheet({ type: 'slot', slot: next })
                      updateCollegeSlot(next.id, next)
                    }}
                  >
                    <option value="Collège">Collège</option>
                    {college.courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} · {c.short}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Début</span>
                  <input
                    type="time"
                    value={sheet.slot.start}
                    onChange={(e) => {
                      const start = e.target.value
                      setSheet({ type: 'slot', slot: { ...sheet.slot, start } })
                      updateCollegeSlot(sheet.slot.id, { start })
                    }}
                  />
                </label>
                <label className="field">
                  <span>Fin</span>
                  <input
                    type="time"
                    value={sheet.slot.end}
                    onChange={(e) => {
                      const end = e.target.value
                      setSheet({ type: 'slot', slot: { ...sheet.slot, end } })
                      updateCollegeSlot(sheet.slot.id, { end })
                    }}
                  />
                </label>
              </div>
              <label className="field">
                <span>Titre</span>
                <input
                  value={sheet.slot.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setSheet({ type: 'slot', slot: { ...sheet.slot, title } })
                    updateCollegeSlot(sheet.slot.id, { title })
                  }}
                />
              </label>
              <div className="grid-2">
                <label className="field">
                  <span>Local</span>
                  <input
                    value={sheet.slot.room}
                    onChange={(e) => {
                      const room = e.target.value
                      setSheet({ type: 'slot', slot: { ...sheet.slot, room } })
                      updateCollegeSlot(sheet.slot.id, { room })
                    }}
                  />
                </label>
                <label className="field">
                  <span>Prof</span>
                  <input
                    value={sheet.slot.teacher}
                    onChange={(e) => {
                      const teacher = e.target.value
                      setSheet({ type: 'slot', slot: { ...sheet.slot, teacher } })
                      updateCollegeSlot(sheet.slot.id, { teacher })
                    }}
                  />
                </label>
                <label className="field">
                  <span>Type</span>
                  <select
                    value={sheet.slot.kind}
                    onChange={(e) => {
                      const kind = e.target.value as WeeklySlot['kind']
                      setSheet({ type: 'slot', slot: { ...sheet.slot, kind } })
                      updateCollegeSlot(sheet.slot.id, { kind })
                    }}
                  >
                    <option value="T">Théorie</option>
                    <option value="L">Laboratoire</option>
                    <option value="activity">Activité / pause</option>
                  </select>
                </label>
              </div>
              <div className="row">
                <button className="gold" type="submit">
                  Enregistrer
                </button>
                <button className="ghost" type="button" onClick={() => setSheet(null)}>
                  Fermer
                </button>
                <button
                  className="ghost danger"
                  type="button"
                  onClick={() => {
                    removeCollegeSlot(sheet.slot.id)
                    setSheet(null)
                  }}
                >
                  Supprimer
                </button>
              </div>
            </form>
          ) : (
            <form
              className="panel composer"
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault()
                updateCollegeEvent(sheet.event.id, sheet.event)
                setSheet(null)
              }}
            >
              <span className="kicker">Éval / note / congé</span>
              <h3>Corriger cette date</h3>
              <p className="muted small">Un intra reporté, un % changé, un congé : le mois et la semaine bougent avec.</p>
              <label className="field">
                <span>Titre</span>
                <input
                  value={sheet.event.title}
                  onChange={(e) => {
                    const title = e.target.value
                    const next = { ...sheet.event, title }
                    setSheet({ type: 'event', event: next })
                    updateCollegeEvent(next.id, { title })
                  }}
                />
              </label>
              <div className="grid-2">
                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={sheet.event.date}
                    onChange={(e) => {
                      const date = e.target.value
                      const next = { ...sheet.event, date }
                      setSheet({ type: 'event', event: next })
                      updateCollegeEvent(next.id, { date })
                    }}
                  />
                </label>
                <label className="field">
                  <span>Jusqu’au (optionnel)</span>
                  <input
                    type="date"
                    value={sheet.event.endDate ?? ''}
                    onChange={(e) => {
                      const endDate = e.target.value || undefined
                      const next = { ...sheet.event, endDate }
                      setSheet({ type: 'event', event: next })
                      updateCollegeEvent(next.id, { endDate })
                    }}
                  />
                </label>
                <label className="field">
                  <span>Début</span>
                  <input
                    type="time"
                    value={sheet.event.start ?? ''}
                    onChange={(e) => {
                      const start = e.target.value || undefined
                      const next = { ...sheet.event, start }
                      setSheet({ type: 'event', event: next })
                      updateCollegeEvent(next.id, { start })
                    }}
                  />
                </label>
                <label className="field">
                  <span>Fin</span>
                  <input
                    type="time"
                    value={sheet.event.end ?? ''}
                    onChange={(e) => {
                      const end = e.target.value || undefined
                      const next = { ...sheet.event, end }
                      setSheet({ type: 'event', event: next })
                      updateCollegeEvent(next.id, { end })
                    }}
                  />
                </label>
                <label className="field">
                  <span>Cours</span>
                  <select
                    value={sheet.event.course}
                    onChange={(e) => {
                      const course = e.target.value
                      const next = { ...sheet.event, course }
                      setSheet({ type: 'event', event: next })
                      updateCollegeEvent(next.id, { course })
                    }}
                  >
                    <option value="Collège">Collège</option>
                    {college.courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} · {c.short}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Type</span>
                  <select
                    value={sheet.event.kind}
                    onChange={(e) => {
                      const kind = e.target.value as CollegeKind
                      const next = { ...sheet.event, kind }
                      setSheet({ type: 'event', event: next })
                      updateCollegeEvent(next.id, { kind })
                    }}
                  >
                    {EVENT_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {kindLabel(k)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>%</span>
                  <input
                    value={sheet.event.percent ?? ''}
                    placeholder="30%"
                    onChange={(e) => {
                      const percent = e.target.value || undefined
                      const next = { ...sheet.event, percent }
                      setSheet({ type: 'event', event: next })
                      updateCollegeEvent(next.id, { percent })
                    }}
                  />
                </label>
                <label className="field">
                  <span>Local</span>
                  <input
                    value={sheet.event.location ?? ''}
                    onChange={(e) => {
                      const location = e.target.value || undefined
                      const next = { ...sheet.event, location }
                      setSheet({ type: 'event', event: next })
                      updateCollegeEvent(next.id, { location })
                    }}
                  />
                </label>
                <label className="field">
                  <span>Effet sur l’horaire</span>
                  <select
                    value={sheet.event.effect ?? ''}
                    onChange={(e) => {
                      const effect = (e.target.value || undefined) as CollegeEvent['effect']
                      const next = { ...sheet.event, effect }
                      setSheet({ type: 'event', event: next })
                      updateCollegeEvent(next.id, { effect })
                    }}
                  >
                    <option value="">Aucun</option>
                    <option value="off">Pas de cours ce jour</option>
                    <option value="monday">Horaire du lundi</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Note</span>
                <textarea
                  value={sheet.event.note ?? ''}
                  onChange={(e) => {
                    const note = e.target.value || undefined
                    const next = { ...sheet.event, note }
                    setSheet({ type: 'event', event: next })
                    updateCollegeEvent(next.id, { note })
                  }}
                />
              </label>
              <label className="row">
                <input
                  type="checkbox"
                  checked={!!sheet.event.confirm}
                  onChange={(e) => {
                    const confirm = e.target.checked
                    const next = { ...sheet.event, confirm }
                    setSheet({ type: 'event', event: next })
                    updateCollegeEvent(next.id, { confirm })
                  }}
                />
                <span>À confirmer en classe</span>
              </label>
              <div className="row">
                <button className="gold" type="submit">
                  Enregistrer
                </button>
                <button className="ghost" type="button" onClick={() => setSheet(null)}>
                  Fermer
                </button>
                <button
                  className="ghost danger"
                  type="button"
                  onClick={() => {
                    removeCollegeEvent(sheet.event.id)
                    setSheet(null)
                  }}
                >
                  Supprimer
                </button>
              </div>
            </form>
          )}
        </div>
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
            <span className="kicker">{draft.id ? 'Corriger' : 'Coller dans l’agenda'}</span>
            <h3>
              {draft.id
                ? 'Cette tâche'
                : draft.kind === 'curriculum'
                  ? 'Un morceau de curriculum'
                  : 'Une tâche à toi'}
            </h3>
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
                {draft.id ? 'Enregistrer' : 'Coller'}
              </button>
              <button className="ghost" type="button" onClick={() => setDraft(null)}>
                Annuler
              </button>
              {draft.id ? (
                <button
                  className="ghost danger"
                  type="button"
                  onClick={() => {
                    removePlannerTask(draft.id!)
                    setDraft(null)
                  }}
                >
                  Supprimer
                </button>
              ) : null}
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
