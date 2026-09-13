import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Download, Eye, Filter, Minus, Plus, Search } from 'lucide-react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useCurrentUser, useStore } from '../store/useStore'
import { calcPercentage, percentTone, STATUS, summarize } from '../lib/attendance'
import { exportAttendanceExcel } from '../lib/excel'
import { Avatar, Badge, Field, inputClass, Modal, PrimaryBtn, Select, cn } from '../components/ui'
import { EmptyState, RoleScreen, SoftCard, StatusChip } from '../components/StudentChrome'
import { openSupportChat } from '../lib/supportChat'

const LESSON_HOURS = 2

function formatUzDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).split('-')
  return `${d}.${m}.${y}`
}

function weekdayFromIso(iso) {
  const day = new Date(`${iso}T12:00:00`).getDay()
  return day === 0 ? 7 : day
}

function mashgulotLabel(schedule, rec) {
  const wd = weekdayFromIso(rec.date)
  const slot =
    schedule.find((s) => s.subject === rec.subject && s.groupId === rec.groupId && s.weekday === wd) ||
    schedule.find((s) => s.subject === rec.subject && s.groupId === rec.groupId)
  const room = String(slot?.room || '').toLowerCase()
  if (room.includes('lab')) return 'Laboratoriya'
  if (slot?.type === 'tanlov') return 'Amaliy'
  return 'Ma’ruza'
}

function isSababli(rec) {
  if (rec.status === 'late') return true
  return rec.status === 'absent' && Boolean(String(rec.comment || '').trim())
}

function teacherName(users, schedule, rec) {
  const byId = users.find((u) => u.id === rec.teacherId)
  if (byId) return byId.name
  const slot = schedule.find((s) => s.subject === rec.subject && s.groupId === rec.groupId)
  return users.find((u) => u.id === slot?.teacherId)?.name || '—'
}

export default function Attendance() {
  const me = useCurrentUser()
  const users = useStore((s) => s.users)
  const groups = useStore((s) => s.groups)
  const attendance = useStore((s) => s.attendance)
  const schedule = useStore((s) => s.schedule)
  const markAttendance = useStore((s) => s.markAttendance)

  const teacherGroups = me.role === 'teacher' ? groups.filter((g) => me.groupIds?.includes(g.id)) : groups
  const [groupId, setGroupId] = useState(teacherGroups[0]?.id || groups[0]?.id)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [q, setQ] = useState('')
  const [subject, setSubject] = useState(
    schedule.find((s) => s.groupId === (teacherGroups[0]?.id || groups[0]?.id))?.subject || 'Dars',
  )
  const [comments, setComments] = useState({})
  const [exportOpen, setExportOpen] = useState(false)
  const [period, setPeriod] = useState('week')
  const [oneStudent, setOneStudent] = useState('')

  const subjects = schedule.filter((s) => s.groupId === groupId)
  const students = users.filter((u) => u.role === 'student' && u.groupId === groupId && u.name.toLowerCase().includes(q.toLowerCase()))

  const dayRecs = attendance.filter((a) => a.groupId === groupId && a.date === date && (!subject || a.subject === subject))
  const sum = summarize(dayRecs)

  const canEdit = me.role === 'teacher' || me.role === 'super_admin'
  const studentView = me.role === 'student'

  const myRecs = useMemo(
    () => attendance.filter((a) => a.studentId === me.id).sort((a, b) => b.date.localeCompare(a.date)),
    [attendance, me.id],
  )

  if (studentView) {
    return (
      <div className="min-w-0 overflow-x-auto">
        <StudentHemisAttendance records={myRecs} users={users} schedule={schedule} />
      </div>
    )
  }

  const mark = (student, status) => {
    const comment = comments[student.id] || ''
    if (status === 'late' && !comment.trim()) return
    markAttendance({
      studentId: student.id,
      groupId,
      status,
      comment: status === 'late' ? comment : '',
      subject,
      date,
    })
  }

  const onPlus = (student) => {
    const comment = (comments[student.id] || '').trim()
    mark(student, comment ? 'late' : 'present')
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Guruh">
          <Select
            value={groupId}
            onChange={(id) => {
              setGroupId(id)
              const next = schedule.find((s) => s.groupId === id)
              if (next) setSubject(next.subject)
            }}
            options={teacherGroups.map((g) => ({ value: g.id, label: g.name }))}
          />
        </Field>
        <Field label="Sana">
          <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Fan">
          <Select
            value={subject}
            onChange={setSubject}
            options={subjects.length ? subjects.map((s) => ({ value: s.subject, label: s.subject })) : [{ value: 'Dars', label: 'Dars' }]}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Mini n={sum.present} label="Kelgan" tone="green" />
        <Mini n={sum.late} label="Kechikkan" tone="yellow" />
        <Mini n={sum.absent} label="Kelmadi" tone="red" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input className={`${inputClass} pl-9`} placeholder="Talaba qidirish" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {students.map((s) => {
          const rec = dayRecs.find((r) => r.studentId === s.id)
          const pct = calcPercentage(attendance.filter((a) => a.studentId === s.id))
          const tone = percentTone(pct)
          return (
            <div key={s.id} className="border-b border-slate-100 p-4 last:border-0">
              <div className="flex items-start gap-3">
                <Avatar name={s.name} color={s.avatarColor} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{s.name}</p>
                    <span className="text-xs text-muted">{s.studentId}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tone.bg} ${tone.text}`}>{pct}%</span>
                    {rec && (
                      <Badge tone={rec.status === 'present' ? 'green' : rec.status === 'late' ? 'yellow' : 'red'}>
                        {STATUS[rec.status].label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {rec?.time || '—'} {rec?.comment ? `· ${rec.comment}` : ''}
                  </p>
                  {canEdit && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        className={`${inputClass} max-w-xs py-2`}
                        placeholder="Kechiksa izoh (keyin +)"
                        value={comments[s.id] || ''}
                        onChange={(e) => setComments((c) => ({ ...c, [s.id]: e.target.value }))}
                      />
                      <button
                        onClick={() => onPlus(s)}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white"
                        title="Kelgan. Izoh bo‘lsa — kechikkan"
                      >
                        <Plus size={18} />
                      </button>
                      <button
                        onClick={() => mark(s, 'absent')}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500 text-white"
                        title="Kelmadi — foiz tushadi"
                      >
                        <Minus size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {me.role === 'super_admin' && (
        <PrimaryBtn className="w-full" onClick={() => setExportOpen(true)}>
          <Download size={16} /> Excelga export qilish
        </PrimaryBtn>
      )}

      <Modal open={exportOpen} title="Davomatni Excelga yuklash" onClose={() => setExportOpen(false)}>
        <div className="space-y-3">
          <Field label="Davr">
            <Select
              value={period}
              onChange={setPeriod}
              options={[
                { value: 'week', label: '1 hafta' },
                { value: 'month', label: '1 oy' },
                { value: 'all', label: 'Hammasi' },
              ]}
            />
          </Field>
          <Field label="Talaba (ixtiyoriy)">
            <Select
              value={oneStudent}
              onChange={setOneStudent}
              options={[
                { value: '', label: 'Barcha talabalar' },
                ...users.filter((u) => u.role === 'student').map((u) => ({ value: u.id, label: `${u.name} · ${u.studentId}` })),
              ]}
            />
          </Field>
          <PrimaryBtn
            className="w-full"
            onClick={() => {
              exportAttendanceExcel({
                users,
                groups,
                records: attendance,
                studentId: oneStudent || null,
                period,
                filename: `davomat-${period}${oneStudent ? '-talaba' : '-barcha'}.xlsx`,
              })
              setExportOpen(false)
            }}
          >
            Yuklab olish
          </PrimaryBtn>
        </div>
      </Modal>
    </div>
  )
}

function StudentHemisAttendance({ records, users, schedule }) {
  const me = useCurrentUser()
  const groups = useStore((s) => s.groups)
  const navigate = useNavigate()
  const ctx = useOutletContext() || {}
  const tableRef = useRef(null)
  const group = groups.find((g) => g.id === me.groupId)
  const semester = String(ctx.semester || Math.min(8, Math.max(1, (group?.course || 1) * 2 - 1)))
  const course = group?.course || 1
  const inSemester = [course * 2 - 1, course * 2].includes(Number(semester))

  const [bySubject, setBySubject] = useState(false)
  const [filters, setFilters] = useState({ subject: '', mashgulot: '', sababli: '' })
  const [openFilter, setOpenFilter] = useState('')
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) setOpenFilter('')
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const rows = useMemo(() => {
    if (!inSemester) return []
    return records.map((rec) => ({
      rec,
      subject: rec.subject,
      date: rec.date,
      mashgulot: mashgulotLabel(schedule, rec),
      sababli: isSababli(rec),
      hours: LESSON_HOURS,
      staff: teacherName(users, schedule, rec),
    }))
  }, [inSemester, records, schedule, users])

  const filtered = rows.filter((row) => {
    if (filters.subject && row.subject !== filters.subject) return false
    if (filters.mashgulot && row.mashgulot !== filters.mashgulot) return false
    if (filters.sababli === 'yes' && !row.sababli) return false
    if (filters.sababli === 'no' && row.sababli) return false
    return true
  })

  const grouped = useMemo(() => {
    const map = new Map()
    for (const row of filtered) {
      const key = row.subject
      if (!map.has(key)) {
        map.set(key, {
          subject: row.subject,
          mashgulot: row.mashgulot,
          staff: row.staff,
          hours: 0,
          sababliHours: 0,
          items: [],
        })
      }
      const g = map.get(key)
      g.hours += row.hours
      if (row.sababli) g.sababliHours += row.hours
      g.items.push(row)
    }
    return [...map.values()]
  }, [filtered])

  const totalHours = filtered.reduce((n, r) => n + r.hours, 0)
  const subjectOptions = [...new Set(rows.map((r) => r.subject))]
  const mashOptions = [...new Set(rows.map((r) => r.mashgulot))]
  const empty = bySubject ? grouped.length === 0 : filtered.length === 0

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setOpenFilter('')
  }

  return (
    <div className="min-w-0 overflow-x-hidden pb-8">
      <p className="text-[12px] font-medium text-[#9aa3b2]">
        Asosiy <span className="mx-1 text-[#c5cad3]">/</span> Dashboard <span className="mx-1 text-[#c5cad3]">/</span> Davomat
      </p>

      <div className="mt-1.5 flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-bold leading-none tracking-tight text-[#2b3340]">Davomat</h1>
        <label className="flex shrink-0 cursor-pointer items-center gap-2.5 whitespace-nowrap select-none">
          <span className="text-[13px] font-medium text-[#8b93a1]">Fanlar kesimida</span>
          <button
            type="button"
            role="switch"
            aria-checked={bySubject}
            onClick={() => setBySubject((v) => !v)}
            className={cn('relative h-[22px] w-[40px] rounded-full transition', bySubject ? 'bg-[#2f80ed]' : 'bg-[#d8dee8]')}
          >
            <span
              className={cn(
                'absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.18)] transition-all',
                bySubject ? 'left-[20px]' : 'left-[2px]',
              )}
            />
          </button>
        </label>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-[#8b93a1]">
          {semester}-semestr{' '}
          <span className="font-medium text-[#7b61ff]">Jami: {totalHours} soat</span>
        </p>
        <button
          type="button"
          title="Support"
          onClick={openSupportChat}
          className="hidden rounded-lg bg-gradient-to-b from-[#5ad0f6] to-[#4f6ef7] px-2 py-1.5 text-[10px] font-extrabold tracking-wide text-white shadow-[0_4px_10px_rgba(79,110,247,0.3)] md:inline-flex"
        >
          Support
        </button>
      </div>

      <div ref={tableRef} className="mt-2.5 min-w-0 overflow-x-auto rounded-[14px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eef1f6] bg-[#f7f9fc] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa3b2]">
                <ThFilter
                  label="Fanlar"
                  open={openFilter === 'subject'}
                  active={Boolean(filters.subject)}
                  onToggle={() => setOpenFilter((v) => (v === 'subject' ? '' : 'subject'))}
                >
                  <FilterMenu
                    value={filters.subject}
                    onChange={(v) => setFilter('subject', v)}
                    options={[{ value: '', label: 'Barchasi' }, ...subjectOptions.map((s) => ({ value: s, label: s }))]}
                  />
                </ThFilter>
                {!bySubject && <th className="px-4 py-3.5 font-semibold">Dars sanasi</th>}
                <ThFilter
                  label="Mashg‘ulot"
                  open={openFilter === 'mashgulot'}
                  active={Boolean(filters.mashgulot)}
                  onToggle={() => setOpenFilter((v) => (v === 'mashgulot' ? '' : 'mashgulot'))}
                >
                  <FilterMenu
                    value={filters.mashgulot}
                    onChange={(v) => setFilter('mashgulot', v)}
                    options={[{ value: '', label: 'Barchasi' }, ...mashOptions.map((s) => ({ value: s, label: s }))]}
                  />
                </ThFilter>
                <ThFilter
                  label="Sababli"
                  open={openFilter === 'sababli'}
                  active={Boolean(filters.sababli)}
                  onToggle={() => setOpenFilter((v) => (v === 'sababli' ? '' : 'sababli'))}
                >
                  <FilterMenu
                    value={filters.sababli}
                    onChange={(v) => setFilter('sababli', v)}
                    options={[
                      { value: '', label: 'Barchasi' },
                      { value: 'yes', label: 'Sababli' },
                      { value: 'no', label: 'Sababsiz' },
                    ]}
                  />
                </ThFilter>
                <th className="px-4 py-3.5 font-semibold">Soat</th>
                <th className="px-4 py-3.5 font-semibold">Xodim</th>
                <th className="px-3 py-3.5 text-right font-semibold">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {empty ? (
                <tr>
                  <td colSpan={bySubject ? 6 : 7} className="px-4">
                    <EmptyDavomat />
                  </td>
                </tr>
              ) : bySubject ? (
                grouped.map((g) => (
                  <tr key={g.subject} className="border-b border-[#eef1f6] text-[13px] text-[#2b3340] last:border-0 hover:bg-[#fafbfd]">
                    <td className="px-4 py-3.5 font-medium">{g.subject}</td>
                    <td className="px-4 py-3.5 text-[#5c6573]">{g.mashgulot}</td>
                    <td className="px-4 py-3.5">{g.sababliHours ? `${g.sababliHours} soat` : '—'}</td>
                    <td className="px-4 py-3.5">{g.hours}</td>
                    <td className="px-4 py-3.5 text-[#5c6573]">{g.staff}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        className="inline-grid h-8 w-8 place-items-center rounded-lg text-[#9aa3b2] hover:bg-[#f3f6fb] hover:text-[#2f80ed]"
                        aria-label="Ko‘rish"
                        onClick={() => setDetail(g.items[0])}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                filtered.map((row) => (
                  <tr key={row.rec.id} className="border-b border-[#eef1f6] text-[13px] text-[#2b3340] last:border-0 hover:bg-[#fafbfd]">
                    <td className="px-4 py-3.5 font-medium">{row.subject}</td>
                    <td className="px-4 py-3.5 text-[#5c6573]">{formatUzDate(row.date)}</td>
                    <td className="px-4 py-3.5 text-[#5c6573]">{row.mashgulot}</td>
                    <td className="px-4 py-3.5">{row.sababli ? <span className="font-medium text-[#7b61ff]">Ha</span> : '—'}</td>
                    <td className="px-4 py-3.5">{row.hours}</td>
                    <td className="px-4 py-3.5 text-[#5c6573]">{row.staff}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        className="inline-grid h-8 w-8 place-items-center rounded-lg text-[#9aa3b2] hover:bg-[#f3f6fb] hover:text-[#2f80ed]"
                        aria-label="Ko‘rish"
                        onClick={() => setDetail(row)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={Boolean(detail)} title="Davomat ma’lumoti" onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted">Fan: </span>
              <span className="font-semibold">{detail.subject}</span>
            </p>
            {detail.date && (
              <p>
                <span className="text-muted">Sana: </span>
                {formatUzDate(detail.date)}
                {detail.rec?.time ? ` · ${detail.rec.time}` : ''}
              </p>
            )}
            <p>
              <span className="text-muted">Mashg‘ulot: </span>
              {detail.mashgulot}
            </p>
            <p>
              <span className="text-muted">Holat: </span>
              {STATUS[detail.rec?.status]?.label || '—'}
            </p>
            <p>
              <span className="text-muted">Sababli: </span>
              {detail.sababli ? 'Ha' : 'Yo‘q'}
            </p>
            <p>
              <span className="text-muted">Xodim: </span>
              {detail.staff}
            </p>
            {detail.rec?.comment ? (
              <p>
                <span className="text-muted">Izoh: </span>
                {detail.rec.comment}
              </p>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  )
}

function ThFilter({ label, open, active, onToggle, children }) {
  return (
    <th className="relative px-4 py-3.5 font-semibold">
      <button type="button" onClick={onToggle} className="inline-flex items-center gap-1.5 uppercase tracking-[0.06em]">
        {label}
        <Filter size={11} className={open || active ? 'text-[#2f80ed]' : 'text-[#c5cad3]'} />
      </button>
      {open && (
        <div className="absolute left-4 top-[calc(100%-4px)] z-20 min-w-[196px] overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
          {children}
        </div>
      )}
    </th>
  )
}

function FilterMenu({ value, onChange, options }) {
  return (
    <div className="flex flex-col">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value || 'all'}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium normal-case tracking-normal',
              active ? 'bg-[#e8f1ff] text-[#2f80ed]' : 'text-[#5c6573] hover:bg-slate-50',
            )}
          >
            {opt.label}
            {active ? <Check size={13} strokeWidth={2.5} className="shrink-0 text-[#2f80ed]" /> : null}
          </button>
        )
      })}
    </div>
  )
}

function EmptyDavomat() {
  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center py-16 text-center">
      <img src="/dashboard/empty-davomat.png" alt="" className="h-[168px] w-[168px] object-contain" />
      <p className="mt-1 text-[14px] font-medium text-[#8b93a1]">Davomat ma’lumoti bo‘sh</p>
    </div>
  )
}

function Mini({ n, label, tone }) {
  const cls = tone === 'green' ? 'bg-emerald-50 text-emerald-800' : tone === 'yellow' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
  return (
    <div className={`rounded-2xl p-3 text-center ${cls}`}>
      <p className="text-2xl font-extrabold">{n}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  )
}
