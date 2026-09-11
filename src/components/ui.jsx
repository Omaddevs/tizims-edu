export { Select, SemesterSelect } from './Select'

export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function Avatar({ name, color, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' }
  const initials = String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  return (
    <div
      className={cn('grid shrink-0 place-items-center rounded-full font-semibold text-white', sizes[size])}
      style={{ background: color || '#147a36' }}
    >
      {initials}
    </div>
  )
}

export function Badge({ children, tone = 'slate' }) {
  const map = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    brand: 'bg-brand-100 text-brand-800 border-brand-100',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', map[tone])}>
      {children}
    </span>
  )
}

export function Modal({ open, title, onClose, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-end p-0 sm:place-items-center sm:p-6">
      <button className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Yopish" />
      <div className={cn('relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[16px] outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100'

export function Tabs({ value, onChange, items }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            'whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition',
            value === it.id ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

export function PrimaryBtn({ children, className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-900 disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Cover({ type = 'book', title, variant = 'full' }) {
  const palettes = {
    python: ['#0d5c28', '#3cbc60'],
    db: ['#0a3d1c', '#22a84a'],
    math: ['#147a36', '#7ed99a'],
    exam: ['#0d5c28', '#4cbe6e'],
    lib: ['#147a36', '#6fd48a'],
    att: ['#1a9440', '#a8e8b8'],
    blog1: ['#0d5c28', '#1a9440'],
    blog2: ['#147a36', '#5dcc78'],
    book: ['#0d5c28', '#147a36'],
    career: ['#0a3d1c', '#3cbc60'],
    grant: ['#0d5c28', '#22a84a'],
  }
  const [a, b] = palettes[type] || palettes.book
  const banner = variant === 'banner'
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col justify-end overflow-hidden text-left text-white',
        banner ? 'p-2.5' : 'rounded-[20px] p-4',
      )}
      style={{ background: `linear-gradient(145deg, ${a}, ${b})` }}
    >
      <div className={cn('pointer-events-none absolute rounded-full bg-white/12', banner ? '-right-5 -top-6 h-16 w-16' : '-right-6 -top-8 h-28 w-28')} />
      <div className={cn('pointer-events-none absolute rounded-full bg-white/10', banner ? 'right-4 top-3 h-8 w-8' : 'right-8 top-6 h-16 w-16')} />
      {title ? (
        <p
          className={cn(
            'relative z-[1] min-w-0 font-semibold tracking-tight [overflow-wrap:anywhere]',
            banner ? 'line-clamp-3 text-[12px] leading-[1.3]' : 'line-clamp-3 text-sm leading-snug',
          )}
        >
          {title}
        </p>
      ) : null}
    </div>
  )
}
