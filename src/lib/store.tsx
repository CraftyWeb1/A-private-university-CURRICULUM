import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { TONES, topicKey } from '../data/curriculum'
import { seedCollege } from '../data/planner'
import { exportStore, loadUserStore, parseImportedStore, saveUserStore } from './storage'
import type {
  Block,
  BlockType,
  Book,
  CollegeCourse,
  CollegeEvent,
  CollegeSession,
  Course,
  DailyEntry,
  LearningKind,
  Manuscript,
  Page,
  PlannerTask,
  Project,
  QuranNote,
  Resource,
  School,
  Store,
  TopicStatus,
  ViewKind,
  WeeklySlot,
} from './types'

export function uid() {
  return crypto.randomUUID()
}

type Patch<T> = Partial<T>

type StoreApi = {
  store: Store
  toggle: (key: string) => void
  setTopicStatus: (key: string, status: TopicStatus) => void
  setMastery: (school: string, level: number) => void
  setView: (scope: string, view: ViewKind) => void
  updateSchool: (id: string, patch: Patch<School>) => void
  addSchool: () => string
  removeSchool: (id: string) => void
  updateCourse: (id: string, patch: Patch<Course>) => void
  addCourse: (schoolId: string) => string
  removeCourse: (id: string) => void
  addTopic: (courseId: string, text?: string) => void
  updateTopic: (courseId: string, index: number, text: string) => void
  removeTopic: (courseId: string, index: number) => void
  addObjective: (courseId: string) => void
  updateObjective: (courseId: string, index: number, text: string) => void
  removeObjective: (courseId: string, index: number) => void
  addAssignment: (courseId: string) => void
  updateAssignment: (courseId: string, index: number, text: string) => void
  removeAssignment: (courseId: string, index: number) => void
  addResource: (courseId: string) => void
  updateResource: (courseId: string, index: number, patch: Patch<Resource>) => void
  removeResource: (courseId: string, index: number) => void
  addSchoolProject: (schoolId: string) => void
  updateSchoolProject: (schoolId: string, index: number, text: string) => void
  removeSchoolProject: (schoolId: string, index: number) => void
  addPage: () => string
  updatePage: (id: string, patch: Patch<Page>) => void
  removePage: (id: string) => void
  addBlock: (pageId: string, type?: BlockType) => void
  updateBlock: (pageId: string, blockId: string, patch: Patch<Block>) => void
  removeBlock: (pageId: string, blockId: string) => void
  addDaily: (entry: Omit<DailyEntry, 'id'>) => void
  removeDaily: (id: string) => void
  addCuriosity: (text: string) => void
  toggleCuriosity: (id: string) => void
  removeCuriosity: (id: string) => void
  upsertBook: (book: Book) => void
  removeBook: (id: string) => void
  addIdea: (text: string) => void
  removeIdea: (id: string) => void
  upsertManuscript: (m: Manuscript) => void
  removeManuscript: (id: string) => void
  upsertProject: (p: Project) => void
  removeProject: (id: string) => void
  addQuran: (note: Omit<QuranNote, 'id'>) => void
  removeQuran: (id: string) => void
  addPlannerTask: (task: Omit<PlannerTask, 'id' | 'done'> & { done?: boolean }) => string
  updatePlannerTask: (id: string, patch: Patch<PlannerTask>) => void
  removePlannerTask: (id: string) => void
  togglePlannerTask: (id: string) => void
  togglePlannerEvent: (id: string) => void
  updateCollegeSession: (patch: Patch<CollegeSession>) => void
  addCollegeCourse: () => string
  updateCollegeCourse: (code: string, patch: Patch<CollegeCourse>) => void
  removeCollegeCourse: (code: string) => void
  addCollegeSlot: (slot?: Partial<WeeklySlot>) => string
  updateCollegeSlot: (id: string, patch: Patch<WeeklySlot>) => void
  removeCollegeSlot: (id: string) => void
  addCollegeEvent: (event?: Partial<CollegeEvent>) => string
  updateCollegeEvent: (id: string, patch: Patch<CollegeEvent>) => void
  removeCollegeEvent: (id: string) => void
  resetCollege: () => void
  download: () => void
  upload: (text: string) => void
  schoolById: (id: string) => School | undefined
  courseById: (id: string) => Course | undefined
  coursesFor: (schoolId: string) => Course[]
  progress: {
    overall: { done: number; total: number }
    school: (id: string) => { done: number; total: number }
    course: (id: string) => { done: number; total: number }
  }
}

const Ctx = createContext<StoreApi | null>(null)

function dropKey(map: Record<string, boolean>, key: string) {
  const next = { ...map }
  delete next[key]
  return next
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Store missing')
  return ctx
}

export function StoreProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => loadUserStore(userId))

  useEffect(() => {
    saveUserStore(userId, store)
  }, [userId, store])

  const api = useMemo<StoreApi>(() => {
    const schoolById = (id: string) => store.schools.find((s) => s.id === id)
    const courseById = (id: string) => store.courses.find((c) => c.id === id)
    const coursesFor = (schoolId: string) => store.courses.filter((c) => c.school === schoolId)
    const all = store.courses.flatMap((course) =>
      course.topics.map((topic) => ({ course, topic, key: topicKey(course.id, topic) })),
    )
    const schoolProgress = (id: string) => {
      const list = all.filter((t) => t.course.school === id)
      return { done: list.filter((t) => store.checked[t.key]).length, total: list.length }
    }
    const courseProgress = (id: string) => {
      const course = courseById(id)
      if (!course) return { done: 0, total: 0 }
      const keys = course.topics.map((topic) => topicKey(course.id, topic))
      return { done: keys.filter((k) => store.checked[k]).length, total: keys.length }
    }

    return {
      store,
      toggle: (key) =>
        setStore((s) => ({
          ...s,
          checked: { ...s.checked, [key]: !s.checked[key] },
          doing: { ...s.doing, [key]: false },
        })),
      setTopicStatus: (key, status) =>
        setStore((s) => ({
          ...s,
          checked: { ...s.checked, [key]: status === 'done' },
          doing: { ...s.doing, [key]: status === 'doing' },
        })),
      setMastery: (school, level) =>
        setStore((s) => ({ ...s, mastery: { ...s.mastery, [school]: level } })),
      setView: (scope, view) => setStore((s) => ({ ...s, views: { ...s.views, [scope]: view } })),
      updateSchool: (id, patch) =>
        setStore((s) => ({
          ...s,
          schools: s.schools.map((school) => (school.id === id ? { ...school, ...patch } : school)),
        })),
      addSchool: () => {
        const id = uid()
        setStore((s) => {
          const n = String(s.schools.length + 1).padStart(2, '0')
          const school: School = {
            id,
            number: n,
            name: 'Untitled school',
            short: 'New',
            tagline: 'A new field of study.',
            description: 'Write why this school exists.',
            tone: TONES[s.schools.length % TONES.length],
            kinds: ['knowledge'] as LearningKind[],
            major: false,
            targetMastery: 3,
            projects: ['A first project for this school.'],
          }
          return { ...s, schools: [...s.schools, school] }
        })
        return id
      },
      removeSchool: (id) =>
        setStore((s) => ({
          ...s,
          schools: s.schools.filter((school) => school.id !== id),
          courses: s.courses.filter((course) => course.school !== id),
        })),
      updateCourse: (id, patch) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((course) => (course.id === id ? { ...course, ...patch } : course)),
        })),
      addCourse: (schoolId) => {
        const id = uid()
        setStore((s) => {
          const count = s.courses.filter((c) => c.school === schoolId).length + 1
          const course: Course = {
            id,
            school: schoolId,
            code: `NEW ${100 + count}`,
            title: 'Untitled course',
            level: 1,
            summary: 'What this course is for.',
            why: 'Why you are learning this.',
            objectives: ['Understand the basics'],
            topics: ['First topic'],
            resources: [{ kind: 'practice', title: 'Start with one honest page of notes' }],
            assignments: ['Explain it without notes'],
            project: 'Make something that proves you learned it.',
            method: 'Learn → explain → apply → create.',
          }
          return { ...s, courses: [...s.courses, course] }
        })
        return id
      },
      removeCourse: (id) =>
        setStore((s) => ({ ...s, courses: s.courses.filter((course) => course.id !== id) })),
      addTopic: (courseId, text = 'New topic') =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((course) =>
            course.id === courseId ? { ...course, topics: [...course.topics, text] } : course,
          ),
        })),
      updateTopic: (courseId, index, text) =>
        setStore((s) => {
          const course = s.courses.find((c) => c.id === courseId)
          if (!course) return s
          const old = course.topics[index]
          if (old === undefined) return s
          const topics = course.topics.map((t, i) => (i === index ? text : t))
          const oldKey = topicKey(courseId, old)
          const newKey = topicKey(courseId, text)
          let checked = s.checked
          let doing = s.doing
          if (oldKey !== newKey) {
            checked = dropKey({ ...checked, [newKey]: !!checked[oldKey] }, oldKey)
            doing = dropKey({ ...doing, [newKey]: !!doing[oldKey] }, oldKey)
          }
          return {
            ...s,
            checked,
            doing,
            courses: s.courses.map((c) => (c.id === courseId ? { ...c, topics } : c)),
          }
        }),
      removeTopic: (courseId, index) =>
        setStore((s) => {
          const course = s.courses.find((c) => c.id === courseId)
          if (!course) return s
          const old = course.topics[index]
          const key = old ? topicKey(courseId, old) : ''
          return {
            ...s,
            checked: key ? dropKey(s.checked, key) : s.checked,
            doing: key ? dropKey(s.doing, key) : s.doing,
            courses: s.courses.map((c) =>
              c.id === courseId ? { ...c, topics: c.topics.filter((_, i) => i !== index) } : c,
            ),
          }
        }),
      addObjective: (courseId) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId ? { ...c, objectives: [...c.objectives, 'New objective'] } : c,
          ),
        })),
      updateObjective: (courseId, index, text) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId
              ? { ...c, objectives: c.objectives.map((o, i) => (i === index ? text : o)) }
              : c,
          ),
        })),
      removeObjective: (courseId, index) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId ? { ...c, objectives: c.objectives.filter((_, i) => i !== index) } : c,
          ),
        })),
      addAssignment: (courseId) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId ? { ...c, assignments: [...c.assignments, 'New assignment'] } : c,
          ),
        })),
      updateAssignment: (courseId, index, text) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId
              ? { ...c, assignments: c.assignments.map((o, i) => (i === index ? text : o)) }
              : c,
          ),
        })),
      removeAssignment: (courseId, index) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId ? { ...c, assignments: c.assignments.filter((_, i) => i !== index) } : c,
          ),
        })),
      addResource: (courseId) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId
              ? { ...c, resources: [...c.resources, { kind: 'book' as const, title: 'New resource' }] }
              : c,
          ),
        })),
      updateResource: (courseId, index, patch) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  resources: c.resources.map((r, i) => (i === index ? { ...r, ...patch } : r)),
                }
              : c,
          ),
        })),
      removeResource: (courseId, index) =>
        setStore((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId ? { ...c, resources: c.resources.filter((_, i) => i !== index) } : c,
          ),
        })),
      addSchoolProject: (schoolId) =>
        setStore((s) => ({
          ...s,
          schools: s.schools.map((school) =>
            school.id === schoolId
              ? { ...school, projects: [...school.projects, 'New project'] }
              : school,
          ),
        })),
      updateSchoolProject: (schoolId, index, text) =>
        setStore((s) => ({
          ...s,
          schools: s.schools.map((school) =>
            school.id === schoolId
              ? { ...school, projects: school.projects.map((p, i) => (i === index ? text : p)) }
              : school,
          ),
        })),
      removeSchoolProject: (schoolId, index) =>
        setStore((s) => ({
          ...s,
          schools: s.schools.map((school) =>
            school.id === schoolId
              ? { ...school, projects: school.projects.filter((_, i) => i !== index) }
              : school,
          ),
        })),
      addPage: () => {
        const id = uid()
        const page: Page = {
          id,
          title: 'Untitled',
          blocks: [{ id: uid(), type: 'p', text: '' }],
        }
        setStore((s) => ({ ...s, pages: [page, ...s.pages] }))
        return id
      },
      updatePage: (id, patch) =>
        setStore((s) => ({
          ...s,
          pages: s.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removePage: (id) => setStore((s) => ({ ...s, pages: s.pages.filter((p) => p.id !== id) })),
      addBlock: (pageId, type = 'p') =>
        setStore((s) => ({
          ...s,
          pages: s.pages.map((p) =>
            p.id === pageId
              ? { ...p, blocks: [...p.blocks, { id: uid(), type, text: '', done: false }] }
              : p,
          ),
        })),
      updateBlock: (pageId, blockId, patch) =>
        setStore((s) => ({
          ...s,
          pages: s.pages.map((p) =>
            p.id === pageId
              ? { ...p, blocks: p.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)) }
              : p,
          ),
        })),
      removeBlock: (pageId, blockId) =>
        setStore((s) => ({
          ...s,
          pages: s.pages.map((p) =>
            p.id === pageId ? { ...p, blocks: p.blocks.filter((b) => b.id !== blockId) } : p,
          ),
        })),
      addDaily: (entry) =>
        setStore((s) => ({ ...s, daily: [{ ...entry, id: uid() }, ...s.daily] })),
      removeDaily: (id) => setStore((s) => ({ ...s, daily: s.daily.filter((d) => d.id !== id) })),
      addCuriosity: (text) =>
        setStore((s) => ({
          ...s,
          curiosity: [{ id: uid(), text, learned: false }, ...s.curiosity],
        })),
      toggleCuriosity: (id) =>
        setStore((s) => ({
          ...s,
          curiosity: s.curiosity.map((c) => (c.id === id ? { ...c, learned: !c.learned } : c)),
        })),
      removeCuriosity: (id) =>
        setStore((s) => ({ ...s, curiosity: s.curiosity.filter((c) => c.id !== id) })),
      upsertBook: (book) =>
        setStore((s) => {
          const exists = s.books.some((b) => b.id === book.id)
          return {
            ...s,
            books: exists ? s.books.map((b) => (b.id === book.id ? book : b)) : [book, ...s.books],
          }
        }),
      removeBook: (id) => setStore((s) => ({ ...s, books: s.books.filter((b) => b.id !== id) })),
      addIdea: (text) =>
        setStore((s) => ({ ...s, ideas: [{ id: uid(), text }, ...s.ideas] })),
      removeIdea: (id) => setStore((s) => ({ ...s, ideas: s.ideas.filter((i) => i.id !== id) })),
      upsertManuscript: (m) =>
        setStore((s) => {
          const exists = s.manuscripts.some((x) => x.id === m.id)
          return {
            ...s,
            manuscripts: exists
              ? s.manuscripts.map((x) => (x.id === m.id ? m : x))
              : [m, ...s.manuscripts],
          }
        }),
      removeManuscript: (id) =>
        setStore((s) => ({ ...s, manuscripts: s.manuscripts.filter((m) => m.id !== id) })),
      upsertProject: (p) =>
        setStore((s) => {
          const exists = s.projects.some((x) => x.id === p.id)
          return {
            ...s,
            projects: exists ? s.projects.map((x) => (x.id === p.id ? p : x)) : [p, ...s.projects],
          }
        }),
      removeProject: (id) =>
        setStore((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) })),
      addQuran: (note) =>
        setStore((s) => ({ ...s, quran: [{ ...note, id: uid() }, ...s.quran] })),
      removeQuran: (id) => setStore((s) => ({ ...s, quran: s.quran.filter((q) => q.id !== id) })),
      addPlannerTask: (task) => {
        const id = uid()
        const next: PlannerTask = {
          id,
          date: task.date,
          start: task.start,
          end: task.end,
          title: task.title,
          note: task.note ?? '',
          kind: task.kind,
          courseId: task.courseId,
          topic: task.topic,
          schoolId: task.schoolId,
          done: task.done ?? false,
        }
        setStore((s) => ({ ...s, plannerTasks: [...s.plannerTasks, next] }))
        return id
      },
      updatePlannerTask: (id, patch) =>
        setStore((s) => ({
          ...s,
          plannerTasks: s.plannerTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removePlannerTask: (id) =>
        setStore((s) => ({ ...s, plannerTasks: s.plannerTasks.filter((t) => t.id !== id) })),
      togglePlannerTask: (id) =>
        setStore((s) => ({
          ...s,
          plannerTasks: s.plannerTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      togglePlannerEvent: (id) =>
        setStore((s) => ({
          ...s,
          plannerDone: { ...s.plannerDone, [id]: !s.plannerDone[id] },
        })),
      updateCollegeSession: (patch) =>
        setStore((s) => ({
          ...s,
          college: { ...s.college, session: { ...s.college.session, ...patch } },
        })),
      addCollegeCourse: () => {
        const n = String((store.college.courses.length % 9) + 1)
        const code = `NEW-${n}${uid().slice(0, 3).toUpperCase()}`
        const colors = ['#c45c78', '#a84562', '#7a3650', '#c9957a', '#8a5a9a', '#d4896a', '#c9a3b8']
        const course: CollegeCourse = {
          code,
          short: 'Nouveau',
          title: 'Nouveau cours',
          teacher: '',
          room: '',
          note: '',
          color: colors[store.college.courses.length % colors.length],
          schoolHint: 'career',
        }
        setStore((s) => ({
          ...s,
          college: { ...s.college, courses: [...s.college.courses, course] },
        }))
        return code
      },
      updateCollegeCourse: (code, patch) =>
        setStore((s) => {
          const nextCode = patch.code ?? code
          const courses = s.college.courses.map((c) => (c.code === code ? { ...c, ...patch } : c))
          const slots = s.college.slots.map((slot) => {
            if (slot.course !== code) return slot
            const kindWord = slot.kind === 'L' ? 'lab' : slot.kind === 'T' ? 'théorie' : 'activité'
            return {
              ...slot,
              course: nextCode,
              teacher: patch.teacher !== undefined ? patch.teacher : slot.teacher,
              room: patch.room !== undefined ? patch.room : slot.room,
              title: patch.short !== undefined ? `${patch.short} · ${kindWord}` : slot.title,
            }
          })
          const events =
            nextCode === code
              ? s.college.events
              : s.college.events.map((event) => (event.course === code ? { ...event, course: nextCode } : event))
          return { ...s, college: { ...s.college, courses, slots, events } }
        }),
      removeCollegeCourse: (code) =>
        setStore((s) => ({
          ...s,
          college: {
            ...s.college,
            courses: s.college.courses.filter((c) => c.code !== code),
            slots: s.college.slots.filter((slot) => slot.course !== code),
          },
        })),
      addCollegeSlot: (slot) => {
        const id = uid()
        const next: WeeklySlot = {
          id,
          weekday: slot?.weekday ?? 1,
          start: slot?.start ?? '09:10',
          end: slot?.end ?? '12:10',
          course: slot?.course ?? store.college.courses[0]?.code ?? 'Collège',
          title: slot?.title ?? 'Nouveau bloc',
          room: slot?.room ?? '',
          teacher: slot?.teacher ?? '',
          kind: slot?.kind ?? 'T',
        }
        setStore((s) => ({ ...s, college: { ...s.college, slots: [...s.college.slots, next] } }))
        return id
      },
      updateCollegeSlot: (id, patch) =>
        setStore((s) => ({
          ...s,
          college: {
            ...s.college,
            slots: s.college.slots.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)),
          },
        })),
      removeCollegeSlot: (id) =>
        setStore((s) => ({
          ...s,
          college: { ...s.college, slots: s.college.slots.filter((slot) => slot.id !== id) },
        })),
      addCollegeEvent: (event) => {
        const id = uid()
        const next: CollegeEvent = {
          id,
          date: event?.date ?? new Date().toISOString().slice(0, 10),
          endDate: event?.endDate,
          start: event?.start,
          end: event?.end,
          course: event?.course ?? store.college.courses[0]?.code ?? 'Collège',
          title: event?.title ?? 'Nouvelle évaluation',
          percent: event?.percent,
          kind: event?.kind ?? 'due',
          location: event?.location,
          note: event?.note,
          confirm: event?.confirm,
          effect: event?.effect,
        }
        setStore((s) => ({ ...s, college: { ...s.college, events: [...s.college.events, next] } }))
        return id
      },
      updateCollegeEvent: (id, patch) =>
        setStore((s) => ({
          ...s,
          college: {
            ...s.college,
            events: s.college.events.map((event) => (event.id === id ? { ...event, ...patch } : event)),
          },
        })),
      removeCollegeEvent: (id) =>
        setStore((s) => ({
          ...s,
          college: { ...s.college, events: s.college.events.filter((event) => event.id !== id) },
          plannerDone: dropKey(s.plannerDone, id),
        })),
      resetCollege: () => setStore((s) => ({ ...s, college: seedCollege() })),
      download: () => exportStore(store),
      upload: (text) => setStore(parseImportedStore(text)),
      schoolById,
      courseById,
      coursesFor,
      progress: {
        overall: {
          done: all.filter((t) => store.checked[t.key]).length,
          total: all.length,
        },
        school: schoolProgress,
        course: courseProgress,
      },
    }
  }, [store])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
