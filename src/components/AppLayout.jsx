import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  BarChart3,
  ClipboardList,
  FileQuestion,
  FileText,
  Folder,
  GraduationCap,
  Home,
  Inbox,
  LayoutDashboard,
  Library,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareWarning,
  Moon,
  Newspaper,
  Plus,
  Settings,
  Shield,
  Sun,
  Users,
  LifeBuoy,
  X,
} from 'lucide-react'
import SupportChat from './SupportChat'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  { to: '/exams/tests', icon: FileQuestion, label: 'Testlar', roles: ['super_admin', 'teacher', 'student'] },
  { to: '/exams/results', icon: BarChart3, label: 'Natijalar', roles: ['super_admin', 'teacher', 'student'] },
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
  { more: true, icon: Plus, label: 'Hammasi uchun' },
  { to: '/subjects', icon: BookOpen, label: 'Fanlar' },
  { to: '/settings', icon: Settings, label: 'Sozlamalar' },
]

const STAFF_BOTTOM = [
  { to: '/', icon: Home, label: 'Asosiy' },
  { to: '/attendance', icon: ClipboardList, label: 'Davomat' },
  { more: true, icon: Plus, label: 'Hammasi uchun' },
  { to: '/assignments', icon: FileText, label: 'Topshiriqlar' },
  { to: '/settings', icon: Settings, label: 'Sozlamalar' },
]

const MORE_ACTIONS = [
  { to: '/exams/tests', icon: FileQuestion, label: 'Testlar', tint: '#4f46e5' },
  { to: '/library', icon: Library, label: 'Library', tint: '#c2410c' },
  { to: '/documents', icon: Folder, label: 'Hujjatlar', tint: '#0369a1' },
  { to: '/attendance', icon: ClipboardList, label: 'Davomat', tint: '#147a36' },
  { to: '/announcements', icon: Newspaper, label: 'Yangiliklar', tint: '#2f80ed' },
]

const MORE_OFFSETS = [
  { x: -148, y: -92 },
  { x: -78, y: -128 },
  { x: 0, y: -150 },
  { x: 78, y: -128 },
  { x: 148, y: -92 },
]

function pathMatches(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

function tabKeyFor(pathname, items, moreOpen) {
  if (moreOpen) return 'more'
  if (MORE_ACTIONS.some((action) => pathMatches(pathname, action.to))) return 'more'
  for (const item of items) {
    if (item.more) continue
    if (item.to === '/') {
      if (pathname === '/') return '/'
    } else if (pathMatches(pathname, item.to)) {
      return item.to
    }
  }
  return null
}

function readTabBox(row, el) {
  if (!row || !el) return null
  const rr = row.getBoundingClientRect()
  const ir = el.getBoundingClientRect()
  return {
    x: ir.left - rr.left,
    y: ir.top - rr.top,
    w: ir.width,
    h: ir.height,
  }
}

function MobileTabBar({ items, pathname, moreOpen, setMoreOpen, navigate }) {
  const rowRef = useRef(null)
  const liquidRef = useRef(null)
  const iconRefs = useRef({})
  const fromBoxRef = useRef(null)
  const prevKeyRef = useRef(null)
  const [blob, setBlob] = useState({ x: 0, y: 0, w: 32, h: 32, visible: false })
  const activeKey = tabKeyFor(pathname, items, moreOpen)

  useLayoutEffect(() => {
    const el = liquidRef.current
    const to = readTabBox(rowRef.current, activeKey ? iconRefs.current[activeKey] : null)
    if (!to || !activeKey) {
      setBlob((b) => ({ ...b, visible: false }))
      return undefined
    }

    const from = fromBoxRef.current
    fromBoxRef.current = to
    prevKeyRef.current = activeKey
    setBlob({ ...to, visible: true })

    if (!el) return undefined
    el.getAnimations().forEach((anim) => anim.cancel())

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dx = from ? to.x - from.x : 0
    if (!from || Math.abs(dx) <= 4 || reduceMotion) return undefined

    const expandX = Math.min(from.x, to.x)
    const expandY = to.y + to.h * 0.06
    const expandW = Math.abs(dx) + Math.max(from.w, to.w)
    const expandH = Math.max(22, to.h * 0.84)

    el.animate(
      [
        {
          transform: `translate3d(${from.x}px, ${from.y}px, 0)`,
          width: `${from.w}px`,
          height: `${from.h}px`,
        },
        {
          transform: `translate3d(${expandX}px, ${expandY}px, 0)`,
          width: `${expandW}px`,
          height: `${expandH}px`,
          offset: 0.42,
        },
        {
          transform: `translate3d(${to.x}px, ${to.y}px, 0)`,
          width: `${to.w}px`,
          height: `${to.h}px`,
        },
      ],
      { duration: 560, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'none' },
    )
    return undefined
  }, [activeKey])

  useEffect(() => {
    const row = rowRef.current
    if (!row) return undefined
    const snap = () => {
      if (liquidRef.current?.getAnimations().some((anim) => anim.playState === 'running')) return
      const key = prevKeyRef.current
      const box = readTabBox(row, key ? iconRefs.current[key] : null)
      if (!box) return
      fromBoxRef.current = box
      setBlob({ ...box, visible: true })
    }
    const ro = new ResizeObserver(snap)
    ro.observe(row)
    window.addEventListener('resize', snap)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', snap)
    }
  }, [])

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[88] border-t border-slate-100 bg-[var(--app-nav)] px-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] md:hidden">
      <div ref={rowRef} className="relative flex items-stretch justify-between">
        <span
          ref={liquidRef}
          className={cn('tab-liquid', blob.visible && 'is-visible')}
          style={{
            transform: `translate3d(${blob.x}px, ${blob.y}px, 0)`,
            width: `${blob.w}px`,
            height: `${blob.h}px`,
          }}
          aria-hidden
        />
        {items.map((item) => {
          if (item.more) {
            const moreActive = activeKey === 'more'
            return (
              <button
                key="more"
                type="button"
                aria-label="Hammasi uchun"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((v) => !v)}
                className="tab-bar-item relative z-[1] flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium"
              >
                <span
                  ref={(el) => {
                    iconRefs.current.more = el
                  }}
                  className="tab-bar-plus-slot"
                >
                  <span className={cn('more-dock-plus', moreOpen && 'is-open', moreActive && 'is-active')}>
                    <Plus size={22} strokeWidth={2.2} />
                  </span>
                </span>
                <span className={cn('tab-bar-label max-w-[3.8rem] text-center leading-[1.15]', moreActive && 'is-active')}>
                  Hammasi uchun
                </span>
              </button>
            )
          }

          const Icon = item.icon
          const active = activeKey === item.to
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => {
                setMoreOpen(false)
                navigate(item.to)
              }}
              className="tab-bar-item relative z-[1] flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium"
            >
              <span
                ref={(el) => {
                  iconRefs.current[item.to] = el
                }}
                className={cn('tab-bar-icon', active && 'is-active')}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span className={cn('tab-bar-label leading-tight', active && 'is-active')}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

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
  const [moreOpen, setMoreOpen] = useState(false)
  const isStudent = me?.role === 'student'

  const items = useMemo(() => ALL_ITEMS.filter((i) => i.roles.includes(me?.role)), [me?.role])
  const unread = notifications.filter((n) => n.userId === me?.id && !n.read).length
  const bottom = isStudent ? STUDENT_BOTTOM : STAFF_BOTTOM

  const group = groups.find((g) => g.id === me?.groupId)
  const [semester, setSemester] = useState(() => String(Math.min(8, Math.max(1, (group?.course || 1) * 2 - 1))))
  const semesterOptions = useMemo(() => Array.from({ length: 8 }, (_, i) => String(i + 1)), [])

  useEffect(() => {
    setOpen(false)
    setMoreOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!moreOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [moreOpen])

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
                'items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                item.to === '/support' ? 'hidden lg:flex' : 'flex',
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

      <div className="flex min-h-0 min-w-0 flex-col bg-[var(--app-bg)]">
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
            onSearch={() => setSearchOpen(true)}
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
            'safe-bottom w-full min-w-0',
            'mx-auto max-w-[1440px] px-4 py-4 sm:px-5 md:px-6 lg:px-8 lg:py-6 xl:px-10',
          )}
        >
          <Outlet context={{ onMenu: () => setOpen(true), semester, setSemester, openSearch: () => setSearchOpen(true) }} />
        </main>
        <SupportChat />
      </div>

      <button
        type="button"
        aria-label="Yopish"
        aria-hidden={!moreOpen}
        tabIndex={moreOpen ? 0 : -1}
        className={cn('more-dock-backdrop md:hidden', moreOpen && 'is-open')}
        onClick={() => setMoreOpen(false)}
      />

      <div
        className="pointer-events-none fixed left-1/2 z-[90] md:hidden"
        style={{ bottom: 'calc(3.55rem + env(safe-area-inset-bottom))' }}
        aria-hidden={!moreOpen}
      >
        {MORE_ACTIONS.map((action, i) => {
          const ActionIcon = action.icon
          const current = pathMatches(location.pathname, action.to)
          const offset = MORE_OFFSETS[i]
          return (
            <button
              key={action.to}
              type="button"
              tabIndex={moreOpen ? 0 : -1}
              onClick={() => {
                setMoreOpen(false)
                navigate(action.to)
              }}
              className={cn('more-dock-item', moreOpen && 'is-open', current && 'is-current')}
              style={{
                '--dx': `${offset.x}px`,
                '--dy': `${offset.y}px`,
                '--tint': action.tint,
                transitionDelay: moreOpen ? `${40 + i * 48}ms` : `${(MORE_ACTIONS.length - 1 - i) * 28}ms`,
              }}
            >
              <span className="more-dock-orb">
                <ActionIcon size={22} strokeWidth={1.9} />
              </span>
              <span className="more-dock-label">{action.label}</span>
            </button>
          )
        })}
      </div>

      <MobileTabBar
        items={bottom}
        pathname={location.pathname}
        moreOpen={moreOpen}
        setMoreOpen={setMoreOpen}
        navigate={navigate}
      />

      {isStudent && <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </div>
  )
}

function documentTitle(path) {
  const map = {
    '/attendance': 'Davomat',
    '/education-params': 'O‘quv parametrlari',
    '/schedule': 'Dars jadvali',
    '/exams/tests': 'Testlar',
    '/exams/results': 'Natijalar',
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
    '/courses': 'Kurslar',
  }
  const hit = Object.keys(map).find((k) => path === k || (k !== '/' && path.startsWith(k)))
  return map[hit] || 'tizimsEdu.uz'
}

