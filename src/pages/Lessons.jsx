import { BookOpen, CalendarDays, CircleCheckBig, ClipboardList, FolderOpen, Info, Sparkles, UserRound } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCurrentUser, useStore } from '../store/useStore'
import { calcPercentage } from '../lib/attendance'
import { WEEKDAYS } from '../lib/schedule'
import { cn } from '../components/ui'
import { EmptyState, RoleScreen, SoftCard, SoftRow, StatusChip } from '../components/StudentChrome'

function useSubjectCards() {
  const me = useCurrentUser()
  const schedule = useStore((s) => s.schedule)
  const assignments = useStore((s) => s.assignments)
  const books = useStore((s) => s.books)

  const rows = (
    me.role === 'student' ? schedule.filter((s) => s.groupId === me.groupId) : schedule
  ).filter((s, i, arr) => arr.findIndex((x) => x.subject === s.subject) === i)

  return rows.map((s) => {
    const key = s.subject.split(' ')[0].toLowerCase()
    const relatedAsg = assignments.filter(
      (a) => a.title.toLowerCase().includes(key) && (me.role !== 'student' || a.groupId === me.groupId),
    )
    const submitted = relatedAsg.filter((a) => a.submissions?.some((sub) => sub.studentId === me.id)).length
    const resources = books.filter((b) => b.title.toLowerCase().includes(key)).length
    const total = relatedAsg.length
    const progress = total ? Math.round((submitted / total) * 100) : 0
    return {
      subject: s.subject,
      type: s.type === 'tanlov' ? 'Tanlov' : 'Majburiy',
      hours: s.hours || 0,
      credit: s.credit || 0,
      taskLabel: me.role === 'student' ? `${submitted} / ${total}` : `${total}`,
      resources,
      progress,
    }
  })
}

function SubjectCard({ data, onClick }) {
  const { subject, type, hours, credit, taskLabel, resources, progress } = data
  return (
    <button
      type="button"
      onClick={onClick}
      className="card flex w-full flex-col gap-4 p-5 text-left transition hover:shadow-md active:scale-[0.99]"
    >
      <div>
        <h3 className="text-[15px] font-bold leading-snug text-ink">{subject}</h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-muted">
          <span className={cn('font-medium', type === 'Tanlov' ? 'text-amber-600' : 'text-brand-700')}>{type}</span>
          <span className="text-slate-300">•</span>
          <span>{hours} soat</span>
          <span className="text-slate-300">•</span>
          <span>{credit.toFixed ? credit.toFixed(1) : credit} kredit</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold text-brand-800">{taskLabel}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-muted">
            <CircleCheckBig size={14} className="text-brand-600" /> Topshiriqlar
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-brand-800">{resources}</p>
          <p className="mt-0.5 flex items-center justify-end gap-1.5 text-[12px] font-medium text-muted">
            <FolderOpen size={14} className="text-brand-600" /> Resurslar
          </p>
        </div>
      </div>

      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-end gap-1 text-[12px] font-medium text-muted">
          {progress} / 100
          <Info size={13} className="text-slate-300" />
        </div>
      </div>
    </button>
  )
}

export function SubjectsPage() {
  const me = useCurrentUser()
  const navigate = useNavigate()
  const cards = useSubjectCards()

  const grid = (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((c) => (
        <SubjectCard key={c.subject} data={c} onClick={() => navigate(`/subjects/${encodeURIComponent(c.subject)}`)} />
      ))}
      {!cards.length && <EmptyState text="Fanlar topilmadi." />}
    </div>
  )

  if (me.role !== 'student') return grid

  return (
    <RoleScreen
      title="Fanlar"
      right={
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate-50 sm:px-4 sm:py-2.5"
        >
          <Sparkles size={16} className="text-brand-700" />
          <span className="hidden sm:inline">Tavsiyaviy kurslar</span>
          <span className="sm:hidden">Kurslar</span>
        </button>
      }
    >
      {grid}
    </RoleScreen>
  )
}

export function SubjectDetail() {
  const { name } = useParams()
  const subject = decodeURIComponent(name || '')
  const me = useCurrentUser()
  const navigate = useNavigate()
  const schedule = useStore((s) => s.schedule)
  const users = useStore((s) => s.users)
  const books = useStore((s) => s.books)
  const assignments = useStore((s) => s.assignments)
  const attendance = useStore((s) => s.attendance)

  const slots = schedule.filter((s) => s.subject === subject && (me.role !== 'student' || s.groupId === me.groupId))
  const teacher = users.find((u) => u.id === slots[0]?.teacherId)
  const relatedBooks = books.filter((b) => b.title.toLowerCase().includes(subject.split(' ')[0].toLowerCase()))
  const relatedAsg = assignments.filter((a) => a.title.toLowerCase().includes(subject.split(' ')[0].toLowerCase()) && (me.role !== 'student' || a.groupId === me.groupId))
  const recs = attendance.filter((a) => a.studentId === me.id && a.subject === subject)
  const pct = recs.length ? calcPercentage(recs) : null

  return (
    <RoleScreen title={subject} back="/subjects">
      <div className="space-y-3">
        <SoftCard>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-brand-50 text-brand-700">
              <UserRound size={22} />
            </span>
            <div>
              <p className="text-[13px] text-muted">O‘qituvchi</p>
              <p className="font-semibold">{teacher?.name || '—'}</p>
            </div>
            {pct !== null && <StatusChip className="ml-auto">{pct}% davomat</StatusChip>}
          </div>
        </SoftCard>

        <p className="px-1 text-[13px] font-semibold text-muted">Dars vaqtlari</p>
        {slots.map((s) => (
          <SoftCard key={s.id}>
            <div className="flex items-center gap-3">
              <CalendarDays className="text-brand-700" size={18} />
              <div>
                <p className="font-medium">{WEEKDAYS.find((w) => w.id === (s.weekday || 1))?.label}</p>
                <p className="text-[13px] text-muted">
                  {s.start} – {s.end}
                  {s.room ? ` · ${s.room}` : ''}
                </p>
              </div>
            </div>
          </SoftCard>
        ))}
        {!slots.length && <EmptyState text="Jadval kiritilmagan." />}

        {relatedAsg.length > 0 && (
          <>
            <p className="px-1 pt-1 text-[13px] font-semibold text-muted">Topshiriqlar</p>
            {relatedAsg.map((a) => (
              <SoftRow
                key={a.id}
                icon={ClipboardList}
                title={a.title}
                sub={`Muddat ${a.deadline}`}
                onClick={() => navigate(`/assignments/${a.id}`)}
              />
            ))}
          </>
        )}

        {relatedBooks.length > 0 && (
          <>
            <p className="px-1 pt-1 text-[13px] font-semibold text-muted">O‘quv materiallari</p>
            {relatedBooks.map((b) => (
              <SoftRow key={b.id} icon={BookOpen} title={b.title} sub={b.author} onClick={() => navigate(`/library/${b.id}`)} />
            ))}
          </>
        )}
      </div>
    </RoleScreen>
  )
}
