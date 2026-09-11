import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Hash, Lock } from 'lucide-react'
import { useStore } from '../store/useStore'

const REMEMBER_KEY = 'tizimsedu-remember-id'

const t = {
  brand: 'tizimsEdu',
  hint: 'Talaba id raqami va parolingizni kiriting!',
  id: 'Talaba ID',
  password: 'Parol',
  remember: 'Eslab qolish',
  forgot: 'Parolni unutdingizmi?',
  enter: 'Kirish',
  noAccount: 'Hisob yo‘qmi?',
  register: 'Ro‘yxatdan o‘tish',
  forgotTitle: 'Parolni tiklash',
  forgotBody: 'Parolni tiklash uchun o‘quv bo‘limi yoki Support orqali murojaat qiling. Demo parollar: Student123!, Teacher123!, Admin123!',
  close: 'Yopish',
  demo: 'Demo',
  student: 'Talaba',
  teacher: 'O‘qituvchi',
  admin: 'Admin',
}

export default function Login() {
  const login = useStore((s) => s.login)
  const navigate = useNavigate()
  const [identity, setIdentity] = useState(() => localStorage.getItem(REMEMBER_KEY) || 'STU-2026-0001')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBER_KEY)))
  const [error, setError] = useState('')
  const [forgot, setForgot] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    const res = login(identity, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    if (remember) localStorage.setItem(REMEMBER_KEY, identity.trim())
    else localStorage.removeItem(REMEMBER_KEY)
    navigate('/')
  }

  const fill = (id, p) => {
    setIdentity(id)
    setPassword(p)
    setError('')
  }

  return (
    <AuthShell>
      <h1 className="text-center text-[28px] font-extrabold tracking-tight text-brand-700">{t.brand}</h1>
      <p className="mt-1 text-center text-[13px] font-medium text-brand-600">{t.hint}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
        <label className="flex items-center gap-3 rounded-[16px] bg-brand-50 px-4 py-3.5">
          <Hash size={18} className="shrink-0 text-[#7a9a82]" strokeWidth={2.2} />
          <input
            className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-[#8aaa90]"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            autoComplete="username"
            required
            placeholder={t.id}
            aria-label={t.id}
          />
        </label>
        <label className="flex items-center gap-3 rounded-[16px] bg-brand-50 px-4 py-3.5">
          <Lock size={18} className="shrink-0 text-[#7a9a82]" strokeWidth={2.2} />
          <input
            className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-[#8aaa90]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder={t.password}
            aria-label={t.password}
          />
          <button type="button" onClick={() => setShowPass((v) => !v)} className="shrink-0 text-[#7a9a82]" aria-label={t.password}>
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </label>

        <div className="flex items-center justify-between px-0.5 pt-1">
          <label className="flex items-center gap-2 text-[13px] font-medium text-[#3d6a4a]">
            <span className={`grid h-[18px] w-[18px] place-items-center rounded-[5px] border ${remember ? 'border-brand-700 bg-brand-700' : 'border-[#c5ddd0] bg-white'}`}>
              {remember && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden>
                  <path d="M1.5 4.5L4.2 7.2L9.5 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <input type="checkbox" className="sr-only" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            {t.remember}
          </label>
          <button type="button" onClick={() => setForgot(true)} className="text-[13px] font-medium text-brand-600">
            {t.forgot}
          </button>
        </div>

        {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-center text-sm text-rose-700">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-[16px] bg-brand-700 py-3.5 text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(20,122,54,0.35)]"
        >
          {t.enter}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] text-muted">
        {t.noAccount}{' '}
        <Link to="/register" className="font-semibold text-brand-700">
          {t.register}
        </Link>
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className="w-full text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t.demo}</span>
        <DemoChip onClick={() => fill('STU-2026-0001', 'Student123!')} label={t.student} />
        <DemoChip onClick={() => fill('teacher@tizimsedu.uz', 'Teacher123!')} label={t.teacher} />
        <DemoChip onClick={() => fill('admin@tizimsedu.uz', 'Admin123!')} label={t.admin} />
      </div>

      {forgot && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-6">
          <div className="w-full max-w-sm rounded-[22px] bg-white p-5 shadow-xl">
            <p className="text-lg font-bold">{t.forgotTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.forgotBody}</p>
            <button type="button" onClick={() => setForgot(false)} className="mt-4 w-full rounded-[14px] bg-brand-700 py-3 font-semibold text-white">
              {t.close}
            </button>
          </div>
        </div>
      )}
    </AuthShell>
  )
}

function DemoChip({ onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-semibold text-brand-700">
      {label}
    </button>
  )
}

export function AuthShell({ children }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#eef6f0] lg:grid lg:grid-cols-[1.05fr_minmax(420px,560px)] xl:grid-cols-[1.15fr_minmax(460px,600px)]">
      <div className="absolute inset-x-0 top-0 h-[42vh] bg-[linear-gradient(180deg,#0d5c28_0%,#1a9440_48%,#5dcc78_100%)] lg:static lg:h-auto lg:bg-none">
        <div className="hidden h-full min-h-dvh flex-col justify-center bg-[linear-gradient(160deg,#0d5c28_0%,#1a9440_48%,#5dcc78_100%)] px-12 text-white lg:flex xl:px-20">
          <img src="/logo-white.svg" alt="" className="h-28 w-28 object-contain drop-shadow-[0_8px_18px_rgba(8,40,90,0.25)]" />
          <p className="mt-8 text-4xl font-extrabold tracking-tight xl:text-5xl">tizimsEdu.uz</p>
          <p className="mt-3 max-w-md text-base text-white/80">Talaba, o‘qituvchi va admin kabineti — dars jadvali, davomat, topshiriqlar va kutubxona bir joyda.</p>
        </div>
      </div>
      <div className="absolute -left-[20%] top-[28vh] h-[220px] w-[140%] rounded-[50%] bg-[#eef6f0] lg:hidden" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center px-5 pt-[max(1.1rem,env(safe-area-inset-top))] pb-10 sm:max-w-[520px] lg:max-w-none lg:justify-center lg:px-10 xl:px-16">
        <img
          src="/logo-white.svg"
          alt="tizimsEdu.uz"
          className="relative z-20 mb-5 h-[128px] w-[128px] bg-transparent object-contain drop-shadow-[0_8px_18px_rgba(8,40,90,0.25)] lg:hidden"
        />
        <div className="w-full rounded-[28px] bg-white px-5 py-7 shadow-[0_18px_50px_rgba(16,90,40,0.14)] lg:max-w-md lg:px-8 lg:py-9">
          {children}
        </div>
      </div>
    </div>
  )
}
