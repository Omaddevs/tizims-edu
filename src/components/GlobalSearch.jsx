import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Mic, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from './ui'

const POPULAR = [
  {
    id: 'mastery',
    label: 'O‘zlashtirish (Baholar)',
    to: '/education-params?tab=mastery',
    tags: ['baholar', 'o‘zlashtirish', 'performance'],
    popular: true,
  },
  {
    id: 'attendance',
    label: 'Davomat',
    to: '/attendance',
    tags: ['davomat', 'attendance', 'посещаемость'],
    popular: true,
  },
  {
    id: 'control',
    label: 'Nazorat jadvali',
    to: '/education-params?tab=control',
    tags: ['nazorat jadvali', 'imtihon sanlari', 'control table'],
    popular: true,
  },
  {
    id: 'contract',
    label: 'Kontrakt to‘lovi',
    to: '/payments',
    tags: ['kontrakt', 'shartnoma', 'to‘lov'],
    popular: true,
  },
  {
    id: 'docs',
    label: 'Hujjatlar',
    to: '/documents',
    tags: ['hujjatlar', 'papkalar', 'folders'],
    popular: true,
  },
]

const EXTRA = [
  { id: 'schedule', label: 'Dars jadvali', to: '/schedule', tags: ['jadval', 'dars', 'schedule'] },
  { id: 'subjects', label: 'Fanlar', to: '/subjects', tags: ['fan', 'subjects'] },
  { id: 'courses', label: 'Kurslar', to: '/courses', tags: ['kurs', 'courses'] },
  { id: 'exams', label: 'Imtihonlar', to: '/exams', tags: ['imtihon', 'sessiya'] },
  { id: 'params', label: 'O‘quv parametrlari', to: '/education-params', tags: ['o‘quv reja', 'gpa', 'parametr'] },
  { id: 'plan', label: 'O‘quv reja', to: '/education-params?tab=plan', tags: ['reja', 'fanlar'] },
  { id: 'gpa', label: 'GPA', to: '/education-params?tab=gpa', tags: ['gpa', 'reyting'] },
  { id: 'daily', label: 'Kundalik baholar', to: '/education-params?tab=daily', tags: ['baho', 'kundalik'] },
  { id: 'rating', label: 'Reyting daftarcha', to: '/education-params?tab=rating', tags: ['reyting', 'daftarcha'] },
  { id: 'assignments', label: 'Topshiriqlar', to: '/assignments', tags: ['vazifa', 'topshiriq'] },
  { id: 'library', label: 'Elektron kutubxona', to: '/library', tags: ['kitob', 'kutubxona'] },
  { id: 'surveys', label: 'So‘rovnomalar', to: '/surveys', tags: ['so‘rov', 'anketa'] },
  { id: 'settings', label: 'Sozlamalar', to: '/settings', tags: ['profil', 'settings'] },
  { id: 'support', label: 'Yordam va yo‘riqnoma', to: '/support', tags: ['yordam', 'support'] },
]

function fold(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[‘’ʻ`'´]/g, '')
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
}

function matches(item, q) {
  if (!q) return true
  const hay = fold([item.label, ...(item.tags || [])].join(' '))
  return hay.includes(q)
}

export function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const recRef = useRef(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const [listening, setListening] = useState(false)

  const list = useMemo(() => {
    const q = fold(query.trim())
    if (!q) return POPULAR
    return [...POPULAR, ...EXTRA].filter((item) => matches(item, q))
  }, [query])

  const go = useCallback(
    (to) => {
      onClose()
      navigate(to)
    },
    [navigate, onClose],
  )

  useEffect(() => {
    if (!open) {
      recRef.current?.stop?.()
      setListening(false)
      setQuery('')
      setActive(-1)
      return undefined
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => {
      document.body.style.overflow = prev
      window.clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    setActive(-1)
  }, [query])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (!list.length) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((i) => Math.min(list.length - 1, i < 0 ? 0 : i + 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((i) => Math.max(0, i < 0 ? list.length - 1 : i - 1))
      }
      if (e.key === 'Enter') {
        const item = list[active] || list[0]
        if (!item) return
        e.preventDefault()
        go(item.to)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, list, active, onClose, go])

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    if (listening) {
      recRef.current?.stop?.()
      setListening(false)
      return
    }
    const rec = new SR()
    rec.lang = 'uz-UZ'
    rec.interimResults = true
    rec.continuous = false
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ')
      setQuery(text)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-end p-0 sm:place-items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-[#1b2430]/35 backdrop-blur-[2px]" onClick={onClose} aria-label="Yopish" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-search-title"
        className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white px-5 pb-5 pt-4 shadow-[0_24px_64px_rgba(15,23,42,0.18)] sm:max-w-[480px] sm:rounded-[22px] sm:px-6 sm:pb-6 sm:pt-5"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="global-search-title" className="text-[17px] font-semibold text-[#2b3340]">
            Umumiy qidirish
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#9aa3b2] transition hover:bg-slate-50 hover:text-[#5b6472]"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2.5">
          <label className="relative min-w-0 flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa3b2]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qidirish... (jadval, to‘lov, talaba...)"
              className="w-full rounded-[12px] border-2 border-[#2f80ed] bg-white py-2.5 pl-10 pr-3 text-[14px] text-[#2b3340] outline-none placeholder:text-[#b0b7c3] ring-[3px] ring-[#2f80ed]/15"
            />
          </label>
          <button
            type="button"
            onClick={toggleVoice}
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-full transition',
              listening ? 'bg-rose-50 text-rose-500' : 'bg-[#eef4ff] text-[#2f80ed] hover:bg-[#e4edff]',
            )}
            aria-label={listening ? 'Tinglashni to‘xtatish' : 'Ovozli qidirish'}
            aria-pressed={listening}
          >
            <Mic size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5 scrollbar-thin">
          {list.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item.to)}
              className={cn(
                'flex w-full items-start gap-3 rounded-[14px] px-3.5 py-3.5 text-left transition',
                i === active ? 'bg-[#eaf3fb]' : 'bg-[#f4f8fc] hover:bg-[#eaf3fb]',
              )}
            >
              <span className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2f80ed] text-[12px] font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[14px] font-semibold leading-snug text-[#2b3340]">{item.label}</span>
                  {item.popular && (
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-[3px] text-[11px] font-medium text-[#2f80ed] shadow-[0_0_0_1px_rgba(47,128,237,0.12)]">
                      Ommabop
                    </span>
                  )}
                </span>
                {item.tags?.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white px-2 py-[3px] text-[11px] text-[#8b93a1]">
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </button>
          ))}
          {!list.length && <p className="px-2 py-10 text-center text-[13px] text-[#8b93a1]">Hech narsa topilmadi</p>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
