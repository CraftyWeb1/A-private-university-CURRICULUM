export type Path =
  | { view: 'home' }
  | { view: 'school'; id: string }
  | { view: 'course'; id: string }
  | { view: 'page'; id: string }
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

export function parseHash(hash = window.location.hash): Path {
  const raw = hash.replace(/^#\/?/, '')
  const [path, query] = raw.split('?')
  const parts = (path || '').split('/').filter(Boolean)
  const q = new URLSearchParams(query || '')
  const head = parts[0]
  if (head === 'school' && parts[1]) return { view: 'school', id: parts[1] }
  if (head === 'course' && parts[1]) return { view: 'course', id: parts[1] }
  if (head === 'page' && parts[1]) return { view: 'page', id: parts[1] }
  if (head === 'semester') return { view: 'semester' }
  if (head === 'week') return { view: 'week' }
  if (head === 'year') return { view: 'year' }
  if (head === 'library') return { view: 'library' }
  if (head === 'author') return { view: 'author' }
  if (head === 'curiosity') return { view: 'curiosity' }
  if (head === 'daily') return { view: 'daily' }
  if (head === 'projects') return { view: 'projects' }
  if (head === 'quran') return { view: 'quran' }
  if (head === 'transcript') return { view: 'transcript' }
  if (head === 'search') return { view: 'search', q: q.get('q') || '' }
  return { view: 'home' }
}

export function href(path: string) {
  return `#/${path.replace(/^\//, '')}`
}
