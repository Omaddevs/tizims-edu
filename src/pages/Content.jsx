import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye, Plus } from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { Cover, Field, inputClass, Modal, PrimaryBtn } from '../components/ui'
import { fileToDataUrl, timeAgo } from '../lib/utils'
import { EmptyState, RoleScreen, SoftCard } from '../components/StudentChrome'

export function Announcements() {
  return (
    <ContentList
      collection="announcements"
      addKey="addAnnouncement"
      title="Yangiliklar"
      path="/announcements"
      fields={['title', 'body', 'cover']}
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
    />
  )
}

export function Blog() {
  return (
    <ContentList collection="posts" addKey="addPost" title="Blog" path="/blog" fields={['title', 'body', 'cover']} />
  )
}

function ContentList({ collection, addKey, title, path, fields }) {
  const me = useCurrentUser()
  const items = useStore((s) => s[collection])
  const add = useStore((s) => s[addKey])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({})
  const canPost = me.role === 'super_admin'

  return (
    <RoleScreen title={title}>
      <div className="space-y-3">
      {canPost && (
        <PrimaryBtn onClick={() => setOpen(true)}>
          <Plus size={16} /> Yangi {title.slice(0, -2).toLowerCase()}
        </PrimaryBtn>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
      {items.map((item) => (
        <Link key={item.id} to={`${path}/${item.id}`} className="flex gap-3 overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_2px_12px_rgba(16,80,40,0.05)] lg:p-4">
          <div className="h-16 w-16 shrink-0">
            {item.coverData ? (
              <img src={item.coverData} alt="" className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <Cover type={item.cover || 'exam'} title="" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{item.title}</p>
            <p className="truncate text-sm text-muted">{item.body || item.description || item.department}</p>
            <p className="mt-1 text-xs text-muted">
              {timeAgo(item.createdAt)} · <Eye className="inline h-3 w-3" /> {item.views}
            </p>
          </div>
        </Link>
      ))}
      </div>
      {!items.length && <EmptyState />}
      <Modal open={open} title={`${title} qo‘shish`} onClose={() => setOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            add(form)
            setOpen(false)
            setForm({})
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
          <Field label="Muqova">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const coverData = await fileToDataUrl(file)
                setForm((x) => ({ ...x, coverData }))
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

export function ContentDetail({ collection, path }) {
  const { id } = useParams()
  const item = useStore((s) => s[collection].find((x) => x.id === id))
  const bumpViews = useStore((s) => s.bumpViews)
  useEffect(() => {
    if (item) bumpViews(collection, item.id)
  }, [id])
  if (!item) {
    return (
      <RoleScreen title="Ma’lumot" back={path}>
        <EmptyState text="Topilmadi" />
      </RoleScreen>
    )
  }
  return (
    <RoleScreen title={item.title} back={path}>
      <SoftCard className="overflow-hidden p-0">
        <div className="h-48">
          {item.coverData ? <img src={item.coverData} alt="" className="h-48 w-full object-cover" /> : <Cover type={item.cover || 'exam'} title={item.title} />}
        </div>
        <div className="space-y-3 p-5">
          <p className="text-xs text-muted">
            {timeAgo(item.createdAt)} · {item.views} ko‘rish {item.department ? `· ${item.department}` : ''} {item.type ? `· ${item.type}` : ''}
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
