import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search, ZoomIn } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function BookReader() {
  const { id } = useParams()
  const book = useStore((s) => s.books.find((b) => b.id === id))
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const [zoom, setZoom] = useState(1)

  const pages = book?.pages?.length ? book.pages : [{ title: book?.title, body: book?.description }]
  const total = book?.fileData ? 1 : pages.length
  const current = pages[page] || pages[0]

  const highlighted = useMemo(() => {
    if (!q) return current.body
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return String(current.body || '').replace(re, '«$1»')
  }, [q, current])

  if (!book) return <p>Kitob topilmadi</p>

  return (
    <div className="-mx-4 -mt-5 min-h-[70vh] bg-slate-950 text-slate-100 lg:-mx-8">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button onClick={() => navigate(`/library/${id}`)} className="text-sm text-slate-400">
            ← Ortga
          </button>
          <div className="flex items-center gap-2">
            <Search size={16} className="text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Qidirish"
              className="w-36 rounded-lg bg-slate-800 px-2 py-1 text-sm outline-none"
            />
            <button onClick={() => setZoom((z) => (z === 1 ? 1.2 : 1))} className="rounded-lg p-1 hover:bg-slate-800">
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {book.fileData ? (
          <iframe title={book.title} src={book.fileData} className="h-[70vh] w-full rounded-2xl bg-white" />
        ) : (
          <article className="rounded-2xl bg-slate-900 p-6 leading-7" style={{ fontSize: `${zoom}rem` }}>
            <p className="text-xs uppercase tracking-wide text-teal-400">{book.author}</p>
            <h1 className="mt-2 text-2xl font-bold">{current.title}</h1>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-slate-200">{highlighted}</pre>
            {page === 1 && book.cover === 'db' && (
              <div className="mt-6 rounded-xl border border-slate-700 p-4 text-sm">
                <p className="font-semibold text-teal-300">ER sxema</p>
                <p className="mt-2">Talaba ──&lt; Guruh &gt;── Fan</p>
                <p>Talaba (id, FISH, telefon) · Guruh (nomi) · Fan (davomat)</p>
              </div>
            )}
          </article>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl bg-slate-800 p-3 disabled:opacity-30"
          >
            <ChevronLeft />
          </button>
          <p className="text-sm text-slate-400">
            {page + 1} / {total}
          </p>
          <button
            disabled={page >= total - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl bg-slate-800 p-3 disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}
