import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  Check,
  ChevronLeft,
  ClipboardList,
  Clock,
  FileText,
  Folder,
  GraduationCap,
  Inbox,
  Library,
  LifeBuoy,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Search,
  Send,
  Settings,
  Shield,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { timeAgo } from '../lib/utils'
import { EmptyInbox, MenuCard } from '../components/HemisUI'
import { cn, Field, Select } from '../components/ui'

const hemisField =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-[#2f80ed] focus:ring-4 focus:ring-[#2f80ed]/10'

const FOLDERS = [
  { id: 'inbox', label: 'Kiruvchi', icon: Inbox },
  { id: 'sent', label: 'Chiquvchi', icon: Send },
  { id: 'draft', label: 'Qoralama', icon: FileText },
  { id: 'deleted', label: 'O‘chirilgan', icon: Trash2 },
]

function partyName(n, folder) {
  if (folder === 'sent' || folder === 'draft') return n.toName || 'Qabul qiluvchi tanlanmagan'
  return n.from || 'Super Admin'
}

function recipientOptions(me, users) {
  const label = (u) => (u.role === 'super_admin' ? 'Super Admin' : u.name)
  if (me.role === 'super_admin') {
    return [
      { id: '__all_students__', name: 'Barcha talabalar' },
      ...users.filter((u) => u.id !== me.id).map((u) => ({ id: u.id, name: label(u) })),
    ]
  }
  if (me.role === 'teacher') {
    return users
      .filter((u) => u.role === 'super_admin' || (u.role === 'student' && me.groupIds?.includes(u.groupId)))
      .sort((a, b) => Number(b.role === 'super_admin') - Number(a.role === 'super_admin'))
      .map((u) => ({ id: u.id, name: label(u) }))
  }
  return users
    .filter((u) => u.role === 'super_admin' || (u.role === 'teacher' && u.groupIds?.includes(me.groupId)))
    .sort((a, b) => Number(b.role === 'super_admin') - Number(a.role === 'super_admin'))
    .map((u) => ({ id: u.id, name: label(u) }))
}

function MessageCard({ item, folder, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[118px] min-w-0 flex-col rounded-[16px] bg-[#f4f6fb] p-4 text-left transition hover:bg-[#eef3fb] hover:shadow-[0_8px_20px_rgba(47,128,237,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-[#2f80ed]">{partyName(item, folder)}</p>
        {item.read ? (
          <Check size={16} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[#2f80ed]" />
        ) : (
          <span className="mt-[-2px] shrink-0 text-[18px] font-bold leading-none text-[#f43f5e]">*</span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[14px] font-semibold leading-snug text-[#2b3340]">{item.title}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-2.5">
        <p className="min-w-0 flex-1 truncate text-[12.5px] text-[#8b93a1]">{item.body}</p>
        <p className="flex shrink-0 items-center gap-1 text-[11px] text-[#9aa3b2]">
          <Clock size={12} strokeWidth={2} />
          {timeAgo(item.createdAt)}
        </p>
      </div>
    </button>
  )
}

function ComposeForm({ me, users, draft, onSent, onSaved }) {
  const sendMessage = useStore((s) => s.sendMessage)
  const saveDraft = useStore((s) => s.saveDraft)
  const options = useMemo(() => recipientOptions(me, users), [me, users])
  const [toUserId, setToUserId] = useState(draft?.toId || options[0]?.id || '')
  const [title, setTitle] = useState(draft?.title === 'Mavzusiz' ? '' : draft?.title || '')
  const [body, setBody] = useState(draft?.body || '')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const draftId = draft?.id

  const selectedName = options.find((o) => o.id === toUserId)?.name || ''

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (!toUserId) return setError('Qabul qiluvchini tanlang')
    if (!title.trim()) return setError('Mavzuni kiriting')
    if (!body.trim()) return setError('Xabar matnini yozing')
    const res = sendMessage({ toUserId, title, body, draftId })
    if (!res?.ok) return setError(res?.error || 'Yuborilmadi')
    onSent?.()
  }

  const save = () => {
    saveDraft({ toUserId, toName: selectedName, title, body, draftId })
    setNotice('Qoralama saqlandi')
    onSaved?.()
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Qabul qiluvchi">
          <Select
            value={toUserId}
            onChange={setToUserId}
            placeholder="Qabul qiluvchini tanlang"
            options={options.map((o) => ({ value: o.id, label: o.name }))}
          />
        </Field>
        <Field label="Mavzu">
          <input className={hemisField} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Xabar mavzusi" />
        </Field>
      </div>
      <Field label="Xabar">
        <textarea
          className={cn(hemisField, 'min-h-[180px] resize-y')}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Xabar matnini yozing..."
        />
      </Field>
      {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
      {notice && <p className="text-sm font-medium text-emerald-600">{notice}</p>}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-[#2f80ed] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_16px_rgba(47,128,237,0.25)] transition hover:bg-[#256fe0]"
        >
          <Send size={15} strokeWidth={2.4} />
          Yuborish
        </button>
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-[#5c6573] transition hover:bg-slate-50"
        >
          <FileText size={15} />
          Qoralama saqlash
        </button>
      </div>
    </form>
  )
}

function MessageDetail({ item, folder, onBack, onEditDraft }) {
  const moveNotif = useStore((s) => s.moveNotif)
  const removeNotif = useStore((s) => s.removeNotif)
  const when = new Date(item.createdAt).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#2f80ed]"
      >
        <ChevronLeft size={16} />
        Orqaga
      </button>
      <div className="rounded-[16px] bg-[#f7f9fc] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-[#2f80ed]">{partyName(item, folder)}</p>
            <h2 className="mt-1 text-[18px] font-bold leading-snug text-[#2b3340]">{item.title}</h2>
          </div>
          <p className="flex items-center gap-1 text-[12px] text-[#9aa3b2]">
            <Clock size={13} />
            {when}
          </p>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-[14px] leading-7 text-[#4b5563]">{item.body}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {folder === 'draft' && (
            <button
              type="button"
              onClick={() => onEditDraft(item)}
              className="rounded-full bg-[#2f80ed] px-4 py-2 text-[12px] font-semibold text-white"
            >
              Tahrirlash
            </button>
          )}
          {folder === 'deleted' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  moveNotif(item.id, item.prevFolder || 'inbox')
                  onBack()
                }}
                className="rounded-full bg-[#2f80ed] px-4 py-2 text-[12px] font-semibold text-white"
              >
                Qayta tiklash
              </button>
              <button
                type="button"
                onClick={() => {
                  removeNotif(item.id)
                  onBack()
                }}
                className="rounded-full bg-rose-50 px-4 py-2 text-[12px] font-semibold text-rose-600"
              >
                Butunlay o‘chirish
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                moveNotif(item.id, 'deleted')
                onBack()
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-2 text-[12px] font-semibold text-rose-600"
            >
              <Trash2 size={14} />
              O‘chirish
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Notifications() {
  const navigate = useNavigate()
  const me = useCurrentUser()
  const users = useStore((s) => s.users)
  const notifications = useStore((s) => s.notifications)
  const markNotifRead = useStore((s) => s.markNotifRead)
  const student = me?.role === 'student'

  const [tab, setTab] = useState('inbox')
  const [folder, setFolder] = useState('inbox')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [editingDraft, setEditingDraft] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 2500)
    return () => clearTimeout(timer)
  }, [notice])

  const mine = useMemo(() => notifications.filter((n) => n.userId === me.id), [notifications, me.id])
  const unreadInbox = mine.filter((n) => (n.folder || 'inbox') === 'inbox' && !n.read).length

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return mine
      .filter((n) => (n.folder || 'inbox') === folder)
      .filter((n) => {
        if (!q) return true
        return [n.title, n.body, n.from, n.toName].some((v) => String(v || '').toLowerCase().includes(q))
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [mine, folder, query])

  const selected = list.find((n) => n.id === selectedId) || mine.find((n) => n.id === selectedId) || null

  const openItem = (item) => {
    if (folder === 'draft' || item.folder === 'draft') {
      setEditingDraft(item)
      setTab('compose')
      setSelectedId(null)
      return
    }
    if (!item.read) markNotifRead(item.id)
    setSelectedId(item.id)
  }

  const body = (
    <>
      <div className="no-scrollbar mb-5 flex gap-5 overflow-x-auto overflow-y-hidden border-b border-slate-100" role="tablist">
        {[
          { id: 'inbox', label: 'Mening xabarlarim' },
          { id: 'compose', label: 'Xabar yaratish' },
        ].map((item) => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTab(item.id)
                setSelectedId(null)
                if (item.id === 'compose') setEditingDraft(null)
              }}
              className={cn(
                'shrink-0 border-b-2 pb-2.5 text-[14px] font-semibold whitespace-nowrap transition',
                active ? 'border-[#2f80ed] text-[#2f80ed]' : 'border-transparent text-[#9aa3b2] hover:text-[#5b6472]',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {tab === 'compose' ? (
        <div className="rounded-[20px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6">
          {notice && <p className="mb-4 text-sm font-medium text-emerald-600">{notice}</p>}
          <ComposeForm
            key={editingDraft?.id || 'new'}
            me={me}
            users={users}
            draft={editingDraft}
            onSent={() => {
              setEditingDraft(null)
              setTab('inbox')
              setFolder('sent')
              setNotice('Xabar yuborildi')
            }}
            onSaved={() => {
              setEditingDraft(null)
              setTab('inbox')
              setFolder('draft')
            }}
          />
        </div>
      ) : (
        <div className="rounded-[18px] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-5">
          {selected ? (
            <MessageDetail
              item={selected}
              folder={selected.folder || folder}
              onBack={() => setSelectedId(null)}
              onEditDraft={(item) => {
                setEditingDraft(item)
                setTab('compose')
                setSelectedId(null)
              }}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto rounded-full bg-[#eef1f6] p-1">
                  {FOLDERS.map((item) => {
                    const Icon = item.icon
                    const active = folder === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setFolder(item.id)
                          setNotice('')
                        }}
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition',
                          active ? 'bg-white text-[#2b3340] shadow-sm' : 'text-[#6b7280] hover:text-[#2b3340]',
                        )}
                      >
                        <Icon size={14} strokeWidth={2} />
                        {item.label}
                        {item.id === 'inbox' && unreadInbox > 0 && (
                          <span className="ml-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#f43f5e] px-1 text-[10px] font-bold text-white">
                            {unreadInbox}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <form
                  className="flex w-full max-w-[260px] shrink-0 items-center gap-2 sm:ml-auto"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Qidirish"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] outline-none placeholder:text-[#9aa3b2] focus:border-[#2f80ed]"
                  />
                  <button
                    type="submit"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#2f80ed] text-white transition hover:bg-[#256fe0]"
                    aria-label="Qidirish"
                  >
                    <Search size={16} />
                  </button>
                </form>
              </div>

              {notice && (
                <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">{notice}</p>
              )}

              {list.length ? (
                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                  {list.map((item) => (
                    <MessageCard key={item.id} item={item} folder={folder} onClick={() => openItem(item)} />
                  ))}
                </div>
              ) : (
                <EmptyInbox title={query ? 'Qidiruv bo‘yicha xabar topilmadi' : 'Xabarlar topilmadi'} />
              )}
            </>
          )}
        </div>
      )}
    </>
  )

  return (
    <div className="pb-8">
      {student ? (
        <>
          <p className="page-crumb">
            Asosiy <span className="mx-1">/</span> Dashboard <span className="mx-1">/</span> Xabarlar
          </p>
          <h1 className="page-title">Xabarlar</h1>
        </>
      ) : (
        <h1 className="page-title mt-0">Xabarlar</h1>
      )}
      <div className="mt-5">{body}</div>
    </div>
  )
}

export function More() {
  const navigate = useNavigate()
  const me = useCurrentUser()
  const logout = useStore((s) => s.logout)
  const student = me.role === 'student'

  const items = [
    { to: '/attendance', label: 'Davomat', icon: ClipboardList },
    { to: '/schedule', label: 'Dars jadvali', icon: CalendarDays },
    { to: '/subjects', label: 'Fanlar', icon: BookOpen },
    { to: '/education-params', label: 'O‘quv parametrlari', icon: GraduationCap },
    { to: '/courses', label: 'Kurslar', icon: GraduationCap },
    { to: '/exams', label: 'Imtihonlar', icon: ClipboardList },
    { to: '/surveys', label: 'So‘rovnomalar', icon: Inbox },
    { to: '/assignments', label: 'Topshiriqlar', icon: FileText },
    { to: '/library', label: 'Elektron kutubxona', icon: Library },
    { to: '/documents', label: 'Hujjatlar', icon: Folder },
    student ? { to: '/payments', label: 'Moliyaviy to‘lov', icon: Wallet } : null,
    { to: '/announcements', label: 'Yangiliklar', icon: Megaphone },
    { to: '/vacancies', label: 'Vakansiyalar', icon: Briefcase },
    { to: '/blog', label: 'Blog', icon: Newspaper },
    me.role !== 'teacher' ? { to: '/complaints', label: 'Shikoyatlar', icon: MessageSquareWarning } : null,
    { to: '/support', label: 'Support', icon: LifeBuoy },
    { to: '/notifications', label: 'Xabarlar', icon: Bell },
    { to: '/settings', label: 'Sozlamalar', icon: Settings },
    me.role === 'super_admin' ? { to: '/users', label: 'Foydalanuvchilar', icon: Users } : null,
    me.role === 'super_admin' ? { to: '/teachers', label: 'O‘qituvchilar', icon: GraduationCap } : null,
    me.role === 'teacher' || me.role === 'super_admin' ? { to: '/students', label: 'Talabalar', icon: Users } : null,
    me.role === 'super_admin' ? { to: '/groups', label: 'Guruhlar', icon: Shield } : null,
    me.role === 'super_admin' ? { to: '/reports', label: 'Hisobotlar', icon: BookOpen } : null,
  ].filter(Boolean)

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="page-crumb">Asosiy / Barchasi</p>
          <h1 className="page-title">Barchasi</h1>
        </div>
        <button
          type="button"
          className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Chiqish
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((it) => (
          <MenuCard key={it.to + it.label} label={it.label} icon={it.icon} onClick={() => navigate(it.to)} />
        ))}
      </div>
    </div>
  )
}
