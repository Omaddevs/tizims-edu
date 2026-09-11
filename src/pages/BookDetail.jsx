import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bookmark, Eye } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PrimaryBtn } from '../components/ui'
import { BookCover, categoryLabel, downloadBook } from './Library'
import { EmptyState, RoleScreen, SoftCard } from '../components/StudentChrome'

export default function BookDetail() {
  const { id } = useParams()
  const book = useStore((s) => s.books.find((b) => b.id === id))
  const bumpViews = useStore((s) => s.bumpViews)

  useEffect(() => {
    if (book) bumpViews('books', book.id)
  }, [id])

  if (!book) {
    return (
      <RoleScreen title="Kitob" back="/library">
        <EmptyState text="Kitob topilmadi" />
      </RoleScreen>
    )
  }

  return (
    <RoleScreen title="Elektron kutubxona" back="/library" right={<Bookmark className="text-slate-400" />}>
      <SoftCard className="overflow-hidden p-0">
        <div className="h-64">
          <BookCover book={book} />
        </div>
        <div className="space-y-3 p-5">
          <p className="text-sm font-medium text-[#27ae60]">{book.author}</p>
          <h1 className="text-2xl font-extrabold">{book.title}</h1>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-[#e7f6ec] px-2 py-0.5 text-[12px] font-medium text-[#1a9440]">{categoryLabel(book.category)}</span>
            {book.publisher ? (
              <span className="rounded-md bg-[#e7f6ec] px-2 py-0.5 text-[12px] font-medium text-[#1a9440]">{book.publisher}</span>
            ) : null}
            <span className="rounded-md bg-[#e7f6ec] px-2 py-0.5 text-[12px] font-medium text-[#1a9440]">{book.language || 'O‘zbek'}</span>
          </div>
          <p className="text-sm text-muted">
            {book.format} · {book.size} · <Eye className="inline h-3.5 w-3.5" /> {book.views} ko‘rish
          </p>
          <h2 className="font-bold">Tavsif</h2>
          <p className="text-sm leading-6 text-slate-600">{book.description}</p>
          <div className="flex gap-2 pt-2">
            <Link to={`/library/${book.id}/read`} className="flex-1">
              <PrimaryBtn className="w-full">O‘qish</PrimaryBtn>
            </Link>
            <button
              disabled={!book.downloadable}
              onClick={() => downloadBook(book)}
              className="flex-1 rounded-2xl border py-3 text-sm font-semibold disabled:opacity-40"
            >
              Yuklab olish
            </button>
          </div>
        </div>
      </SoftCard>
    </RoleScreen>
  )
}
