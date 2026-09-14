export type LearningKind = 'knowledge' | 'skill' | 'character' | 'creation'

export type ResourceKind = 'teacher' | 'book' | 'site' | 'course' | 'practice'

export type BookSlot = 'islam' | 'knowledge' | 'literature' | 'study'
export type BookStatus = 'want' | 'reading' | 'finished'
export type ManuscriptStage =
  | 'idea'
  | 'research'
  | 'world'
  | 'outline'
  | 'draft'
  | 'rest'
  | 'revision'
  | 'beta'
  | 'editing'
  | 'final'

export type TermId = 'fall' | 'winter' | 'spring' | 'summer'

export type School = {
  id: string
  number: string
  name: string
  short: string
  tagline: string
  description: string
  tone: string
  kinds: LearningKind[]
  major: boolean
  targetMastery: number
  projects: string[]
}

export type Resource = {
  kind: ResourceKind
  title: string
  note?: string
}

export type Course = {
  id: string
  school: string
  code: string
  title: string
  level: 1 | 2 | 3 | 4
  summary: string
  why: string
  objectives: string[]
  topics: string[]
  resources: Resource[]
  assignments: string[]
  project: string
  method?: string
}

export type DailyEntry = {
  id: string
  date: string
  what: string
  why: string
  connect: string
  more: boolean
}

export type CuriosityItem = {
  id: string
  text: string
  learned: boolean
}

export type Book = {
  id: string
  title: string
  author: string
  topic: string
  slot: BookSlot
  status: BookStatus
  rating: number
  why: string
  notes: string
}

export type StoryIdea = {
  id: string
  text: string
}

export type Manuscript = {
  id: string
  title: string
  genre: string
  premise: string
  theme: string
  stage: ManuscriptStage
  notes: string
}

export type Project = {
  id: string
  title: string
  kind: string
  status: 'seed' | 'active' | 'resting' | 'made'
  notes: string
}

export type QuranNote = {
  id: string
  surah: string
  ayah: string
  translation: string
  vocabulary: string
  context: string
  tafsir: string
  learned: string
  applies: string
  action: string
  date: string
}

export type ViewKind = 'list' | 'board' | 'table' | 'gallery'

export type TopicStatus = 'todo' | 'doing' | 'done'

export type BlockType = 'p' | 'h' | 'todo' | 'bullet'

export type Block = {
  id: string
  type: BlockType
  text: string
  done?: boolean
}

export type Page = {
  id: string
  title: string
  blocks: Block[]
}

export type PlannerKind = 'school' | 'curriculum' | 'life'

export type PlannerTask = {
  id: string
  date: string
  start?: string
  end?: string
  title: string
  note: string
  kind: PlannerKind
  courseId?: string
  topic?: string
  schoolId?: string
  done: boolean
}

export type Store = {
  checked: Record<string, boolean>
  doing: Record<string, boolean>
  mastery: Record<string, number>
  schools: School[]
  courses: Course[]
  pages: Page[]
  views: Record<string, ViewKind>
  daily: DailyEntry[]
  curiosity: CuriosityItem[]
  books: Book[]
  ideas: StoryIdea[]
  manuscripts: Manuscript[]
  projects: Project[]
  quran: QuranNote[]
  plannerTasks: PlannerTask[]
  plannerDone: Record<string, boolean>
}

export type Route =
  | { view: 'home' }
  | { view: 'school'; id: string }
  | { view: 'course'; id: string }
  | { view: 'planner' }
  | { view: 'semester' }
  | { view: 'week' }
  | { view: 'year' }
  | { view: 'library' }
  | { view: 'author' }
  | { view: 'curiosity' }
  | { view: 'daily' }
  | { view: 'projects' }
  | { view: 'quran' }
  | { view: 'transcript' }
  | { view: 'search'; q: string }
