import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Folder,
  GraduationCap,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  Library,
  Map,
  Moon,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
  Wallet,
} from 'lucide-react'
import { Avatar, SemesterSelect, cn } from './ui'
import { useTheme } from '../lib/ThemeContext'

function SidebarItem({ icon: Icon, label, to, onClick, dot, collapsed, indent, shortcut, tone, active }) {
  const base = cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition',
    collapsed && 'justify-center px-0',
    indent && !collapsed && 'pl-10',
    tone === 'danger'
      ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
      : 'text-slate-600 hover:bg-slate-50 hover:text-ink dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white',
    active && 'bg-[#e8f1ff] text-[#2f80ed]',
  )
  const inner = (
    <>
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
      {!collapsed && dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
      {!collapsed && shortcut && (
        <span className="shrink-0 rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
          {shortcut}
        </span>
      )}
    </>
  )
  if (to) {
    return (
      <NavLink
        to={to}
        end={to === '/'}
        title={collapsed ? label : undefined}
        onClick={onClick}
        className={({ isActive }) => cn(base, isActive && 'bg-[#e8f1ff] text-[#2f80ed]')}
      >
        {inner}
      </NavLink>
    )
  }
  return (
    <button type="button" onClick={onClick} title={collapsed ? label : undefined} className={base}>
      {inner}
    </button>
  )
}

function SidebarGroup({ icon: Icon, label, collapsed, dot, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen)
  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={collapsed ? label : undefined}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-600 transition hover:bg-slate-50 hover:text-ink',
          collapsed && 'justify-center px-0',
        )}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
        {!collapsed && dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
        {!collapsed && <ChevronDown size={15} className={cn('shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />}
      </button>
      {open && !collapsed && <div className="mt-0.5 space-y-0.5">{children}</div>}
    </div>
  )
}

export function DesktopSidebar({
  collapsed,
  onToggleCollapse,
  onLogout,
  onInert,
  onSearch,
  searchOpen,
  overlay,
  onNavigate,
}) {
  const { pathname } = useLocation()
  const educationOpen = ['/schedule', '/subjects', '/attendance', '/education-params'].some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const servicesOpen = pathname === '/courses' || pathname.startsWith('/courses/')
  const libraryOpen = pathname === '/library' || pathname.startsWith('/library/')
  const go = (fn) => () => {
    fn?.()
    onNavigate?.()
  }
  return (
    <aside
      className={cn(
        'h-screen shrink-0 flex-col border-r border-slate-100 bg-white transition-[width] duration-200 dark:border-[#2a3444] dark:bg-[#141b27]',
        overlay
          ? 'flex w-[min(86vw,280px)]'
          : cn('sticky top-0 hidden lg:flex', collapsed ? 'w-[76px]' : 'w-[264px]'),
      )}
    >
      <div className="border-b border-slate-100 px-3 py-4">
        <div className={cn('flex items-center gap-2', collapsed ? 'flex-col' : 'justify-between')}>
          <div className={cn('flex min-w-0 items-center gap-2', collapsed && 'flex-col')}>
            <img src="/favicon.svg" alt="tizimsEdu.uz" className="h-8 w-8 shrink-0 rounded-full object-contain" />
            {(!collapsed || overlay) && <p className="truncate text-[13px] font-extrabold tracking-tight text-ink">TIZIMSEDU.UZ</p>}
          </div>
          {!overlay && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50"
            aria-label="Menyuni yig‘ish"
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarItem icon={Newspaper} label="Yangiliklar" to="/announcements" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarGroup icon={GraduationCap} label="Mening ta’limim" collapsed={collapsed && !overlay} defaultOpen={educationOpen}>
          <SidebarItem icon={CalendarDays} label="Dars jadvali" to="/schedule" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
          <SidebarItem icon={BookOpen} label="Fanlar" to="/subjects" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
          <SidebarItem icon={ClipboardList} label="Davomat" to="/attendance" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
          <SidebarItem icon={SlidersHorizontal} label="O‘quv parametrlari" to="/education-params" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
        </SidebarGroup>
        <SidebarGroup icon={Award} label="Mening grantim" dot collapsed={collapsed && !overlay}>
          <SidebarItem icon={Wallet} label="Tez orada" onClick={go(onInert)} collapsed={collapsed && !overlay} indent />
        </SidebarGroup>
        <SidebarItem icon={Wallet} label="Moliyaviy to‘lov" to="/payments" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarItem icon={Folder} label="Hujjatlar" to="/documents" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarItem icon={ClipboardCheck} label="Imtihonlar" to="/exams" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarItem icon={Inbox} label="So‘rovnomalar" to="/surveys" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarGroup icon={Map} label="Tashqi xizmatlar" collapsed={collapsed && !overlay} defaultOpen={servicesOpen || libraryOpen}>
          <SidebarItem icon={GraduationCap} label="Kurslar" to="/courses" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
          <SidebarItem icon={Library} label="Elektron kutubxona" to="/library" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
        </SidebarGroup>
      </nav>
      <div className="space-y-1 border-t border-slate-100 px-3 py-3">
        <SidebarItem icon={Search} label="Qidirish" onClick={go(onSearch)} dot shortcut="Ctrl K" collapsed={collapsed && !overlay} active={searchOpen} />
        <SidebarItem icon={Settings} label="Sozlamalar" to="/settings" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarItem icon={HelpCircle} label="Yordam va yo‘riqnoma" to="/support" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarItem icon={LogOut} label="Chiqish" onClick={go(onLogout)} tone="danger" collapsed={collapsed && !overlay} />
      </div>
    </aside>
  )
}

export function DesktopTopbar({ me, unread, semester, setSemester, semesterOptions, groupName, onBell, onMenu }) {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-100 bg-white px-3 py-2.5 pt-[max(0.65rem,env(safe-area-inset-top))] sm:gap-3 sm:px-5 lg:px-6 lg:py-3 lg:pt-3">
      {onMenu && (
        <button
          type="button"
          onClick={onMenu}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 lg:hidden"
          aria-label="Menyu"
        >
          <PanelLeftOpen size={16} />
        </button>
      )}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <SemesterSelect value={semester} onChange={setSemester} options={semesterOptions} />
        {groupName ? <span className="hidden truncate text-[13px] font-medium text-slate-400 sm:inline">{groupName}</span> : null}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={toggle}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          aria-label="Mavzu"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          type="button"
          onClick={onBell}
          className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          aria-label="Bildirishnomalar"
        >
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
        <button type="button" onClick={() => navigate('/settings')} className="relative rounded-full">
          <Avatar name={me?.name} color={me?.avatarColor} size="sm" />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </button>
      </div>
    </header>
  )
}
