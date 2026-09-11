import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { ArrowUpRight, LifeBuoy, Plus, Volume2 } from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { Field, inputClass, Modal, PrimaryBtn, cn } from '../components/ui'
import { timeAgo } from '../lib/utils'
import { EmptyState, RoleScreen, SoftCard } from '../components/StudentChrome'
import { SupportComposer, TicketMessages } from '../components/SupportChat'

const HELP_LINKS = [
  {
    id: 'group',
    title: 'Telegram guruh',
    href: 'https://t.me/tizimsedu',
    icon: 'telegram-solid',
    text: '«TIZIMSEDU.UZ» sayti bo‘yicha muhokama, savol-javob va takliflar uchun yaratilgan Telegram guruh',
  },
  {
    id: 'channel',
    title: 'Telegram kanal',
    href: 'https://t.me/tizimsedu_news',
    icon: 'telegram-soft',
    text: 'tizimsEdu tizimi bo‘yicha yangiliklar va foydali ma’lumotlar berib boriladigan Telegram kanal',
  },
  {
    id: 'bot',
    title: 'Telegram bot',
    href: 'https://t.me/tizimsedu_bot',
    icon: 'telegram-soft',
    text: '«TIZIMSEDU.UZ» sayti texnik muammolarni bartaraf etish uchun ishlab chiqilgan Telegram bot',
  },
  {
    id: 'youtube',
    title: 'YouTube kanal',
    href: 'https://www.youtube.com/@tizimsedu',
    icon: 'youtube',
    text: 'tizimsEdu tizimi bo‘yicha video darslar va yo‘riqnomalar taqdim etiladigan YouTube kanal',
  },
]

function TelegramGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M9.6 15.52 9.47 19.2c.37 0 .53-.16.73-.35l1.75-1.67 3.63 2.66c.67.37 1.14.18 1.32-.61l2.4-11.27c.21-.96-.35-1.33-1-.1L3.98 10.9c-.93.36-.91.88-.16 1.11l4.16 1.3 9.66-6.08c.46-.28.87-.12.53.16z"
      />
    </svg>
  )
}

function HelpIcon({ type }) {
  if (type === 'telegram-solid') {
    return (
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2AABEE] text-white shadow-[0_6px_14px_rgba(42,171,238,0.28)]">
        <TelegramGlyph className="h-[18px] w-[18px]" />
      </span>
    )
  }
  if (type === 'youtube') {
    return (
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#ffecec]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <rect x="2.5" y="6.2" width="19" height="11.6" rx="3.4" fill="#FF0000" />
          <path d="M10.4 9.35v5.3L15.6 12z" fill="#fff" />
        </svg>
      </span>
    )
  }
  if (type === 'ticket') {
    return (
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f1ff] text-[#2f80ed]">
        <LifeBuoy size={18} strokeWidth={2.1} />
      </span>
    )
  }
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d9f3fc] text-[#2AABEE]">
      <TelegramGlyph className="h-[18px] w-[18px]" />
    </span>
  )
}

function HelpCard({ title, text, href, icon, onClick }) {
  const body = (
    <>
      <div className="flex items-center gap-3">
        <HelpIcon type={icon} />
        <h3 className="text-[15px] font-semibold text-[#2b3340]">{title}</h3>
      </div>
      <p className="mt-3 min-h-[44px] flex-1 text-[13px] leading-relaxed text-[#8b93a1]">{text}</p>
      <span className="mt-4 flex items-center justify-center gap-1.5 border-t border-[#f1f4f8] pt-3 text-[13px] font-medium text-[#9aa3b2] transition group-hover:text-[#2f80ed]">
        <ArrowUpRight size={14} strokeWidth={2.2} />
        Ko‘rish
      </span>
    </>
  )
  const className =
    'group flex min-h-[168px] min-w-0 flex-col rounded-[16px] bg-white p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]'

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {body}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  )
}

function NewsTeaser() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/announcements')}
      className="flex w-[196px] items-start gap-2.5 rounded-[16px] bg-white p-3.5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef3fb] text-[#94a3b8]">
        <Volume2 size={16} strokeWidth={1.8} />
      </span>
      <span>
        <span className="block text-[13px] font-semibold leading-snug text-[#2b3340]">Yangiliklar tez orada</span>
        <span className="mt-1 block text-[11px] leading-snug text-[#9aa3b2]">
          Universitet e’lonlari va yangiliklari shu yerda paydo bo‘ladi
        </span>
      </span>
    </button>
  )
}

function HelpChrome({ title = 'Yordam va yo‘riqnoma', back, right, children, crumb }) {
  const me = useCurrentUser()
  const student = me?.role === 'student'
  const trail = (
    <p className="text-[12px] font-medium text-[#9aa3b2]">
      Asosiy <span className="mx-1 text-[#c5cad3]">/</span> Dashboard <span className="mx-1 text-[#c5cad3]">/</span>{' '}
      {crumb || 'Yordam va yo‘riqnoma'}
    </p>
  )

  if (!student) {
    return (
      <div className="space-y-4 pb-8">
        {trail}
        {children}
      </div>
    )
  }

  return (
    <RoleScreen title={title} back={back} right={right} className="pb-8">
      {children}
    </RoleScreen>
  )
}

function HelpHome({ ticketCount, onTickets }) {
  return (
    <HelpChrome>
      <NewsTeaser />
      <div className="mt-5 grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HELP_LINKS.map((item) => (
          <HelpCard key={item.id} {...item} />
        ))}
        <HelpCard
          title="Yozma murojaat"
          icon="ticket"
          text="Texnik savollar va tizim bo‘yicha yozma murojaat yuboring — javob shu yerda ko‘rinadi"
          onClick={onTickets}
        />
      </div>
      {ticketCount > 0 && (
        <p className="mt-4 text-[12px] text-[#9aa3b2]">
          Sizda {ticketCount} ta ochiq murojaat bor.{' '}
          <button type="button" onClick={onTickets} className="font-semibold text-[#2f80ed] hover:underline">
            Ko‘rish
          </button>
        </p>
      )}
    </HelpChrome>
  )
}

function TicketThread({ ticket, users, me, onReply }) {
  return (
    <SoftCard className="flex min-h-[360px] flex-col rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] lg:min-h-[480px]">
      <TicketMessages ticket={ticket} users={users} meId={me.id} />
      <SupportComposer
        placeholder="Javob yozing..."
        onSend={({ text, attachments }) => onReply(ticket.id, { text, attachments })}
      />
    </SoftCard>
  )
}

export default function Support() {
  const me = useCurrentUser()
  const tickets = useStore((s) => s.tickets)
  const users = useStore((s) => s.users)
  const addTicket = useStore((s) => s.addTicket)
  const replyTicket = useStore((s) => s.replyTicket)
  const navigate = useNavigate()
  const { id } = useParams()
  const [subject, setSubject] = useState('')
  const [first, setFirst] = useState('')
  const [open, setOpen] = useState(false)

  const visible = me.role === 'super_admin' ? tickets : tickets.filter((t) => t.userId === me.id)
  const openCount = visible.filter((t) => t.status !== 'closed').length

  if (!id) {
    return <HelpHome ticketCount={openCount} onTickets={() => navigate('/support/tickets')} />
  }

  if (id === 'tickets') {
    return (
      <>
      <HelpChrome
        title="Yozma murojaat"
        back="/support"
        crumb="Yordam va yo‘riqnoma / Murojaatlar"
        right={
          me.role !== 'super_admin' ? (
            <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center" aria-label="Yangi">
              <Plus size={20} />
            </button>
          ) : null
        }
      >
        <div className="mt-5 space-y-2.5">
          {me.role !== 'super_admin' && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#d7e4f7] bg-white px-4 py-3 text-[13px] font-semibold text-[#2f80ed] shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <Plus size={16} />
              Yangi murojaat
            </button>
          )}
          {visible.map((t) => {
            const owner = users.find((u) => u.id === t.userId)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => navigate(`/support/${t.id}`)}
                className="flex w-full items-center gap-3 rounded-[16px] bg-white px-4 py-3.5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              >
                <HelpIcon type="ticket" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-[#2b3340]">{t.subject}</span>
                  <span className="mt-0.5 block text-[12px] text-[#9aa3b2]">
                    {me.role === 'super_admin' ? `${owner?.name} · ` : ''}
                    {timeAgo(t.createdAt)}
                  </span>
                </span>
                <span className="shrink-0 text-lg text-slate-300">›</span>
              </button>
            )
          })}
        {!visible.length && <EmptyState text="Murojaatlar yo‘q. Yangi xabar yozing." />}
        </div>
      </HelpChrome>
        <Modal open={open} title="Yangi murojaat" onClose={() => setOpen(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              const created = addTicket({ subject, text: first })
              setSubject('')
              setFirst('')
              setOpen(false)
              navigate(`/support/${created.id}`)
            }}
          >
            <Field label="Mavzu">
              <input className={inputClass} required value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="Xabar">
              <textarea className={inputClass} rows={3} required value={first} onChange={(e) => setFirst(e.target.value)} />
            </Field>
            <PrimaryBtn className="w-full" type="submit">
              Yuborish
            </PrimaryBtn>
          </form>
        </Modal>
      </>
    )
  }

  const ticket = visible.find((t) => t.id === id)
  if (!ticket) {
    return (
      <HelpChrome title="Murojaat" back="/support/tickets">
        <EmptyState text="Murojaat topilmadi." />
      </HelpChrome>
    )
  }

  return (
    <HelpChrome title={ticket.subject} back="/support/tickets" crumb="Yordam va yo‘riqnoma / Murojaat">
      <h1 className="page-title">{ticket.subject}</h1>
      <div className="mt-5">
        <TicketThread ticket={ticket} users={users} me={me} onReply={replyTicket} />
      </div>
    </HelpChrome>
  )
}
