import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileQuestion,
  MapPin,
  Play,
  Timer,
  UserRound,
  XCircle,
} from 'lucide-react'
import {
  TESTS,
  TYPE_TONE,
  STATUS_META,
  findTest,
  formatDuration,
  formatExamDate,
  formatExamDateTime,
  formatMmSs,
  getAttempt,
  gradeFromPercent,
  remainingMs,
  resolveTestStatus,
  scoreAnswers,
} from '../data/exams'
import { Modal, cn } from '../components/ui'
import { useCurrentUser, useStore } from '../store/useStore'
import emptyAssignmentsPng from '../assets/empty-assignments.png'

const TEST_TABS = [
  { id: 'all', label: 'Barchasi' },
  { id: 'open', label: 'Faol' },
  { id: 'in_progress', label: 'Davom etmoqda' },
  { id: 'completed', label: 'Yakunlangan' },
  { id: 'upcoming', label: 'Kutilmoqda' },
]

const RESULT_TABS = [
  { id: 'all', label: 'Barchasi' },
  { id: '5', label: 'A’lo' },
  { id: '4', label: 'Yaxshi' },
  { id: '3', label: 'Qoniqarli' },
  { id: '2', label: 'Qoniqarsiz' },
]

function toneChip(tone) {
  const map = {
    blue: 'bg-[#e8f1ff] text-[#2f80ed]',
    green: 'bg-[#e7f8ee] text-[#2db36a]',
    amber: 'bg-[#fff4d6] text-[#d9a21b]',
    red: 'bg-[#fde8ee] text-[#e45d7a]',
    slate: 'bg-[#eef1f6] text-[#8b93a1]',
  }
  return map[tone] || map.slate
}

function Chip({ tone, children, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', toneChip(tone), className)}>
      {children}
    </span>
  )
}

function PageHead({ title, trail, right }) {
  const me = useCurrentUser()
  const student = me?.role === 'student'
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        {student ? (
          <p className="page-crumb">
            Asosiy <span className="mx-1">/</span> Dashboard <span className="mx-1">/</span> Imtihonlar
            {trail ? (
              <>
                {' '}
                <span className="mx-1">/</span> {trail}
              </>
            ) : null}
          </p>
        ) : null}
        <h1 className={cn('page-title', !student && 'mt-0')}>{title}</h1>
      </div>
      {right}
    </div>
  )
}

function EmptyCard({ text }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-[18px] bg-white px-6 py-14 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col items-center text-center">
        <img src={emptyAssignmentsPng} alt="" className="h-[140px] w-[140px] object-contain" />
        <p className="mt-2 text-[14px] font-medium text-[#8b93a1]">{text}</p>
      </div>
    </div>
  )
}

function HemisTabs({ items, value, onChange }) {
  return (
    <div className="no-scrollbar mb-5 flex gap-5 overflow-x-auto overflow-y-hidden" role="tablist">
      {items.map((item) => {
        const active = value === item.id
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'shrink-0 border-b-2 pb-2.5 text-[14px] font-semibold whitespace-nowrap transition',
              active ? 'border-[#2f80ed] text-[#2b3340]' : 'border-transparent text-[#9aa3b2] hover:text-[#5b6472]',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function StatCard({ label, value, hint, icon: Icon, accent }) {
  return (
    <div className="rounded-[16px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[#8b93a1]">{label}</p>
          <p className="mt-1 text-[22px] font-bold tabular-nums tracking-tight text-[#2b3340]">{value}</p>
          {hint ? <p className="mt-1 text-[12px] text-[#9aa3b2]">{hint}</p> : null}
        </div>
        <span className={cn('grid h-10 w-10 place-items-center rounded-2xl', accent || 'bg-[#e8f1ff] text-[#2f80ed]')}>
          <Icon size={18} />
        </span>
      </div>
    </div>
  )
}

function ScoreRing({ percent, size = 88, stroke = 8 }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const grade = gradeFromPercent(p)
  const color = { green: '#2db36a', blue: '#2f80ed', amber: '#d9a21b', red: '#e45d7a' }[grade.tone]
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef1f6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (p / 100) * c}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-[18px] font-bold leading-none tabular-nums text-[#2b3340]">{p}%</p>
      </div>
    </div>
  )
}

function useExamRows() {
  const me = useCurrentUser()
  const attempts = useStore((s) => s.examAttempts) || []
  return useMemo(
    () =>
      TESTS.map((test) => {
        const attempt = getAttempt(test, attempts, me?.id)
        const status = resolveTestStatus(test, attempt)
        const score = attempt?.status === 'completed' ? scoreAnswers(test, attempt.answers) : null
        return { test, attempt, status, score }
      }),
    [attempts, me?.id],
  )
}

export default function TestsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const rows = useExamRows()

  const filtered = rows.filter((r) => {
    if (tab === 'all') return true
    if (tab === 'open') return r.status === 'open' || r.status === 'in_progress'
    return r.status === tab
  })

  const stats = {
    open: rows.filter((r) => r.status === 'open' || r.status === 'in_progress').length,
    done: rows.filter((r) => r.status === 'completed').length,
    avg: (() => {
      const scored = rows.filter((r) => r.score)
      if (!scored.length) return '—'
      return `${Math.round(scored.reduce((n, r) => n + r.score.percent, 0) / scored.length)}%`
    })(),
  }

  return (
    <div className="pb-8">
      <PageHead title="Testlar" trail="Testlar" />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Faol testlar" value={stats.open} hint="Hozir topshirish mumkin" icon={Play} />
        <StatCard
          label="Yakunlangan"
          value={stats.done}
          hint="Natijalar bo‘limida"
          icon={CheckCircle2}
          accent="bg-[#e7f8ee] text-[#2db36a]"
        />
        <StatCard
          label="O‘rtacha ball"
          value={stats.avg}
          hint="Yakunlangan testlar"
          icon={Award}
          accent="bg-[#fff4d6] text-[#d9a21b]"
        />
      </div>
      <HemisTabs items={TEST_TABS} value={tab} onChange={setTab} />
      {filtered.length ? (
        <div className="grid gap-3">
          {filtered.map(({ test, attempt, status, score }) => {
            const meta = STATUS_META[status]
            return (
              <button
                key={test.id}
                type="button"
                onClick={() => navigate(`/exams/tests/${test.id}`)}
                className="flex w-full flex-col gap-3 rounded-[16px] bg-white p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)] sm:flex-row sm:items-center sm:gap-5 sm:p-5"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eef3fb] text-[#2f80ed]">
                  <FileQuestion size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#2b3340]">{test.subject}</span>
                    <Chip tone={TYPE_TONE[test.type] || 'slate'}>{test.type}</Chip>
                    <Chip tone={meta.tone}>{meta.label}</Chip>
                    {score ? <Chip tone={score.grade.tone}>{score.percent}% · {score.grade.label}</Chip> : null}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#8b93a1]">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen size={13} /> {test.questions.length} savol
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Timer size={13} /> {formatDuration(test.durationMin)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={13} /> {formatExamDate(test.startsAt)} – {formatExamDate(test.endsAt)}
                    </span>
                  </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-[#c5cad3]" />
              </button>
            )
          })}
        </div>
      ) : (
        <EmptyCard text="Bu filter bo‘yicha test topilmadi" />
      )}
    </div>
  )
}

export function TestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const me = useCurrentUser()
  const attempts = useStore((s) => s.examAttempts) || []
  const saveExamDraft = useStore((s) => s.saveExamDraft)
  const test = findTest(id)

  if (!test) {
    return (
      <div className="pb-8">
        <PageHead title="Test" trail="Testlar" />
        <EmptyCard text="Test topilmadi" />
      </div>
    )
  }

  const attempt = getAttempt(test, attempts, me?.id)
  const status = resolveTestStatus(test, attempt)
  const score = attempt?.status === 'completed' ? scoreAnswers(test, attempt.answers) : null
  const meta = STATUS_META[status]
  const canStart = status === 'open' || status === 'in_progress'

  const start = () => {
    if (!canStart) return
    if (status === 'open') {
      saveExamDraft(test.id, {}, 0)
    }
    navigate(`/exams/tests/${test.id}/take`)
  }

  return (
    <div className="pb-8">
      <PageHead
        title={test.subject}
        trail={
          <>
            Testlar <span className="mx-1">/</span> {test.subject}
          </>
        }
      />

      <div className="space-y-4">
        <div className="rounded-[18px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={TYPE_TONE[test.type] || 'slate'}>{test.type}</Chip>
            <Chip tone={meta.tone}>{meta.label}</Chip>
            <Chip tone="slate">{test.semester}-semestr</Chip>
          </div>
          <h2 className="mt-3 text-[22px] font-bold leading-snug text-[#2b3340]">{test.subject}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#5c6573]">{test.note}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetaRow icon={BookOpen} label="Savollar" value={`${test.questions.length} ta`} />
            <MetaRow icon={Timer} label="Davomiyligi" value={formatDuration(test.durationMin)} />
            <MetaRow icon={CalendarDays} label="Boshlanish" value={formatExamDateTime(test.startsAt)} />
            <MetaRow icon={Clock} label="Tugash" value={formatExamDateTime(test.endsAt)} />
            <MetaRow icon={UserRound} label="O‘qituvchi" value={test.teacher} />
            <MetaRow icon={MapPin} label="Xona" value={test.room} />
          </div>

          {status === 'upcoming' && (
            <p className="mt-5 rounded-xl bg-[#eef3fb] px-3.5 py-3 text-[13px] font-medium text-[#2f80ed]">
              Test {formatExamDateTime(test.startsAt)} da ochiladi.
            </p>
          )}
          {status === 'closed' && (
            <p className="mt-5 rounded-xl bg-[#fde8ee] px-3.5 py-3 text-[13px] font-medium text-[#e45d7a]">
              Muddat o‘tgan. Bu testni topshirish mumkin emas.
            </p>
          )}
          {score && (
            <p className="mt-5 rounded-xl bg-[#e7f8ee] px-3.5 py-3 text-[13px] font-medium text-[#2db36a]">
              Test yakunlangan. Natija: {score.percent}% · {score.grade.label}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {canStart && (
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2f80ed] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_16px_rgba(47,128,237,0.28)] transition hover:bg-[#256fe0]"
              >
                <Play size={15} />
                {status === 'in_progress' ? 'Davom ettirish' : 'Testni boshlash'}
              </button>
            )}
            {score && (
              <button
                type="button"
                onClick={() => navigate(`/exams/results/${test.id}`)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2b3340] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#1e2530]"
              >
                Natijani ko‘rish
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/exams/tests')}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] font-semibold text-[#2f80ed]"
            >
              <ChevronLeft size={16} /> Orqaga
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-[13px] font-semibold text-[#2b3340]">Baholash</p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-[#5c6573]">
              <li className="flex justify-between gap-3">
                <span>A’lo</span>
                <span className="font-semibold text-[#2db36a]">86–100%</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Yaxshi</span>
                <span className="font-semibold text-[#2f80ed]">71–85%</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Qoniqarli</span>
                <span className="font-semibold text-[#d9a21b]">56–70%</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Qoniqarsiz</span>
                <span className="font-semibold text-[#e45d7a]">0–55%</span>
              </li>
            </ul>
          </div>
          <div className="rounded-[18px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-[13px] font-semibold text-[#2b3340]">Qoidalar</p>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-[#8b93a1]">
              <li>1 ta urinish. Yakunlagach qayta topshirib bo‘lmaydi.</li>
              <li>Vaqt tugasa javoblar avtomatik yuboriladi.</li>
              <li>Savollar tartibini o‘zingiz tanlashingiz mumkin.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f7f9fc] px-3.5 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#2f80ed] shadow-sm">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#9aa3b2]">{label}</p>
        <p className="truncate text-[13px] font-semibold text-[#2b3340]">{value}</p>
      </div>
    </div>
  )
}

export function TestTake() {
  const { id } = useParams()
  const navigate = useNavigate()
  const me = useCurrentUser()
  const attempts = useStore((s) => s.examAttempts) || []
  const saveExamDraft = useStore((s) => s.saveExamDraft)
  const submitExamAttempt = useStore((s) => s.submitExamAttempt)
  const test = findTest(id)

  const existing = test ? getAttempt(test, attempts, me?.id) : null
  const status = test ? resolveTestStatus(test, existing) : 'closed'
  const startedRef = useRef(existing?.startedAt || new Date().toISOString())
  const submittedRef = useRef(false)

  const [index, setIndex] = useState(() => existing?.currentIndex || 0)
  const [answers, setAnswers] = useState(() => ({ ...(existing?.answers || {}) }))
  const [confirm, setConfirm] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!test) return undefined
    if (status === 'completed') {
      navigate(`/exams/results/${test.id}`, { replace: true })
      return undefined
    }
    if (status === 'upcoming' || status === 'closed') {
      navigate(`/exams/tests/${test.id}`, { replace: true })
      return undefined
    }
    if (status === 'open') saveExamDraft(test.id, answers, index)
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.id, status])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onLeave = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [])

  const left = test ? remainingMs(test, { startedAt: existing?.startedAt || startedRef.current }, now) : 0

  const finish = () => {
    if (!test || submittedRef.current) return
    submittedRef.current = true
    submitExamAttempt({ testId: test.id, answers, subject: test.subject })
    navigate(`/exams/results/${test.id}`, { replace: true })
  }

  useEffect(() => {
    if (test && status !== 'completed' && status !== 'upcoming' && status !== 'closed' && left <= 0) {
      finish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  if (!test) {
    return (
      <div className="pb-8">
        <EmptyCard text="Test topilmadi" />
      </div>
    )
  }

  if (status === 'completed' || status === 'upcoming' || status === 'closed') return null

  const q = test.questions[index]
  const answeredCount = test.questions.filter((item) => answers[item.id]).length
  const urgent = left < 60 * 1000

  const pick = (optionId) => {
    const next = { ...answers, [q.id]: optionId }
    setAnswers(next)
    saveExamDraft(test.id, next, index)
  }

  const go = (i) => {
    const next = Math.max(0, Math.min(test.questions.length - 1, i))
    setIndex(next)
    saveExamDraft(test.id, answers, next)
  }

  return (
    <div className="pb-8">
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[16px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#2b3340]">{test.subject}</p>
          <p className="text-[12px] text-[#8b93a1]">
            Savol {index + 1} / {test.questions.length} · Javob berilgan {answeredCount}
          </p>
        </div>
        <div
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-bold tabular-nums',
            urgent ? 'bg-[#fde8ee] text-[#e45d7a]' : 'bg-[#e8f1ff] text-[#2f80ed]',
          )}
        >
          <Timer size={15} />
          {formatMmSs(left)}
        </div>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#eef1f6]">
        <div
          className="h-full rounded-full bg-[#2f80ed] transition-[width]"
          style={{ width: `${((index + 1) / test.questions.length) * 100}%` }}
        />
      </div>

      <div className="mb-4 rounded-[16px] bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="mb-2.5 text-[13px] font-semibold text-[#2b3340]">Savollar xaritasi</p>
        <div className="flex flex-wrap gap-1.5">
          {test.questions.map((item, i) => {
            const current = i === index
            const done = Boolean(answers[item.id])
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(i)}
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-xl text-[12px] font-bold transition',
                  current && 'ring-2 ring-[#2f80ed] ring-offset-1',
                  done ? 'bg-[#2f80ed] text-white' : 'bg-[#f3f6fb] text-[#8b93a1]',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
        {urgent && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#fff4d6] px-3 py-2 text-[12px] font-medium text-[#d9a21b]">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            Vaqt tugashiga kam qoldi
          </p>
        )}
      </div>

      <div className="rounded-[18px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9aa3b2]">Savol {index + 1}</p>
          <h2 className="mt-2 text-[18px] font-semibold leading-snug text-[#2b3340]">{q.text}</h2>
          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === opt.id
              const letter = String.fromCharCode(65 + i)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => pick(opt.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition',
                    selected
                      ? 'border-[#2f80ed] bg-[#e8f1ff] shadow-[0_0_0_3px_rgba(47,128,237,0.12)]'
                      : 'border-slate-100 bg-[#f7f9fc] hover:border-slate-200 hover:bg-white',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-bold',
                      selected ? 'bg-[#2f80ed] text-white' : 'bg-white text-[#8b93a1]',
                    )}
                  >
                    {letter}
                  </span>
                  <span className={cn('text-[14px] font-medium', selected ? 'text-[#2f80ed]' : 'text-[#2b3340]')}>
                    {opt.label}
                  </span>
                  {selected ? <Check size={16} className="ml-auto text-[#2f80ed]" /> : null}
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => go(index - 1)}
              className="inline-flex items-center gap-1 rounded-2xl px-3 py-2.5 text-[13px] font-semibold text-[#5c6573] disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Oldingi
            </button>
            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-[#2b3340] hover:bg-slate-50"
            >
              Yakunlash
            </button>
            {index < test.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="inline-flex items-center gap-1 rounded-2xl bg-[#2f80ed] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#256fe0]"
              >
                Keyingi <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirm(true)}
                className="rounded-2xl bg-[#2f80ed] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#256fe0]"
              >
                Yakunlash
              </button>
            )}
          </div>
      </div>

      <Modal open={confirm} title="Testni yakunlash" onClose={() => setConfirm(false)}>
        <p className="text-[14px] leading-relaxed text-[#5c6573]">
          {answeredCount} / {test.questions.length} savolga javob berilgan.
          {answeredCount < test.questions.length
            ? ' Javobsiz savollar 0 ball hisoblanadi. Davom etasizmi?'
            : ' Natija saqlanadi va qayta topshirish mumkin emas.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={finish}
            className="rounded-2xl bg-[#2f80ed] px-4 py-2.5 text-[13px] font-semibold text-white"
          >
            Ha, yakunlash
          </button>
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="rounded-2xl px-4 py-2.5 text-[13px] font-semibold text-[#5c6573]"
          >
            Bekor qilish
          </button>
        </div>
      </Modal>
    </div>
  )
}

export function ResultsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const rows = useExamRows().filter((r) => r.status === 'completed' && r.score)

  const filtered = rows.filter((r) => (tab === 'all' ? true : String(r.score.grade.mark) === tab))
  const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.score.percent, 0) / rows.length) : 0
  const best = rows.length ? Math.max(...rows.map((r) => r.score.percent)) : 0
  const passed = rows.filter((r) => r.score.passed).length

  return (
    <div className="pb-8">
      <PageHead title="Natijalar" trail="Natijalar" />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="O‘rtacha ball" value={rows.length ? `${avg}%` : '—'} hint={gradeFromPercent(avg).label} icon={BarChart3} />
        <StatCard
          label="Eng yuqori"
          value={rows.length ? `${best}%` : '—'}
          hint="Yakunlangan testlar ichida"
          icon={Award}
          accent="bg-[#e7f8ee] text-[#2db36a]"
        />
        <StatCard
          label="O‘tgan testlar"
          value={`${passed} / ${rows.length}`}
          hint="56% va undan yuqori"
          icon={CheckCircle2}
          accent="bg-[#e8f1ff] text-[#2f80ed]"
        />
      </div>
      <HemisTabs items={RESULT_TABS} value={tab} onChange={setTab} />

      {filtered.length ? (
        <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#eef1f6] bg-[#f7f9fc] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa3b2]">
                  <th className="px-4 py-3.5">Fan</th>
                  <th className="px-4 py-3.5">Nazorat turi</th>
                  <th className="px-4 py-3.5">To‘g‘ri</th>
                  <th className="px-4 py-3.5">Ball</th>
                  <th className="px-4 py-3.5">Baho</th>
                  <th className="px-4 py-3.5">Sana</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ test, attempt, score }) => (
                  <tr
                    key={test.id}
                    className="cursor-pointer border-b border-[#eef1f6] text-[13px] text-[#2b3340] last:border-0 hover:bg-[#fafbfd]"
                    onClick={() => navigate(`/exams/results/${test.id}`)}
                  >
                    <td className="px-4 py-3.5 font-medium">{test.subject}</td>
                    <td className="px-4 py-3.5 text-[#5c6573]">{test.type}</td>
                    <td className="px-4 py-3.5 tabular-nums">
                      {score.correct}/{score.total}
                    </td>
                    <td className="px-4 py-3.5 font-semibold tabular-nums">{score.percent}%</td>
                    <td className="px-4 py-3.5">
                      <Chip tone={score.grade.tone}>{score.grade.label}</Chip>
                    </td>
                    <td className="px-4 py-3.5 text-[#5c6573]">{formatExamDate(attempt.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#eef1f6] md:hidden">
            {filtered.map(({ test, attempt, score }) => (
              <button
                key={test.id}
                type="button"
                onClick={() => navigate(`/exams/results/${test.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <ScoreRing percent={score.percent} size={56} stroke={6} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-[#2b3340]">{test.subject}</span>
                  <span className="mt-0.5 block text-[12px] text-[#8b93a1]">
                    {test.type} · {formatExamDate(attempt.submittedAt)}
                  </span>
                </span>
                <Chip tone={score.grade.tone}>{score.grade.label}</Chip>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <EmptyCard text="Natijalar topilmadi" />
      )}
    </div>
  )
}

export function ResultDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const me = useCurrentUser()
  const attempts = useStore((s) => s.examAttempts) || []
  const test = findTest(id)
  const attempt = test ? getAttempt(test, attempts, me?.id) : null
  const score = attempt?.status === 'completed' ? scoreAnswers(test, attempt.answers) : null

  if (!test || !score) {
    return (
      <div className="pb-8">
        <PageHead title="Natija" trail="Natijalar" />
        <EmptyCard text="Natija topilmadi" />
      </div>
    )
  }

  return (
    <div className="pb-8">
      <PageHead
        title={test.subject}
        trail={
          <>
            Natijalar <span className="mx-1">/</span> {test.subject}
          </>
        }
      />

      <div className="rounded-[18px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ScoreRing percent={score.percent} size={108} stroke={10} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={TYPE_TONE[test.type] || 'slate'}>{test.type}</Chip>
              <Chip tone={score.grade.tone}>{score.grade.label}</Chip>
              {score.passed ? <Chip tone="green">O‘tdi</Chip> : <Chip tone="red">O‘tmadi</Chip>}
            </div>
            <h2 className="mt-2 text-[22px] font-bold text-[#2b3340]">{test.subject}</h2>
            <p className="mt-1 text-[13px] text-[#8b93a1]">
              Topshirilgan: {formatExamDateTime(attempt.submittedAt)} · {test.teacher}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat icon={CheckCircle2} label="To‘g‘ri" value={score.correct} className="text-[#2db36a]" />
          <MiniStat icon={XCircle} label="Noto‘g‘ri" value={score.wrong} className="text-[#e45d7a]" />
          <MiniStat icon={FileQuestion} label="O‘tkazilgan" value={score.skipped} className="text-[#d9a21b]" />
        </div>
      </div>

      <h3 className="mt-6 mb-3 text-[15px] font-semibold text-[#2b3340]">Savollar tahlili</h3>
      <div className="space-y-3">
        {test.questions.map((q, i) => {
          const picked = attempt.answers?.[q.id]
          const ok = picked === q.answer
          const skipped = !picked
          const letter = (optId) => String.fromCharCode(65 + q.options.findIndex((o) => o.id === optId))
          return (
            <article key={q.id} className="rounded-[16px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[12px] font-bold text-white',
                    skipped ? 'bg-[#d9a21b]' : ok ? 'bg-[#2db36a]' : 'bg-[#e45d7a]',
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold leading-snug text-[#2b3340]">{q.text}</p>
                  <div className="mt-3 space-y-1.5">
                    {q.options.map((opt) => {
                      const isAnswer = opt.id === q.answer
                      const isPicked = opt.id === picked
                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            'flex items-center gap-2 rounded-xl px-3 py-2 text-[13px]',
                            isAnswer && 'bg-[#e7f8ee] font-medium text-[#2db36a]',
                            isPicked && !isAnswer && 'bg-[#fde8ee] font-medium text-[#e45d7a]',
                            !isAnswer && !isPicked && 'text-[#5c6573]',
                          )}
                        >
                          <span className="w-5 font-bold">{letter(opt.id)}</span>
                          <span>{opt.label}</span>
                          {isAnswer ? (
                            <span className="ml-2 shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold">To‘g‘ri</span>
                          ) : null}
                          {isPicked && !isAnswer ? (
                            <span className="ml-2 shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold">Sizniki</span>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => navigate('/exams/results')}
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#2f80ed]"
      >
        <ChevronLeft size={16} /> Natijalarga qaytish
      </button>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, className }) {
  return (
    <div className="rounded-2xl bg-[#f7f9fc] px-3 py-3 text-center">
      <Icon size={16} className={cn('mx-auto', className)} />
      <p className="mt-1 text-[18px] font-bold tabular-nums text-[#2b3340]">{value}</p>
      <p className="text-[11px] font-medium text-[#8b93a1]">{label}</p>
    </div>
  )
}

export function ExamDetail() {
  return <TestDetail />
}
