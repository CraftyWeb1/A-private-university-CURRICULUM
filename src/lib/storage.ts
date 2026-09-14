import { seedCourses, seedSchools } from '../data/curriculum'
import { STARTER_BOOKS, STARTER_CURIOSITY, STARTER_PROJECTS } from '../data/life'
import { seedCollege } from '../data/planner'
import type { Store } from './types'

const KEY = 'dar-al-ilm-v1'

export const emptyStore = (): Store => ({
  checked: {},
  doing: {},
  mastery: {
    islam: 1,
    intellect: 0,
    world: 0,
    science: 0,
    career: 2,
    writing: 1,
    literature: 1,
    art: 2,
    life: 1,
    inner: 0,
  },
  schools: seedSchools(),
  courses: seedCourses(),
  pages: [],
  views: {},
  daily: [],
  curiosity: STARTER_CURIOSITY,
  books: STARTER_BOOKS,
  ideas: [
    {
      id: 'idea-1',
      text: 'A story about a girl who builds a private university out of notebooks, kitchens, and code.',
    },
  ],
  manuscripts: [],
  projects: STARTER_PROJECTS,
  quran: [],
  plannerTasks: [],
  plannerDone: {},
  college: seedCollege(),
})

export function loadStore(): Store {
  const base = emptyStore()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<Store>
    return {
      ...base,
      ...parsed,
      checked: parsed.checked ?? {},
      doing: parsed.doing ?? {},
      mastery: { ...base.mastery, ...parsed.mastery },
      schools: parsed.schools?.length ? parsed.schools : base.schools,
      courses: parsed.courses?.length ? parsed.courses : base.courses,
      pages: parsed.pages ?? [],
      views: parsed.views ?? {},
      daily: parsed.daily ?? [],
      curiosity: parsed.curiosity ?? base.curiosity,
      books: parsed.books ?? base.books,
      ideas: parsed.ideas ?? base.ideas,
      manuscripts: parsed.manuscripts ?? [],
      projects: parsed.projects ?? base.projects,
      quran: parsed.quran ?? [],
      plannerTasks: parsed.plannerTasks ?? [],
      plannerDone: parsed.plannerDone ?? {},
      college:
        parsed.college?.courses?.length && parsed.college.slots?.length
          ? {
              session: { ...base.college.session, ...parsed.college.session },
              courses: parsed.college.courses,
              slots: parsed.college.slots,
              events: parsed.college.events ?? base.college.events,
            }
          : base.college,
    }
  } catch {
    return base
  }
}

export function saveStore(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function exportStore(store: Store) {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dar-al-ilm.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function parseImportedStore(text: string): Store {
  const parsed = JSON.parse(text) as Partial<Store>
  const base = emptyStore()
  return {
    ...base,
    ...parsed,
    checked: parsed.checked ?? {},
    doing: parsed.doing ?? {},
    mastery: { ...base.mastery, ...parsed.mastery },
    schools: parsed.schools?.length ? parsed.schools : base.schools,
    courses: parsed.courses?.length ? parsed.courses : base.courses,
    pages: parsed.pages ?? [],
    views: parsed.views ?? {},
    daily: parsed.daily ?? [],
    curiosity: parsed.curiosity ?? [],
    books: parsed.books ?? [],
    ideas: parsed.ideas ?? [],
    manuscripts: parsed.manuscripts ?? [],
    projects: parsed.projects ?? [],
    quran: parsed.quran ?? [],
    plannerTasks: parsed.plannerTasks ?? [],
    plannerDone: parsed.plannerDone ?? {},
    college:
      parsed.college?.courses?.length && parsed.college.slots?.length
        ? {
            session: { ...base.college.session, ...parsed.college.session },
            courses: parsed.college.courses,
            slots: parsed.college.slots,
            events: parsed.college.events ?? [],
          }
        : base.college,
  }
}
