import { useMemo, useState } from 'react'
import { Calculator, ChevronDown, ChevronRight, Filter } from 'lucide-react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { useCurrentUser, useStore } from '../store/useStore'
import { EXAMS } from '../data/catalog'
import { academicSemesters, gpaFromSubjects, gpaRows } from '../data/academic'
import { Modal, cn } from '../components/ui'

const TABS = [
  { id: 'plan', label: 'O‘quv reja' },
  { id: 'mastery', label: 'O‘zlashtirish' },
  { id: 'daily', label: 'Kundalik baholar' },
  { id: 'gpa', label: 'GPA' },
  { id: 'control', label: 'Nazorat jadvali' },
  { id: 'rating', label: 'Reyting daftarcha' },
]

function pillClass(tone) {
  const map = {
    rose: 'bg-[#fde8ee] text-[#e45d7a]',
    amber: 'bg-[#fff4d6] text-[#d9a21b]',
    green: 'bg-[#e7f8ee] text-[#2db36a]',
    orange: 'bg-[#fff0e0] text-[#ef8a2a]',
    blue: 'bg-[#2f80ed] text-white',
  }
  return map[tone] || map.blue
}

function ScoreChip({ value, max, tone }) {
  return (
    <span className={cn('inline-flex min-w-[72px] items-center justify-center rounded-full px-2.5 py-[5px] text-[12px] font-semibold tabular-nums', pillClass(tone))}>
      {value} / {max}
    </span>
  )
}

function GpaChip({ value }) {
  const n = Number(value) || 0
  const tone = n < 3 ? 'rose' : n < 3.6 ? 'orange' : 'green'
  return (
    <span className={cn('inline-flex min-w-[52px] items-center justify-center rounded-full px-2.5 py-[5px] text-[12px] font-semibold tabular-nums', pillClass(tone))}>
      {n.toFixed(2)}
    </span>
  )
}

function EmptyFigure({ text }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[16px] bg-white px-6 py-16 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <img src="/dashboard/empty-assignments.png" alt="" className="h-[140px] w-[140px] object-contain" />
      <p className="mt-3 text-[14px] font-medium text-[#8b93a1]">{text}</p>
    </div>
  )
}

function ParamTable({ columns, rows }) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={c.width ? { width: c.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-[#eef1f6] bg-[#f7f9fc] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa3b2]">
            {columns.map((c) => (
              <th key={c.key} className={cn('px-4 py-3.5', c.align === 'right' && 'text-right')}>
                <span className="inline-flex items-center gap-1.5">
                  {c.label}
                  {c.filter && <Filter size={12} className="text-[#c5cad3]" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-[#eef1f6] text-[13px] text-[#2b3340] last:border-0 hover:bg-[#fafbfd]">
              {columns.map((c) => (
                <td key={c.key} className={cn('max-w-0 overflow-hidden px-4 py-3.5', c.align === 'right' && 'text-right', c.muted && 'text-[#5c6573]')}>
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SemesterBlock({ sem, open, onToggle, extra, children }) {
  return (
    <div className="rounded-[16px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
        <p className="text-[14px] font-semibold text-[#2b3340]">
          {sem.id}-semestr <span className="font-normal text-[#8b93a1]">({sem.range})</span>
          {extra ? <span className="ml-2 font-normal text-[#8b93a1]">{extra}</span> : null}
        </p>
        {open ? <ChevronDown size={18} className="shrink-0 text-[#9aa3b2]" /> : <ChevronRight size={18} className="shrink-0 text-[#9aa3b2]" />}
      </button>
      {open && children}
    </div>
  )
}

export default function EducationParams() {
  const me = useCurrentUser()
  const groups = useStore((s) => s.groups)
  const schedule = useStore((s) => s.schedule)
  const ctx = useOutletContext() || {}
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'plan'
  const setTab = (id) => {
    const next = new URLSearchParams(params)
    if (id === 'plan') next.delete('tab')
    else next.set('tab', id)
    setParams(next, { replace: true })
  }
  const [openId, setOpenId] = useState(null)
  const [calcOpen, setCalcOpen] = useState(false)

  const group =
    me.role === 'student'
      ? groups.find((g) => g.id === me.groupId)
      : groups.find((g) => me.groupIds?.includes(g.id)) || groups[0]

  const semesters = useMemo(
    () => academicSemesters({ group, schedule, studentId: me.id }),
    [group, schedule, me.id],
  )

  const selected = Number(ctx.semester || semesters.at(-1)?.id || 1)
  const activeId = openId ?? (semesters.some((s) => s.id === selected) ? selected : semesters.at(-1)?.id)

  const gpa = useMemo(() => gpaRows(semesters), [semesters])
  const calcSem = semesters.find((s) => s.id === activeId) || semesters.at(-1)
  const calcStats = gpaFromSubjects(calcSem?.subjects || [])

  const toggle = (id) => setOpenId((cur) => (cur === id ? -1 : id))

  const body = (
    <div className="min-w-0 max-w-full pb-8">
      <div className="hidden lg:block">
        <p className="text-[12px] font-medium text-[#9aa3b2]">
          Asosiy <span className="mx-1 text-[#c5cad3]">/</span> Dashboard <span className="mx-1 text-[#c5cad3]">/</span> O‘quv parametrlari
        </p>
        <h1 className="mt-1.5 text-[26px] font-bold leading-none text-[#2b3340]">O‘quv parametrlari</h1>
      </div>

      <div className="no-scrollbar mt-5 flex gap-5 overflow-x-auto overflow-y-hidden border-b border-[#eef1f6]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 border-b-2 pb-2.5 text-[13px] font-medium transition',
              tab === t.id ? 'border-[#2f80ed] text-[#2f80ed]' : 'border-transparent text-[#8b93a1] hover:text-[#2b3340]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {tab === 'plan' &&
          semesters
            .slice()
            .reverse()
            .map((sem) => (
              <SemesterBlock key={sem.id} sem={sem} open={sem.id === activeId} onToggle={() => toggle(sem.id)}>
                <ParamTable
                  columns={[
                    { key: 'name', label: 'Fanlar', filter: true, width: '32%' },
                    { key: 'type', label: 'Fan turi', muted: true, width: '16%' },
                    { key: 'hours', label: 'Yuklama', muted: true, width: '16%' },
                    { key: 'credit', label: 'Kredit', width: '14%' },
                    { key: 'action', label: 'Amallar', align: 'right', width: '22%' },
                  ]}
                  rows={sem.subjects.map((s) => ({
                    id: s.name,
                    name: <span className="font-medium">{s.name}</span>,
                    type: s.type,
                    hours: `${s.hours} soat`,
                    credit: Number(s.credit).toFixed(1),
                    action: (
                      <button
                        type="button"
                        className="text-[13px] font-medium text-[#2f80ed] hover:underline"
                        onClick={() => navigate(`/subjects/${encodeURIComponent(s.name)}`)}
                      >
                        Batafsil
                      </button>
                    ),
                  }))}
                />
              </SemesterBlock>
            ))}

        {tab === 'mastery' &&
          semesters
            .slice()
            .reverse()
            .map((sem) => (
              <SemesterBlock
                key={sem.id}
                sem={sem}
                extra={`${sem.subjects.length} ta fan`}
                open={sem.id === activeId}
                onToggle={() => toggle(sem.id)}
              >
                <ParamTable
                  columns={[
                    { key: 'name', label: 'Fanlar', filter: true },
                    { key: 'joriy', label: 'Joriy nazorat' },
                    { key: 'oraliq', label: 'Oraliq nazorat' },
                    { key: 'yakuniy', label: 'Yakuniy' },
                    { key: 'total', label: 'Umumiy' },
                  ]}
                  rows={sem.subjects.map((s) => {
                    const sc = s.scores
                    const oraliqTone = sc.oraliq / sc.oraliqMax >= 0.9 ? 'green' : 'amber'
                    return {
                      id: s.name,
                      name: <span className="font-medium">{s.name}</span>,
                      joriy: <ScoreChip value={sc.joriy} max={sc.joriyMax} tone="rose" />,
                      oraliq: <ScoreChip value={sc.oraliq} max={sc.oraliqMax} tone={oraliqTone} />,
                      yakuniy: <ScoreChip value={sc.yakuniy} max={sc.yakuniyMax} tone="orange" />,
                      total: <ScoreChip value={sc.total} max={sc.totalMax} tone="blue" />,
                    }
                  })}
                />
              </SemesterBlock>
            ))}

        {tab === 'daily' && <EmptyFigure text="Ma’lumot topilmadi" />}

        {tab === 'gpa' && (
          <>
            <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <ParamTable
                columns={[
                  { key: 'year', label: 'O‘quv yili' },
                  { key: 'course', label: 'Kurs' },
                  { key: 'gpa', label: 'GPA' },
                  { key: 'credits', label: 'Kredit' },
                  { key: 'debt', label: 'Qarz' },
                  { key: 'method', label: 'GPA usuli' },
                ]}
                rows={gpa.map((r) => ({
                  id: r.year,
                  year: <span className="font-medium">{r.year}</span>,
                  course: `${r.course}-kurs`,
                  gpa: <GpaChip value={r.gpa} />,
                  credits: r.credits.toFixed(1),
                  debt: `${r.debt} / ${r.total}`,
                  method: <span className="text-[#5c6573]">{r.method}</span>,
                }))}
              />
              <div className="flex justify-end px-4 py-3">
                <button
                  type="button"
                  onClick={() => setCalcOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2f80ed] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#256fd1]"
                >
                  <Calculator size={16} />
                  GPA hisoblagich
                </button>
              </div>
            </div>
          </>
        )}

        {tab === 'control' &&
          (EXAMS.length ? (
            <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <ParamTable
                columns={[
                  { key: 'name', label: 'Fanlar', filter: true },
                  { key: 'type', label: 'Nazorat turi', muted: true },
                  { key: 'date', label: 'Sana', muted: true },
                  { key: 'time', label: 'Vaqt', muted: true },
                  { key: 'room', label: 'Xona' },
                ]}
                rows={EXAMS.map((e) => ({
                  id: e.id,
                  name: <span className="font-medium">{e.subject}</span>,
                  type: e.type,
                  date: e.date,
                  time: e.time,
                  room: e.room,
                }))}
              />
            </div>
          ) : (
            <EmptyFigure text="Nazorat ma’lumotlari topilmadi" />
          ))}

        {tab === 'rating' &&
          semesters
            .slice()
            .reverse()
            .map((sem) => (
              <SemesterBlock key={sem.id} sem={sem} open={sem.id === activeId} onToggle={() => toggle(sem.id)}>
                <ParamTable
                  columns={[
                    { key: 'name', label: 'Fanlar', filter: true },
                    { key: 'type', label: 'Fan turi', muted: true },
                    { key: 'hours', label: 'Yuklama', muted: true },
                    { key: 'credit', label: 'Kredit' },
                    { key: 'rating', label: 'Reyting / ball' },
                    { key: 'grade', label: 'Baho' },
                  ]}
                  rows={sem.subjects.map((s) => ({
                    id: s.name,
                    name: <span className="font-medium">{s.name}</span>,
                    type: s.type,
                    hours: `${s.hours} soat`,
                    credit: Number(s.credit).toFixed(1),
                    rating: <ScoreChip value={s.scores.total} max={100} tone="orange" />,
                    grade: <ScoreChip value={s.scores.total} max={100} tone="orange" />,
                  }))}
                />
              </SemesterBlock>
            ))}
      </div>

      <Modal open={calcOpen} title="GPA hisoblagich" onClose={() => setCalcOpen(false)} wide>
        <p className="mb-3 text-[13px] text-muted">
          {calcSem?.id}-semestr · kreditlar {calcStats.credits.toFixed(1)} · GPA {calcStats.gpa.toFixed(2)}
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f7f9fc] text-[11px] font-semibold uppercase tracking-wide text-[#9aa3b2]">
              <tr>
                <th className="px-3 py-2.5">Fan</th>
                <th className="px-3 py-2.5">Kredit</th>
                <th className="px-3 py-2.5">Ball</th>
                <th className="px-3 py-2.5">GPA</th>
              </tr>
            </thead>
            <tbody>
              {(calcSem?.subjects || []).map((s) => (
                <tr key={s.name} className="border-t border-slate-50">
                  <td className="px-3 py-2.5 font-medium">{s.name}</td>
                  <td className="px-3 py-2.5">{Number(s.credit).toFixed(1)}</td>
                  <td className="px-3 py-2.5">{s.scores.total}</td>
                  <td className="px-3 py-2.5">{((s.scores.total / 100) * 4).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  )

  return (
    <div>
      {me.role === 'student' ? (
        <div className="mb-5">
          <p className="page-crumb">
            Asosiy <span className="mx-1">/</span> Dashboard <span className="mx-1">/</span> O‘quv parametrlari
          </p>
          <h1 className="page-title">O‘quv parametrlari</h1>
        </div>
      ) : null}
      {body}
    </div>
  )
}
