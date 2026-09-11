import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hash, Mail, Pencil, Phone } from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { Field, inputClass, PrimaryBtn, Select, cn } from '../components/ui'
import { ROLE_LABEL, fileToDataUrl, initials } from '../lib/utils'
import { formatDateUz, profileOf } from '../lib/profile'
import { useTheme } from '../lib/ThemeContext'

const TABS = [
  { id: 'profile', label: 'Profil' },
  { id: 'personal', label: 'Shaxsiy ma’lumotlar' },
  { id: 'system', label: 'Tizim sozlamalari' },
]

const LANGS = [
  { id: 'uz', label: 'O‘zbekcha' },
  { id: 'ru', label: 'Русский' },
  { id: 'en', label: 'English' },
]

function PhotoDisk({ me, photo, className }) {
  return (
    <div className={cn('grid shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-[#eef1f6] bg-[#f7f9fc]', className)}>
      {photo ? (
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <span
          className="grid h-full w-full place-items-center text-2xl font-semibold text-white"
          style={{ background: me?.avatarColor || '#147a36' }}
        >
          {initials(me?.name)}
        </span>
      )}
    </div>
  )
}

function ProfileCard({ me, profile, onEdit }) {
  const student = me?.role === 'student'
  return (
    <article className="rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <PhotoDisk me={me} photo={profile.photo} className="h-[92px] w-[92px]" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h2 className="text-[17px] font-bold uppercase leading-snug tracking-wide text-[#2b3340]">
              {profile.officialName}
            </h2>
            {student && profile.course ? (
              <span className="inline-flex items-center rounded-full bg-[#e7f8ee] px-2.5 py-[3px] text-[12px] font-semibold text-[#22a45a]">
                {profile.course}-kurs
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[#e7f8ee] px-2.5 py-[3px] text-[12px] font-semibold text-[#22a45a]">
                {ROLE_LABEL[me?.role] || me?.role}
              </span>
            )}
            {student && profile.groupName ? (
              <span className="inline-flex items-center rounded-full bg-[#2f80ed] px-2.5 py-[3px] text-[12px] font-semibold text-white">
                {profile.groupName}
              </span>
            ) : me?.subject ? (
              <span className="inline-flex items-center rounded-full bg-[#2f80ed] px-2.5 py-[3px] text-[12px] font-semibold text-white">
                {me.subject}
              </span>
            ) : null}
          </div>

          <p className="mt-1.5 text-[13.5px] text-[#5b6472]">{profile.university}</p>
          <p className="text-[13.5px] text-[#5b6472]">{student ? profile.faculty : ROLE_LABEL[me?.role]}</p>
          {student && <p className="text-[13px] italic text-[#8b93a1]">{profile.specialty}</p>}

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-[#8b93a1]">
            {student && (
              <span className="inline-flex items-center gap-1.5">
                <Hash size={13} strokeWidth={2.2} />
                Talaba ID: <span className="font-medium text-[#5b6472]">{profile.studentId}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              JSHSHIR: <span className="font-medium text-[#5b6472]">{profile.pinfl}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} strokeWidth={2.2} />
              Telefon raqami: <span className="font-medium text-[#5b6472]">{me?.phone}</span>
            </span>
          </div>

          <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-[#2f80ed]">
            <Mail size={14} strokeWidth={2.2} />
            Email: {me?.email}
          </p>

          <div className="mt-4">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#f3b4c0] px-3.5 py-1.5 text-[13px] font-semibold text-[#e45d7a] transition hover:bg-[#fff5f7]"
            >
              <Pencil size={13} strokeWidth={2.2} />
              Tahrirlash
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 border-b border-[#f3f5f8] py-3 last:border-0 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <dt className="text-[13px] text-[#8b93a1]">{label}</dt>
      <dd className="text-[13.5px] font-medium text-[#2b3340]">{value || '—'}</dd>
    </div>
  )
}

function InfoCard({ title, children }) {
  return (
    <section className="rounded-[16px] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <h3 className="mb-1 text-[15px] font-semibold text-[#2b3340]">{title}</h3>
      <dl>{children}</dl>
    </section>
  )
}

function PersonalTab({ me, profile, editing, setEditing, onSaved }) {
  const upsertUser = useStore((s) => s.upsertUser)
  const [form, setForm] = useState(() => ({
    lastName: profile.lastName,
    firstName: profile.firstName,
    middleName: profile.middleName,
    birthDate: profile.birthDate,
    gender: profile.gender,
    nationality: profile.nationality,
    citizenship: profile.citizenship,
    passport: profile.passport,
    address: profile.address,
    region: profile.region,
    district: profile.district,
    phone: me?.phone || '',
    email: me?.email || '',
    photo: profile.photo,
  }))
  const [note, setNote] = useState('')

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const save = (e) => {
    e.preventDefault()
    const name = `${form.firstName} ${form.lastName}`.trim()
    upsertUser({
      ...me,
      name: name || me.name,
      phone: form.phone,
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName,
      birthDate: form.birthDate,
      gender: form.gender,
      nationality: form.nationality,
      citizenship: form.citizenship,
      passport: form.passport,
      address: form.address,
      region: form.region,
      district: form.district,
      photo: form.photo,
      pinfl: profile.pinfl,
    })
    setNote('Ma’lumotlar saqlandi')
    setEditing(false)
    onSaved?.()
  }

  if (!editing) {
    return (
      <div className="space-y-4">
        <InfoCard title="Asosiy ma’lumotlar">
          <InfoRow label="Familiya" value={profile.lastName} />
          <InfoRow label="Ism" value={profile.firstName} />
          <InfoRow label="Otasining ismi" value={profile.middleName} />
          <InfoRow label="Tug‘ilgan sana" value={formatDateUz(profile.birthDate)} />
          <InfoRow label="Jinsi" value={profile.genderLabel} />
          <InfoRow label="Millati" value={profile.nationality} />
          <InfoRow label="Fuqaroligi" value={profile.citizenship} />
        </InfoCard>
        <InfoCard title="Passport ma’lumotlari">
          <InfoRow label="JSHSHIR" value={profile.pinfl} />
          <InfoRow label="Passport seriya va raqami" value={profile.passport} />
          {me?.role === 'student' && <InfoRow label="Talaba ID" value={profile.studentId} />}
        </InfoCard>
        <InfoCard title="Aloqa va manzil">
          <InfoRow label="Viloyat" value={profile.region} />
          <InfoRow label="Tuman" value={profile.district} />
          <InfoRow label="Manzil" value={profile.address} />
          <InfoRow label="Telefon raqami" value={me?.phone} />
          <InfoRow label="Email" value={me?.email} />
        </InfoCard>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#f3b4c0] px-3.5 py-1.5 text-[13px] font-semibold text-[#e45d7a] transition hover:bg-[#fff5f7]"
        >
          <Pencil size={13} strokeWidth={2.2} />
          Tahrirlash
        </button>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex items-center gap-4">
          <PhotoDisk me={me} photo={form.photo} className="h-[72px] w-[72px] text-xl" />
          <label className="cursor-pointer text-[13px] font-semibold text-[#2f80ed]">
            Rasm yuklash
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                set('photo', await fileToDataUrl(file))
              }}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Familiya">
            <input className={inputClass} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </Field>
          <Field label="Ism">
            <input className={inputClass} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </Field>
          <Field label="Otasining ismi">
            <input className={inputClass} value={form.middleName} onChange={(e) => set('middleName', e.target.value)} />
          </Field>
          <Field label="Tug‘ilgan sana">
            <input type="date" className={inputClass} value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
          </Field>
          <Field label="Jinsi">
            <Select
              value={form.gender}
              onChange={(gender) => set('gender', gender)}
              options={[
                { value: 'male', label: 'Erkak' },
                { value: 'female', label: 'Ayol' },
              ]}
            />
          </Field>
          <Field label="Millati">
            <input className={inputClass} value={form.nationality} onChange={(e) => set('nationality', e.target.value)} />
          </Field>
          <Field label="Fuqaroligi">
            <input className={inputClass} value={form.citizenship} onChange={(e) => set('citizenship', e.target.value)} />
          </Field>
          <Field label="Passport">
            <input className={inputClass} value={form.passport} onChange={(e) => set('passport', e.target.value)} />
          </Field>
          <Field label="Viloyat">
            <input className={inputClass} value={form.region} onChange={(e) => set('region', e.target.value)} />
          </Field>
          <Field label="Tuman">
            <input className={inputClass} value={form.district} onChange={(e) => set('district', e.target.value)} />
          </Field>
          <Field label="Manzil">
            <input className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} />
          </Field>
          <Field label="Telefon">
            <input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
        </div>
      </section>
      {note && <p className="text-[13px] font-medium text-emerald-600">{note}</p>}
      <div className="flex flex-wrap gap-2">
        <PrimaryBtn type="submit">Saqlash</PrimaryBtn>
        <button
          type="button"
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
          onClick={() => setEditing(false)}
        >
          Bekor qilish
        </button>
      </div>
    </form>
  )
}

function SystemTab() {
  const me = useCurrentUser()
  const upsertUser = useStore((s) => s.upsertUser)
  const resetDemo = useStore((s) => s.resetDemo)
  const logout = useStore((s) => s.logout)
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const [lang, setLang] = useState(() => localStorage.getItem('tizimsedu-lang') || 'uz')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const saveLang = (id) => {
    setLang(id)
    localStorage.setItem('tizimsedu-lang', id)
  }

  const changePassword = (e) => {
    e.preventDefault()
    setError('')
    setOk('')
    if (current !== me.password) {
      setError('Joriy parol noto‘g‘ri')
      return
    }
    if (next.length < 6) {
      setError('Yangi parol kamida 6 belgidan iborat bo‘lsin')
      return
    }
    if (next !== confirmPass) {
      setError('Parol tasdiqi mos kelmadi')
      return
    }
    upsertUser({ ...me, password: next })
    setCurrent('')
    setNext('')
    setConfirmPass('')
    setOk('Parol yangilandi')
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <h3 className="text-[15px] font-semibold text-[#2b3340]">Ko‘rinish</h3>
        <p className="mt-1 text-[13px] text-[#8b93a1]">Light va dark rejim barcha qurilmalarda saqlanadi</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => dark && toggle()}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition',
              !dark ? 'bg-[#2f80ed] text-white' : 'bg-[#f3f5f8] text-[#5b6472] hover:bg-[#e8ecf2]',
            )}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => !dark && toggle()}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition',
              dark ? 'bg-[#2f80ed] text-white' : 'bg-[#f3f5f8] text-[#5b6472] hover:bg-[#e8ecf2]',
            )}
          >
            Dark
          </button>
        </div>
      </section>

      <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <h3 className="text-[15px] font-semibold text-[#2b3340]">Interfeys tili</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => saveLang(item.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition',
                lang === item.id ? 'bg-[#2f80ed] text-white' : 'bg-[#f3f5f8] text-[#5b6472] hover:bg-[#e8ecf2]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <form
        className="space-y-3 rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        onSubmit={changePassword}
      >
        <h3 className="text-[15px] font-semibold text-[#2b3340]">Parolni o‘zgartirish</h3>
        <Field label="Joriy parol">
          <input type="password" className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label="Yangi parol">
          <input type="password" className={inputClass} value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Yangi parolni tasdiqlang">
          <input type="password" className={inputClass} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
        </Field>
        {error && <p className="text-[13px] font-medium text-rose-600">{error}</p>}
        {ok && <p className="text-[13px] font-medium text-emerald-600">{ok}</p>}
        <PrimaryBtn type="submit">Parolni saqlash</PrimaryBtn>
      </form>

      <button
        className="w-full rounded-2xl border border-rose-200 py-3 text-sm font-semibold text-rose-700"
        onClick={() => {
          resetDemo()
          logout()
          navigate('/login')
        }}
      >
        Demo ma’lumotlarni tiklash
      </button>
    </div>
  )
}

function SettingsTabs({ tab, setTab }) {
  return (
    <div className="mb-5 flex gap-5 overflow-x-auto border-b border-[#eef1f6] scrollbar-thin">
      {TABS.map((item) => {
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'shrink-0 border-b-2 pb-2.5 text-[14px] font-semibold transition',
              active ? 'border-[#2f80ed] text-[#2f80ed]' : 'border-transparent text-[#9aa3b2] hover:text-[#5b6472]',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function SettingsBody({ tab, setTab, me, profile, editing, setEditing }) {
  return (
    <>
      <SettingsTabs tab={tab} setTab={setTab} />
      {tab === 'profile' && (
        <ProfileCard
          me={me}
          profile={profile}
          onEdit={() => {
            setTab('personal')
            setEditing(true)
          }}
        />
      )}
      {tab === 'personal' && (
        <PersonalTab
          key={`${me?.id}-${editing}`}
          me={me}
          profile={profile}
          editing={editing}
          setEditing={setEditing}
          onSaved={() => setTab('profile')}
        />
      )}
      {tab === 'system' && <SystemTab />}
    </>
  )
}

export default function Settings() {
  const me = useCurrentUser()
  const navigate = useNavigate()
  const groups = useStore((s) => s.groups)
  const [tab, setTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const student = me?.role === 'student'
  const group = useMemo(() => {
    if (me?.role === 'student') return groups.find((g) => g.id === me.groupId)
    if (me?.role === 'teacher') return groups.find((g) => me.groupIds?.includes(g.id))
    return undefined
  }, [groups, me])
  const profile = useMemo(() => profileOf(me, group), [me, group])

  const changeTab = (id) => {
    setTab(id)
    if (id !== 'personal') setEditing(false)
  }

  return (
    <div className="pb-8">
      {student ? (
        <>
          <p className="page-crumb">
            Asosiy <span className="mx-1">/</span> Dashboard <span className="mx-1">/</span> Sozlamalar
          </p>
          <h1 className="page-title">Sozlamalar</h1>
        </>
      ) : (
        <h1 className="page-title mt-0">Sozlamalar</h1>
      )}
      <div className="mt-5">
        <SettingsBody tab={tab} setTab={changeTab} me={me} profile={profile} editing={editing} setEditing={setEditing} />
      </div>
    </div>
  )
}
