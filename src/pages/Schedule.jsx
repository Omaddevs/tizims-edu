import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CalendarX,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Menu,
  Pencil,
  Plus,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useCurrentUser, useStore } from '../store/useStore'
import { openSupportChat } from '../lib/supportChat'
import { Field, inputClass, Modal, PrimaryBtn, Select, cn } from '../components/ui'
import {
  WEEKDAYS,
  MONTHS_UZ,
  MONTHS_UZ_SHORT,
  addDays,
  calendarCells,
  formatUzFull,
  isoDate,
  matchesDate,
  parseISO,
  startOfWeek,
  weekdayFromDate,
} from '../lib/schedule'

const WEEK_LENGTH = 6
const COLUMN_LABELS = { 1: 'Dush', 2: 'Sesh', 3: 'Chor', 4: 'Pay', 5: 'Jum', 6: 'Shan' }
const DAY_START = 8
const DAY_END_DEFAULT = 20
const HOUR_H = 78
const DAY_COL = 'min-w-[168px] flex-1'

function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm || '00:00').split(':').map(Number)
  return h * 60 + (m || 0)
}

function offsetPx(hhmm) {
  return ((timeToMinutes(hhmm) - DAY_START * 60) / 60) * HOUR_H
}

export default function SchedulePage() {
  const me = useCurrentUser()
  if (me.role === 'super_admin') return <AdminSchedule />
  return <ScheduleCalendar />
}

function visibleLessons(schedule, me, date) {
  return schedule.filter((s) => {
    if (!matchesDate(s, date)) return false
    if (me.role === 'student') return s.groupId === me.groupId
    if (me.role === 'teacher') return s.teacherId === me.id
    return true
  })
}

function ScheduleCalendar() {
  const me = useCurrentUser()
  const schedule = useStore((s) => s.schedule)
  const users = useStore((s) => s.users)
  const groups = useStore((s) => s.groups)
  const attendance = useStore((s) => s.attendance)
  return <DesktopScheduleView me={me} schedule={schedule} users={users} groups={groups} attendance={attendance} />
}

const STATUS_TO_LEGEND = { present: 'attended', late: 'excused', absent: 'unexcused' }

const LEGEND = [
  { id: 'attended', label: 'Qatnashilgan', icon: CheckCircle2, dot: 'text-emerald-500', block: 'schedule-lesson schedule-lesson-attended border-emerald-200 bg-emerald-50 text-emerald-800' },
  { id: 'unexcused', label: 'Sababsiz', icon: XCircle, dot: 'text-rose-500', block: 'schedule-lesson schedule-lesson-unexcused border-rose-200 bg-rose-50 text-rose-800' },
  { id: 'excused', label: 'Sababli', icon: AlertTriangle, dot: 'text-amber-500', block: 'schedule-lesson schedule-lesson-excused border-amber-200 bg-amber-50 text-amber-800' },
]
const LEGEND_BY_ID = Object.fromEntries(LEGEND.map((l) => [l.id, l]))
const DEFAULT_BLOCK = 'schedule-lesson border-brand-200 bg-brand-50 text-brand-800'

function DesktopScheduleView({ me, schedule, users, groups, attendance }) {
  const today = new Date()
  const todayIso = isoDate(today)
  const [view, setView] = useState('week')
  const [weekCursor, setWeekCursor] = useState(() => startOfWeek(today))
  const [selected, setSelected] = useState(todayIso)
  const selectedDate = parseISO(selected)

  const days = useMemo(() => {
    if (view === 'day') return [selectedDate]
    return Array.from({ length: WEEK_LENGTH }, (_, i) => addDays(weekCursor, i))
  }, [view, weekCursor, selectedDate])

  const rangeLabel = useMemo(() => {
    if (view === 'day') return formatUzFull(selectedDate)
    const first = days[0]
    const last = days[days.length - 1]
    return `${first.getDate()} ${MONTHS_UZ_SHORT[first.getMonth()]} - ${last.getDate()} ${MONTHS_UZ_SHORT[last.getMonth()]}`
  }, [view, days, selectedDate])

  const goPrev = () => {
    if (view === 'day') setSelected(isoDate(addDays(selectedDate, -1)))
    else setWeekCursor((c) => addDays(c, -7))
  }
  const goNext = () => {
    if (view === 'day') setSelected(isoDate(addDays(selectedDate, 1)))
    else setWeekCursor((c) => addDays(c, 7))
  }
  const goToday = () => {
    setWeekCursor(startOfWeek(today))
    setSelected(todayIso)
  }

  const lessonsByDay = useMemo(
    () => days.map((d) => visibleLessons(schedule, me, d).map((s) => ({ ...s, _iso: isoDate(d) }))),
    [days, schedule, me],
  )
  const totalLessons = lessonsByDay.reduce((sum, arr) => sum + arr.length, 0)
  const lastHour = lessonsByDay.flat().reduce((max, s) => Math.max(max, timeToMinutes(s.end) / 60), DAY_START)
  const nowHour = today.getHours() + today.getMinutes() / 60
  const dayEnd = Math.max(DAY_END_DEFAULT, Math.ceil(nowHour + 0.4), Math.ceil(lastHour + 0.15))
  const dayHeight = (dayEnd - DAY_START) * HOUR_H
  const hourLabels = Array.from({ length: dayEnd - DAY_START }, (_, i) => DAY_START + i)
  const nowOffset = offsetPx(`${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`)
  const nowLabel = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`
  const showNow = nowOffset >= 0 && nowOffset <= dayHeight

  const findStatus = (lesson) => {
    const rec = attendance.find(
      (r) => r.studentId === me.id && r.date === lesson._iso && r.subject === lesson.subject,
    )
    return rec ? STATUS_TO_LEGEND[rec.status] : null
  }

  return (
    <div className="flex h-[calc(100dvh-11.75rem)] min-h-[520px] min-w-0 flex-col md:h-[calc(100dvh-8.5rem)] lg:h-[calc(100dvh-7rem)]">
      <p className="shrink-0 text-[12px] font-medium text-[#9aa3b2]">
        Asosiy <span className="mx-1 text-[#c5cad3]">/</span> Dashboard <span className="mx-1 text-[#c5cad3]">/</span> Dars jadvali
      </p>

      <div className="mt-1.5 flex shrink-0 flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-3">
        <h1 className="text-[26px] font-bold leading-none text-[#2b3340]">Dars jadvali</h1>

        <div className="flex w-full min-w-0 flex-col gap-2 md:w-auto md:flex-row md:flex-nowrap md:items-center md:gap-1.5">
          <div className="flex items-center gap-2 md:contents">
            <div
              role="group"
              aria-label="Ko‘rinish"
              className="flex min-w-0 flex-1 rounded-[12px] bg-[#eef1f6] p-[3px] md:flex-none md:rounded-none md:bg-transparent md:p-0"
            >
              <button
                type="button"
                aria-pressed={view === 'week'}
                onClick={() => setView('week')}
                className={cn(
                  'h-9 flex-1 rounded-[10px] px-3.5 text-[13px] font-semibold md:h-auto md:flex-none md:py-2',
                  view === 'week' ? 'bg-white text-[#2b3340] shadow-[0_2px_8px_rgba(15,23,42,0.06)]' : 'text-[#9aa3b2]',
                )}
              >
                Hafta
              </button>
              <button
                type="button"
                aria-pressed={view === 'day'}
                onClick={() => setView('day')}
                className={cn(
                  'h-9 flex-1 rounded-[10px] px-3.5 text-[13px] font-semibold md:h-auto md:flex-none md:py-2',
                  view === 'day' ? 'bg-white text-[#2b3340] shadow-[0_2px_8px_rgba(15,23,42,0.06)]' : 'text-[#9aa3b2]',
                )}
              >
                Kun
              </button>
            </div>
            <button
              type="button"
              onClick={goToday}
              className="h-9 shrink-0 rounded-[10px] bg-[#2f80ed] px-3.5 text-[13px] font-semibold whitespace-nowrap text-white md:order-4 md:h-auto md:py-2"
            >
              Bugun
            </button>
          </div>

          <div className="flex h-10 min-w-0 items-center rounded-[12px] bg-white px-0.5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] md:contents md:h-auto md:rounded-none md:bg-transparent md:p-0 md:shadow-none">
            <span
              title={rangeLabel}
              className="order-2 min-w-0 flex-1 truncate px-2 text-center text-[13px] font-semibold text-[#2b3340] md:order-none md:ml-2 md:mr-1 md:flex-none md:px-0 md:whitespace-nowrap"
            >
              {rangeLabel}
            </span>
            <button
              type="button"
              onClick={goPrev}
              className="order-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#9aa3b2] md:order-none md:h-8 md:w-8 md:bg-white md:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
              aria-label="Oldingi"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="order-3 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#9aa3b2] md:order-5 md:h-8 md:w-8 md:bg-white md:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
              aria-label="Keyingi"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              title="Support"
              onClick={openSupportChat}
              className="ml-0.5 hidden rounded-[10px] bg-gradient-to-b from-[#5ad0f6] to-[#4f6ef7] px-2 py-1.5 text-[10px] font-extrabold tracking-wide text-white md:order-6 md:inline-flex"
            >
              Support
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex shrink-0 flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#8b93a1]">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[#3ecf8e]">
            <Check size={9} strokeWidth={3.4} className="text-white" />
          </span>
          Qatnashilgan
        </span>
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#8b93a1]">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[#f07171]">
            <X size={9} strokeWidth={3.4} className="text-white" />
          </span>
          Sababsiz
        </span>
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#8b93a1]">
          <AlertTriangle size={15} className="fill-[#f5c451] text-[#f5c451]" strokeWidth={0} />
          Sababli
        </span>
      </div>

      <div className="app-scroll relative mt-2.5 min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain rounded-[16px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className={view === 'week' ? 'min-w-[1060px]' : 'min-w-0'}>
          <div className="sticky top-0 z-20 flex bg-white">
            <div className="sticky left-0 z-30 grid w-[64px] shrink-0 place-items-center border-b border-r border-[#eef1f6] bg-white py-[13px]">
              <span className="rounded-md bg-[#f3f5f8] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-[#b4bac6]">#1</span>
            </div>
            {days.map((d) => {
              const iso = isoDate(d)
              const isToday = iso === todayIso
              return (
                <div
                  key={iso}
                  className={cn(
                    'flex items-center justify-center gap-1.5 border-b border-r border-[#eef1f6] py-[11px] last:border-r-0',
                    DAY_COL,
                    isToday && 'bg-[#eaf1ff]',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-[26px] min-w-[26px] place-items-center text-[15px] font-semibold',
                      isToday ? 'rounded-full bg-[#2f80ed] px-1 text-white' : 'text-[#2b3340]',
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <span className={cn('text-[13px] font-medium', isToday ? 'text-[#2f80ed]' : 'text-[#9aa3b2]')}>
                    {COLUMN_LABELS[weekdayFromDate(d)]}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="relative flex">
            <div
              className="relative sticky left-0 z-10 w-[64px] shrink-0 border-r border-[#eef1f6] bg-white"
              style={{ height: dayHeight }}
            >
              {hourLabels.map((h) => (
                <span
                  key={h}
                  className="absolute left-2.5 text-[12px] font-medium tabular-nums text-[#c0c6d0]"
                  style={{ top: Math.max(6, (h - DAY_START) * HOUR_H - 7) }}
                >
                  {String(h).padStart(2, '0')}:00
                </span>
              ))}
              {showNow && (
                <span
                  className="absolute left-1.5 z-[2] rounded-md bg-[#e9f9f0] px-1 py-[1px] text-[11px] font-semibold tabular-nums text-[#3ecf8e]"
                  style={{ top: Math.max(6, nowOffset - 8) }}
                >
                  {nowLabel}
                </span>
              )}
            </div>

            {days.map((d, di) => {
              const iso = isoDate(d)
              const isToday = iso === todayIso
              const lessons = lessonsByDay[di].sort((a, b) => a.start.localeCompare(b.start))
              return (
                <div
                  key={iso}
                  className={cn('relative border-r border-[#eef1f6] last:border-r-0', DAY_COL, isToday && 'bg-[#f3f7ff]')}
                  style={{
                    height: dayHeight,
                    backgroundImage: `repeating-linear-gradient(to bottom, #eef1f6 0, #eef1f6 1px, transparent 1px, transparent ${HOUR_H}px)`,
                  }}
                >
                  {isToday && showNow && (
                    <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top: nowOffset }}>
                      <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#3ecf8e]" />
                      <span className="h-[2px] flex-1 bg-[#3ecf8e]" />
                    </div>
                  )}
                  {lessons.map((s) => {
                    const teacher = users.find((u) => u.id === s.teacherId)
                    const group = groups.find((g) => g.id === s.groupId)
                    const status = findStatus(s)
                    const tone = status ? LEGEND_BY_ID[status].block : DEFAULT_BLOCK
                    const top = offsetPx(s.start)
                    const height = Math.max(offsetPx(s.end) - top, 28)
                    return (
                      <div
                        key={s.id}
                        className={cn('absolute inset-x-1.5 z-[5] overflow-hidden rounded-lg border px-2 py-1 text-left', tone)}
                        style={{ top, height }}
                        title={`${s.subject} · ${s.start}-${s.end}`}
                      >
                        <p className="truncate text-[12px] font-semibold leading-tight">{s.subject}</p>
                        <p className="truncate text-[10.5px] leading-tight text-current/70">
                          {s.start}-{s.end}
                          {group ? ` · ${group.name}` : ''}
                          {teacher ? ` · ${teacher.name}` : ''}
                          {s.room ? ` · ${s.room}` : ''}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {totalLessons === 0 && (
              <div className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center pl-[64px]">
                <EmptyScheduleMark />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyScheduleMark() {
  return (
    <div className="-mt-4 flex flex-col items-center">
      <div className="relative">
        <svg width="64" height="48" viewBox="0 0 64 48" fill="none" aria-hidden>
          <rect x="22" y="6" width="20" height="8" rx="1.5" fill="#E8ECF1" />
          <rect x="18" y="14" width="28" height="14" rx="3" fill="#D7DCE4" />
          <rect x="24" y="18" width="16" height="5" rx="1" fill="#EEF1F5" />
          <rect x="16" y="26" width="32" height="10" rx="2" fill="#C9D0DA" />
          <rect x="22" y="28" width="20" height="4" rx="1" fill="#E8ECF1" />
        </svg>
        <span className="absolute -right-3 top-0 rounded-[8px] bg-[#e6ebf2] px-[6px] py-[3px] text-[9px] leading-none tracking-[0.22em] text-[#b7bec8] shadow-sm">
          •••
        </span>
      </div>
      <p className="mt-2 text-[13px] font-medium text-[#8b93a1]">Ushbu sanada darslar mavjud emas</p>
    </div>
  )
}

const emptyForm = {
  groupId: '',
  teacherId: '',
  subject: '',
  start: '08:30',
  end: '10:00',
  weekday: 1,
  room: '',
  date: '',
}

function AdminSchedule() {
  const schedule = useStore((s) => s.schedule)
  const groups = useStore((s) => s.groups)
  const users = useStore((s) => s.users)
  const addSchedule = useStore((s) => s.addSchedule)
  const updateSchedule = useStore((s) => s.updateSchedule)
  const removeSchedule = useStore((s) => s.removeSchedule)
  const teachers = users.filter((u) => u.role === 'teacher')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [groupFilter, setGroupFilter] = useState('all')

  const rows = schedule.filter((s) => groupFilter === 'all' || s.groupId === groupFilter)

  const startEdit = (item) => {
    setEditing(item.id)
    setForm({
      groupId: item.groupId,
      teacherId: item.teacherId,
      subject: item.subject,
      start: item.start,
      end: item.end,
      weekday: item.weekday || 1,
      room: item.room || '',
      date: item.date || '',
    })
    setOpen(true)
  }

  const startCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      groupId: groups[0]?.id || '',
      teacherId: teachers[0]?.id || '',
    })
    setOpen(true)
  }

  const save = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      weekday: form.date ? undefined : Number(form.weekday),
      date: form.date || '',
    }
    if (editing) updateSchedule(editing, payload)
    else addSchedule(payload)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Dars jadvallari</h2>
          <p className="text-sm text-muted">Guruh, fan, o‘qituvchi, kun va vaqtni kiriting. Talaba kalendarida shu ma’lumot chiqadi.</p>
        </div>
        <PrimaryBtn className="py-2" onClick={startCreate}>
          <Plus size={16} /> Yangi dars
        </PrimaryBtn>
      </div>

      <Select
        className="max-w-xs"
        value={groupFilter}
        onChange={setGroupFilter}
        options={[{ value: 'all', label: 'Barcha guruhlar' }, ...groups.map((g) => ({ value: g.id, label: g.name }))]}
      />

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 border-b border-slate-100 px-4 py-2 text-xs font-semibold text-muted sm:grid">
          <span>Fan / guruh</span>
          <span>O‘qituvchi</span>
          <span>Vaqt</span>
          <span>Kun</span>
          <span />
        </div>
        {rows.map((s) => {
          const teacher = users.find((u) => u.id === s.teacherId)
          const group = groups.find((g) => g.id === s.groupId)
          const day = s.date ? s.date : WEEKDAYS.find((w) => w.id === (s.weekday || 1))?.label
          return (
            <div key={s.id} className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 last:border-0 sm:grid sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:items-center">
              <div>
                <p className="font-semibold">{s.subject}</p>
                <p className="text-xs text-muted">{group?.name}</p>
              </div>
              <p className="text-sm">{teacher?.name}</p>
              <p className="text-sm">
                {s.start} – {s.end}
                {s.room ? ` · ${s.room}` : ''}
              </p>
              <p className="text-sm text-muted">{day}</p>
              <div className="flex gap-1">
                <button type="button" className="rounded-xl p-2 text-brand-800 hover:bg-brand-50" onClick={() => startEdit(s)}>
                  <Pencil size={16} />
                </button>
                <button type="button" className="rounded-xl p-2 text-rose-600 hover:bg-rose-50" onClick={() => removeSchedule(s.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
        {!rows.length && <p className="px-4 py-6 text-sm text-muted">Hali dars qo‘shilmagan.</p>}
      </div>

      <Modal open={open} title={editing ? 'Darsni tahrirlash' : 'Yangi dars'} onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={save}>
          <Field label="Guruh">
            <Select
              required
              value={form.groupId}
              onChange={(groupId) => setForm({ ...form, groupId })}
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
            />
          </Field>
          <Field label="O‘qituvchi">
            <Select
              required
              value={form.teacherId}
              onChange={(teacherId) => setForm({ ...form, teacherId })}
              options={teachers.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Field>
          <Field label="Fan">
            <input className={inputClass} required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Boshlanish">
              <input className={inputClass} type="time" required value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
            </Field>
            <Field label="Tugash">
              <input className={inputClass} type="time" required value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
            </Field>
          </div>
          <Field label="Xona">
            <input className={inputClass} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="A-204" />
          </Field>
          <Field label="Hafta kuni (takrorlanuvchi)">
            <Select
              value={form.weekday}
              disabled={!!form.date}
              onChange={(weekday) => setForm({ ...form, weekday: Number(weekday) })}
              options={WEEKDAYS.map((w) => ({ value: w.id, label: w.label }))}
            />
          </Field>
          <Field label="Yoki aniq sana (ixtiyoriy)">
            <input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <PrimaryBtn type="submit" className="w-full">
            Saqlash
          </PrimaryBtn>
        </form>
      </Modal>
    </div>
  )
}
