import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../store/useStore'
import { cn } from './ui'

export function RoleScreen({ title, back = '/', right, children, className }) {
  const me = useCurrentUser()
  if (me?.role !== 'student') return children
  return (
    <Screen title={title} back={back} right={right} className={className}>
      {children}
    </Screen>
  )
}

export function Screen({ title, back = '/', right, children, className }) {
  const navigate = useNavigate()
  return (
    <div className={cn('min-w-0 pb-2', className)}>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="page-crumb">
            Asosiy <span className="mx-1">/</span> Dashboard <span className="mx-1">/</span> {title}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
              className="grid h-9 w-9 place-items-center rounded-full text-ink md:hidden"
              aria-label="Orqaga"
            >
              <ChevronLeft size={22} />
            </button>
            <h1 className="page-title mt-0">{title}</h1>
          </div>
        </div>
        {right && <div className="shrink-0 pt-5">{right}</div>}
      </header>
      <div>{children}</div>
    </div>
  )
}

export function SoftCard({ children, className, onClick }) {
  const cls = cn(
    'w-full rounded-[20px] bg-white p-4 text-left shadow-[0_2px_12px_rgba(16,80,40,0.05)]',
    onClick && 'active:scale-[0.99]',
    className,
  )
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    )
  }
  return <div className={cls}>{children}</div>
}

export function SoftRow({ icon: Icon, title, sub, extra, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[20px] bg-white px-3 py-3 text-left shadow-[0_2px_12px_rgba(16,80,40,0.05)]"
    >
      {Icon && (
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-brand-50 text-brand-700">
          <Icon size={20} strokeWidth={1.8} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-snug text-ink">{title}</span>
        {sub && <span className="mt-0.5 block text-[12px] leading-snug text-muted">{sub}</span>}
      </span>
      {extra}
      <span className="shrink-0 text-lg text-slate-300">›</span>
    </button>
  )
}

export function EmptyState({ text = 'Ma’lumot topilmadi' }) {
  return <p className="px-2 py-12 text-center text-sm text-muted">{text}</p>
}

export function StatusChip({ children, tone = 'blue' }) {
  const map = {
    blue: 'bg-brand-50 text-brand-800',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', map[tone] || map.blue)}>{children}</span>
}
