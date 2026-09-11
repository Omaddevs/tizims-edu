import { useMemo, useState } from 'react'
import { useCurrentUser, useStore } from '../store/useStore'
import { Avatar, Badge, Field, inputClass, Modal, PrimaryBtn, Select } from '../components/ui'
import { ROLE_LABEL, uid } from '../lib/utils'
import { calcPercentage, percentTone } from '../lib/attendance'

export default function UsersPage({ roleFilter }) {
  const me = useCurrentUser()
  const users = useStore((s) => s.users)
  const groups = useStore((s) => s.groups)
  const attendance = useStore((s) => s.attendance)
  const setUserBlocked = useStore((s) => s.setUserBlocked)
  const upsertUser = useStore((s) => s.upsertUser)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '+998 ', password: 'User123!', role: roleFilter || 'student', groupId: groups[0]?.id, subject: '' })

  const list = useMemo(
    () =>
      users.filter((u) => {
        if (roleFilter && u.role !== roleFilter) return false
        if (me.role === 'teacher' && u.role === 'student' && !me.groupIds?.includes(u.groupId)) return false
        return `${u.name} ${u.email} ${u.studentId || ''}`.toLowerCase().includes(q.toLowerCase())
      }),
    [users, q, roleFilter, me],
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className={inputClass} placeholder="Qidirish" value={q} onChange={(e) => setQ(e.target.value)} />
        {me.role === 'super_admin' && (
          <PrimaryBtn className="shrink-0 py-2" onClick={() => setOpen(true)}>
            Qo‘shish
          </PrimaryBtn>
        )}
      </div>
      <div className="card divide-y divide-slate-100 overflow-hidden">
        {list.map((u) => {
          const group = groups.find((g) => g.id === u.groupId)
          const pct = u.role === 'student' ? calcPercentage(attendance.filter((a) => a.studentId === u.id)) : null
          const tone = pct != null ? percentTone(pct) : null
          return (
            <div key={u.id} className="flex items-center gap-3 p-4">
              <Avatar name={u.name} color={u.avatarColor} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {u.name} {u.blocked && <Badge tone="red">Bloklangan</Badge>}
                </p>
                <p className="text-xs text-muted">
                  {u.studentId || ROLE_LABEL[u.role]} · {u.phone} · {group?.name || u.subject || ''}
                </p>
              </div>
              {tone && <span className={`rounded-full px-2 py-1 text-xs font-bold ${tone.bg} ${tone.text}`}>{pct}%</span>}
              {me.role === 'super_admin' && u.role !== 'super_admin' && (
                <button
                  onClick={() => setUserBlocked(u.id, !u.blocked)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${u.blocked ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                >
                  {u.blocked ? 'Ochish' : 'Bloklash'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <Modal open={open} title="Foydalanuvchi qo‘shish" onClose={() => setOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            upsertUser({ ...form, id: uid('u'), blocked: false, createdAt: new Date().toISOString(), avatarColor: '#0B5D4A', groupIds: form.role === 'teacher' || roleFilter === 'teacher' ? groups.map((g) => g.id) : undefined })
            setOpen(false)
          }}
        >
          <Field label="F.I.Sh.">
            <input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Telefon">
            <input className={inputClass} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Parol">
            <input className={inputClass} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          {!roleFilter && (
            <Field label="Rol">
              <Select
                value={form.role}
                onChange={(role) => setForm({ ...form, role })}
                options={[
                  { value: 'student', label: 'Talaba' },
                  { value: 'teacher', label: 'O‘qituvchi' },
                ]}
              />
            </Field>
          )}
          {(form.role === 'student' || roleFilter === 'student') && (
            <Field label="Guruh">
              <Select
                value={form.groupId}
                onChange={(groupId) => setForm({ ...form, groupId })}
                options={groups.map((g) => ({ value: g.id, label: g.name }))}
              />
            </Field>
          )}
          <PrimaryBtn className="w-full" type="submit">
            Saqlash
          </PrimaryBtn>
        </form>
      </Modal>
    </div>
  )
}
