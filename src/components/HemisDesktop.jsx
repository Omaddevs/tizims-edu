import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FileQuestion,
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
  X,
} from 'lucide-react'
import { Avatar, SemesterSelect, cn } from './ui'
import { searchCatalog } from './GlobalSearch'
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

function SidebarGroup({ icon: Icon, label, collapsed, children, defaultOpen, to, onNavigate }) {
  const [open, setOpen] = useState(!!defaultOpen)
  const navigate = useNavigate()
  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (collapsed && to) {
            navigate(to)
            onNavigate?.()
            return
          }
          setOpen((o) => !o)
        }}
        title={collapsed ? label : undefined}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-600 transition hover:bg-slate-50 hover:text-ink dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white',
          collapsed && 'justify-center px-0',
          defaultOpen && !collapsed && 'text-ink',
        )}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
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
  onSearch,
  searchOpen,
  overlay,
  onNavigate,
}) {
  const { pathname } = useLocation()
  const educationOpen = ['/schedule', '/subjects', '/attendance', '/education-params'].some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const examsOpen = pathname === '/exams' || pathname.startsWith('/exams/')
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
            <img
              src="/logo-tizims-mark.png?v=1"
              alt="tizims.uz"
              className="h-10 w-10 shrink-0 object-contain"
            />
            {(!collapsed || overlay) && <p className="truncate text-[13px] font-extrabold tracking-tight text-ink">TIZIMSEDU.UZ</p>}
          </div>
          {overlay ? (
            <button
              type="button"
              onClick={onNavigate}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-ink"
              aria-label="Menyuni yopish"
            >
              <X size={16} />
            </button>
          ) : (
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
        <SidebarItem icon={Wallet} label="Moliyaviy to‘lov" to="/payments" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarItem icon={Folder} label="Hujjatlar" to="/documents" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarGroup
          icon={ClipboardCheck}
          label="Imtihonlar"
          collapsed={collapsed && !overlay}
          defaultOpen={examsOpen}
          to="/exams/tests"
          onNavigate={onNavigate}
        >
          <SidebarItem icon={FileQuestion} label="Testlar" to="/exams/tests" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
          <SidebarItem icon={BarChart3} label="Natijalar" to="/exams/results" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
        </SidebarGroup>
        <SidebarItem icon={Inbox} label="So‘rovnomalar" to="/surveys" collapsed={collapsed && !overlay} onClick={onNavigate} />
        <SidebarGroup icon={Map} label="Tashqi xizmatlar" collapsed={collapsed && !overlay} defaultOpen={servicesOpen || libraryOpen}>
          <SidebarItem icon={GraduationCap} label="Kurslar" to="/courses" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
          <SidebarItem icon={Library} label="Elektron kutubxona" to="/library" collapsed={collapsed && !overlay} indent onClick={onNavigate} />
        </SidebarGroup>
      </nav>
      <div className="space-y-1 border-t border-slate-100 px-3 py-3">
        <SidebarItem icon={Search} label="Qidirish" onClick={go(onSearch)} dot shortcut="Ctrl K" collapsed={collapsed && !overlay} active={searchOpen} />
        <SidebarItem icon={Settings} label="Sozlamalar" to="/settings" collapsed={collapsed && !overlay} onClick={onNavigate} />
        {!overlay && (
          <SidebarItem icon={HelpCircle} label="Yordam va yo‘riqnoma" to="/support" collapsed={collapsed} onClick={onNavigate} />
        )}
        <SidebarItem icon={LogOut} label="Chiqish" onClick={go(onLogout)} tone="danger" collapsed={collapsed && !overlay} />
      </div>
    </aside>
  )
}

function ShortcutKbd({ isMac }) {
  return (
    <span className="pointer-events-none flex shrink-0 items-center gap-0.5">
      <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-[2px] text-[10px] font-semibold text-slate-400 dark:border-[#3a4658] dark:bg-[#141b27]">
        {isMac ? '⌘' : 'Ctrl'}
      </kbd>
      <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-[2px] text-[10px] font-semibold text-slate-400 dark:border-[#3a4658] dark:bg-[#141b27]">
        K
      </kbd>
    </span>
  )
}

function HeaderSearch({ onOpenModal }) {
  const navigate = useNavigate()
  const listId = useId()
  const boxRef = useRef(null)
  const menuRef = useRef(null)
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState(null)
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || '')

  const list = useMemo(() => searchCatalog(query), [query])

  useEffect(() => {
    setActive(0)
  }, [query])

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return undefined
    }
    const place = () => {
      const box = boxRef.current
      if (!box) return
      const r = box.getBoundingClientRect()
      setPos({
        left: r.left,
        width: r.width,
        top: r.bottom + 8,
        maxHeight: Math.max(180, window.innerHeight - r.bottom - 20),
      })
    }
    place()
    const id = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, list.length])

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => {
      if (boxRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  const go = useCallback(
    (to) => {
      if (!to) return
      setOpen(false)
      setQuery('')
      navigate(to)
    },
    [navigate],
  )

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(list.length - 1, i + 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.max(0, i - 1))
      return
    }
    if (e.key === 'Enter') {
      const item = list[active] || list[0]
      if (!item) return
      e.preventDefault()
      go(item.to)
    }
  }

  return (
    <div className="mx-2 hidden min-w-0 flex-1 sm:mx-4 sm:block lg:mx-6">
      <div
        ref={boxRef}
        className={cn(
          'flex h-9 w-full items-center gap-2 rounded-xl border px-3 transition-all',
          open
            ? 'border-[#2f80ed] bg-white shadow-[0_0_0_4px_rgba(47,128,237,0.10)] dark:border-[#4d8ef5] dark:bg-[#171e2b] dark:shadow-[0_0_0_4px_rgba(47,128,237,0.16)]'
            : 'border-slate-200 bg-[#f4f6fb] hover:border-slate-300 hover:bg-white dark:border-[#2a3444] dark:bg-[#1c2433] dark:hover:border-[#3a4658] dark:hover:bg-[#222b3a]',
        )}
        onMouseDown={() => setOpen(true)}
      >
        <Search
          size={15}
          strokeWidth={2}
          className={cn('shrink-0', open ? 'text-[#2f80ed]' : 'text-slate-400')}
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Qidirish..."
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && list[active] ? `${listId}-${list[active].id}` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
        {query ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="grid h-5 w-5 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
            aria-label="Tozalash"
          >
            <X size={13} />
          </button>
        ) : (
          <span className="hidden lg:flex">
            <ShortcutKbd isMac={isMac} />
          </span>
        )}
      </div>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="listbox"
              style={{
                position: 'fixed',
                zIndex: 80,
                left: pos?.left ?? 0,
                width: pos?.width ?? 360,
                top: pos?.top ?? 0,
                maxHeight: pos?.maxHeight ?? 360,
                visibility: pos ? 'visible' : 'hidden',
              }}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.14)] dark:border-[#2a3444] dark:bg-[#171e2b]"
            >
              <div className="max-h-[min(360px,70vh)] overflow-y-auto p-1.5 scrollbar-thin">
                <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {query.trim() ? 'Natijalar' : 'Tez-tez qidiriladi'}
                </p>
                {list.map((item, i) => (
                  <button
                    key={item.id}
                    id={`${listId}-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item.to)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition',
                      i === active
                        ? 'bg-[#e8f1ff] text-[#2f80ed] dark:bg-[#243044] dark:text-[#7eb0ff]'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5',
                    )}
                  >
                    <Search size={14} className="shrink-0 opacity-70" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{item.label}</span>
                    {item.popular && (
                      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#2f80ed] shadow-[0_0_0_1px_rgba(47,128,237,0.12)] dark:bg-[#1c2433]">
                        Ommabop
                      </span>
                    )}
                  </button>
                ))}
                {!list.length && (
                  <p className="px-2 py-8 text-center text-[13px] text-slate-400">Hech narsa topilmadi</p>
                )}
              </div>
              {onOpenModal && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setOpen(false)
                    onOpenModal()
                  }}
                  className="flex w-full items-center justify-between border-t border-slate-100 px-3.5 py-2.5 text-[12px] text-slate-500 transition hover:bg-slate-50 dark:border-[#2a3444] dark:text-slate-400 dark:hover:bg-white/5"
                >
                  <span>Umumiy qidirish</span>
                  <ShortcutKbd isMac={isMac} />
                </button>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

export function DesktopTopbar({ me, unread, semester, setSemester, semesterOptions, groupName, onBell, onMenu, onSearch }) {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-100 bg-white px-3 py-2.5 pt-[max(0.65rem,env(safe-area-inset-top))] sm:gap-3 sm:px-5 lg:px-6 lg:py-3 lg:pt-3 dark:border-[#2a3444] dark:bg-[#141b27]">
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
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <SemesterSelect value={semester} onChange={setSemester} options={semesterOptions} />
        {groupName ? <span className="hidden truncate text-[13px] font-medium text-slate-400 sm:inline">{groupName}</span> : null}
      </div>

      <HeaderSearch onOpenModal={onSearch} />

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        {onSearch && (
          <button
            type="button"
            onClick={onSearch}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 sm:hidden dark:border-[#2a3444] dark:hover:bg-white/5"
            aria-label="Qidirish"
          >
            <Search size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={toggle}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-[#2a3444] dark:hover:bg-white/5"
          aria-label="Mavzu"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          type="button"
          onClick={onBell}
          className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-[#2a3444] dark:hover:bg-white/5"
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
