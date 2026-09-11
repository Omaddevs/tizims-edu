import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageSquareWarning, Plus } from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { Avatar, Badge, Field, inputClass, Modal, PrimaryBtn, Select, Tabs } from '../components/ui'
import { timeAgo } from '../lib/utils'
import { EmptyState, RoleScreen, SoftCard, SoftRow, StatusChip } from '../components/StudentChrome'

const TONE = { new: 'red', review: 'amber', resolved: 'green' }
const LABEL = { new: 'Yangi', review: 'Ko‘rib chiqilmoqda', resolved: 'Hal qilingan' }

export default function Complaints() {
  const me = useCurrentUser()
  const complaints = useStore((s) => s.complaints)
  const users = useStore((s) => s.users)
  const addComplaint = useStore((s) => s.addComplaint)
  const updateComplaint = useStore((s) => s.updateComplaint)
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ teacherId: users.find((u) => u.role === 'teacher')?.id, subject: '', body: '' })
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('review')

  const list = complaints.filter((c) => {
    if (me.role === 'student') return c.studentId === me.id
    if (tab !== 'all' && c.status !== tab) return false
    return true
  })

  const teachers = users.filter((u) => u.role === 'teacher')

  const formModal = (
    <Modal open={open} title="Shikoyat yozish" onClose={() => setOpen(false)}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          addComplaint(form)
          setOpen(false)
        }}
      >
        <Field label="O‘qituvchi">
          <Select
            value={form.teacherId}
            onChange={(teacherId) => setForm({ ...form, teacherId })}
            options={teachers.map((t) => ({ value: t.id, label: t.name }))}
          />
        </Field>
        <Field label="Mavzu">
          <input className={inputClass} required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </Field>
        <Field label="Matn">
          <textarea className={inputClass} rows={4} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </Field>
        <p className="text-xs text-muted">Shikoyat faqat Super Adminga ko‘rinadi.</p>
        <PrimaryBtn className="w-full" type="submit">
          Yuborish
        </PrimaryBtn>
      </form>
    </Modal>
  )

  if (me.role === 'student') {
    return (
      <RoleScreen
        title="Shikoyatlar"
        right={
          <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center text-ink" aria-label="Yangi">
            <Plus size={20} />
          </button>
        }
      >
        <div className="grid gap-2.5 lg:grid-cols-2">
          {list.map((c) => {
            const teacher = users.find((u) => u.id === c.teacherId)
            return (
              <SoftRow
                key={c.id}
                icon={MessageSquareWarning}
                title={c.subject}
                sub={`${teacher?.name} · ${timeAgo(c.createdAt)}`}
                extra={<StatusChip tone={TONE[c.status]}>{LABEL[c.status]}</StatusChip>}
                onClick={() => navigate(`/complaints/${c.id}`)}
              />
            )
          })}
          {!list.length && <EmptyState text="Hali shikoyat yo‘q." />}
        </div>
        {formModal}
      </RoleScreen>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'all', label: 'Barchasi' },
          { id: 'new', label: 'Yangi' },
          { id: 'review', label: 'Ko‘rib chiqilmoqda' },
          { id: 'resolved', label: 'Hal qilingan' },
        ]}
      />
      <div className="space-y-3">
        {list.map((c) => {
          const student = users.find((u) => u.id === c.studentId)
          const teacher = users.find((u) => u.id === c.teacherId)
          return (
            <article key={c.id} className="card p-4">
              <div className="flex items-start gap-3">
                <Avatar name={student?.name} color={student?.avatarColor} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{student?.name}</p>
                    <Badge tone={c.status === 'new' ? 'red' : c.status === 'review' ? 'yellow' : 'green'}>{LABEL[c.status]}</Badge>
                  </div>
                  <p className="text-sm font-medium">{c.subject}</p>
                  <p className="text-sm text-muted">{c.body}</p>
                  <p className="mt-1 text-xs text-muted">
                    {teacher?.name} ustidan · {timeAgo(c.createdAt)}
                  </p>
                  {c.adminNote && <p className="mt-2 rounded-xl bg-brand-50 p-2 text-sm text-brand-900">Admin: {c.adminNote}</p>}
                  <button
                    className="mt-2 text-sm font-semibold text-brand-800"
                    onClick={() => {
                      setEdit(c)
                      setNote(c.adminNote)
                      setStatus(c.status)
                    }}
                  >
                    Holatni yangilash
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <Modal open={!!edit} title="Shikoyat holati" onClose={() => setEdit(null)}>
        <div className="space-y-3">
          <Field label="Holat">
            <Select
              value={status}
              onChange={setStatus}
              options={[
                { value: 'new', label: 'Yangi' },
                { value: 'review', label: 'Ko‘rib chiqilmoqda' },
                { value: 'resolved', label: 'Muammo hal bo‘ldi' },
              ]}
            />
          </Field>
          <Field label="Talabaga izoh">
            <textarea className={inputClass} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Masalan: Muammo hal bo‘ldi..." />
          </Field>
          <PrimaryBtn
            className="w-full"
            onClick={() => {
              updateComplaint(edit.id, { status, adminNote: note })
              setEdit(null)
            }}
          >
            Saqlash va talabaga yuborish
          </PrimaryBtn>
        </div>
      </Modal>
    </div>
  )
}

export function ComplaintDetail() {
  const { id } = useParams()
  const me = useCurrentUser()
  const complaint = useStore((s) => s.complaints.find((c) => c.id === id))
  const users = useStore((s) => s.users)
  if (!complaint || (me.role === 'student' && complaint.studentId !== me.id)) {
    return (
      <RoleScreen title="Shikoyatlar" back="/complaints">
        <EmptyState text="Yozuv topilmadi." />
      </RoleScreen>
    )
  }
  const teacher = users.find((u) => u.id === complaint.teacherId)
  return (
    <RoleScreen title="Shikoyatlar" back="/complaints">
      <SoftCard>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[20px] font-bold leading-snug">{complaint.subject}</h2>
          <StatusChip tone={TONE[complaint.status]}>{LABEL[complaint.status]}</StatusChip>
        </div>
        <p className="mt-2 text-[13px] text-muted">
          {teacher?.name} · {timeAgo(complaint.createdAt)}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{complaint.body}</p>
        {complaint.adminNote && (
          <p className="mt-4 rounded-[14px] bg-brand-50 p-3 text-[14px] text-brand-900">Admin: {complaint.adminNote}</p>
        )}
      </SoftCard>
    </RoleScreen>
  )
}
