import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import EducationParams from './pages/EducationParams'
import { SubjectsPage, SubjectDetail } from './pages/Lessons'
import CoursesPage from './pages/Courses'
import SchedulePage from './pages/Schedule'
import DocumentsPage, { DocumentCategoryPage, DocumentFilePage } from './pages/Documents'
import Payments from './pages/Payments'
import ExamsPage, { ExamDetail } from './pages/Exams'
import Assignments, { AssignmentDetail } from './pages/Assignments'
import Library from './pages/Library'
import BookDetail from './pages/BookDetail'
import BookReader from './pages/BookReader'
import { Announcements, Blog, ContentDetail, Vacancies } from './pages/Content'
import Complaints, { ComplaintDetail } from './pages/Complaints'
import SurveysPage, { SurveyDetail } from './pages/Surveys'
import Support from './pages/Support'
import UsersPage from './pages/Users'
import Groups from './pages/Groups'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Notifications, { More } from './pages/Notifications'
import { useCurrentUser, useStore } from './store/useStore'
import { ThemeProvider } from './lib/ThemeContext'

function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated())
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useStore.persist.hasHydrated())
    return unsub
  }, [])
  return hydrated
}

function Guard({ roles }) {
  const me = useCurrentUser()
  const hydrated = useHydrated()
  if (!hydrated) return <div className="grid min-h-screen place-items-center text-brand-800">Yuklanmoqda...</div>
  if (!me) return <Navigate to="/login" replace />
  if (roles && !roles.includes(me.role)) return <Navigate to="/" replace />
  return <Outlet />
}

function Guest() {
  const me = useCurrentUser()
  const hydrated = useHydrated()
  if (!hydrated) return <div className="grid min-h-screen place-items-center text-brand-800">Yuklanmoqda...</div>
  if (me) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Guest />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<Guard />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="lessons" element={<Navigate to="/schedule" replace />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="subjects/:name" element={<SubjectDetail />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="payments" element={<Payments />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="documents/:id" element={<DocumentCategoryPage />} />
            <Route path="documents/:id/:fileId" element={<DocumentFilePage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="exams/:id" element={<ExamDetail />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="education-params" element={<EducationParams />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:id" element={<AssignmentDetail />} />
            <Route path="library" element={<Library />} />
            <Route path="library/:id" element={<BookDetail />} />
            <Route path="library/:id/read" element={<BookReader />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="announcements/:id" element={<ContentDetail collection="announcements" path="/announcements" />} />
            <Route path="vacancies" element={<Vacancies />} />
            <Route path="vacancies/:id" element={<ContentDetail collection="vacancies" path="/vacancies" />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<ContentDetail collection="posts" path="/blog" />} />
            <Route element={<Guard roles={['super_admin', 'student']} />}>
              <Route path="complaints" element={<Complaints />} />
              <Route path="complaints/:id" element={<ComplaintDetail />} />
            </Route>
            <Route path="surveys" element={<SurveysPage />} />
            <Route path="surveys/:id" element={<SurveyDetail />} />
            <Route path="support" element={<Support />} />
            <Route path="support/:id" element={<Support />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="more" element={<More />} />
            <Route element={<Guard roles={['super_admin']} />}>
              <Route path="users" element={<UsersPage />} />
              <Route path="teachers" element={<UsersPage roleFilter="teacher" />} />
              <Route path="groups" element={<Groups />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            <Route element={<Guard roles={['super_admin', 'teacher']} />}>
              <Route path="students" element={<UsersPage roleFilter="student" />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}
