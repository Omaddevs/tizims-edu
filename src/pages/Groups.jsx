import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Field, inputClass, PrimaryBtn } from '../components/ui'

export default function Groups() {
  const groups = useStore((s) => s.groups)
  const users = useStore((s) => s.users)
  const addGroup = useStore((s) => s.addGroup)
  const [form, setForm] = useState({ name: '', faculty: '', course: 1 })

  return (
    <div className="space-y-4">
      <form
        className="card grid gap-3 p-4 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault()
          addGroup(form)
          setForm({ name: '', faculty: '', course: 1 })
        }}
      >
        <Field label="Guruh">
          <input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Fakultet">
          <input className={inputClass} required value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} />
        </Field>
        <Field label="Kurs">
          <input className={inputClass} type="number" min={1} max={6} value={form.course} onChange={(e) => setForm({ ...form, course: Number(e.target.value) })} />
        </Field>
        <PrimaryBtn className="self-end" type="submit">
          Qo‘shish
        </PrimaryBtn>
      </form>
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((g) => {
          const n = users.filter((u) => u.groupId === g.id).length
          return (
            <article key={g.id} className="card p-4">
              <h3 className="text-lg font-bold">{g.name}</h3>
              <p className="text-sm text-muted">
                {g.faculty} · {g.course}-kurs · {n} talaba
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
