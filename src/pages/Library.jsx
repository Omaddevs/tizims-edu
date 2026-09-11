import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { cn, Field, inputClass, Modal, PrimaryBtn, Select } from '../components/ui'
import { fileToDataUrl, formatBytes } from '../lib/utils'
import { EmptyState, RoleScreen } from '../components/StudentChrome'

export const LIBRARY_TABS = [
  { id: 'all', label: 'Barchasi' },
  { id: 'literature', label: 'Adabiyotlar' },
  { id: 'articles', label: 'Maqolalar' },
  { id: 'dissertations', label: 'Dissertatsiyalar' },
  { id: 'monographs', label: 'Monografiyalar' },
  { id: 'journals', label: 'Jurnallar' },
]

export function categoryLabel(id) {
  return LIBRARY_TABS.find((t) => t.id === id)?.label || 'Adabiyotlar'
}

const COVER_THEMES = {
  python: { from: '#0d3b2e', to: '#1faa59', accent: '#9ef0c1' },
  db: { from: '#083024', to: '#148f4a', accent: '#7ee0a6' },
  math: { from: '#163d7a', to: '#4c8dff', accent: '#d7e6ff' },
  health: { from: '#4aa3c7', to: '#8fd3ea', accent: '#ffffff' },
  marriage: { from: '#1d4f9c', to: '#6ea0e6', accent: '#f4c4c4' },
  law: { from: '#8b1538', to: '#d43b5c', accent: '#ffd27a' },
  toefl: { from: '#1f6b32', to: '#4cbe6e', accent: '#fff3a8' },
  mathintro: { from: '#2f6adf', to: '#8bb4ff', accent: '#ffffff' },
  mathadv: { from: '#c9a36a', to: '#eee0c4', accent: '#5b3b16' },
  chemistry: { from: '#c81e1e', to: '#f05a3a', accent: '#ffe082' },
  demo: { from: '#1e4f9c', to: '#4d8fe8', accent: '#ffffff' },
  pharma: { from: '#0e7c66', to: '#4fd1b3', accent: '#fff' },
  history: { from: '#6b3b16', to: '#c48a4a', accent: '#f3e2c7' },
  article: { from: '#334155', to: '#64748b', accent: '#e2e8f0' },
  diss: { from: '#1e293b', to: '#475569', accent: '#f8fafc' },
  journal: { from: '#7c2d12', to: '#ea580c', accent: '#ffedd5' },
  book: { from: '#0d5c28', to: '#147a36', accent: '#d1fae5' },
}

export function BookCover({ book, className }) {
  if (book.coverData) {
    return <img src={book.coverData} alt="" className={cn('h-full w-full object-cover', className)} />
  }
  const theme = COVER_THEMES[book.cover] || COVER_THEMES.book
  return (
    <div
      className={cn('relative flex h-full w-full flex-col justify-end overflow-hidden p-3 text-left text-white', className)}
      style={{ background: `linear-gradient(160deg, ${theme.from}, ${theme.to})` }}
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15" />
      <div className="pointer-events-none absolute right-6 top-5 h-10 w-10 rounded-full bg-white/10" />
      <p className="relative z-[1] line-clamp-4 text-[11px] font-bold leading-snug tracking-tight [overflow-wrap:anywhere]">
        {book.title}
      </p>
      <p className="relative z-[1] mt-1 line-clamp-1 text-[9px] font-medium" style={{ color: theme.accent }}>
        {book.author}
      </p>
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="inline-flex max-w-full truncate rounded-md bg-[#e7f6ec] px-1.5 py-0.5 text-[10px] font-medium text-[#1a9440]">
      {children}
    </span>
  )
}

function BookCard({ book, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col rounded-[16px] bg-white p-2.5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[3/4] overflow-hidden rounded-[12px] bg-slate-100">
        <BookCover book={book} />
      </div>
      <p className="mt-2.5 truncate text-[12px] font-medium text-[#27ae60]">{book.author}</p>
      <h3 className="mt-0.5 line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-snug text-[#2b3340]">{book.title}</h3>
      <div className="mt-2 flex flex-wrap gap-1">
        <Tag>{categoryLabel(book.category)}</Tag>
        {book.publisher ? <Tag>{book.publisher}</Tag> : null}
      </div>
      <p className="mt-auto pt-2 text-[11px] font-medium text-[#67b37c]">{book.language || 'O‘zbek'}</p>
    </button>
  )
}

function UniLibraryMark() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <rect x="3.2" y="5.2" width="14" height="16" rx="1.6" fill="#c9d4e3" />
        <rect x="6.4" y="3" width="14.2" height="16.6" rx="1.8" fill="#ef6b7b" />
        <rect x="8.2" y="5.2" width="10.6" height="1.3" rx="0.6" fill="#fff" opacity="0.9" />
        <rect x="8.2" y="8" width="7.2" height="1.1" rx="0.55" fill="#fff" opacity="0.75" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-[#2f80ed]">Unilibrary</span>
    </span>
  )
}

function LibraryToolbar({ q, setQ, tab, setTab, extra }) {
  const trackRef = useRef(null)
  const btnRefs = useRef({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    const update = () => {
      const track = trackRef.current
      const btn = btnRefs.current[tab]
      if (!track || !btn) return
      const trackBox = track.getBoundingClientRect()
      const btnBox = btn.getBoundingClientRect()
      setIndicator({
        left: btnBox.left - trackBox.left,
        width: btnBox.width,
        ready: true,
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [tab])

  return (
    <div className="flex flex-col gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-slate-100/80 lg:flex-row lg:items-center lg:gap-5">
      <UniLibraryMark />
      <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
        <div
          ref={trackRef}
          className="relative inline-flex min-w-max items-center rounded-full bg-[#eef2f7] p-1"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute top-1 h-[calc(100%-8px)] rounded-full bg-white shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            style={{
              left: indicator.left,
              width: indicator.width,
              opacity: indicator.ready ? 1 : 0,
              transition: indicator.ready
                ? 'left 280ms cubic-bezier(0.22, 1, 0.36, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'none',
            }}
          />
          {LIBRARY_TABS.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                ref={(el) => {
                  btnRefs.current[item.id] = el
                }}
                onClick={() => setTab(item.id)}
                className={cn(
                  'relative z-[1] whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200',
                  active ? 'text-[#2b3340]' : 'text-[#8b95a5] hover:text-[#5b6472]',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <form
          className="flex h-10 w-full items-center overflow-hidden rounded-full border border-slate-200 bg-white sm:w-[240px]"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="h-full min-w-0 flex-1 bg-transparent py-0 pl-4 pr-2 text-[13px] outline-none placeholder:text-slate-400"
            placeholder="Qidirish"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="submit"
            className="m-[3px] grid h-[34px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-[#2f80ed] text-white transition hover:bg-[#1f6fd6] active:scale-[0.97]"
            aria-label="Qidirish"
          >
            <Search size={16} />
          </button>
        </form>
        {extra}
      </div>
    </div>
  )
}

export default function Library() {
  const me = useCurrentUser()
  const books = useStore((s) => s.books)
  const addBook = useStore((s) => s.addBook)
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    downloadable: false,
    cover: 'book',
    category: 'literature',
    publisher: '',
    language: 'O‘zbek',
    source: 'Unilibrary',
    fileData: '',
    fileName: '',
    format: 'PDF',
    size: '',
    bytes: 0,
  })
  const navigate = useNavigate()

  const list = books.filter((b) => {
    const hit = `${b.title} ${b.author} ${b.publisher || ''}`.toLowerCase().includes(q.toLowerCase())
    if (!hit) return false
    if (tab === 'all') return true
    return (b.category || 'literature') === tab
  })

  const addBtn =
    me.role === 'super_admin' ? (
      <PrimaryBtn className="shrink-0 py-2" onClick={() => setOpen(true)}>
        <Plus size={16} /> Kitob
      </PrimaryBtn>
    ) : null

  const grid = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {list.map((b) => (
        <BookCard key={b.id} book={b} onOpen={() => navigate(`/library/${b.id}`)} />
      ))}
    </div>
  )

  const modal = (
    <Modal open={open} title="Kitob yuklash" onClose={() => setOpen(false)} wide>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          addBook({
            ...form,
            pages: form.fileData
              ? [{ title: form.title, body: 'Yuklangan PDF fayl platforma ichida ochiladi.' }]
              : form.pages,
          })
          setOpen(false)
        }}
      >
        <Field label="Sarlavha">
          <input className={inputClass} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Muallif">
          <input className={inputClass} required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </Field>
        <Field label="Tavsif">
          <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Turkum">
          <Select
            value={form.category}
            onChange={(category) => setForm({ ...form, category })}
            options={LIBRARY_TABS.filter((t) => t.id !== 'all').map((t) => ({ value: t.id, label: t.label }))}
          />
        </Field>
        <Field label="Nashriyot">
          <input className={inputClass} value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
        </Field>
        <Field label="Til">
          <input className={inputClass} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
        </Field>
        <Field label="Muqova rasmi">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const coverData = await fileToDataUrl(f)
              setForm((x) => ({ ...x, coverData }))
            }}
          />
        </Field>
        <Field label="PDF fayl">
          <input
            type="file"
            accept="application/pdf"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const fileData = await fileToDataUrl(f)
              setForm((x) => ({ ...x, fileData, fileName: f.name, size: formatBytes(f.size), bytes: f.size, format: 'PDF' }))
            }}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.downloadable} onChange={(e) => setForm({ ...form, downloadable: e.target.checked })} />
          Yuklab olishga ruxsat
        </label>
        <PrimaryBtn className="w-full" type="submit">
          Saqlash
        </PrimaryBtn>
      </form>
    </Modal>
  )

  const body = (
    <div className="space-y-5">
      <LibraryToolbar q={q} setQ={setQ} tab={tab} setTab={setTab} extra={addBtn} />
      {grid}
      {!list.length && <EmptyState text="Kitob topilmadi." />}
      {modal}
    </div>
  )

  if (me.role !== 'student') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Elektron kutubxona</h1>
        {body}
      </div>
    )
  }

  return (
    <RoleScreen title="Elektron kutubxona">
      {body}
    </RoleScreen>
  )
}

export function downloadBook(b) {
  if (!b.downloadable) return
  if (b.fileData) {
    const a = document.createElement('a')
    a.href = b.fileData
    a.download = b.fileName || `${b.title}.pdf`
    a.click()
    return
  }
  const blob = new Blob(
    [`${b.title}\n${b.author}\n\n${(b.pages || []).map((p) => `${p.title}\n${p.body}`).join('\n\n')}`],
    { type: 'text/plain' },
  )
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${b.title}.txt`
  a.click()
}
