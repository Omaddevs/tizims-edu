import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from './Login'
import { useStore } from '../store/useStore'
import { Select } from '../components/ui'

export default function Register() {
  const register = useStore((s) => s.register)
  const groups = useStore((s) => s.groups)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+998 ',
    password: '',
    role: 'student',
    groupId: groups[0]?.id || '',
  })
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const field = 'w-full rounded-[16px] bg-brand-50 px-4 py-3.5 text-[16px] outline-none'

  const onSubmit = (e) => {
    e.preventDefault()
    if (!/^\+?998\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
      setError('Telefon raqam +998 XX XXX XX XX formatida bo‘lsin')
      return
    }
    const res = register(form)
    if (!res.ok) setError(res.error)
    else navigate('/')
  }

  return (
    <AuthShell>
      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-brand-700">tizimsEdu</h1>
      <p className="mt-1 text-center text-[13px] font-medium text-brand-600">Ro‘yxatdan o‘ting — talaba ID avtomatik beriladi</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input className={field} placeholder="F.I.Sh." value={form.name} onChange={(e) => set('name', e.target.value)} required />
        <input className={field} placeholder="Telefon" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
        <input className={field} type="email" placeholder="Email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        <input
          className={field}
          type="password"
          placeholder="Parol"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          minLength={6}
          required
        />
        <Select
          variant="soft"
          value={form.role}
          onChange={(role) => set('role', role)}
          options={[
            { value: 'student', label: 'Talaba' },
            { value: 'teacher', label: 'O‘qituvchi' },
          ]}
        />
        {form.role === 'student' && (
          <Select
            variant="soft"
            value={form.groupId}
            onChange={(groupId) => set('groupId', groupId)}
            options={groups.map((g) => ({ value: g.id, label: `${g.name} · ${g.faculty}` }))}
          />
        )}
        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-center text-sm text-rose-700">{error}</p>}
        <button type="submit" className="w-full rounded-[16px] bg-brand-700 py-3.5 text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(20,122,54,0.35)]">
          Hisob yaratish
        </button>
      </form>
      <p className="mt-4 text-center text-[13px] text-muted">
        Allaqachon hisobingiz bormi?{' '}
        <Link to="/login" className="font-semibold text-brand-700">
          Kirish
        </Link>
      </p>
    </AuthShell>
  )
}
