import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { Download, Plus, Search } from 'lucide-react'
import { DOCUMENT_FILES } from '../data/catalog'
import { Modal, Select, cn } from '../components/ui'
import { TizimsIdCard } from '../components/IdCard'
import { profileOf } from '../lib/profile'
import { useCurrentUser, useStore } from '../store/useStore'
import emptyAssignmentsPng from '../assets/empty-assignments.png'

const TABS = [
  { id: 'student', label: 'Talaba hujjati' },
  { id: 'refs', label: 'Ma’lumotnomalar' },
  { id: 'idcard', label: 'ID Guvohnomasi' },
  { id: 'orders', label: 'Buyruqlar' },
  { id: 'certs', label: 'Sertifikatlar' },
  { id: 'clearance', label: 'Ajralma varaqa' },
]

const TAB_FROM_CAT = {
  all: 'student',
  housing: 'refs',
  military: 'student',
  contract: 'student',
  orders: 'orders',
  other: 'student',
  certs: 'certs',
  antiplag: 'student',
}

const SPECIALTY = {
  'Axborot texnologiyalari': 'Kompyuter ilmlari va dasturlash texnologiyalari (yo‘nalishlar bo‘yicha)',
  Iqtisodiyot: 'Iqtisodiyot (tarmoqlar va sohalar bo‘yicha)',
}

function academicYear(course) {
  const end = 2023 + Number(course || 1)
  return `${end - 1}-${end}`
}

function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).slice(0, 10).split('-')
  return `${d}.${m}.${y}`
}

function downloadText(title, lines) {
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${title}.txt`
  a.click()
  URL.revokeObjectURL(a.href)
}

function useStudentContext() {
  const me = useCurrentUser()
  const groups = useStore((s) => s.groups)
  const ctx = useOutletContext() || {}
  const group = groups.find((g) => g.id === me?.groupId)
  const course = group?.course || 1
  const semester = String(ctx.semester || Math.min(8, Math.max(1, course * 2 - 1)))
  const digits = String(me?.studentId || me?.id || '0001').replace(/\D/g, '') || '20260001'
  return {
    me,
    group,
    course,
    semester,
    faculty: group?.faculty || 'Fakultet',
    specialty: SPECIALTY[group?.faculty] || group?.faculty || 'Mutaxassislik',
    year: academicYear(course),
    digits,
    blank: (n) => `${digits}${n}`,
  }
}

function HemisTabs({ tab, setTab }) {
  return (
    <div
      className="no-scrollbar mb-5 flex gap-5 overflow-x-auto overflow-y-hidden"
      role="tablist"
      aria-label="Hujjat turlari"
    >
      {TABS.map((item) => {
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setTab(item.id)}
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

function DownloadBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-[#2f80ed] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(47,128,237,0.28)] transition hover:bg-[#256fe0]"
    >
      <Download size={14} strokeWidth={2.4} />
      Yuklab olish
    </button>
  )
}

function DocCard({ title, fields, fileTitle }) {
  const rows = Object.entries(fields)
  return (
    <article className="flex min-h-[168px] flex-col rounded-[16px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <h3 className="text-[16px] font-semibold text-[#2b3340]">{title}</h3>
      <dl className="mt-4 flex-1 space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 text-[13px]">
            <dt className="text-[#8b93a1]">{label}</dt>
            <dd className="max-w-[58%] text-right font-medium leading-snug text-[#2b3340]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex justify-end">
        <DownloadBtn
          onClick={() =>
            downloadText(
              fileTitle || title,
              [title, '', ...rows.map(([k, v]) => `${k}: ${v}`)],
            )
          }
        />
      </div>
    </article>
  )
}

function PrinterEmpty({ text }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative">
        <svg width="92" height="80" viewBox="0 0 92 80" fill="none" aria-hidden>
          <rect x="18" y="28" width="56" height="32" rx="6" fill="#dfe5ee" />
          <rect x="26" y="10" width="40" height="22" rx="4" fill="#edf1f6" />
          <rect x="30" y="16" width="32" height="4" rx="2" fill="#d5dce6" />
          <rect x="30" y="23" width="20" height="4" rx="2" fill="#d5dce6" />
          <rect x="28" y="44" width="36" height="22" rx="3" fill="#f7f9fc" />
          <rect x="32" y="50" width="28" height="3" rx="1.5" fill="#e3e8f0" />
          <rect x="32" y="56" width="18" height="3" rx="1.5" fill="#e3e8f0" />
          <circle cx="68" cy="40" r="3" fill="#c5cedb" />
        </svg>
        <span className="absolute -right-5 -top-3 grid h-8 w-8 place-items-center rounded-2xl bg-[#eef2f7] text-[11px] text-[#b7c0cc] shadow-sm">
          ◦
        </span>
      </div>
      <p className="mt-4 text-[14px] font-medium text-[#8b93a1]">{text}</p>
    </div>
  )
}

function BoxPersonEmpty({ text }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-14 text-center">
      <img src={emptyAssignmentsPng} alt="" className="h-[140px] w-[140px] object-contain" />
      <p className="mt-2 text-[14px] font-medium text-[#8b93a1]">{text}</p>
    </div>
  )
}

function StudentDocs() {
  const { course, semester, year, specialty, blank } = useStudentContext()
  const prev = Number(year.slice(0, 4))
  const cards = [
    {
      title: 'O‘quv varaqa',
      fields: { Kurs: `${course}-kurs`, 'O‘quv yili': `${prev + 1}-${prev + 2}`, Semestr: `${semester}-semestr` },
    },
    {
      title: 'Reyting daftarcha',
      fields: { Mutaxassislik: specialty, Semestr: `${semester}-semestr`, Kurs: `${course}-kurs` },
    },
    {
      title: 'Chaqiruv qog‘ozi',
      fields: { 'Blank qarami': blank('-6'), 'O‘quv yili': `${prev}-${prev + 1}`, 'Qayd sanasi': '16.05.2026' },
    },
    {
      title: 'Chaqiruv qog‘ozi',
      fields: { 'Blank qarami': blank('-5'), 'O‘quv yili': `${prev - 1}-${prev}`, 'Qayd sanasi': '17.12.2025' },
    },
    {
      title: 'Chaqiruv qog‘ozi',
      fields: { 'Blank qarami': blank('-4'), 'O‘quv yili': `${prev - 2}-${prev - 1}`, 'Qayd sanasi': '19.05.2025' },
    },
    {
      title: 'Shaxsiy qaydnoma',
      fields: { 'Qaydnoma raqami': `N°${String(course * 80 + Number(semester)).padStart(3, '0')}`, Semestr: `${semester}-semestr`, Sana: '23.06.2025' },
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {cards.map((card, i) => (
        <DocCard key={`${card.title}-${i}`} {...card} />
      ))}
    </div>
  )
}

function ReferencesTab() {
  const { course, semester, year, me, group } = useStudentContext()
  const [open, setOpen] = useState(false)
  const [purpose, setPurpose] = useState('bank')
  const [rows, setRows] = useState([])

  const addRef = () => {
    const n = rows.length + 1
    setRows((list) => [
      {
        id: `ref-${Date.now()}`,
        number: `ML-${String(n).padStart(3, '0')}`,
        date: formatDate(new Date().toISOString()),
        year,
        course: `${course}-kurs`,
        semester: `${semester}-semestr`,
        title: purpose === 'bank' ? 'Bank uchun ma’lumotnoma' : purpose === 'military' ? 'Harbiy komissariat uchun' : 'Ish joyi uchun ma’lumotnoma',
      },
      ...list,
    ])
    setOpen(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#2f80ed] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_16px_rgba(47,128,237,0.25)] hover:bg-[#256fe0]"
      >
        <Plus size={16} strokeWidth={2.4} />
        Ma’lumotnoma olish
      </button>

      <div className="mt-4 overflow-hidden rounded-[14px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-[#eef1f6] bg-white text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa3b2]">
                <th className="px-5 py-3.5">Hujjat raqami</th>
                <th className="px-5 py-3.5">Hujjat sanasi</th>
                <th className="px-5 py-3.5">O‘quv yili</th>
                <th className="px-5 py-3.5">Kurs</th>
                <th className="px-5 py-3.5">Semestr</th>
                <th className="px-5 py-3.5 text-right">Fayl</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#eef1f6] text-[13px] text-[#2b3340] last:border-0">
                    <td className="px-5 py-3.5 font-medium">{row.number}</td>
                    <td className="px-5 py-3.5 text-[#5c6573]">{row.date}</td>
                    <td className="px-5 py-3.5">{row.year}</td>
                    <td className="px-5 py-3.5">{row.course}</td>
                    <td className="px-5 py-3.5">{row.semester}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        className="inline-grid h-8 w-8 place-items-center rounded-lg text-[#2f80ed] hover:bg-[#e8f1ff]"
                        aria-label="Yuklab olish"
                        onClick={() =>
                          downloadText(row.title, [
                            row.title,
                            `Talaba: ${me?.name}`,
                            `Guruh: ${group?.name || '—'}`,
                            `Raqam: ${row.number}`,
                            `Sana: ${row.date}`,
                          ])
                        }
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <PrinterEmpty text="Ma’lumotnoma topilmadi" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} title="Ma’lumotnoma olish" onClose={() => setOpen(false)}>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Maqsad</span>
          <Select
            value={purpose}
            onChange={setPurpose}
            ariaLabel="Maqsad"
            options={[
              { value: 'bank', label: 'Bank / stipendija' },
              { value: 'work', label: 'Ish joyi' },
              { value: 'military', label: 'Harbiy komissariat' },
            ]}
          />
        </label>
        <button
          type="button"
          onClick={addRef}
          className="mt-4 w-full rounded-full bg-[#2f80ed] py-2.5 text-[14px] font-semibold text-white"
        >
          So‘rov yuborish
        </button>
      </Modal>
    </div>
  )
}

function IdCardTab() {
  const { me, group } = useStudentContext()
  const profile = useMemo(() => profileOf(me, group), [me, group])
  return <TizimsIdCard me={me} profile={profile} />
}

function OrdersTab() {
  const orders = DOCUMENT_FILES.filter((f) => f.cat === 'orders')
  return (
    <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col style={{ width: '18%' }} />
            <col style={{ width: '34%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '14%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[#eef1f6] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa3b2]">
              <th className="px-5 py-3.5">Buyruq raqami</th>
              <th className="px-5 py-3.5">Buyruq nomi</th>
              <th className="px-5 py-3.5">
                <span className="inline-flex items-center gap-1">
                  Buyruq sanasi <Search size={12} className="text-[#c5cad3]" />
                </span>
              </th>
              <th className="px-5 py-3.5">Buyruq turi</th>
              <th className="px-5 py-3.5 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {orders.length ? (
              orders.map((row) => (
                <tr key={row.id} className="border-b border-[#eef1f6] text-[13px] text-[#2b3340] last:border-0">
                  <td className="px-5 py-3.5 font-medium">{row.id.replace('df-', 'BR-').toUpperCase()}</td>
                  <td className="px-5 py-3.5">{row.title}</td>
                  <td className="px-5 py-3.5 text-[#5c6573]">{formatDate(row.date)}</td>
                  <td className="px-5 py-3.5">{row.status}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        className="inline-grid h-8 w-8 place-items-center rounded-lg text-[#2f80ed] hover:bg-[#e8f1ff]"
                        aria-label="Yuklab olish"
                        onClick={() => downloadText(row.title, [row.title, row.date, row.body])}
                      >
                        <Download size={16} />
                      </button>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <PrinterEmpty text="Buyruq topilmadi" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CertsTab() {
  const certs = DOCUMENT_FILES.filter((f) => f.cat === 'certs')
  if (!certs.length) {
    return (
      <div className="rounded-[16px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <BoxPersonEmpty text="Sertifikatlar topilmadi" />
      </div>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {certs.map((c) => (
        <DocCard
          key={c.id}
          title={c.title}
          fields={{ Holat: c.status, Sana: formatDate(c.date), Hajm: c.meta }}
        />
      ))}
    </div>
  )
}

function ClearanceTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-[16px] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[14px] font-semibold text-[#2b3340]">Tasdiqlash jarayoni</p>
          <p className="text-[13px] font-semibold text-[#8b93a1]">0/0</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eef2f7]">
          <span className="block h-full w-0 rounded-full bg-[#22c55e]" />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-[#22c55e]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />0 tasdiqlangan
        </p>
      </div>

      <div className="rounded-[16px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="px-5 pt-4 text-[14px] font-semibold text-[#2b3340]">Bo‘limlar tasdiqlovi</p>
        <BoxPersonEmpty text="Ma’lumot topilmadi" />
      </div>

      <div className="flex items-start gap-3 rounded-[14px] border border-[#f3e0b5] bg-[#fff8e8] px-4 py-3.5 text-[#c27a12]">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[#e8c56a] text-[11px] font-bold">
          !
        </span>
        <div>
          <p className="text-[13px] font-semibold">Hujjat hali tasdiqlanmagan</p>
          <p className="mt-0.5 text-[12px] text-[#c9a15a]">Barcha bo‘limlar tasdiqlashi zarur</p>
        </div>
      </div>
    </div>
  )
}

function DocumentsBody({ tab, setTab }) {
  return (
    <>
      <HemisTabs tab={tab} setTab={setTab} />
      {tab === 'student' && <StudentDocs />}
      {tab === 'refs' && <ReferencesTab />}
      {tab === 'idcard' && <IdCardTab />}
      {tab === 'orders' && <OrdersTab />}
      {tab === 'certs' && <CertsTab />}
      {tab === 'clearance' && <ClearanceTab />}
    </>
  )
}

export default function DocumentsPage() {
  const me = useCurrentUser()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'student'
  const setTab = (id) => {
    const next = new URLSearchParams(params)
    next.set('tab', id)
    setParams(next, { replace: true })
  }
  const student = me?.role === 'student'

  return (
    <div className="pb-8">
      {student ? (
        <>
          <p className="page-crumb">
            Asosiy <span className="mx-1">/</span> Dashboard <span className="mx-1">/</span> Hujjatlar
          </p>
          <h1 className="page-title">Hujjatlar</h1>
        </>
      ) : (
        <h1 className="page-title mt-0">Hujjatlar</h1>
      )}
      <div className="mt-5">
        <DocumentsBody tab={tab} setTab={setTab} />
      </div>
    </div>
  )
}

export function DocumentCategoryPage() {
  const { id } = useParams()
  const tab = TAB_FROM_CAT[id] || 'student'
  return <Navigate to={`/documents?tab=${tab}`} replace />
}

export function DocumentFilePage() {
  return <Navigate to="/documents" replace />
}
