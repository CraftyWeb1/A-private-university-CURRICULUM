import type { Book, CuriosityItem, Project, TermId } from '../lib/types'

export const MANIFESTO = [
  'I know my religion.',
  'I can think.',
  'I can learn.',
  'I can build things.',
  'I can write.',
  'I understand money.',
  'I understand the world.',
  'I can take care of myself.',
  'I can create beautiful things.',
  'I know how to communicate.',
  'I have things I believe in.',
  'I have things I have made.',
  'And I am still curious.',
]

export const KINDS = [
  {
    id: 'knowledge' as const,
    name: 'Knowledge',
    line: 'I understand something.',
  },
  {
    id: 'skill' as const,
    name: 'Skills',
    line: 'I can do something.',
  },
  {
    id: 'character' as const,
    name: 'Character',
    line: 'I have become better at something.',
  },
  {
    id: 'creation' as const,
    name: 'Creation',
    line: 'I made something.',
  },
]

export const READING_SLOTS = [
  { id: 'islam' as const, label: 'Islamic book', note: 'Always one.' },
  { id: 'knowledge' as const, label: 'Nonfiction / knowledge', note: 'The world, the mind, the sciences.' },
  { id: 'literature' as const, label: 'Literature / novel', note: 'Your canon, slowly.' },
  { id: 'study' as const, label: 'A book for the current course', note: 'Tied to this semester’s work.' },
]

export const MANUSCRIPT_STAGES = [
  { id: 'idea', label: 'Idea' },
  { id: 'research', label: 'Research' },
  { id: 'world', label: 'World / argument' },
  { id: 'outline', label: 'Outline' },
  { id: 'draft', label: 'First draft' },
  { id: 'rest', label: 'Rest' },
  { id: 'revision', label: 'Revision' },
  { id: 'beta', label: 'Beta readers' },
  { id: 'editing', label: 'Editing' },
  { id: 'final', label: 'Final' },
] as const

export const WEEK = [
  {
    day: 'Monday',
    items: [
      { school: 'islam', label: 'Islam', minutes: 45 },
      { school: 'career', label: 'Programming', minutes: 60 },
    ],
  },
  {
    day: 'Tuesday',
    items: [
      { school: 'literature', label: 'Reading', minutes: 45 },
      { school: 'writing', label: 'Writing', minutes: 60 },
    ],
  },
  {
    day: 'Wednesday',
    items: [
      { school: 'islam', label: 'Qur’an', minutes: 30 },
      { school: 'intellect', label: 'Current course', minutes: 60 },
    ],
  },
  {
    day: 'Thursday',
    items: [
      { school: 'career', label: 'Programming / project', minutes: 90 },
    ],
  },
  {
    day: 'Friday',
    items: [
      { school: 'islam', label: 'Seerah / Hadith', minutes: 45 },
      { school: 'literature', label: 'Reading', minutes: 30 },
    ],
  },
  {
    day: 'Saturday',
    items: [
      { school: 'art', label: 'Creative project', minutes: 120 },
      { school: 'world', label: 'General knowledge', minutes: 60 },
    ],
  },
  {
    day: 'Sunday',
    items: [
      { school: 'inner', label: 'Weekly review', minutes: 30 },
    ],
  },
]

export const TERMS: Record<
  TermId,
  {
    name: string
    season: string
    months: string
    minors: { name: string; school: string; course: string }[]
    cores: string[]
    project: string
    reading: string
  }
> = {
  fall: {
    name: 'Fall',
    season: 'Harvest term',
    months: 'September → December',
    minors: [
      { name: 'Psychology', school: 'inner', course: 'psy-101' },
      { name: 'World history', school: 'world', course: 'his-101' },
    ],
    cores: ['isl-101', 'qrn-101', 'cs-201'],
    project: 'A themed paper collection, or a chapter of a book.',
    reading: 'One Islamic book, one history, one novel, one psychology intro.',
  },
  winter: {
    name: 'Winter',
    season: 'Frost term',
    months: 'January → April',
    minors: [
      { name: 'Personal finance', school: 'life', course: 'lif-101' },
      { name: 'Literature', school: 'literature', course: 'lit-101' },
    ],
    cores: ['srh-101', 'cs-301', 'wrt-101'],
    project: 'Ship a programming project. Write a short story.',
    reading: 'Seerah, a money book, a novel from the canon.',
  },
  spring: {
    name: 'Spring',
    season: 'Blossom term',
    months: 'May → June',
    minors: [
      { name: 'Biology', school: 'science', course: 'bio-101' },
      { name: 'Philosophy', school: 'intellect', course: 'phl-101' },
    ],
    cores: ['akl-101', 'wrt-201'],
    project: 'A character notebook, plus a short fiction.',
    reading: 'Akhlaq, a philosophy primer, a novel.',
  },
  summer: {
    name: 'Summer',
    season: 'Sun term',
    months: 'July → August',
    minors: [
      { name: 'Art history / visual language', school: 'art', course: 'art-101' },
      { name: 'Geography', school: 'world', course: 'geo-101' },
    ],
    cores: ['fqh-101', 'pro-101'],
    project: 'Portfolio refresh, or a complete junk journal.',
    reading: 'A fiqh primer with a teacher, an atlas, one novel for pleasure.',
  },
}

export const YEAR_ONE = [
  {
    term: 'fall' as const,
    focus: 'Foundations of deen, TypeScript/React, psychology, ancient history.',
  },
  {
    term: 'winter' as const,
    focus: 'Seerah, shipping software, writing craft, money, a personal canon.',
  },
  {
    term: 'spring' as const,
    focus: 'Akhlaq as practice, fiction, biology literacy, first philosophy.',
  },
  {
    term: 'summer' as const,
    focus: 'Everyday fiqh with a teacher, professional presence, making with the hands, maps.',
  },
]

export const MAJORS = [
  { school: 'islam', name: 'Islam' },
  { school: 'career', name: 'Software development' },
  { school: 'writing', name: 'Writing' },
  { school: 'art', name: 'Creative arts' },
  { school: 'intellect', name: 'General knowledge / intellect' },
]

export function currentTerm(date = new Date()): TermId {
  const month = date.getMonth()
  if (month >= 8) return 'fall'
  if (month <= 3) return 'winter'
  if (month <= 5) return 'spring'
  return 'summer'
}

export function todayPlan(date = new Date()) {
  const day = date.getDay()
  const index = day === 0 ? 6 : day - 1
  return WEEK[index]
}

export const STARTER_CURIOSITY: CuriosityItem[] = [
  'How airplanes fly',
  'How elevators work',
  'How perfume is made',
  'How diamonds form',
  'How bread rises',
  'How chocolate is made',
  'How vaccines work',
  'How passports work',
  'How airports operate',
  'How the internet works',
  'How GPS works',
  'How satellites work',
  'How banks transfer money',
  'How elections work',
  'How movies are produced',
  'How books are published',
  'How fashion houses work',
  'How museums preserve artifacts',
  'How archaeology works',
  'How forensic science works',
  'How languages evolve',
  'Why accents exist',
  'How dreams work',
  'How memory works',
  'Why we sleep',
  'Why seasons exist',
  'Why tides happen',
  'How volcanoes work',
  'How earthquakes happen',
  'How hurricanes form',
  'How oceans work',
  'How glaciers form',
].map((text, i) => ({ id: `cur-${i + 1}`, text, learned: false }))

export const STARTER_BOOKS: Book[] = [
  {
    id: 'bk-1',
    title: 'Being Muslim',
    author: 'Asad Tarsin',
    topic: 'Foundations',
    slot: 'islam',
    status: 'want',
    rating: 0,
    why: 'A gentle, serious start to living the deen with understanding.',
    notes: '',
  },
  {
    id: 'bk-2',
    title: 'The Sealed Nectar',
    author: 'Safiur Rahman al-Mubarakpuri',
    topic: 'Seerah',
    slot: 'islam',
    status: 'want',
    rating: 0,
    why: 'To know him ﷺ in order.',
    notes: '',
  },
  {
    id: 'bk-3',
    title: 'Purification of the Heart',
    author: 'Hamza Yusuf / al-Mawlud',
    topic: 'Akhlaq',
    slot: 'islam',
    status: 'want',
    rating: 0,
    why: 'Character as a science of the soul.',
    notes: '',
  },
  {
    id: 'bk-4',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    topic: 'Mind',
    slot: 'knowledge',
    status: 'want',
    rating: 0,
    why: 'A map of bias and judgment.',
    notes: '',
  },
  {
    id: 'bk-5',
    title: 'Destiny Disrupted',
    author: 'Tamim Ansary',
    topic: 'History',
    slot: 'knowledge',
    status: 'want',
    rating: 0,
    why: 'World history with the ummah in the middle of the story.',
    notes: '',
  },
  {
    id: 'bk-6',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    topic: 'Novel',
    slot: 'literature',
    status: 'want',
    rating: 0,
    why: 'Voice, irony, and the social novel at their sharpest.',
    notes: '',
  },
  {
    id: 'bk-7',
    title: 'Palace Walk',
    author: 'Naguib Mahfouz',
    topic: 'Arabic novel',
    slot: 'literature',
    status: 'want',
    rating: 0,
    why: 'A doorway into modern Arabic fiction.',
    notes: '',
  },
  {
    id: 'bk-8',
    title: 'Bird by Bird',
    author: 'Anne Lamott',
    topic: 'Craft',
    slot: 'study',
    status: 'want',
    rating: 0,
    why: 'To write the books, not only study writing.',
    notes: '',
  },
]

export const STARTER_PROJECTS: Project[] = [
  { id: 'pr-1', title: 'RichCook', kind: 'software', status: 'active', notes: 'Semester project energy. Ship, then refine.' },
  { id: 'pr-2', title: 'Developer portfolio', kind: 'software', status: 'active', notes: 'Evidence, not adjectives.' },
  { id: 'pr-3', title: 'Personal tracking systems', kind: 'software', status: 'seed', notes: 'The university can feed the app, and the app can feed the university.' },
  { id: 'pr-4', title: 'Future company', kind: 'software', status: 'seed', notes: 'A long major. Keep a notes file, not only a dream.' },
  { id: 'pr-5', title: 'Widgetable-like app', kind: 'software', status: 'seed', notes: 'When a semester needs a product, this is a candidate.' },
  { id: 'pr-6', title: 'Own CMS / blog', kind: 'software', status: 'seed', notes: 'A place for essays, seerah notes, and stories.' },
  { id: 'pr-7', title: 'Theme kit collection', kind: 'craft', status: 'seed', notes: 'Research → papers → stickers → ephemera → packaging → photograph → catalog.' },
  { id: 'pr-8', title: 'Qur’an notebook', kind: 'deen', status: 'active', notes: 'Use the journal in this university.' },
  { id: 'pr-9', title: '100 books before I die', kind: 'literature', status: 'active', notes: 'Living list, not a guilt machine.' },
  { id: 'pr-10', title: 'Household recipe book', kind: 'life', status: 'seed', notes: 'Your people’s food, written down.' },
]
