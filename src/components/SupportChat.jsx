import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Image as ImageIcon, LifeBuoy, Paperclip, Send, X } from 'lucide-react'
import { useCurrentUser, useStore } from '../store/useStore'
import { cn } from './ui'
import {
  SUPPORT_CHAT_EVENT,
  formatFileSize,
  isImageAttachment,
  readAttachment,
} from '../lib/supportChat'

function MessageAttachments({ items = [], mine }) {
  if (!items.length) return null
  return (
    <div className="mt-2 space-y-2">
      {items.map((file) =>
        isImageAttachment(file) && file.dataUrl ? (
          <a key={file.id} href={file.dataUrl} target="_blank" rel="noreferrer" className="block">
            <img src={file.dataUrl} alt={file.name} className="max-h-40 w-full rounded-xl object-cover" />
            <p className={cn('mt-1 truncate text-[10px]', mine ? 'text-white/80' : 'text-slate-500')}>{file.name}</p>
          </a>
        ) : (
          <a
            key={file.id}
            href={file.dataUrl || undefined}
            download={file.name}
            className={cn(
              'flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px]',
              mine ? 'bg-white/15' : 'bg-white',
            )}
          >
            <Paperclip size={14} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{file.name}</span>
              <span className={cn('block text-[10px]', mine ? 'text-white/70' : 'text-slate-400')}>
                {formatFileSize(file.size)}
              </span>
            </span>
          </a>
        ),
      )}
    </div>
  )
}

export function TicketMessages({ ticket, users, meId }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages?.length])

  if (!ticket) return null

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-1 py-1">
      {ticket.messages.map((m) => {
        const u = users.find((x) => x.id === m.userId)
        const mine = m.userId === meId
        const support = m.userId === 'u_admin' || u?.role === 'super_admin'
        return (
          <div
            key={m.id}
            className={cn('max-w-[86%] rounded-2xl px-3 py-2 text-sm', mine ? 'ml-auto bg-[#4361ee] text-white' : 'bg-[#f3f6fb] text-[#2b3340]')}
          >
            <p className="text-[10px] opacity-70">{mine ? 'Siz' : support ? 'Support' : u?.name}</p>
            {m.text ? <p className="whitespace-pre-wrap break-words">{m.text}</p> : null}
            <MessageAttachments items={m.attachments} mine={mine} />
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

export function SupportComposer({ onSend, placeholder = 'Xabar yozing...' }) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const imageRef = useRef(null)

  const addFiles = async (list, { imagesOnly } = {}) => {
    setError('')
    const next = []
    for (const file of list) {
      if (imagesOnly && !file.type.startsWith('image/')) {
        setError('Faqat rasm tanlang')
        continue
      }
      try {
        next.push(await readAttachment(file))
      } catch (err) {
        setError(err.message)
      }
    }
    if (next.length) setFiles((prev) => [...prev, ...next].slice(0, 6))
  }

  const submit = () => {
    const value = text.trim()
    if (!value && !files.length) return
    onSend({ text: value, attachments: files })
    setText('')
    setFiles([])
    setError('')
  }

  return (
    <form
      className="mt-2 space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <span key={file.id} className="flex max-w-[180px] items-center gap-1.5 rounded-xl bg-[#eef3fb] px-2 py-1 text-[11px]">
              {isImageAttachment(file) && file.dataUrl ? (
                <img src={file.dataUrl} alt="" className="h-7 w-7 rounded-md object-cover" />
              ) : (
                <Paperclip size={12} />
              )}
              <span className="truncate">{file.name}</span>
              <button type="button" onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))} aria-label="Olib tashlash">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
      <div className="flex items-end gap-1.5">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          multiple
          onChange={(e) => {
            addFiles(Array.from(e.target.files || []))
            e.target.value = ''
          }}
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          multiple
          onChange={(e) => {
            addFiles(Array.from(e.target.files || []), { imagesOnly: true })
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef3fb] text-[#4361ee]"
          title="Fayl yuborish"
        >
          <Paperclip size={16} />
        </button>
        <button
          type="button"
          onClick={() => imageRef.current?.click()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef3fb] text-[#4361ee]"
          title="Rasm yuborish"
        >
          <ImageIcon size={16} />
        </button>
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4361ee]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="submit"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#4361ee] text-white"
          title="Yuborish"
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  )
}

export default function SupportChat({ visible = true }) {
  const me = useCurrentUser()
  const users = useStore((s) => s.users)
  const tickets = useStore((s) => s.tickets)
  const ensureSupportChat = useStore((s) => s.ensureSupportChat)
  const replyTicket = useStore((s) => s.replyTicket)
  const [open, setOpen] = useState(false)
  const ticketIdRef = useRef(null)

  const ticket = tickets.find((t) => t.id === ticketIdRef.current) || tickets.find((t) => t.userId === me?.id && t.channel === 'chat' && t.status !== 'closed')

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(SUPPORT_CHAT_EVENT, onOpen)
    return () => window.removeEventListener(SUPPORT_CHAT_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (!open || !me || me.role === 'super_admin') return
    const created = ensureSupportChat()
    ticketIdRef.current = created.id
  }, [open, me, ensureSupportChat])

  const send = ({ text, attachments }) => {
    const current = ensureSupportChat()
    if (!current) return
    ticketIdRef.current = current.id
    replyTicket(current.id, { text, attachments })
    const hasImage = attachments.some((f) => String(f.type || '').startsWith('image/'))
    const ack = hasImage
      ? 'Rasm qabul qilindi. Support mutaxassisi ko‘rib chiqadi.'
      : attachments.length
        ? 'Fayl qabul qilindi. Zarurat bo‘lsa qo‘shimcha ma’lumot so‘raymiz.'
        : 'Rahmat, murojaatingiz qabul qilindi. Tez orada javob beramiz.'
    window.setTimeout(() => {
      replyTicket(current.id, { text: ack, asUserId: 'u_admin' })
    }, 800)
  }

  if (!visible || !me || me.role === 'super_admin') return null

  return createPortal(
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-[4.6rem] right-4 z-[70] flex h-12 items-center gap-1.5 rounded-full bg-gradient-to-br from-[#4cc9f0] to-[#4361ee] px-3.5 text-[11px] font-extrabold tracking-wide text-white shadow-[0_10px_24px_rgba(67,97,238,0.4)] md:bottom-6 md:right-6 lg:right-8"
          aria-label="Support"
          title="Support"
        >
          <LifeBuoy size={16} strokeWidth={2.4} />
          Support
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-end p-0 sm:p-6">
          <button type="button" className="absolute inset-0 bg-slate-900/30" onClick={() => setOpen(false)} aria-label="Yopish" />
          <section className="relative flex h-[min(82dvh,620px)] w-full max-w-[400px] flex-col rounded-t-3xl bg-white shadow-2xl sm:h-[560px] sm:rounded-3xl">
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#4cc9f0] to-[#4361ee] text-white">
                  <LifeBuoy size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold">Support</p>
                  <p className="text-[11px] text-slate-400">Xabar, rasm va fayl yuboring</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-slate-100" aria-label="Yopish">
                <X size={16} />
              </button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col p-3">
              <TicketMessages ticket={ticket} users={users} meId={me.id} />
              <SupportComposer onSend={send} />
            </div>
          </section>
        </div>
      )}
    </>,
    document.body,
  )
}
