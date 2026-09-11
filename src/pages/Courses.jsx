import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ListFilter, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { COURSES } from '../data/catalog'
import { OverflowTabs } from '../components/HemisUI'
import { RoleScreen } from '../components/StudentChrome'
import { cn } from '../components/ui'
import { useCurrentUser } from '../store/useStore'

const TABS = [
  { id: 'all', label: 'Umumiy kurslar' },
  { id: 'promo', label: 'Promo kurslar' },
  { id: 'mine', label: 'Mening kurslarim' },
]

const PRICE_OPTS = [
  { id: 'all', label: 'Barcha narxlar' },
  { id: 'free', label: 'Bepul' },
  { id: 'paid', label: 'Pullik' },
]

function formatPrice(n) {
  if (!n) return 'Bepul'
  return `${n.toLocaleString('uz-UZ')} so‘m`
}

function CourseCard({ course, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
    >
      <div className={cn('h-28 bg-gradient-to-br', course.cover)} />
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-snug text-[#2b3340]">{course.title}</h3>
          {course.promo && (
            <span className="shrink-0 rounded-md bg-[#e8f1ff] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2f80ed]">
              Promo
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-[#8b93a1]">{course.org}</p>
        <div className="flex items-center justify-between pt-1 text-[12.5px] font-medium text-[#5b6472]">
          <span>{course.hours} soat</span>
          <span className={course.price ? 'text-[#2b3340]' : 'text-emerald-600'}>{formatPrice(course.price)}</span>
        </div>
      </div>
    </button>
  )
}

function EmptyCourses() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
      <img src="/dashboard/empty-assignments.png" alt="" className="h-[140px] w-[140px] object-contain" />
      <p className="mt-4 text-[15px] font-semibold text-[#2b3340]">Kurslar topilmadi</p>
      <p className="mt-1 max-w-[360px] text-[13px] leading-relaxed text-[#8b93a1]">
        Kurslar mavjud emas yoki filterlar bo‘yicha natija topilmadi.
      </p>
    </div>
  )
}

export default function CoursesPage() {
  const me = useCurrentUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [price, setPrice] = useState('all')
  const filterRef = useRef(null)

  const runSearch = (e) => {
    e?.preventDefault()
    setQuery(draft.trim())
  }

  useEffect(() => {
    if (!filtersOpen) return undefined
    const onPointer = (e) => {
      if (!filterRef.current?.contains(e.target)) setFiltersOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setFiltersOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [filtersOpen])

  const list = useMemo(() => {
    const q = query.toLowerCase()
    return COURSES.filter((c) => {
      if (tab === 'promo' && !c.promo) return false
      if (tab === 'mine' && !c.enrolled) return false
      if (price === 'free' && c.price) return false
      if (price === 'paid' && !c.price) return false
      if (q && !`${c.title} ${c.org}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [tab, query, price])

  const panel = (
    <div className="rounded-[18px] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-4 pt-3 sm:px-5">
        <OverflowTabs items={TABS} value={tab} onChange={setTab} />
      </div>

      <form onSubmit={runSearch} className="grid grid-cols-[minmax(0,1fr)_2.5rem_auto] items-center gap-2 px-4 py-3 sm:gap-2.5 sm:px-5">
        <label className="relative min-w-0">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Kurs qidirish..."
            className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-[14px] text-[#2b3340] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#2f80ed] focus:ring-4 focus:ring-[#2f80ed]/10"
          />
        </label>
        <div className="relative shrink-0" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              'grid h-10 w-10 place-items-center rounded-lg border transition duration-200',
              filtersOpen || price !== 'all'
                ? 'border-[#2f80ed] bg-[#e8f1ff] text-[#2f80ed]'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
            )}
            aria-label="Filter"
            aria-expanded={filtersOpen}
          >
            <ListFilter size={16} />
          </button>
          <div
            className={cn(
              'absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)] transition duration-150',
              filtersOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
            )}
          >
            {PRICE_OPTS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setPrice(opt.id)
                  setFiltersOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors',
                  price === opt.id ? 'bg-[#e8f1ff] text-[#2f80ed]' : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                {opt.label}
                {price === opt.id ? <Check size={14} strokeWidth={2.5} className="shrink-0 text-[#2f80ed]" /> : null}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#2f80ed] px-4 text-[14px] font-semibold text-white shadow-sm transition duration-200 hover:bg-[#256fd4] active:scale-[0.98]"
        >
          <Search size={15} />
          Qidirish
        </button>
      </form>

      {list.length ? (
        <div className="grid gap-4 px-4 pb-5 sm:grid-cols-2 sm:px-5 xl:grid-cols-3">
          {list.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onOpen={() => {
                if (c.subject) navigate(`/subjects/${encodeURIComponent(c.subject)}`)
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyCourses />
      )}
    </div>
  )

  if (me?.role !== 'student') {
    return (
      <div className="space-y-4 pb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Kurslar</h1>
        {panel}
      </div>
    )
  }

  return (
    <RoleScreen title="Kurslar">{panel}</RoleScreen>
  )
}
