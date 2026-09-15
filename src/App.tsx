import { Layout } from './components/Layout'
import { AuthProvider, useAuth } from './lib/auth'
import { StoreProvider } from './lib/store'
import { usePath } from './lib/usePath'
import { AuthScreen } from './views/Auth'
import { Home } from './views/Home'
import { CoursePage, SchoolPage } from './views/School'
import { SemesterPage, TranscriptPage, WeekPage, YearPage } from './views/Plan'
import { PlannerPage } from './views/Planner'
import { PagePage } from './views/Page'
import {
  AuthorPage,
  CuriosityPage,
  DailyPage,
  LibraryPage,
  ProjectsPage,
  QuranPage,
  SearchPage,
} from './views/Studio'

function Screen() {
  const path = usePath()
  let body = <Home />
  if (path.view === 'school') body = <SchoolPage id={path.id} />
  if (path.view === 'course') body = <CoursePage id={path.id} />
  if (path.view === 'page') body = <PagePage id={path.id} />
  if (path.view === 'planner') body = <PlannerPage />
  if (path.view === 'semester') body = <SemesterPage />
  if (path.view === 'week') body = <WeekPage />
  if (path.view === 'year') body = <YearPage />
  if (path.view === 'transcript') body = <TranscriptPage />
  if (path.view === 'library') body = <LibraryPage />
  if (path.view === 'author') body = <AuthorPage />
  if (path.view === 'curiosity') body = <CuriosityPage />
  if (path.view === 'daily') body = <DailyPage />
  if (path.view === 'projects') body = <ProjectsPage />
  if (path.view === 'quran') body = <QuranPage />
  if (path.view === 'search') body = <SearchPage q={path.q} />
  return <Layout path={path}>{body}</Layout>
}

function Gate() {
  const { user } = useAuth()
  if (!user) return <AuthScreen />
  return (
    <StoreProvider key={user.id} userId={user.id}>
      <Screen />
    </StoreProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
