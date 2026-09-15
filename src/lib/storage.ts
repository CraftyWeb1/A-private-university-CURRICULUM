import { seedCourses, seedSchools } from '../data/curriculum'
import { STARTER_BOOKS, STARTER_CURIOSITY, STARTER_PROJECTS } from '../data/life'
import { blankCollege, seedCollege } from '../data/planner'
import type { Store } from './types'

export const LEGACY_KEY = 'dar-al-ilm-v1'
const CLAIMED_KEY = 'dar-al-ilm-legacy-claimed'

export function spaceKey(userId: string) {
  return `dar-al-ilm-space-${userId}`
}

export const seededStore = (): Store => ({
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

export const blankStore = (): Store => ({
  checked: {},
  doing: {},
  mastery: {},
  schools: [],
  courses: [],
  pages: [],
  views: {},
  daily: [],
  curiosity: [],
  books: [],
  ideas: [],
  manuscripts: [],
  projects: [],
  quran: [],
  plannerTasks: [],
  plannerDone: {},
  college: blankCollege(),
})

export const emptyStore = seededStore

function hydrateStore(parsed: Partial<Store>, base: Store): Store {
  return {
    ...base,
    ...parsed,
    checked: parsed.checked ?? {},
    doing: parsed.doing ?? {},
    mastery: { ...base.mastery, ...parsed.mastery },
    schools: parsed.schools ?? base.schools,
    courses: parsed.courses ?? base.courses,
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
    college: parsed.college
      ? {
          session: { ...base.college.session, ...parsed.college.session },
          courses: parsed.college.courses ?? [],
          slots: parsed.college.slots ?? [],
          events: parsed.college.events ?? [],
        }
      : base.college,
  }
}

export function hasUnclaimedLegacy() {
  try {
    return Boolean(localStorage.getItem(LEGACY_KEY)) && !localStorage.getItem(CLAIMED_KEY)
  } catch {
    return false
  }
}

export function claimLegacy(userId: string) {
  localStorage.setItem(CLAIMED_KEY, userId)
}

export function loadLegacyStore(): Store {
  const base = seededStore()
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return base
    return hydrateStore(JSON.parse(raw) as Partial<Store>, base)
  } catch {
    return base
  }
}

export function loadUserStore(userId: string): Store {
  try {
    const raw = localStorage.getItem(spaceKey(userId))
    if (!raw) return blankStore()
    return hydrateStore(JSON.parse(raw) as Partial<Store>, blankStore())
  } catch {
    return blankStore()
  }
}

export function saveUserStore(userId: string, store: Store) {
  localStorage.setItem(spaceKey(userId), JSON.stringify(store))
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
  return hydrateStore(parsed, blankStore())
}
