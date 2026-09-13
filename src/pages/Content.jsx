import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Bookmark,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { Avatar, Cover, Field, cn, inputClass, Modal, PrimaryBtn } from '../components/ui'
import { fileToDataUrl, formatNewsDate, timeAgo } from '../lib/utils'
import { EmptyState, RoleScreen, SoftCard } from '../components/StudentChrome'

export function Announcements() {
  return (
    <ContentList
      collection="announcements"
      addKey="addAnnouncement"
      title="Yangiliklar"
      path="/announcements"
      fields={['title', 'body']}
      variant="news"
      addLabel="Yangi yangilik"
    />
  )
}

export function Vacancies() {
  return (
    <ContentList
      collection="vacancies"
      addKey="addVacancy"
      title="Vakansiyalar"
      path="/vacancies"
      fields={['title', 'department', 'type', 'deadline', 'description']}
      addLabel="Yangi vakansiya"
    />
  )
}

export function Blog() {
  return (
    <ContentList
      collection="posts"
      addKey="addPost"
      title="Blog"
      path="/blog"
      fields={['title', 'body']}
      addLabel="Yangi maqola"
    />
  )
}

function galleryOf(item) {
  if (item.images?.length) return item.images
  return [item.coverData, item.image].filter(Boolean)
}

function newsImage(item) {
  return galleryOf(item)[0] || ''
}

function NewsMedia({ src, className, fallback }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return <Cover type={fallback || 'exam'} title="" />
  }
  return (
    <img
      src={src}
      alt=""
      className={cn('h-full w-full max-w-full object-cover', className)}
      onError={() => setFailed(true)}
    />
  )
}

function NewsMeta({ item }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 via-black/45 to-transparent px-3 py-2.5 text-white">
      <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-medium tracking-tight">
        <CalendarDays size={14} strokeWidth={2} className="shrink-0 opacity-95" />
        <span className="truncate">{formatNewsDate(item.createdAt)}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium tabular-nums">
        <Eye size={14} strokeWidth={2} className="opacity-95" />
        {item.views || 0}
      </span>
    </div>
  )
}

function NewsTabs({ items, value, onChange }) {
  return (
    <div className="no-scrollbar mb-4 flex gap-5 overflow-x-auto overflow-y-hidden" role="tablist">
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

function NewsCard({ item, path, saved }) {
  const likes = item.likedBy?.length || 0
  const comments = item.comments?.length || 0
  return (
    <Link
      to={`${path}/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-100/90 transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <NewsMedia src={newsImage(item)} fallback={item.cover} className="transition duration-500 group-hover:scale-[1.04]" />
        <NewsMeta item={item} />
        {saved ? (
          <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[#2f80ed] shadow-sm">
            <Bookmark size={14} className="fill-[#2f80ed]" />
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-3.5 pb-4 pt-3">
        <h3 className="line-clamp-2 min-h-[42px] text-[15px] font-semibold leading-snug text-[#2b3340] transition group-hover:text-brand-800">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#8b93a1]">
          {item.body || item.description || item.department}
        </p>
        <div className="mt-2.5 flex items-center gap-3 text-[11px] font-medium text-[#9aa3b2]">
          <span className="inline-flex items-center gap-1">
            <Heart size={12} /> {likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={12} /> {comments}
          </span>
        </div>
      </div>
    </Link>
  )
}

const NEWS_PAGE_SIZE = 8
const LIST_PAGE_SIZE = 10

function paginationItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, current - 1, current, current + 1])
  if (current <= 4) [2, 3, 4, 5].forEach((n) => set.add(n))
  if (current >= total - 3) [total - 4, total - 3, total - 2, total - 1].forEach((n) => set.add(n))
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out = []
  for (const n of nums) {
    const prev = out[out.length - 1]
    if (typeof prev === 'number' && n - prev > 1) out.push('…')
    out.push(n)
  }
  return out
}

function PageBtn({ active, disabled, label, onClick, children, wide }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'grid h-9 place-items-center rounded-[10px] text-[13px] font-semibold tabular-nums transition',
        wide ? 'min-w-9 px-2.5' : 'w-9',
        active
          ? 'bg-[#2f80ed] text-white shadow-[0_6px_14px_rgba(47,128,237,0.32)]'
          : 'text-[#5b6472] hover:bg-[#f3f6fb] hover:text-[#2b3340]',
        disabled && 'pointer-events-none text-[#c5cad3] hover:bg-transparent',
      )}
    >
      {children}
    </button>
  )
}

function Pagination({ page, pageCount, total, pageSize, onChange, noun = 'ta yangilik' }) {
  if (total <= pageSize) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const items = paginationItems(page, pageCount)
  const go = (next) => onChange(Math.min(pageCount, Math.max(1, next)))

  return (
    <nav aria-label="Sahifalar" className="flex flex-col items-center gap-2.5 pt-4">
      <div className="inline-flex items-center gap-0.5 rounded-[16px] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-100/90">
        {pageCount > 5 ? (
          <PageBtn label="Birinchi sahifa" disabled={page === 1} onClick={() => go(1)}>
            <ChevronsLeft size={16} strokeWidth={2.2} />
          </PageBtn>
        ) : null}
        <PageBtn label="Oldingi sahifa" disabled={page === 1} onClick={() => go(page - 1)}>
          <ChevronLeft size={16} strokeWidth={2.2} />
        </PageBtn>
        {items.map((item, i) =>
          item === '…' ? (
            <span key={`gap-${i}`} className="grid h-9 w-7 place-items-center text-[13px] font-semibold tracking-widest text-[#c5cad3]">
              …
            </span>
          ) : (
            <PageBtn key={item} active={item === page} label={`${item}-sahifa`} onClick={() => go(item)} wide={item > 99}>
              {item}
            </PageBtn>
          ),
        )}
        <PageBtn label="Keyingi sahifa" disabled={page === pageCount} onClick={() => go(page + 1)}>
          <ChevronRight size={16} strokeWidth={2.2} />
        </PageBtn>
        {pageCount > 5 ? (
          <PageBtn label="Oxirgi sahifa" disabled={page === pageCount} onClick={() => go(pageCount)}>
            <ChevronsRight size={16} strokeWidth={2.2} />
          </PageBtn>
        ) : null}
      </div>
      <p className="text-[13px] font-medium tabular-nums text-[#9aa3b2]">
        <span className="text-[#5b6472]">{from}–{to}</span>
        <span className="mx-1.5 text-[#d4d9e2]">/</span>
        {total} {noun}
      </p>
    </nav>
  )
}

function ListCard({ item, path }) {
  return (
    <Link
      to={`${path}/${item.id}`}
      className="flex gap-3 overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_2px_12px_rgba(16,80,40,0.05)] lg:p-4"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        {newsImage(item) ? (
          <img src={newsImage(item)} alt="" className="h-16 w-16 object-cover" />
        ) : (
          <Cover type={item.cover || 'exam'} title="" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{item.title}</p>
        <p className="truncate text-sm text-muted">{item.body || item.description || item.department}</p>
        <p className="mt-1 text-xs text-muted">
          {formatNewsDate(item.createdAt)} · <Eye className="inline h-3 w-3" /> {item.views}
        </p>
      </div>
    </Link>
  )
}

function ContentList({ collection, addKey, title, path, fields, variant = 'list', addLabel }) {
  const me = useCurrentUser()
  const items = useStore((s) => s[collection])
  const savedNews = useStore((s) => s.savedNews || [])
  const add = useStore((s) => s[addKey])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({})
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)
  const listRef = useRef(null)
  const canPost = me.role === 'super_admin'
  const pageSize = variant === 'news' ? NEWS_PAGE_SIZE : LIST_PAGE_SIZE
  const savedIds = useMemo(
    () => new Set(savedNews.filter((s) => s.userId === me.id && s.collection === collection).map((s) => s.itemId)),
    [savedNews, me.id, collection],
  )
  const sorted = useMemo(
    () => [...(items || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [items],
  )
  const visible = variant === 'news' && tab === 'saved' ? sorted.filter((item) => savedIds.has(item.id)) : sorted
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const paged = visible.slice((safePage - 1) * pageSize, safePage * pageSize)

  const goPage = (next) => {
    setPage(next)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <RoleScreen title={title}>
      <div className="space-y-4" ref={listRef}>
        {canPost && (
          <div className="flex justify-end">
            <PrimaryBtn onClick={() => setOpen(true)} className="px-3.5 py-2.5">
              <Plus size={16} /> {addLabel || 'Qo‘shish'}
            </PrimaryBtn>
          </div>
        )}
        {variant === 'news' ? (
          <NewsTabs
            value={tab}
            onChange={(id) => {
              setTab(id)
              setPage(1)
            }}
            items={[
              { id: 'all', label: 'Barchasi' },
              { id: 'saved', label: `Saqlangan${savedIds.size ? ` (${savedIds.size})` : ''}` },
            ]}
          />
        ) : null}
        {visible.length ? (
          <>
            {variant === 'news' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paged.map((item) => (
                  <NewsCard key={item.id} item={item} path={path} saved={savedIds.has(item.id)} />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {paged.map((item) => (
                  <ListCard key={item.id} item={item} path={path} />
                ))}
              </div>
            )}
            <Pagination
              page={safePage}
              pageCount={pageCount}
              total={visible.length}
              pageSize={pageSize}
              onChange={goPage}
              noun={variant === 'news' ? 'ta yangilik' : 'ta yozuv'}
            />
          </>
        ) : (
          <EmptyState text={tab === 'saved' ? 'Saqlangan yangiliklar yo‘q' : 'Ma’lumot topilmadi'} />
        )}
        <Modal open={open} title={`${title} qo‘shish`} onClose={() => setOpen(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              add(form)
              setOpen(false)
              setForm({})
              setPage(1)
            }}
          >
            {fields.map((f) => (
              <Field key={f} label={labelOf(f)}>
                {f === 'body' || f === 'description' ? (
                  <textarea className={inputClass} rows={4} required value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
                ) : (
                  <input
                    className={inputClass}
                    type={f === 'deadline' ? 'date' : 'text'}
                    required={f !== 'cover' && f !== 'type'}
                    value={form[f] || ''}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  />
                )}
              </Field>
            ))}
            <Field label="Rasmlar">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = [...(e.target.files || [])]
                  if (!files.length) return
                  const images = await Promise.all(files.map((file) => fileToDataUrl(file)))
                  setForm((x) => ({ ...x, images, coverData: images[0] }))
                }}
              />
            </Field>
            <PrimaryBtn className="w-full" type="submit">
              Joylash
            </PrimaryBtn>
          </form>
        </Modal>
      </div>
    </RoleScreen>
  )
}

function ActionBtn({ icon: Icon, label, active, onClick, activeClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition',
        active ? activeClass : 'text-[#5b6472] hover:bg-slate-50',
      )}
    >
      <Icon size={18} className={active ? 'fill-current' : ''} />
      <span className="tabular-nums">{label}</span>
    </button>
  )
}

function NewsLightbox({ images, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-4" onClick={onClose}>
      <button
        type="button"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
        onClick={onClose}
        aria-label="Yopish"
      >
        <X size={18} />
      </button>
      {images.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:left-6"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            aria-label="Oldingi rasm"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:right-6"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            aria-label="Keyingi rasm"
          >
            <ChevronRight size={22} />
          </button>
        </>
      ) : null}
      <img
        src={images[index]}
        alt=""
        className="max-h-[86vh] max-w-[min(92vw,1100px)] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="absolute bottom-5 text-[13px] font-medium text-white/80">
        {index + 1} / {images.length}
      </p>
    </div>
  )
}

function NewsGallery({ images, cover }) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  if (!images.length) {
    return (
      <div className="relative h-[220px] w-full overflow-hidden bg-slate-100 sm:h-[300px] lg:h-[380px]">
        <Cover type={cover || 'exam'} title="" />
      </div>
    )
  }

  const go = (dir) => setIndex((i) => (i + dir + images.length) % images.length)

  return (
    <div>
      <div className="relative h-[220px] w-full overflow-hidden bg-slate-100 sm:h-[320px] lg:h-[400px]">
        <button type="button" className="h-full w-full" onClick={() => setOpen(true)}>
          <NewsMedia src={images[index]} fallback={cover} />
        </button>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white hover:bg-black/55"
              aria-label="Oldingi rasm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white hover:bg-black/55"
              aria-label="Keyingi rasm"
            >
              <ChevronRight size={18} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
              {index + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'h-16 w-[88px] shrink-0 overflow-hidden rounded-xl ring-2 transition',
                i === index ? 'ring-[#2f80ed]' : 'ring-transparent opacity-80 hover:opacity-100',
              )}
            >
              <NewsMedia src={src} fallback={cover} />
            </button>
          ))}
        </div>
      ) : null}
      {open ? (
        <NewsLightbox
          images={images}
          index={index}
          onClose={() => setOpen(false)}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
        />
      ) : null}
    </div>
  )
}

function PhotoGrid({ images, cover }) {
  const [open, setOpen] = useState(null)
  const go = (dir) => setOpen((i) => ((i ?? 0) + dir + images.length) % images.length)
  if (images.length < 2) return null
  return (
    <div className="px-5 pb-5 lg:px-7">
      <p className="mb-2.5 text-[13px] font-semibold text-[#2b3340]">Rasmlar · {images.length}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"
          >
            <NewsMedia src={src} fallback={cover} className="transition hover:scale-105" />
          </button>
        ))}
      </div>
      {open != null ? (
        <NewsLightbox
          images={images}
          index={open}
          onClose={() => setOpen(null)}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
        />
      ) : null}
    </div>
  )
}

function CommentList({ collection, item, me }) {
  const users = useStore((s) => s.users)
  const addContentComment = useStore((s) => s.addContentComment)
  const removeContentComment = useStore((s) => s.removeContentComment)
  const [text, setText] = useState('')
  const comments = item.comments || []

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addContentComment(collection, item.id, text)
    setText('')
  }

  return (
    <section id="comments" className="scroll-mt-24 border-t border-slate-100 px-5 py-5 lg:px-7">
      <h2 className="text-[16px] font-bold text-[#2b3340]">Izohlar · {comments.length}</h2>
      <form className="mt-4 flex items-start gap-3" onSubmit={submit}>
        <Avatar name={me?.name} color={me?.avatarColor} size="sm" />
        <div className="min-w-0 flex-1">
          <textarea
            className={cn(inputClass, 'min-h-[44px] resize-none py-2.5')}
            rows={2}
            maxLength={500}
            placeholder="Izoh yozing..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <PrimaryBtn type="submit" className="px-3.5 py-2" disabled={!text.trim()}>
              <Send size={14} /> Yuborish
            </PrimaryBtn>
          </div>
        </div>
      </form>
      <div className="mt-5 space-y-4">
        {!comments.length ? (
          <p className="py-4 text-center text-[13px] text-[#9aa3b2]">Birinchi izohni yozing</p>
        ) : (
          [...comments]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((c) => {
              const author = users.find((u) => u.id === c.userId)
              const canRemove = c.userId === me?.id || me?.role === 'super_admin'
              return (
                <div key={c.id} className="flex gap-3">
                  <Avatar name={author?.name || 'Foydalanuvchi'} color={author?.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1 rounded-2xl bg-[#f7f9fc] px-3.5 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-[#2b3340]">{author?.name || 'Foydalanuvchi'}</p>
                        <p className="text-[11px] text-[#9aa3b2]">{timeAgo(c.createdAt)}</p>
                      </div>
                      {canRemove ? (
                        <button
                          type="button"
                          onClick={() => removeContentComment(collection, item.id, c.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-rose-500"
                          aria-label="O‘chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-[13.5px] leading-6 text-slate-700">{c.text}</p>
                  </div>
                </div>
              )
            })
        )}
      </div>
    </section>
  )
}

function NewsDetail({ collection, item, path }) {
  const me = useCurrentUser()
  const bumpViews = useStore((s) => s.bumpViews)
  const toggleContentLike = useStore((s) => s.toggleContentLike)
  const toggleSaveContent = useStore((s) => s.toggleSaveContent)
  const savedNews = useStore((s) => s.savedNews || [])
  const images = galleryOf(item)
  const liked = (item.likedBy || []).includes(me.id)
  const saved = savedNews.some((s) => s.userId === me.id && s.collection === collection && s.itemId === item.id)

  useEffect(() => {
    bumpViews(collection, item.id)
  }, [item.id])

  return (
    <RoleScreen title="Yangiliklar" back={path}>
      <div className="mx-auto w-full max-w-4xl">
        <article className="min-w-0 overflow-hidden rounded-[18px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-slate-100/90">
          <NewsGallery images={images} cover={item.cover} />
          <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-100 px-2 py-1.5 lg:px-4">
            <div className="flex items-center">
              <ActionBtn
                icon={Heart}
                label={item.likedBy?.length || 0}
                active={liked}
                activeClass="text-rose-500 hover:bg-rose-50"
                onClick={() => toggleContentLike(collection, item.id)}
              />
              <ActionBtn
                icon={MessageCircle}
                label={item.comments?.length || 0}
                onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              />
            </div>
            <ActionBtn
              icon={Bookmark}
              label={saved ? 'Saqlangan' : 'Saqlash'}
              active={saved}
              activeClass="text-[#2f80ed] hover:bg-[#e8f1ff]"
              onClick={() => toggleSaveContent(collection, item.id)}
            />
          </div>
          <div className="space-y-3 px-5 py-5 lg:px-7">
            <h1 className="text-[22px] font-bold leading-snug tracking-tight text-[#2b3340] lg:text-[26px]">{item.title}</h1>
            <p className="text-[12px] font-medium text-[#9aa3b2]">
              {formatNewsDate(item.createdAt)} · {item.views || 0} ko‘rish
              {item.department ? ` · ${item.department}` : ''}
              {item.type ? ` · ${item.type}` : ''}
            </p>
            <div className="space-y-4 text-[15px] leading-7 text-slate-700">
              {String(item.body || item.description || '')
                .split(/\n{2,}/)
                .map((p, i) => (
                  <p key={i} className="whitespace-pre-wrap break-words">
                    {p}
                  </p>
                ))}
            </div>
          </div>
          {images.length > 1 ? <PhotoGrid images={images} cover={item.cover} /> : null}
          <CommentList collection={collection} item={item} me={me} />
        </article>
      </div>
    </RoleScreen>
  )
}

export function ContentDetail({ collection, path }) {
  const { id } = useParams()
  const item = useStore((s) => s[collection].find((x) => x.id === id))
  const bumpViews = useStore((s) => s.bumpViews)
  useEffect(() => {
    if (item && collection !== 'announcements' && collection !== 'posts') bumpViews(collection, item.id)
  }, [id])
  if (!item) {
    return (
      <RoleScreen title="Ma’lumot" back={path}>
        <EmptyState text="Topilmadi" />
      </RoleScreen>
    )
  }
  if (collection === 'announcements' || collection === 'posts') {
    return <NewsDetail collection={collection} item={item} path={path} />
  }
  return (
    <RoleScreen title={item.title} back={path}>
      <SoftCard className="overflow-hidden p-0">
        <div className="h-48">
          {newsImage(item) ? (
            <img src={newsImage(item)} alt="" className="h-48 w-full object-cover" />
          ) : (
            <Cover type={item.cover || 'exam'} title={item.title} />
          )}
        </div>
        <div className="space-y-3 p-5">
          <p className="text-xs text-muted">
            {formatNewsDate(item.createdAt)} · {item.views} ko‘rish {item.department ? `· ${item.department}` : ''} {item.type ? `· ${item.type}` : ''}
          </p>
          <p className="whitespace-pre-wrap leading-7 text-slate-700">{item.body || item.description}</p>
        </div>
      </SoftCard>
    </RoleScreen>
  )
}

function labelOf(f) {
  return { title: 'Sarlavha', body: 'Matn', description: 'Tavsif', department: 'Bo‘lim', type: 'Tur', deadline: 'Muddat', cover: 'Muqova turi' }[f] || f
}
