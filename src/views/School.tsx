import { useState } from 'react'
import { MASTERY, topicKey } from '../data/curriculum'
import { AddLine, Editable, IconX } from '../components/Editable'
import { pct, Progress, Rule } from '../components/ui'
import { href } from '../lib/route'
import { useStore } from '../lib/store'
import type { Course, TopicStatus, ViewKind } from '../lib/types'

const VIEWS: { id: ViewKind; label: string }[] = [
  { id: 'list', label: 'List' },
  { id: 'board', label: 'Board' },
  { id: 'table', label: 'Table' },
  { id: 'gallery', label: 'Gallery' },
]

const LANES: { id: TopicStatus; label: string }[] = [
  { id: 'todo', label: 'To learn' },
  { id: 'doing', label: 'Learning' },
  { id: 'done', label: 'Learned' },
]

function statusOf(checked: Record<string, boolean>, doing: Record<string, boolean>, key: string): TopicStatus {
  if (checked[key]) return 'done'
  if (doing[key]) return 'doing'
  return 'todo'
}

export function SchoolPage({ id }: { id: string }) {
  const api = useStore()
  const { store, setMastery, setView, addCourse, removeSchool, progress } = api
  const [open, setOpen] = useState<string | null>(null)
  const school = api.schoolById(id)
  if (!school) return <Missing />
  const courses = api.coursesFor(school.id)
  const p = progress.school(school.id)
  const mastery = store.mastery[school.id] ?? 0
  const view = store.views[school.id] ?? 'list'
  const target = MASTERY[school.targetMastery] ?? MASTERY[3]

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="kicker">
          School {school.number} {school.major ? '· major' : '· field'} · click any text to edit
        </span>
        <button
          className="ghost danger"
          type="button"
          onClick={() => {
            if (window.confirm(`Delete “${school.name}” and its courses?`)) {
              removeSchool(school.id)
              window.location.hash = '#/'
            }
          }}
        >
          Delete school
        </button>
      </div>
      <Editable
        className="edit-h1"
        value={school.name}
        onChange={(name) => api.updateSchool(school.id, { name })}
        placeholder="School name"
      />
      <Editable
        className="lede-edit"
        value={school.description}
        onChange={(description) => api.updateSchool(school.id, { description })}
        placeholder="What this school is for"
        multiline
      />
      <div className="row" style={{ marginTop: 8 }}>
        <label className="field" style={{ maxWidth: 160 }}>
          <span>Sidebar name</span>
          <Editable value={school.short} onChange={(short) => api.updateSchool(school.id, { short })} />
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span>Tagline</span>
          <Editable value={school.tagline} onChange={(tagline) => api.updateSchool(school.id, { tagline })} />
        </label>
        <label className="row" style={{ marginTop: 18 }}>
          <input
            type="checkbox"
            checked={school.major}
            onChange={(e) => api.updateSchool(school.id, { major: e.target.checked })}
          />
          Major
        </label>
      </div>

      <div className="grid-2" style={{ margin: '28px 0' }}>
        <article className={`panel tone-${school.tone}`}>
          <span className="kicker">Kept</span>
          <div className="stat">{pct(p.done, p.total)}%</div>
          <p className="muted">
            {p.done} of {p.total} topics · target {target.name}
          </p>
          <Progress done={p.done} total={p.total} />
        </article>
        <article className="panel">
          <span className="kicker">Your level of mastery</span>
          <h3>{MASTERY[mastery]?.name ?? 'Curious'}</h3>
          <p className="muted">{MASTERY[mastery]?.meaning}</p>
          <div className="ladder">
            {MASTERY.map((m) => (
              <button
                key={m.level}
                type="button"
                className={mastery === m.level ? 'on' : ''}
                onClick={() => setMastery(school.id, m.level)}
              >
                <span>
                  {m.level} · {m.name}
                </span>
                <span className="small">{m.meaning}</span>
              </button>
            ))}
          </div>
        </article>
      </div>

      {school.id === 'islam' ? (
        <article className="panel dark" style={{ marginBottom: 22 }}>
          <span className="kicker" style={{ color: 'var(--gold-2)' }}>
            A principle, not a footnote
          </span>
          <p className="quote">When you do not know, ask people of knowledge.</p>
          <a className="gold" href={href('quran')}>
            Open the Qur’an journal
          </a>
        </article>
      ) : null}

      <div className="view-tabs">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={view === item.id ? 'on' : ''}
            onClick={() => setView(school.id, item.id)}
          >
            {item.label}
          </button>
        ))}
        <AddLine
          label="New course"
          onClick={() => {
            const courseId = addCourse(school.id)
            window.location.hash = `#/course/${courseId}`
          }}
        />
      </div>

      {view === 'list' ? (
        <CourseList schoolId={school.id} courses={courses} open={open} setOpen={setOpen} />
      ) : null}
      {view === 'board' ? <TopicBoard courses={courses} /> : null}
      {view === 'table' ? <CourseTable courses={courses} /> : null}
      {view === 'gallery' ? <CourseGallery courses={courses} /> : null}

      <Rule>Final projects</Rule>
      <div className="stack">
        {school.projects.map((project, i) => (
          <div className="edit-row" key={`${i}-${project.slice(0, 12)}`}>
            <Editable
              value={project}
              onChange={(text) => api.updateSchoolProject(school.id, i, text)}
              placeholder="A thing to make"
            />
            <IconX onClick={() => api.removeSchoolProject(school.id, i)} />
          </div>
        ))}
        <AddLine label="Project" onClick={() => api.addSchoolProject(school.id)} />
      </div>
    </div>
  )
}

function CourseList({
  schoolId,
  courses,
  open,
  setOpen,
}: {
  schoolId: string
  courses: Course[]
  open: string | null
  setOpen: (id: string | null) => void
}) {
  const api = useStore()
  const { store, toggle, progress } = api
  return (
    <div className="stack">
      {courses.map((course) => {
        const cp = progress.course(course.id)
        const expanded = open === course.id
        return (
          <article className="course" key={course.id}>
            <header>
              <div style={{ flex: 1 }}>
                <Editable
                  className="code-edit"
                  value={course.code}
                  onChange={(code) => api.updateCourse(course.id, { code })}
                />
                <Editable
                  className="edit-h3"
                  value={course.title}
                  onChange={(title) => api.updateCourse(course.id, { title })}
                />
                <Editable
                  value={course.summary}
                  onChange={(summary) => api.updateCourse(course.id, { summary })}
                  placeholder="Summary"
                />
                <Progress done={cp.done} total={cp.total} />
                <button
                  type="button"
                  className="add-line"
                  onClick={() => setOpen(expanded ? null : course.id)}
                >
                  {cp.done}/{cp.total} · {expanded ? 'Hide topics' : 'Show topics'}
                </button>
              </div>
              <a className="ghost" href={href(`course/${course.id}`)}>
                Open
              </a>
            </header>
            {expanded ? (
              <div className="topics">
                {course.topics.map((topic, i) => {
                  const key = topicKey(course.id, topic)
                  const on = !!store.checked[key]
                  return (
                    <div className={on ? 'topic on edit-row' : 'topic edit-row'} key={key}>
                      <button type="button" className="check-wrap" onClick={() => toggle(key)}>
                        <span className="check" />
                      </button>
                      <Editable
                        value={topic}
                        onChange={(text) => api.updateTopic(course.id, i, text)}
                        placeholder="Topic"
                      />
                      <IconX onClick={() => api.removeTopic(course.id, i)} />
                    </div>
                  )
                })}
                <AddLine label="Topic" onClick={() => api.addTopic(course.id)} />
              </div>
            ) : null}
          </article>
        )
      })}
      <AddLine label="New course" onClick={() => api.addCourse(schoolId)} />
    </div>
  )
}

function TopicBoard({ courses }: { courses: Course[] }) {
  const { store, setTopicStatus } = useStore()
  const cards = courses.flatMap((course) =>
    course.topics.map((topic, index) => ({
      course,
      topic,
      index,
      key: topicKey(course.id, topic),
    })),
  )

  return (
    <div className="board">
      {LANES.map((lane) => (
        <section
          key={lane.id}
          className="lane"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const key = e.dataTransfer.getData('text/plain')
            if (key) setTopicStatus(key, lane.id)
          }}
        >
          <h3>
            {lane.label}
            <span className="muted small">
              {' '}
              {cards.filter((c) => statusOf(store.checked, store.doing, c.key) === lane.id).length}
            </span>
          </h3>
          {cards
            .filter((c) => statusOf(store.checked, store.doing, c.key) === lane.id)
            .map((card) => (
              <article
                key={card.key}
                className="lane-card"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', card.key)}
              >
                <div className="small muted">{card.course.code}</div>
                <div>{card.topic}</div>
              </article>
            ))}
        </section>
      ))}
    </div>
  )
}

function CourseTable({ courses }: { courses: Course[] }) {
  const api = useStore()
  return (
    <div className="sheet-wrap">
      <table className="sheet">
        <thead>
          <tr>
            <th>Code</th>
            <th>Course</th>
            <th>Summary</th>
            <th>Topics</th>
            <th>Kept</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const p = api.progress.course(course.id)
            return (
              <tr key={course.id}>
                <td>
                  <Editable value={course.code} onChange={(code) => api.updateCourse(course.id, { code })} />
                </td>
                <td>
                  <Editable value={course.title} onChange={(title) => api.updateCourse(course.id, { title })} />
                </td>
                <td>
                  <Editable
                    value={course.summary}
                    onChange={(summary) => api.updateCourse(course.id, { summary })}
                  />
                </td>
                <td className="muted">{course.topics.length}</td>
                <td>
                  {p.done}/{p.total}
                </td>
                <td>
                  <a className="ghost" href={href(`course/${course.id}`)}>
                    Open
                  </a>
                  <IconX
                    onClick={() => {
                      if (window.confirm(`Delete “${course.title}”?`)) api.removeCourse(course.id)
                    }}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CourseGallery({ courses }: { courses: Course[] }) {
  const api = useStore()
  return (
    <div className="grid-3">
      {courses.map((course) => {
        const p = api.progress.course(course.id)
        return (
          <article className="panel" key={course.id}>
            <Editable
              className="code-edit"
              value={course.code}
              onChange={(code) => api.updateCourse(course.id, { code })}
            />
            <Editable
              className="edit-h3"
              value={course.title}
              onChange={(title) => api.updateCourse(course.id, { title })}
            />
            <Editable
              value={course.summary}
              onChange={(summary) => api.updateCourse(course.id, { summary })}
              multiline
            />
            <Progress done={p.done} total={p.total} />
            <div className="row" style={{ marginTop: 12 }}>
              <a className="gold" href={href(`course/${course.id}`)}>
                Open
              </a>
              <IconX
                onClick={() => {
                  if (window.confirm(`Delete “${course.title}”?`)) api.removeCourse(course.id)
                }}
              />
            </div>
          </article>
        )
      })}
    </div>
  )
}

export function CoursePage({ id }: { id: string }) {
  const api = useStore()
  const { store, toggle, progress, setView } = api
  const course = api.courseById(id)
  const school = course ? api.schoolById(course.school) : undefined
  if (!course || !school) return <Missing />
  const p = progress.course(course.id)
  const view = store.views[`course:${course.id}`] ?? 'list'

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <a className="kicker" href={href(`school/${school.id}`)}>
          ← {school.name}
        </a>
        <button
          className="ghost danger"
          type="button"
          onClick={() => {
            if (window.confirm(`Delete “${course.title}”?`)) {
              api.removeCourse(course.id)
              window.location.hash = `#/school/${school.id}`
            }
          }}
        >
          Delete course
        </button>
      </div>
      <Editable
        className="code-edit"
        value={course.code}
        onChange={(code) => api.updateCourse(course.id, { code })}
      />
      <Editable
        className="edit-h1"
        value={course.title}
        onChange={(title) => api.updateCourse(course.id, { title })}
      />
      <Editable
        className="lede-edit"
        value={course.why}
        onChange={(why) => api.updateCourse(course.id, { why })}
        placeholder="Why this course"
        multiline
      />

      <div className="grid-3" style={{ margin: '24px 0' }}>
        <article className="panel">
          <span className="kicker">Progress</span>
          <div className="stat">{pct(p.done, p.total)}%</div>
          <Progress done={p.done} total={p.total} />
        </article>
        <article className="panel">
          <span className="kicker">Level</span>
          <div className="row">
            {([1, 2, 3, 4] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={course.level === level ? 'chip on' : 'chip'}
                onClick={() => api.updateCourse(course.id, { level })}
              >
                {level}0{level}
              </button>
            ))}
          </div>
        </article>
        <article className="panel">
          <span className="kicker">Method</span>
          <Editable
            value={course.method || ''}
            onChange={(method) => api.updateCourse(course.id, { method })}
            placeholder="Learn → explain → apply → create."
            multiline
          />
        </article>
      </div>

      <div className="grid-2">
        <article className="panel">
          <h3>Learning objectives</h3>
          {course.objectives.map((o, i) => (
            <div className="edit-row" key={`o-${i}`}>
              <Editable value={o} onChange={(text) => api.updateObjective(course.id, i, text)} />
              <IconX onClick={() => api.removeObjective(course.id, i)} />
            </div>
          ))}
          <AddLine label="Objective" onClick={() => api.addObjective(course.id)} />
        </article>
        <article className="panel">
          <h3>Resources</h3>
          {course.resources.map((r, i) => (
            <div className="edit-row" key={`r-${i}`}>
              <select
                value={r.kind}
                onChange={(e) =>
                  api.updateResource(course.id, i, { kind: e.target.value as typeof r.kind })
                }
              >
                <option value="teacher">teacher</option>
                <option value="book">book</option>
                <option value="site">site</option>
                <option value="course">course</option>
                <option value="practice">practice</option>
              </select>
              <Editable
                value={r.title}
                onChange={(title) => api.updateResource(course.id, i, { title })}
              />
              <IconX onClick={() => api.removeResource(course.id, i)} />
            </div>
          ))}
          <AddLine label="Resource" onClick={() => api.addResource(course.id)} />
          <h3 style={{ marginTop: 18 }}>Assignments</h3>
          {course.assignments.map((a, i) => (
            <div className="edit-row" key={`a-${i}`}>
              <Editable value={a} onChange={(text) => api.updateAssignment(course.id, i, text)} />
              <IconX onClick={() => api.removeAssignment(course.id, i)} />
            </div>
          ))}
          <AddLine label="Assignment" onClick={() => api.addAssignment(course.id)} />
          <h3 style={{ marginTop: 18 }}>Final project</h3>
          <Editable
            value={course.project}
            onChange={(project) => api.updateCourse(course.id, { project })}
            multiline
          />
        </article>
      </div>

      <div className="view-tabs">
        <button
          type="button"
          className={view === 'list' ? 'on' : ''}
          onClick={() => setView(`course:${course.id}`, 'list')}
        >
          List
        </button>
        <button
          type="button"
          className={view === 'board' ? 'on' : ''}
          onClick={() => setView(`course:${course.id}`, 'board')}
        >
          Board
        </button>
      </div>

      {view === 'board' ? (
        <TopicBoard courses={[course]} />
      ) : (
        <>
          <Rule>Topics</Rule>
          <div className="topics" style={{ padding: 0 }}>
            {course.topics.map((topic, i) => {
              const key = topicKey(course.id, topic)
              const on = !!store.checked[key]
              return (
                <div className={on ? 'topic on edit-row' : 'topic edit-row'} key={key}>
                  <button type="button" className="check-wrap" onClick={() => toggle(key)}>
                    <span className="check" />
                  </button>
                  <Editable value={topic} onChange={(text) => api.updateTopic(course.id, i, text)} />
                  <IconX onClick={() => api.removeTopic(course.id, i)} />
                </div>
              )
            })}
            <AddLine label="Topic" onClick={() => api.addTopic(course.id)} />
          </div>
        </>
      )}
    </div>
  )
}

function Missing() {
  return (
    <div>
      <h1>That page has wandered off.</h1>
      <p>
        <a href={href('')}>Return to the garden.</a>
      </p>
    </div>
  )
}
