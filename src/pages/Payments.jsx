import { useState } from 'react'
import { cn } from '../components/ui'
import { RoleScreen } from '../components/StudentChrome'
import { useCurrentUser } from '../store/useStore'

const TABS = [
  {
    id: 'contract',
    label: 'Kontrakt to‘lovi',
    title: 'Shartnoma topilmadi',
    hint: 'contract',
  },
  {
    id: 'stipend',
    label: 'Stipendiya',
    title: 'Stipendiya ma’lumoti topilmadi',
    hint: 'none',
  },
  {
    id: 'retake',
    label: 'Qayta o‘qish',
    title: 'Qayta o‘qish to‘lovi topilmadi',
    hint: 'none',
  },
  {
    id: 'rent',
    label: 'Ijara to‘lovlari',
    title: 'Ijara to‘lovi topilmadi',
    hint: 'none',
  },
  {
    id: 'dorm',
    label: 'Turar joy shartnomasi',
    title: 'Turar joy shartnomasi topilmadi',
    hint: 'contract',
  },
]

function ContractHint() {
  return (
    <p className="mx-auto mt-2 max-w-[520px] text-[13px] leading-relaxed text-[#8b93a1]">
      Agar davlat OTM talabasi bo‘lsangiz{' '}
      <a href="https://kontrakt.edu.uz" target="_blank" rel="noreferrer" className="font-medium text-[#2f80ed] hover:underline">
        kontrakt.edu.uz
      </a>
      , nodavlat OTM talabasi bo‘lsangiz{' '}
      <a href="https://shartnoma.edu.uz" target="_blank" rel="noreferrer" className="font-medium text-[#2f80ed] hover:underline">
        shartnoma.edu.uz
      </a>{' '}
      tizimi orqali moliyaviy to‘lovingiz haqida ma’lumot olishingiz mumkin
    </p>
  )
}

function EmptyCard({ tab }) {
  return (
    <div className="rounded-[20px] bg-white px-6 py-14 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:max-w-[640px]">
      <img
        src="/emojis/crying-face.webp"
        alt=""
        width={72}
        height={72}
        className="mx-auto h-[72px] w-[72px]"
        aria-hidden
      />
      <p className="mt-4 text-[15px] font-semibold text-[#2b3340]">{tab.title}</p>
      {tab.hint === 'contract' ? <ContractHint /> : <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-relaxed text-[#8b93a1]">Hozircha bu bo‘limda ko‘rsatiladigan ma’lumot yo‘q.</p>}
    </div>
  )
}

function PaymentTabs({ tab, setTab }) {
  return (
    <div
      className="no-scrollbar mb-5 flex gap-5 overflow-x-auto overflow-y-hidden"
      role="tablist"
      aria-label="Moliyaviy to‘lov bo‘limlari"
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

function PaymentsBody({ tab, setTab, current }) {
  return (
    <>
      <PaymentTabs tab={tab} setTab={setTab} />
      <EmptyCard tab={current} />
    </>
  )
}

export default function Payments() {
  const me = useCurrentUser()
  const [tab, setTab] = useState('contract')
  const current = TABS.find((t) => t.id === tab) || TABS[0]
  const student = me?.role === 'student'

  if (!student) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Moliyaviy to‘lov</h1>
        <PaymentsBody tab={tab} setTab={setTab} current={current} />
      </div>
    )
  }

  return (
    <RoleScreen title="Moliyaviy to‘lov">
      <PaymentsBody tab={tab} setTab={setTab} current={current} />
    </RoleScreen>
  )
}
