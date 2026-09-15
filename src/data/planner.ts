import type {
  CollegeCourse,
  CollegeEvent,
  CollegeKind,
  CollegeSession,
  CollegeState,
  WeeklySlot,
} from '../lib/types'

export type { CollegeCourse, CollegeEvent, CollegeKind, WeeklySlot } from '../lib/types'

export type PedWeek = {
  n: number
  start: string
  end: string
  note?: string
}

export const SESSION: CollegeSession = {
  name: 'Automne 2026',
  college: 'Collège de Maisonneuve',
  program: 'Techniques de l’informatique',
  start: '2026-08-20',
  end: '2026-12-23',
}

export const COLLEGE_COURSES: CollegeCourse[] = [
  {
    code: '420-5D6',
    short: 'Hybrides',
    title: 'Mobiles et hybrides',
    teacher: 'Guillaume Lachance',
    room: 'D3673',
    note: 'Lun T / Jeu L · 100 % individuel · double seuil',
    color: '#c45c78',
    schoolHint: 'career',
  },
  {
    code: '420-H4K',
    short: 'Sécurité',
    title: 'Sécurité offensive',
    teacher: 'Mohamed Guesmia',
    room: 'D3744',
    note: 'Lun L / Jeu T · double seuil · finale sem. 16',
    color: '#a84562',
    schoolHint: 'career',
  },
  {
    code: '340-P10',
    short: 'Éthique',
    title: 'Éthique et politique',
    teacher: 'Sébastien Mussi',
    room: 'E4403',
    note: 'Lun 16:10 · cahier manuscrit, aucun écran',
    color: '#7a3650',
    schoolHint: 'intellect',
  },
  {
    code: '420-5D2',
    short: 'Web 2',
    title: 'Applications web 2',
    teacher: 'Vincent Archambault-Bouffard',
    room: 'D3704',
    note: 'Mar L / Jeu T · double seuil · équipes ≤ 30 %',
    color: '#c9957a',
    schoolHint: 'career',
  },
  {
    code: '420-5D7',
    short: 'IoT',
    title: 'Internet des objets',
    teacher: 'Jihene Rezgui',
    room: 'D3739',
    note: 'Mar T / Ven L · Arduino + Pi',
    color: '#8a5a9a',
    schoolHint: 'career',
  },
  {
    code: '420-5D1',
    short: 'Projet 3',
    title: 'Projet 3',
    teacher: 'Lorry James Encarnacion',
    room: 'D3739 / D3744',
    note: 'Équipes de 4 · pas de double seuil',
    color: '#d4896a',
    schoolHint: 'career',
  },
  {
    code: '601-103',
    short: 'Littérature',
    title: 'Littérature contemporaine',
    teacher: 'Jean Sébastien',
    room: 'B1151 / E3305',
    note: 'Mer. théorie / ven. lab · retard 5 %/jour',
    color: '#c9a3b8',
    schoolHint: 'literature',
  },
]

export const WEEKLY_SLOTS: WeeklySlot[] = [
  { id: 'mon-hyb', weekday: 1, start: '08:10', end: '10:10', course: '420-5D6', title: 'Hybrides · théorie', room: 'D3673', teacher: 'Lachance', kind: 'T' },
  { id: 'mon-sec', weekday: 1, start: '10:10', end: '12:10', course: '420-H4K', title: 'Sécurité · lab', room: 'D3744', teacher: 'Guesmia', kind: 'L' },
  { id: 'mon-eth', weekday: 1, start: '16:10', end: '18:00', course: '340-P10', title: 'Éthique · théorie', room: 'E4403', teacher: 'Mussi', kind: 'T' },
  { id: 'tue-web', weekday: 2, start: '09:10', end: '12:10', course: '420-5D2', title: 'Web 2 · lab', room: 'D3704', teacher: 'Archambault-Bouffard', kind: 'L' },
  { id: 'tue-act', weekday: 2, start: '12:10', end: '14:10', course: 'Collège', title: 'Activités communes', room: '', teacher: '', kind: 'activity' },
  { id: 'tue-iot', weekday: 2, start: '14:10', end: '16:10', course: '420-5D7', title: 'IoT · théorie', room: 'D3739', teacher: 'Rezgui', kind: 'T' },
  { id: 'wed-p3', weekday: 3, start: '08:10', end: '11:10', course: '420-5D1', title: 'Projet 3 · lab', room: 'D3739', teacher: 'Encarnacion', kind: 'L' },
  { id: 'wed-lit', weekday: 3, start: '12:10', end: '14:10', course: '601-103', title: 'Littérature · théorie', room: 'B1151', teacher: 'Sébastien', kind: 'T' },
  { id: 'thu-hyb', weekday: 4, start: '09:10', end: '12:10', course: '420-5D6', title: 'Hybrides · lab', room: 'D3673', teacher: 'Lachance', kind: 'L' },
  { id: 'thu-act', weekday: 4, start: '12:10', end: '14:10', course: 'Collège', title: 'Activités pédagogiques', room: '', teacher: '', kind: 'activity' },
  { id: 'thu-web', weekday: 4, start: '14:10', end: '16:10', course: '420-5D2', title: 'Web 2 · théorie', room: 'D3704', teacher: 'VAB', kind: 'T' },
  { id: 'thu-sec', weekday: 4, start: '16:10', end: '18:00', course: '420-H4K', title: 'Sécurité · théorie', room: 'D3744', teacher: 'Guesmia', kind: 'T' },
  { id: 'fri-iot', weekday: 5, start: '08:10', end: '11:10', course: '420-5D7', title: 'IoT · lab', room: 'D3739', teacher: 'Rezgui', kind: 'L' },
  { id: 'fri-lit', weekday: 5, start: '12:10', end: '14:10', course: '601-103', title: 'Littérature · lab', room: 'E3305', teacher: 'Sébastien', kind: 'L' },
  { id: 'fri-p3', weekday: 5, start: '16:10', end: '18:00', course: '420-5D1', title: 'Projet 3 · théorie', room: 'D3744', teacher: 'Encarnacion', kind: 'T' },
]

export const PED_WEEKS: PedWeek[] = [
  { n: 1, start: '2026-08-20', end: '2026-08-26', note: 'Début de session' },
  { n: 2, start: '2026-08-27', end: '2026-09-02' },
  { n: 3, start: '2026-09-03', end: '2026-09-09', note: 'Fête du travail' },
  { n: 4, start: '2026-09-10', end: '2026-09-16', note: 'Horaire du lundi le jeudi 10' },
  { n: 5, start: '2026-09-17', end: '2026-09-23', note: 'Désinscription ven. 18' },
  { n: 6, start: '2026-09-24', end: '2026-09-30' },
  { n: 7, start: '2026-10-01', end: '2026-10-07', note: 'Élections lun. 5' },
  { n: 8, start: '2026-10-08', end: '2026-10-14', note: 'Deux intras + JSR' },
  { n: 9, start: '2026-10-15', end: '2026-10-21', note: 'JSR jeu.–ven.' },
  { n: 10, start: '2026-10-22', end: '2026-10-28' },
  { n: 11, start: '2026-10-29', end: '2026-11-04' },
  { n: 12, start: '2026-11-05', end: '2026-11-11', note: 'Date limite d’abandon' },
  { n: 13, start: '2026-11-12', end: '2026-11-18' },
  { n: 14, start: '2026-11-19', end: '2026-11-25', note: 'Finales IoT' },
  { n: 15, start: '2026-11-26', end: '2026-12-02', note: 'Semaine la plus chargée' },
  { n: 16, start: '2026-12-03', end: '2026-12-09', note: 'Finale Sécurité' },
]

export const COLLEGE_EVENTS: CollegeEvent[] = [
  { id: 'start', date: '2026-08-20', course: 'Collège', title: 'Début de session', kind: 'admin' },
  { id: 'labour', date: '2026-09-07', course: 'Collège', title: 'Fête du travail — pas de cours', kind: 'holiday' },
  { id: 'mon-on-thu', date: '2026-09-10', course: 'Collège', title: 'Horaire du lundi', kind: 'admin', effect: 'monday' },
  { id: 'jonas', date: '2026-09-14', start: '16:10', end: '18:00', course: '340-P10', title: 'Lecture Jonas — test surprise possible', percent: '3%', kind: 'note', location: 'E4403' },
  { id: 'web-p1s', date: '2026-09-15', start: '09:10', end: '12:10', course: '420-5D2', title: 'Énoncé du projet 1 (équipes 3–4)', percent: '10%', kind: 'note', location: 'D3704' },
  { id: 'lit-para', date: '2026-09-16', start: '12:10', end: '14:10', course: '601-103', title: 'Paragraphe de dissertation', percent: '6%', kind: 'due', location: 'B1151', note: 'Possible aussi ven. 11 si déjà fait.' },
  { id: 'desins', date: '2026-09-18', course: 'Collège', title: 'Date limite de désinscription', kind: 'admin', note: 'Sans mention au bulletin.' },
  { id: 'lit-plan-e', date: '2026-09-18', start: '12:10', end: '14:10', course: '601-103', title: 'Plan comparatif (équipe)', percent: '5%', kind: 'due', location: 'E3305' },
  { id: 'p10-e1', date: '2026-09-21', start: '16:10', end: '18:00', course: '340-P10', title: 'Intra éthique #1', percent: '27,5%', kind: 'exam', location: 'E4403', note: 'Feuille 8½×11 recto + textes non annotés. Meilleure des 2 = 55%.' },
  { id: 'lit-plan-i', date: '2026-09-25', start: '12:10', end: '14:10', course: '601-103', title: 'Plan comparatif (individuel)', percent: '6%', kind: 'due', location: 'E3305' },
  { id: 'iot-quiz', date: '2026-09-29', start: '14:10', end: '16:10', course: '420-5D7', title: 'Quiz noté', percent: '5%', kind: 'quiz', location: 'D3739', note: 'Double seuil.' },
  { id: 'p3-alpha', date: '2026-09-30', start: '08:10', end: '11:10', course: '420-5D1', title: 'Sprint 1 — Alpha + démo', percent: '20%', kind: 'due', location: 'D3739' },
  { id: 'h4k-tp1', date: '2026-10-01', start: '16:10', end: '18:00', course: '420-H4K', title: 'Remise TP1', percent: '15%', kind: 'due', location: 'D3744' },
  { id: 'hyb-tp1', date: '2026-10-01', start: '09:10', end: '12:10', course: '420-5D6', title: 'Remise TP1 Android', percent: '10%', kind: 'due', location: 'D3673' },
  { id: 'iot-intra', date: '2026-10-02', start: '08:10', end: '11:10', course: '420-5D7', title: 'Examen pratique mi-session', percent: '20%', kind: 'exam', location: 'D3739', note: '3 h · double seuil · départ du projet 45%.' },
  { id: 'elections', date: '2026-10-05', course: 'Collège', title: 'Élections provinciales — pas de cours', kind: 'holiday', note: 'Repris ven. 9 oct (horaire du lundi).' },
  { id: 'web-p1', date: '2026-10-06', start: '09:10', end: '12:10', course: '420-5D2', title: 'Remise projet 1', percent: '10%', kind: 'due', location: 'D3704' },
  { id: 'lit-diss1', date: '2026-10-07', start: '12:10', end: '14:10', course: '601-103', title: 'Dissertation partielle + conférence', percent: '20%', kind: 'exam', location: 'B1151', confirm: true },
  { id: 'hyb-intra', date: '2026-10-08', start: '09:10', end: '12:10', course: '420-5D6', title: 'Intra Hybrides', percent: '30%', kind: 'exam', location: 'D3673', confirm: true, note: 'Même jour que Sécurité.' },
  { id: 'h4k-intra', date: '2026-10-08', start: '16:10', end: '18:00', course: '420-H4K', title: 'Intra Sécurité', percent: '25%', kind: 'exam', location: 'D3744', confirm: true, note: 'Même jour que Hybrides.' },
  { id: 'horaire-lun-oct', date: '2026-10-09', course: 'Collège', title: 'Horaire du lundi', kind: 'admin', effect: 'monday' },
  { id: 'thanksgiving', date: '2026-10-12', course: 'Collège', title: 'Action de grâce — pas de cours', kind: 'holiday' },
  { id: 'web-intra', date: '2026-10-13', start: '09:10', end: '12:10', course: '420-5D2', title: 'Intra Web 2', percent: '30%', kind: 'exam', location: 'D3704', confirm: true, note: 'Conflit JSR · report probable 15–16 oct.' },
  { id: 'jsr', date: '2026-10-13', endDate: '2026-10-16', course: 'Collège', title: 'JSR / JRE — pas d’horaire régulier', kind: 'holiday' },
  { id: 'p10-e2', date: '2026-10-19', start: '16:10', end: '18:00', course: '340-P10', title: 'Intra éthique #2 (Anders)', percent: '27,5%', kind: 'exam', location: 'E4403' },
  { id: 'h4k-tp2', date: '2026-10-19', start: '10:10', end: '12:10', course: '420-H4K', title: 'Remise TP2', percent: '15%', kind: 'due', location: 'D3744', note: 'Jeu. 15 = JSR, donc lab lundi.' },
  { id: 'web-at2', date: '2026-10-20', start: '09:10', end: '12:10', course: '420-5D2', title: 'Atelier 2 Socket.IO', percent: '5%', kind: 'due', location: 'D3704' },
  { id: 'p3-beta', date: '2026-10-21', start: '08:10', end: '11:10', course: '420-5D1', title: 'Sprint 2 — Beta + démo', percent: '20%', kind: 'due', location: 'D3739' },
  { id: 'iot-e1', date: '2026-10-21', course: '420-5D7', title: 'Projet étape 1', percent: '8%', kind: 'due', location: 'D3739' },
  { id: 'web-p2s', date: '2026-10-27', start: '09:10', end: '12:10', course: '420-5D2', title: 'Énoncé du projet 2', percent: '20%', kind: 'note', location: 'D3704' },
  { id: 'decol', date: '2026-10-19', endDate: '2026-11-04', course: '601-103', title: 'Discussions décoloniales (6 cours)', percent: '15%', kind: 'note', note: 'Lire Fontaine ou Simpson.' },
  { id: 'iot-e2', date: '2026-11-04', course: '420-5D7', title: 'Projet étape 2', percent: '13%', kind: 'due', location: 'D3739' },
  { id: 'abandon', date: '2026-11-05', course: 'Collège', title: 'Date limite d’abandon', kind: 'admin' },
  { id: 'iot-e3', date: '2026-11-11', course: '420-5D7', title: 'Projet étape 3', percent: '10%', kind: 'due', location: 'D3739' },
  { id: 'lit-diss2', date: '2026-11-11', course: '601-103', title: 'Dissertation critique à la maison', percent: '30%', kind: 'due', note: 'Pénalité langue 1 %/faute.' },
  { id: 'hyb-tp2s', date: '2026-11-12', course: '420-5D6', title: 'Énoncé TP2 Flutter', percent: '15%', kind: 'note' },
  { id: 'h4k-tp3s', date: '2026-11-12', course: '420-H4K', title: 'Début TP3', percent: '15%', kind: 'note' },
  { id: 'iot-final-p', date: '2026-11-20', start: '08:10', end: '11:10', course: '420-5D7', title: 'Épreuve finale pratique', percent: '15%', kind: 'exam', location: 'D3739' },
  { id: 'p10-synth', date: '2026-11-23', start: '16:10', end: '18:00', course: '340-P10', title: 'Cours de synthèse — dissertation 900 mots', kind: 'note', location: 'E4403' },
  { id: 'web-p2', date: '2026-11-24', start: '09:10', end: '12:10', course: '420-5D2', title: 'Remise et présentation projet 2', percent: '20%', kind: 'due', location: 'D3704', note: 'Même journée que l’intra théorique IoT.' },
  { id: 'iot-final-t', date: '2026-11-24', start: '14:10', end: '16:10', course: '420-5D7', title: 'Épreuve finale théorique', percent: '15%', kind: 'exam', location: 'D3739' },
  { id: 'p3-final', date: '2026-11-25', course: '420-5D1', title: 'Sprint 3 — version finale', percent: '20%', kind: 'due', location: 'D3739' },
  { id: 'hyb-final', date: '2026-11-26', start: '09:10', end: '12:10', course: '420-5D6', title: 'Épreuve finale + remise TP2', percent: '45%', kind: 'exam', location: 'D3673' },
  { id: 'h4k-tp3', date: '2026-11-30', start: '10:10', end: '12:10', course: '420-H4K', title: 'Remise TP3', percent: '15%', kind: 'due', location: 'D3744' },
  { id: 'p10-final', date: '2026-11-30', start: '16:10', end: '18:00', course: '340-P10', title: 'Examen final — dissertation 900 mots', percent: '30%', kind: 'exam', location: 'E4403', note: 'Ou jour FG 14 déc.' },
  { id: 'web-final', date: '2026-12-01', start: '09:10', end: '12:10', course: '420-5D2', title: 'Épreuve finale', percent: '30%', kind: 'exam', location: 'D3704', note: '30 % théorie sans doc + 70 % pratique.' },
  { id: 'p3-wrap', date: '2026-12-02', course: '420-5D1', title: 'Rapport, entrevue, analyse critique', percent: '22%', kind: 'due' },
  { id: 'iot-pres', date: '2026-12-02', course: '420-5D7', title: 'Projet étapes 4–5 + présentation', percent: '14%', kind: 'due', location: 'D3739' },
  { id: 'lit-crea', date: '2026-12-02', course: '601-103', title: 'Projet direction artistique (fantastique)', percent: '15%', kind: 'due' },
  { id: 'h4k-final', date: '2026-12-03', endDate: '2026-12-09', course: '420-H4K', title: 'Épreuve finale Sécurité', percent: '30%', kind: 'exam', location: 'D3744', note: 'Pratique 80 % + théorie 20 %. Peut glisser dans les JES.' },
  { id: 'jes', date: '2026-12-14', endDate: '2026-12-23', course: 'Collège', title: 'Jours d’évaluations sommatives', kind: 'admin', note: 'Jour FG le 14 déc.', effect: 'off' },
  { id: 'euf', date: '2026-12-16', course: '601-103', title: 'Épreuve uniforme de français', kind: 'exam', note: 'Si admissible. Confirme sur Omnivox.' },
  { id: 'fin', date: '2026-12-23', course: 'Collège', title: 'Fin de session', kind: 'admin', note: 'Notes le 31 déc.' },
]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function seedCollege(): CollegeState {
  return {
    session: { ...SESSION },
    courses: clone(COLLEGE_COURSES),
    slots: clone(WEEKLY_SLOTS),
    events: clone(COLLEGE_EVENTS),
  }
}

export function blankCollege(): CollegeState {
  return {
    session: { name: '', college: '', program: '', start: '', end: '' },
    courses: [],
    slots: [],
    events: [],
  }
}

export const WEEKDAYS = [
  { n: 1, label: 'Lundi' },
  { n: 2, label: 'Mardi' },
  { n: 3, label: 'Mercredi' },
  { n: 4, label: 'Jeudi' },
  { n: 5, label: 'Vendredi' },
]

export function iso(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseIso(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(d: Date, n: number) {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

export function startOfWeek(d: Date) {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  start.setDate(start.getDate() + diff)
  return start
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function minutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function hhmm(total: number) {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function inSession(date: Date, session: CollegeSession = SESSION) {
  const key = iso(date)
  return key >= session.start && key <= session.end
}

export function eventHitsDate(event: CollegeEvent, key: string) {
  const end = event.endDate ?? event.date
  return key >= event.date && key <= end
}

export function eventsOn(date: Date, events: CollegeEvent[]) {
  const key = iso(date)
  return events.filter((e) => eventHitsDate(e, key))
}

export function isOffDay(date: Date, events: CollegeEvent[]) {
  return eventsOn(date, events).some((e) => e.kind === 'holiday' || e.effect === 'off')
}

export function usesMondayGrid(date: Date, events: CollegeEvent[]) {
  return eventsOn(date, events).some((e) => e.effect === 'monday')
}

export function collegeWeekOf(date: Date) {
  const key = iso(date)
  return PED_WEEKS.find((w) => key >= w.start && key <= w.end) ?? null
}

export function collegeByCode(code: string, courses: CollegeCourse[]) {
  return courses.find((c) => c.code === code)
}

export function slotsOn(
  date: Date,
  slots: WeeklySlot[],
  events: CollegeEvent[],
  session: CollegeSession = SESSION,
): WeeklySlot[] {
  if (!inSession(date, session) || isOffDay(date, events)) return []
  const weekday = usesMondayGrid(date, events) ? 1 : date.getDay()
  if (weekday === 0 || weekday === 6) return []
  return slots.filter((s) => s.weekday === weekday)
}

export function pocketsOn(
  date: Date,
  slots: WeeklySlot[],
  events: CollegeEvent[],
  session: CollegeSession = SESSION,
) {
  const weekday = date.getDay()
  if (isOffDay(date, events)) {
    return [{ weekday, start: '09:00', end: '19:00', label: 'Congé — curriculum possible' }]
  }
  const daySlots = slotsOn(date, slots, events, session)
  if (!daySlots.length && (weekday === 0 || weekday === 6 || !inSession(date, session))) {
    const label = weekday === 6 ? 'Samedi — curriculum' : weekday === 0 ? 'Dimanche — curriculum' : 'Journée libre'
    return [{ weekday, start: '09:00', end: '19:00', label }]
  }
  const busy = daySlots
    .map((s) => ({ start: minutes(s.start), end: minutes(s.end) }))
    .sort((a, b) => a.start - b.start)
  const merged: { start: number; end: number }[] = []
  for (const b of busy) {
    const last = merged[merged.length - 1]
    if (!last || b.start > last.end) merged.push({ ...b })
    else last.end = Math.max(last.end, b.end)
  }
  const gaps: { weekday: number; start: string; end: string; label: string }[] = []
  const gridStart = 8 * 60
  const gridEnd = 19 * 60
  let cursor = gridStart
  for (const b of merged) {
    if (b.start - cursor >= 40) {
      gaps.push({
        weekday,
        start: hhmm(cursor),
        end: hhmm(b.start),
        label: cursor >= 16 * 60 ? 'Soirée' : 'Trou — coller du curriculum',
      })
    }
    cursor = Math.max(cursor, b.end)
  }
  if (gridEnd - cursor >= 40) {
    gaps.push({
      weekday,
      start: hhmm(cursor),
      end: hhmm(gridEnd),
      label: cursor >= 16 * 60 ? 'Soirée' : 'Trou — coller du curriculum',
    })
  }
  return gaps
}

export function upcomingEvents(events: CollegeEvent[], from = new Date(), days = 21) {
  const start = iso(from)
  const end = iso(addDays(from, days))
  return events
    .filter((e) => {
      const last = e.endDate ?? e.date
      return last >= start && e.date <= end && e.kind !== 'class'
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? '').localeCompare(b.start ?? ''))
}

export function kindLabel(kind: CollegeKind | 'curriculum' | 'life' | 'school') {
  const map: Record<string, string> = {
    exam: 'Examen',
    due: 'Remise',
    quiz: 'Quiz',
    note: 'Cours',
    admin: 'Admin',
    holiday: 'Congé',
    class: 'Cours',
    activity: 'Activité',
    curriculum: 'Curriculum',
    life: 'Vie',
    school: 'École',
  }
  return map[kind] ?? kind
}

export const EVENT_KINDS: CollegeKind[] = ['exam', 'due', 'quiz', 'note', 'admin', 'holiday']
