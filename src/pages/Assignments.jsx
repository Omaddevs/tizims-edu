import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClipboardList, Plus } from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { Badge, Field, inputClass, Modal, PrimaryBtn, Select, Tabs } from '../components/ui'
import { EmptyState, RoleScreen, SoftCard, SoftRow, StatusChip } from '../components/StudentChrome'

export default function Assignments() {
  const me = useCurrentUser()
  const assignments = useStore((s) => s.assignments)
  const groups = useStore((s) => s.groups)
  const users = useStore((s) => s.users)
  const addAssignment = useStore((s) => s.addAssignment)
  const submitAssignment = useStore((s) => s.submitAssignment)
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', groupId: groups[0]?.id, deadline: '', fileName: '' })

  const visible = assignments.filter((a) => {
    if (me.role === 'teacher') return a.teacherId === me.id || me.groupIds?.includes(a.groupId)
    if (me.role === 'student') return a.groupId === me.groupId
    return true
  })

  const filtered = visible.filter((a) => {
    if (tab === 'active') return a.status === 'active' && new Date(a.deadline) >= new Date()
    if (tab === 'submit') return a.status === 'active'
    if (tab === 'finished') return a.status === 'finished' || new Date(a.deadline) < new Date()
    return true
  })

  const canCreate = me.role === 'teacher' || me.role === 'super_admin'

  if (me.role === 'student') {
    return (
      <RoleScreen title="Topshiriqlar">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'active', label: 'Faol' },
            { id: 'submit', label: 'Topshirish' },
            { id: 'finished', label: 'Tugagan' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
                tab === t.id ? 'bg-brand-800 text-white' : 'bg-white text-slate-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid gap-2.5 lg:grid-cols-2">
          {filtered.map((a) => {
            const mine = a.submissions.find((s) => s.studentId === me.id)
            const overdue = a.status === 'finished' || new Date(a.deadline) < new Date()
            return (
              <SoftRow
                key={a.id}
                icon={ClipboardList}
                title={a.title}
                sub={`Muddat ${a.deadline}${mine ? ' · Yuborilgan' : ''}`}
                extra={<StatusChip tone={mine ? 'green' : overdue ? 'slate' : 'blue'}>{mine ? 'Yuborildi' : overdue ? 'Tugagan' : 'Faol'}</StatusChip>}
                onClick={() => navigate(`/assignments/${a.id}`)}
              />
            )
          })}
          {!filtered.length && <EmptyState text="Topshiriq yo‘q." />}
        </div>
      </RoleScreen>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'all', label: 'Barchasi' },
            { id: 'active', label: 'Faol' },
            { id: 'submit', label: 'Topshirish' },
            { id: 'finished', label: 'Tugagan' },
          ]}
        />
        {canCreate && (
          <PrimaryBtn className="shrink-0 py-2" onClick={() => setOpen(true)}>
            <Plus size={16} /> Yangi topshiriq
          </PrimaryBtn>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((a) => {
          const group = groups.find((g) => g.id === a.groupId)
          const count = users.filter((u) => u.role === 'student' && u.groupId === a.groupId).length
          return (
            <article key={a.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted">{a.description}</p>
                  <p className="mt-2 text-xs text-muted">
                    {group?.name} · muddat {a.deadline} · {a.submissions.length}/{count} topshirdi
                  </p>
                </div>
                <Badge tone={a.status === 'finished' ? 'slate' : 'green'}>{a.status === 'finished' ? 'Tugagan' : 'Faol'}</Badge>
              </div>
            </article>
          )
        })}
      </div>

      <Modal open={open} title="Yangi topshiriq" onClose={() => setOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            addAssignment(form)
            setOpen(false)
          }}
        >
          <Field label="Sarlavha">
            <input className={inputClass} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Tavsif">
            <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Guruh">
            <Select
              value={form.groupId}
              onChange={(groupId) => setForm({ ...form, groupId })}
              options={groups
                .filter((g) => me.role === 'super_admin' || me.groupIds?.includes(g.id))
                .map((g) => ({ value: g.id, label: g.name }))}
            />
          </Field>
          <Field label="Muddat">
            <input className={inputClass} type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </Field>
          <Field label="Fayl nomi (ixtiyoriy)">
            <input className={inputClass} value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} />
          </Field>
          <PrimaryBtn className="w-full" type="submit">
            Yuklash
          </PrimaryBtn>
        </form>
      </Modal>
    </div>
  )
}

export function AssignmentDetail() {
  const { id } = useParams()
  const me = useCurrentUser()
  const assignment = useStore((s) => s.assignments.find((a) => a.id === id))
  const groups = useStore((s) => s.groups)
  const submitAssignment = useStore((s) => s.submitAssignment)
  if (!assignment) {
    return (
      <RoleScreen title="Topshiriq" back="/assignments">
        <EmptyState text="Topshiriq topilmadi." />
      </RoleScreen>
    )
  }
  const group = groups.find((g) => g.id === assignment.groupId)
  const mine = assignment.submissions.find((s) => s.studentId === me.id)
  const overdue = assignment.status === 'finished' || new Date(assignment.deadline) < new Date()

  return (
    <RoleScreen title="Topshiriq" back="/assignments">
      <SoftCard>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[20px] font-bold leading-snug">{assignment.title}</h2>
          <StatusChip tone={mine ? 'green' : overdue ? 'slate' : 'blue'}>{mine ? 'Yuborildi' : overdue ? 'Tugagan' : 'Faol'}</StatusChip>
        </div>
        <p className="mt-2 text-[13px] text-muted">
          {group?.name} · muddat {assignment.deadline}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{assignment.description}</p>
        {assignment.fileName && <p className="mt-3 text-[13px] font-medium text-brand-800">Ilova: {assignment.fileName}</p>}
        {me.role === 'student' && assignment.status === 'active' && !overdue && (
          <div className="mt-5">
            {mine ? (
              <p className="rounded-[14px] bg-emerald-50 px-3 py-2 text-[14px] font-medium text-emerald-700">Yuborildi: {mine.fileName}</p>
            ) : (
              <label className="flex w-full cursor-pointer items-center justify-center rounded-[16px] bg-brand-800 py-3 text-[16px] font-semibold text-white">
                Fayl yuklash
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) submitAssignment(assignment.id, f.name)
                  }}
                />
              </label>
            )}
          </div>
        )}
      </SoftCard>
    </RoleScreen>
  )
}
