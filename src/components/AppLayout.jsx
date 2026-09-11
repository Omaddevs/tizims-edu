import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Library,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareWarning,
  Moon,
  Newspaper,
  Settings,
  Shield,
  Sun,
  Users,
  LifeBuoy,
  X,
} from 'lucide-react'
import SupportChat from './SupportChat'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCurrentUser, useStore } from '../store/useStore'
import { Avatar, cn } from './ui'
import { DesktopSidebar, DesktopTopbar } from './HemisDesktop'
import { GlobalSearch } from './GlobalSearch'
import { ROLE_LABEL } from '../lib/utils'
import { useTheme } from '../lib/ThemeContext'

const ALL_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Asosiy', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/schedule', icon: CalendarDays, label: 'Dars jadvali', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/subjects', icon: BookOpen, label: 'Fanlar', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/courses', icon: GraduationCap, label: 'Kurslar', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/exams', icon: ClipboardList, label: 'Imtihonlar', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/users', icon: Users, label: 'Foydalanuvchilar', roles: ['super_admin'] },
  { to: '/teachers', icon: GraduationCap, label: 'O‘qituvchilar', roles: ['super_admin'] },
  { to: '/students', icon: Users, label: 'Talabalar', roles: ['super_admin', 'teacher'] },
  { to: '/groups', icon: Shield, label: 'Guruhlar', roles: ['super_admin'] },
  { to: '/attendance', icon: ClipboardList, label: 'Davomat', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/education-params', icon: GraduationCap, label: 'O‘quv parametrlari', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/assignments', icon: FileText, label: 'Topshiriqlar', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/library', icon: Library, label: 'Elektron kutubxona', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/announcements', icon: Megaphone, label: 'E’lonlar', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/vacancies', icon: Briefcase, label: 'Vakansiyalar', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/blog', icon: Newspaper, label: 'Blog', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/surveys', icon: Inbox, label: 'So‘rovnomalar', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/complaints', icon: MessageSquareWarning, label: 'Shikoyatlar', roles: ['super_admin', 'student'] },
  { to: '/reports', icon: BookOpen, label: 'Hisobotlar', roles: ['super_admin'] },
  { to: '/support', icon: LifeBuoy, label: 'Support', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/settings', icon: Settings, label: 'Sozlamalar', roles: ['super_admin', 'teacher', 'student'] },
]

const STUDENT_BOTTOM = [
  { to: '/', icon: Home, label: 'Asosiy' },
  { to: '/schedule', icon: CalendarDays, label: 'Jadval' },
  { to: '/announcements', icon: Newspaper, label: 'Yangiliklar', center: true },
  { to: '/subjects', icon: BookOpen, label: 'Fanlar' },
  { to: '/more', icon: LayoutGrid, label: 'Barchasi' },
]

const STAFF_BOTTOM = [
  { to: '/', icon: Home, label: 'Asosiy' },
  { to: '/attendance', icon: ClipboardList, label: 'Davomat' },
  { to: '/announcements', icon: Newspaper, label: 'Yangiliklar', center: true },
  { to: '/assignments', icon: FileText, label: 'Topshiriqlar' },
  { to: '/more', icon: LayoutGrid, label: 'Barchasi' },
]

export default function AppLayout() {
  const me = useCurrentUser()
  const logout = useStore((s) => s.logout)
  const notifications = useStore((s) => s.notifications)
  const groups = useStore((s) => s.groups)
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const isStudent = me?.role === 'student'

  const items = useMemo(() => ALL_ITEMS.filter((i) => i.roles.includes(me?.role)), [me?.role])
  const unread = notifications.filter((n) => n.userId === me?.id && !n.read).length
  const bottom = isStudent ? STUDENT_BOTTOM : STAFF_BOTTOM

  const group = groups.find((g) => g.id === me?.groupId)
  const [semester, setSemester] = useState(() => String(Math.min(8, Math.max(1, (group?.course || 1) * 2 - 1))))
  const semesterOptions = useMemo(() => Array.from({ length: 8 }, (_, i) => String(i + 1)), [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isStudent) return undefined
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isStudent])

  const showInert = () => {
    setToast('Bu bo‘lim tez orada qo‘shiladi')
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  const doLogout = () => {
    logout()
    navigate('/login')
  }

  const NavList = ({ onClick }) => (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 scrollbar-thin">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )

  return (
    <div
      className={cn(
        'min-h-dvh bg-[var(--app-bg)] lg:grid',
        isStudent
          ? collapsed
            ? 'lg:grid-cols-[76px_minmax(0,1fr)]'
            : 'lg:grid-cols-[264px_minmax(0,1fr)]'
          : 'lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)]',
      )}
    >
      {isStudent ? (
        <DesktopSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onLogout={doLogout}
          onInert={showInert}
          onSearch={() => setSearchOpen(true)}
          searchOpen={searchOpen}
        />
      ) : (
        <aside className="sticky top-0 hidden h-screen flex-col bg-brand-800 text-white lg:flex dark:bg-[#0f1a14]">
          <div className="flex items-center gap-3 px-5 py-6">
            <img src="/logo-white.svg" alt="" className="h-11 w-11 bg-transparent object-contain" />
            <div>
              <p className="text-lg font-extrabold tracking-tight">tizimsEdu.uz</p>
              <p className="text-xs text-white/60">Talaba kabineti</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="mx-3 mb-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-left"
          >
            <Avatar name={me?.name} color={me?.avatarColor} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{me?.name}</p>
              <p className="truncate text-xs text-white/60">{me?.email}</p>
            </div>
          </button>
          <NavList />
          <div className="p-3">
            <button
              onClick={doLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
            >
              <LogOut size={16} />
              Chiqish
            </button>
          </div>
        </aside>
      )}

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          {isStudent ? (
            <div className="absolute inset-y-0 left-0 shadow-2xl">
              <DesktopSidebar
                overlay
                collapsed={false}
                onLogout={doLogout}
                onInert={showInert}
                onSearch={() => setSearchOpen(true)}
                searchOpen={searchOpen}
                onNavigate={() => setOpen(false)}
              />
            </div>
          ) : (
            <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-brand-800 text-white">
              <div className="flex items-center justify-between px-5 py-5">
                <div className="flex items-center gap-2">
                  <img src="/logo-white.svg" alt="" className="h-9 w-9 bg-transparent object-contain" />
                  <p className="text-lg font-extrabold">tizimsEdu.uz</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>
              <div className="mx-3 mb-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                <Avatar name={me?.name} color={me?.avatarColor} />
                <div>
                  <p className="text-sm font-semibold">{me?.name}</p>
                  <p className="text-xs text-white/60">{ROLE_LABEL[me?.role]}</p>
                </div>
              </div>
              <NavList onClick={() => setOpen(false)} />
              <div className="p-3">
                <button
                  onClick={doLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold"
                >
                  <LogOut size={16} /> Chiqish
                </button>
              </div>
            </aside>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-col bg-[var(--app-bg)]">
        {isStudent ? (
          <DesktopTopbar
            me={me}
            unread={unread}
            semester={semester}
            setSemester={setSemester}
            semesterOptions={semesterOptions}
            groupName={group?.name || ''}
            onBell={() => navigate('/notifications')}
            onMenu={() => setOpen(true)}
          />
        ) : (
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-100 bg-[var(--app-surface)] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:px-8 xl:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <button className="rounded-xl p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)}>
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">{ROLE_LABEL[me?.role]}</p>
                <h1 className="truncate text-base font-bold leading-tight lg:text-lg">
                  {location.pathname === '/' ? `Xush kelibsiz, ${me?.name?.split(' ')[0]}` : documentTitle(location.pathname)}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--app-surface-2)] text-slate-500"
                aria-label="Mavzu"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="relative rounded-2xl bg-[var(--app-surface-2)] p-2.5 shadow-sm"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
            </div>
          </header>
        )}

        <main
          className={cn(
            'safe-bottom w-full min-w-0 overflow-x-hidden',
            'mx-auto max-w-[1440px] px-4 py-4 sm:px-5 md:px-6 lg:px-8 lg:py-6 xl:px-10',
          )}
        >
          <Outlet context={{ onMenu: () => setOpen(true), semester, setSemester, openSearch: () => setSearchOpen(true) }} />
        </main>
        <SupportChat />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-[var(--app-nav)] px-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] md:hidden">
        <div className="flex items-stretch justify-between">
          {bottom.map((item) => {
            const Icon = item.icon
            const active =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
            const center = item.center
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                className="flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium"
              >
                <span
                  className={cn(
                    'grid place-items-center transition',
                    center
                      ? cn('h-8', active ? 'text-[#2f80ed]' : 'text-slate-400')
                      : cn('h-8 w-8 rounded-full', active ? 'bg-[#2f80ed] text-white' : 'text-slate-400'),
                  )}
                >
                  <Icon size={center ? 22 : 18} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                <span className={cn('leading-tight', active ? 'font-semibold text-[#2f80ed]' : 'text-slate-400')}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {isStudent && <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function documentTitle(path) {
  const map = {
    '/attendance': 'Davomat',
    '/education-params': 'O‘quv parametrlari',
    '/schedule': 'Dars jadvali',
    '/exams': 'Imtihonlar',
    '/assignments': 'Topshiriqlar',
    '/library': 'Elektron kutubxona',
    '/documents': 'Hujjatlar',
    '/payments': 'Moliyaviy to‘lov',
    '/announcements': 'Yangiliklar',
    '/vacancies': 'Vakansiyalar',
    '/blog': 'Blog',
    '/surveys': 'So‘rovnomalar',
    '/complaints': 'Shikoyatlar',
    '/support': 'Yordam va yo‘riqnoma',
    '/users': 'Foydalanuvchilar',
    '/teachers': 'O‘qituvchilar',
    '/students': 'Talabalar',
    '/groups': 'Guruhlar',
    '/reports': 'Hisobotlar',
    '/settings': 'Sozlamalar',
    '/notifications': 'Xabarlar',
    '/more': 'Barchasi',
    '/courses': 'Kurslar',
  }
  const hit = Object.keys(map).find((k) => path === k || (k !== '/' && path.startsWith(k)))
  return map[hit] || 'tizimsEdu.uz'
}
