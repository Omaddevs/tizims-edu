import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Bell,
  BookOpen,
  Briefcase,
  Calculator,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Folder,
  GraduationCap,
  GripVertical,
  Info,
  Library,
  LifeBuoy,
  LineChart as LineChartIcon,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Plus,
  QrCode,
  Search,
  Settings,
  Settings2,
  Shield,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { calcPercentage, percentTone, STATUS, summarize } from '../lib/attendance'
import { Avatar, Badge, Select, SemesterSelect, cn } from '../components/ui'
import { BannerStrip, IconGridItem, QuickBlue, QrBtn, shortName } from '../components/HemisUI'
import { MONTHS_UZ, MONTHS_UZ_SHORT, addDays, matchesDate, startOfWeek } from '../lib/schedule'
import { ROLE_LABEL } from '../lib/utils'
import { openSupportChat } from '../lib/supportChat'

const SEMESTERS = Array.from({ length: 8 }, (_, i) => String(i + 1))

const DASH_WIDGETS = [
  { id: 'assignments', title: 'Topshiriqlar', span: 1, icon: ClipboardCheck, tint: '#14b8a6' },
  { id: 'schedule', title: 'Dars jadvali', span: 1, icon: CalendarDays, tint: '#22c55e' },
  { id: 'progress', title: 'O‘zlashtirish', span: 1, icon: BadgeCheck, tint: '#a855f7' },
  { id: 'attendance', title: 'Davomat', span: 1, icon: CalendarClock, tint: '#3b82f6' },
  { id: 'gpa', title: 'GPA', span: 2, icon: Star, tint: '#f59e0b' },
  { id: 'gpaRating', title: 'GPA reyting', span: 2, icon: Settings2, tint: '#ef4444' },
]

const DASH_WIDGET_IDS = DASH_WIDGETS.map((w) => w.id)

function defaultWidgetPrefs() {
  return {
    order: [...DASH_WIDGET_IDS],
    enabled: Object.fromEntries(DASH_WIDGET_IDS.map((id) => [id, true])),
  }
}

function widgetStorageKey(userId) {
  return `tizims-dash-widgets:${userId || 'anon'}`
}

function readWidgetPrefs(userId) {
  const fallback = defaultWidgetPrefs()
  try {
    const raw = localStorage.getItem(widgetStorageKey(userId))
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    const saved = Array.isArray(parsed.order) ? parsed.order : []
    const order = [
      ...saved.filter((id) => DASH_WIDGET_IDS.includes(id)),
      ...DASH_WIDGET_IDS.filter((id) => !saved.includes(id)),
    ]
    const enabled = Object.fromEntries(
      DASH_WIDGET_IDS.map((id) => [id, parsed.enabled?.[id] !== false]),
    )
    return { order, enabled }
  } catch {
    return fallback
  }
}

function writeWidgetPrefs(userId, prefs) {
  try {
    localStorage.setItem(widgetStorageKey(userId), JSON.stringify(prefs))
  } catch {
    /* ignore quota */
  }
}

function studentGpa(id) {
  if (!id) return 3.0
  let hash = 0
  for (const ch of String(id)) hash = (hash * 31 + ch.charCodeAt(0)) % 1000
  return Math.min(5, 2.2 + (hash % 250) / 100)
}

export default function Dashboard() {
  const me = useCurrentUser()
  if (me?.role === 'student') return <StudentHome />
  if (me?.role === 'teacher') return <TeacherHome />
  return <AdminHome />
}

function AdminHome() {
  const me = useCurrentUser()
  const users = useStore((s) => s.users)
  const attendance = useStore((s) => s.attendance)
  const complaints = useStore((s) => s.complaints)
  const announcements = useStore((s) => s.announcements)
  const posts = useStore((s) => s.posts)
  const students = users.filter((u) => u.role === 'student')
  const teachers = users.filter((u) => u.role === 'teacher')
  const avg = Math.round(
    (students.reduce((s, u) => s + calcPercentage(attendance.filter((a) => a.studentId === u.id)), 0) / Math.max(1, students.length)) * 10,
  ) / 10
  const openC = complaints.filter((c) => c.status !== 'resolved').length
  const sum = summarize(attendance)
  const pie = [
    { name: 'Kelgan', value: sum.present, color: '#10b981' },
    { name: 'Kechikkan', value: sum.late, color: '#f59e0b' },
    { name: 'Kelmadi', value: sum.absent, color: '#f43f5e' },
  ]
  const line = weekLine(attendance)

  const quickActions = [
    { label: 'Foydalanuvchilar', sub: 'Barcha a’zolar', icon: Users, to: '/users' },
    { label: 'Guruhlar', sub: 'Guruhlarni boshqarish', icon: Shield, to: '/groups' },
    { label: 'Hisobotlar', sub: 'Statistika va export', icon: BookOpen, to: '/reports' },
    { label: 'Dars jadvali', sub: 'Darslarni qo‘shish', icon: CalendarDays, to: '/schedule' },
  ]
  const iconTiles = [
    { label: 'Davomat', icon: ClipboardList, to: '/attendance' },
    { label: 'O‘qituvchilar', icon: GraduationCap, to: '/teachers' },
    { label: 'Talabalar', icon: Users, to: '/students' },
    { label: 'Topshiriqlar', icon: FileText, to: '/assignments' },
    { label: 'Elektron kutubxona', icon: Library, to: '/library' },
    { label: 'E’lonlar', icon: Megaphone, to: '/announcements' },
    { label: 'Vakansiyalar', icon: Briefcase, to: '/vacancies' },
    { label: 'Blog', icon: Newspaper, to: '/blog' },
    { label: 'Shikoyatlar', icon: MessageSquareWarning, to: '/complaints' },
    { label: 'Support', icon: LifeBuoy, to: '/support' },
  ]
  const banners = buildBanners({ announcements, posts })

  return (
    <div className="space-y-5 pb-2">
      <Hero me={me} banners={banners} quickActions={quickActions} iconTiles={iconTiles} />
      <div className="space-y-5 px-4 lg:px-0">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat title="Jami talabalar" value={students.length.toLocaleString()} delta="+12%" icon={GraduationCap} />
          <Stat title="Jami o‘qituvchilar" value={teachers.length} delta="+3%" icon={BookOpen} />
          <Stat title="O‘rtacha davomat" value={`${avg}%`} delta="+2.1%" icon={TrendingUp} />
          <Stat title="Ochiq shikoyatlar" value={openC} delta="-4" negative icon={MessageSquareWarning} />
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="card p-5 lg:col-span-3">
            <h3 className="font-bold">Davomat dinamikasi</h3>
            <p className="text-sm text-muted">So‘nggi 7 kun</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={line}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="foiz" stroke="#147a36" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-5 lg:col-span-2">
            <h3 className="font-bold">Davomat holati</h3>
            <div className="mt-2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3}>
                    {pie.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm">
              {pie.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                    {p.name}
                  </span>
                  <b>{p.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeacherHome() {
  const me = useCurrentUser()
  const users = useStore((s) => s.users)
  const groups = useStore((s) => s.groups)
  const attendance = useStore((s) => s.attendance)
  const assignments = useStore((s) => s.assignments)
  const announcements = useStore((s) => s.announcements)
  const posts = useStore((s) => s.posts)
  const myGroups = groups.filter((g) => me.groupIds?.includes(g.id))
  const myStudents = users.filter((u) => u.role === 'student' && me.groupIds?.includes(u.groupId))
  const myAsg = assignments.filter((a) => a.teacherId === me.id)

  const quickActions = [
    { label: 'Davomat', sub: 'Belgilash va tarix', icon: QrCode, to: '/attendance' },
    { label: 'Dars jadvali', sub: 'Guruh darslari', icon: CalendarDays, to: '/schedule' },
    { label: 'Topshiriqlar', sub: 'Baholash va nazorat', icon: FileText, to: '/assignments' },
    { label: 'Talabalarim', sub: 'Guruhlar ro‘yxati', icon: Users, to: '/students' },
  ]
  const iconTiles = [
    { label: 'E’lonlar', icon: Megaphone, to: '/announcements' },
    { label: 'Vakansiyalar', icon: Briefcase, to: '/vacancies' },
    { label: 'Blog', icon: Newspaper, to: '/blog' },
    { label: 'Support', icon: LifeBuoy, to: '/support' },
    { label: 'Bildirishnoma', icon: Bell, to: '/notifications' },
    { label: 'Sozlamalar', icon: Settings, to: '/settings' },
  ]
  const banners = buildBanners({ announcements, posts })

  return (
    <div className="space-y-5 pb-2">
      <Hero me={me} banners={banners} quickActions={quickActions} iconTiles={iconTiles} />
      <div className="space-y-4 px-4 lg:px-0">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat title="Guruhlarim" value={myGroups.length} icon={Shield} />
          <Stat title="Talabalarim" value={myStudents.length} icon={Users} />
          <Stat title="Faol topshiriqlar" value={myAsg.filter((a) => a.status === 'active').length} icon={FileText} />
        </div>
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 p-4 font-bold">Guruhlaringizdagi davomat</div>
          <ul className="divide-y divide-slate-100">
            {myStudents.slice(0, 8).map((s) => {
              const pct = calcPercentage(attendance.filter((a) => a.studentId === s.id))
              const tone = percentTone(pct)
              return (
                <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={s.name} color={s.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted">{s.studentId}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone.bg} ${tone.text}`}>{pct}%</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

function StudentHome() {
  const me = useCurrentUser()
  return <StudentDesktopDashboard me={me} />
}

function StudentDesktopDashboard({ me }) {
  const navigate = useNavigate()
  const groups = useStore((s) => s.groups)
  const schedule = useStore((s) => s.schedule)
  const group = groups.find((g) => g.id === me?.groupId)
  const defaultSemester = String(Math.min(8, Math.max(1, (group?.course || 1) * 2 - 1)))
  const [achSemester, setAchSemester] = useState(defaultSemester)
  const [attScope, setAttScope] = useState('Hafta')
  const [ratingYear, setRatingYear] = useState('2025-2026')
  const [ratingScope, setRatingScope] = useState('Guruh')
  const [gpaOpen, setGpaOpen] = useState(false)
  const [dayCursor, setDayCursor] = useState(() => new Date())
  const [weekCursor, setWeekCursor] = useState(() => startOfWeek(new Date()))
  const [panelOpen, setPanelOpen] = useState(false)
  const [prefs, setPrefs] = useState(() => readWidgetPrefs(me?.id))
  const gpa = studentGpa(me?.id)

  const weekDays = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']
  const jsDay = new Date().getDay()
  const todayIdx = jsDay === 0 ? -1 : jsDay - 1
  const dayLessons = schedule.filter((s) => s.groupId === me?.groupId && matchesDate(s, dayCursor))
  const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']
  const dayLabel = `${dayCursor.getDate()} ${MONTHS_UZ[dayCursor.getMonth()].toLowerCase()} - ${dayNames[dayCursor.getDay()]}`
  const weekEnd = addDays(weekCursor, 5)
  const weekLabel = `${weekCursor.getDate()}-${MONTHS_UZ_SHORT[weekCursor.getMonth()]} – ${weekEnd.getDate()}-${MONTHS_UZ_SHORT[weekEnd.getMonth()]}`
  const visibleWidgets = prefs.order
    .map((id) => DASH_WIDGETS.find((w) => w.id === id))
    .filter((w) => w && prefs.enabled[w.id])

  const persistPrefs = (next) => {
    setPrefs(next)
    writeWidgetPrefs(me?.id, next)
  }

  const toggleWidget = (id) => {
    persistPrefs({
      ...prefs,
      enabled: { ...prefs.enabled, [id]: !prefs.enabled[id] },
    })
  }

  const reorderWidgets = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return
    const order = [...prefs.order]
    const from = order.indexOf(fromId)
    const to = order.indexOf(toId)
    if (from < 0 || to < 0) return
    order.splice(from, 1)
    order.splice(to, 0, fromId)
    persistPrefs({ ...prefs, order })
  }

  const widgetNodes = {
    assignments: (
      <DashCard title="Topshiriqlar" onOpen={() => navigate('/assignments')}>
        <EmptyFigure src="/dashboard/empty-assignments.png" title="Topshiriq hozircha yo‘q" />
      </DashCard>
    ),
    schedule: (
      <DashCard
        title="Dars jadvali"
        sub={dayLabel}
        onOpen={() => navigate('/schedule')}
        extra={
          <div className="flex items-center gap-1">
            <IconNav onClick={() => setDayCursor((d) => addDays(d, -1))}>
              <ChevronLeft size={14} />
            </IconNav>
            <IconNav onClick={() => setDayCursor((d) => addDays(d, 1))}>
              <ChevronRight size={14} />
            </IconNav>
            <SupportDot />
          </div>
        }
      >
        {dayLessons.length ? (
          <ul className="space-y-2 pt-2">
            {dayLessons.map((s) => (
              <li key={s.id} className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-sm font-semibold">{s.subject}</p>
                <p className="text-[11px] text-slate-400">
                  {s.start} – {s.end}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyFigure src="/dashboard/empty-schedule.png" title="Ushbu sanada darslar mavjud emas" />
        )}
      </DashCard>
    ),
    progress: (
      <DashCard
        title="O‘zlashtirish"
        onOpen={() => navigate('/education-params')}
        extra={
          <div className="flex items-center gap-2">
            <SemesterSelect variant="pill" align="right" value={achSemester} onChange={setAchSemester} options={SEMESTERS} />
            <SupportDot />
          </div>
        }
      >
        <EmptyFigure src="/dashboard/empty-progress.png" title="O‘zlashtirish ma’lumotlari topilmadi" />
      </DashCard>
    ),
    attendance: (
      <DashCard
        title="Davomat"
        onOpen={() => navigate('/attendance')}
        extra={
          <div className="flex items-center gap-2">
            <Select
              variant="pill"
              align="right"
              value={attScope}
              onChange={setAttScope}
              options={[
                { value: 'Hafta', label: 'Hafta' },
                { value: 'Oy', label: 'Oy' },
              ]}
            />
            <SupportDot />
          </div>
        }
      >
        <div className="flex h-full flex-col pt-3">
          <div className="mb-3 flex items-center justify-between gap-1 text-[12px] text-slate-400">
            <IconNav onClick={() => setWeekCursor((d) => addDays(d, -7))}>
              <ChevronLeft size={13} />
            </IconNav>
            <span className="font-semibold text-[#334155]">{weekLabel}</span>
            <IconNav onClick={() => setWeekCursor((d) => addDays(d, 7))}>
              <ChevronRight size={13} />
            </IconNav>
          </div>
          <div className="grid flex-1 grid-cols-6 gap-2">
            {weekDays.map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-2">
                <div className="h-[88px] w-full rounded-md bg-[#eef1f6]" />
                <span className={i === todayIdx ? 'text-[11px] font-bold text-[#6d5efc]' : 'text-[11px] font-medium text-slate-400'}>
                  {d}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[34px] font-bold leading-none text-[#6d5efc]">
            0 <span className="text-[16px] font-semibold text-slate-400">soat</span>
          </p>
          <p className="mt-1 text-[12px] leading-snug text-slate-400">Jami haftalik qoldirilgan dars soati</p>
        </div>
      </DashCard>
    ),
    gpa: (
      <div className="h-full rounded-[18px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-[#1e293b]">GPA</h3>
            <span className="rounded-md bg-[#e8f8ee] px-2 py-0.5 text-[12px] font-bold text-[#22a84a]">{gpa.toFixed(2)} / 5</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate('/education-params')} className="grid h-8 w-8 place-items-center rounded-lg bg-[#f3f6fb] text-slate-400 hover:bg-slate-100" aria-label="GPA hisoblagich">
              <Calculator size={15} />
            </button>
            <SupportDot />
          </div>
        </div>
        <button type="button" onClick={() => setGpaOpen((v) => !v)} className="mt-2 flex w-full items-center justify-between py-3 text-left">
          <span className="text-[14px] font-medium text-[#334155]">
            2025-2026 | {group?.course || 1}-kurs
          </span>
          <span className="flex items-center gap-2">
            <span className="rounded-md bg-[#e8f8ee] px-2 py-0.5 text-[12px] font-bold text-[#22a84a]">{gpa.toFixed(2)}</span>
            <ChevronDown size={15} className={`text-slate-400 transition ${gpaOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
      </div>
    ),
    gpaRating: (
      <div className="h-full rounded-[18px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[16px] font-semibold text-[#1e293b]">GPA reyting</h3>
          <div className="flex items-center gap-2">
            <Select variant="pill" align="right" value={ratingYear} onChange={setRatingYear} options={[{ value: '2025-2026', label: '2025-2026' }]} />
            <Select
              variant="pill"
              align="right"
              value={ratingScope}
              onChange={setRatingScope}
              options={[
                { value: 'Guruh', label: 'Guruh' },
                { value: 'Fakultet', label: 'Fakultet' },
              ]}
            />
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-[#fdecee] px-4 py-3 text-[13px] font-medium text-[#e14d62]">
          Guruh bo‘yicha sizning o‘ringiz — ma’lumot topilmadi
        </div>
      </div>
    ),
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="page-crumb">
            Asosiy <span className="mx-1">/</span> Dashboard
          </p>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-[#2f80ed] px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(47,128,237,0.28)] transition hover:bg-[#256fd4] sm:px-4"
          onClick={() => setPanelOpen(true)}
        >
          <SlidersHorizontal size={16} strokeWidth={2.2} />
          Boshqaruv
        </button>
      </div>

      {visibleWidgets.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleWidgets.map((widget) => (
            <div key={widget.id} className={widget.span === 2 ? 'min-w-0 sm:col-span-2' : 'min-w-0'}>
              {widgetNodes[widget.id]}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <p className="text-[15px] font-semibold text-[#1e293b]">Kartalar yashirilgan</p>
          <p className="mt-1 text-[13px] text-slate-400">Boshqaruv paneli orqali kerakli kartalarni qayta qo‘shing</p>
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <SlidersHorizontal size={15} />
            Boshqaruv
          </button>
        </div>
      )}

      <DashboardControlPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        order={prefs.order}
        enabled={prefs.enabled}
        onToggle={toggleWidget}
        onReorder={reorderWidgets}
      />
    </div>
  )
}

function DashboardControlPanel({ open, onClose, order, enabled, onToggle, onReorder }) {
  const [reorderOn, setReorderOn] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) {
      setReorderOn(false)
      setDragId(null)
      setOverId(null)
      return undefined
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = order.map((id) => DASH_WIDGETS.find((w) => w.id === id)).filter(Boolean)

  return createPortal(
    <div
      className={cn('fixed inset-0 z-[80]', open ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!open}
      inert={!open || undefined}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Yopish"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-[#0f172a]/45 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="dash-control-title"
        className={cn(
          'absolute inset-y-0 right-0 flex w-[min(100vw,400px)] flex-col bg-white shadow-[-16px_0_48px_rgba(15,23,42,0.16)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="dash-control-title" className="text-[16px] font-semibold tracking-tight text-[#1e293b]">
            Kartalarni tahrirlash
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-[13px] font-medium text-slate-500">Kartalarni surish</p>
          <button
            type="button"
            role="switch"
            aria-label="Kartalarni surish"
            aria-checked={reorderOn}
            onClick={() => setReorderOn((v) => !v)}
            className={cn('relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors', reorderOn ? 'bg-[#2f80ed]' : 'bg-[#d0d5dd]')}
          >
            <span
              className={cn(
                'absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
                reorderOn ? 'translate-x-[20px]' : 'translate-x-[2px]',
              )}
            />
          </button>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto px-4 pb-6 scrollbar-thin">
          {items.map((widget) => {
            const Icon = widget.icon
            const added = enabled[widget.id] !== false
            const dragging = dragId === widget.id
            const over = overId === widget.id && dragId && dragId !== widget.id
            return (
              <div
                key={widget.id}
                draggable={reorderOn}
                onDragStart={(e) => {
                  if (!reorderOn) return
                  setDragId(widget.id)
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', widget.id)
                }}
                onDragOver={(e) => {
                  if (!reorderOn) return
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  setOverId(widget.id)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  onReorder(dragId || e.dataTransfer.getData('text/plain'), widget.id)
                  setDragId(null)
                  setOverId(null)
                }}
                onDragEnd={() => {
                  setDragId(null)
                  setOverId(null)
                }}
                className={cn(
                  'flex items-center gap-3 rounded-[14px] border bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition',
                  reorderOn ? 'cursor-grab active:cursor-grabbing' : '',
                  dragging ? 'opacity-40' : 'opacity-100',
                  over ? 'border-[#2f80ed] ring-2 ring-[#2f80ed]/15' : 'border-slate-100',
                )}
              >
                {reorderOn && <GripVertical size={16} className="shrink-0 text-slate-300" />}
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] text-white shadow-[0_6px_14px_rgba(15,23,42,0.12)]"
                  style={{ background: widget.tint }}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </span>
                <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#1e293b]">{widget.title}</p>
                <button
                  type="button"
                  draggable={false}
                  onClick={() => onToggle(widget.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition',
                    added
                      ? 'bg-[#2f80ed] text-white hover:bg-[#256fd4]'
                      : 'border border-slate-200 bg-white text-slate-500 hover:border-[#2f80ed] hover:text-[#2f80ed]',
                  )}
                >
                  {added ? <Check size={14} strokeWidth={2.6} /> : <Plus size={14} strokeWidth={2.6} />}
                  {added ? 'Qo‘shilgan' : 'Qo‘shish'}
                </button>
              </div>
            )
          })}
        </div>
      </aside>
    </div>,
    document.body,
  )
}

function IconNav({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-50">
      {children}
    </button>
  )
}

function EmptyFigure({ src, title }) {
  return (
    <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center px-3 pb-2 pt-4 text-center">
      <img src={src} alt="" className="h-[132px] w-[132px] object-contain" />
      <p className="mt-3 max-w-[180px] text-[13px] leading-snug text-slate-400">{title}</p>
    </div>
  )
}

function DashCard({ title, sub, onOpen, extra, children }) {
  return (
    <div className="flex min-h-[280px] min-w-0 flex-col rounded-[18px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:min-h-[360px]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button type="button" onClick={onOpen} className="flex items-center gap-1.5 text-left text-[15px] font-semibold text-[#1e293b]">
            {title}
            <Info size={14} strokeWidth={2} className="text-slate-300" />
          </button>
          {sub && <p className="mt-0.5 text-[12px] text-slate-400">{sub}</p>}
        </div>
        {extra && <div className="shrink-0">{extra}</div>}
      </div>
      <div className="mt-1 flex flex-1 flex-col">{children}</div>
    </div>
  )
}

function SupportDot() {
  return (
    <button
      type="button"
      title="Support"
      onClick={openSupportChat}
      className="rounded-lg bg-gradient-to-b from-[#4cc9f0] to-[#4361ee] px-1.5 py-1.5 text-[9px] font-extrabold tracking-wide text-white shadow-[0_4px_10px_rgba(67,97,238,0.35)]"
    >
      Support
    </button>
  )
}

function buildBanners({ announcements, posts }) {
  return [
    ...announcements.slice(0, 2).map((a) => ({ to: `/announcements/${a.id}`, title: a.title, cover: a.cover })),
    ...posts.slice(0, 1).map((p) => ({ to: `/blog/${p.id}`, title: p.title, cover: p.cover })),
  ]
}

function Hero({ me, subtitle, banners, quickActions, iconTiles }) {
  const navigate = useNavigate()
  const notifications = useStore((s) => s.notifications)
  const unread = notifications.filter((n) => n.userId === me?.id && !n.read).length
  const [query, setQuery] = useState('')

  const searchable = useMemo(() => {
    const nav = [{ label: 'Bildirishnomalar', icon: Bell, to: '/notifications' }, { label: 'Sozlamalar', icon: Settings, to: '/settings' }]
    const merged = [...quickActions, ...iconTiles, ...nav]
    const seen = new Set()
    return merged.filter((it) => (seen.has(it.to) ? false : (seen.add(it.to), true)))
  }, [quickActions, iconTiles])

  const results = query.trim()
    ? searchable.filter((it) => it.label.toLowerCase().includes(query.trim().toLowerCase()))
    : []

  const go = (to) => {
    setQuery('')
    navigate(to)
  }

  return (
    <div>
      <div className="relative rounded-b-[28px] bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-4 pb-6 pt-[calc(1rem+env(safe-area-inset-top))] text-white shadow-lg lg:rounded-[28px] lg:px-8 lg:pt-7">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[28px] lg:rounded-[28px]">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute right-16 top-10 h-20 w-20 rounded-full bg-white/10" />
        </div>

        <div className="relative flex items-center justify-between gap-3">
          <button onClick={() => navigate('/settings')} className="flex min-w-0 items-center gap-3 text-left">
            <Avatar name={me?.name} color={me?.avatarColor} />
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold leading-tight">{me?.name}</p>
              <p className="truncate text-xs text-white/70">{subtitle || ROLE_LABEL[me?.role]}</p>
            </div>
          </button>
          <button onClick={() => navigate('/notifications')} className="relative shrink-0 rounded-2xl bg-white/15 p-2.5 backdrop-blur">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        </div>

        <BannerStrip items={banners} onOpen={(to) => go(to)} />

        <div className="relative mt-4">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-slate-400 shadow-sm">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qidiruv..."
              className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-slate-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-300 hover:text-slate-500">
                <X size={16} />
              </button>
            )}
          </div>
          {results.length > 0 && (
            <div className="absolute inset-x-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl bg-white text-ink shadow-2xl">
              {results.map((r) => {
                const Icon = r.icon
                return (
                  <button
                    key={r.to}
                    onClick={() => go(r.to)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50"
                  >
                    <Icon size={16} className="text-brand-700" />
                    {r.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4 lg:grid-cols-4 lg:px-0 lg:pt-6">
        {quickActions.map((qa, i) => (
          <QuickAction key={qa.to} {...qa} alt={i % 2 === 1} onClick={() => navigate(qa.to)} />
        ))}
      </div>

      {iconTiles.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-3 px-4 pt-3 lg:grid-cols-5 xl:grid-cols-6 lg:px-0">
          {iconTiles.map((it) => (
            <IconTile key={it.to} {...it} onClick={() => navigate(it.to)} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuickAction({ label, sub, icon: Icon, alt, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 text-left text-white shadow-md transition hover:brightness-110 active:scale-[0.98] lg:min-h-[128px] lg:p-5 ${
        alt ? 'bg-gradient-to-br from-brand-700 to-brand-500' : 'bg-gradient-to-br from-brand-900 to-brand-700'
      }`}
    >
      <div className="pointer-events-none absolute -right-4 -top-6 h-16 w-16 rounded-full bg-white/10" />
      <Icon size={20} className="relative" />
      <p className="relative mt-3 text-sm font-bold leading-tight">{label}</p>
      <p className="relative mt-0.5 text-[11px] text-white/75 leading-tight">{sub}</p>
    </button>
  )
}

function IconTile({ label, icon: Icon, onClick }) {
  return (
    <button onClick={onClick} className="card flex flex-col items-center gap-2 px-2 py-4 text-center transition hover:shadow-lg active:scale-[0.98]">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-800">
        <Icon size={20} />
      </span>
      <span className="text-xs font-semibold leading-tight text-ink">{label}</span>
    </button>
  )
}

function Stat({ title, value, delta, icon: Icon, negative }) {
  return (
    <div className="card flex items-start justify-between p-4">
      <div>
        <p className="text-sm text-muted">{title}</p>
        <p className="mt-1 text-2xl font-extrabold">{value}</p>
        {delta && <p className={`mt-1 text-xs font-semibold ${negative ? 'text-rose-600' : 'text-emerald-600'}`}>{delta}</p>}
      </div>
      {Icon && (
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-800">
          <Icon size={18} />
        </div>
      )}
    </div>
  )
}

function weekLine(attendance) {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const rec = attendance.filter((a) => a.date === key)
    const foiz = rec.length ? calcPercentage(rec) : 80 + i
    return { name: d.toLocaleDateString('uz-UZ', { weekday: 'short' }), foiz }
  })
  return days
}
