import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, Check, ChevronDown } from 'lucide-react'

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

const VARIANTS = {
  field: {
    trigger:
      'flex w-full items-center gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-[16px] font-medium text-ink shadow-sm transition dark:bg-[var(--app-surface)]',
    idle: 'border-slate-200 hover:border-slate-300',
    open: 'border-[#2f80ed] ring-4 ring-[#2f80ed]/10',
    chevron: 16,
    minMenu: 0,
  },
  pill: {
    trigger:
      'inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#f3f6fb] py-1.5 pl-2.5 pr-2 text-left text-[12px] font-semibold text-[#334155] transition',
    idle: 'hover:bg-[#e8edf5]',
    open: 'bg-white shadow-sm ring-2 ring-[#2f80ed]/20',
    chevron: 13,
    minMenu: 176,
  },
  soft: {
    trigger:
      'flex w-full items-center gap-2 rounded-[16px] bg-brand-50 px-4 py-3.5 text-left text-[16px] font-medium text-ink transition',
    idle: 'hover:bg-brand-100/70',
    open: 'ring-4 ring-brand-100',
    chevron: 18,
    minMenu: 0,
  },
  toolbar: {
    trigger:
      'inline-flex items-center gap-2 rounded-xl border bg-white py-1.5 pl-1.5 pr-2.5 text-left text-[13px] font-semibold text-ink shadow-sm transition',
    idle: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
    open: 'border-[#2f80ed] ring-4 ring-[#2f80ed]/10',
    chevron: 14,
    minMenu: 280,
  },
}

function flatten(options, groups) {
  if (groups?.length) return groups.flatMap((g) => g.options || [])
  return options || []
}

function same(a, b) {
  return String(a ?? '') === String(b ?? '')
}

function OptionRow({ active, highlighted, onClick, onMouseEnter, label, hint }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition',
        active ? 'bg-[#e8f1ff] text-[#2f80ed]' : highlighted ? 'bg-slate-50 text-ink' : 'text-slate-600 hover:bg-slate-50 hover:text-ink',
      )}
    >
      <span className="min-w-0 truncate">
        {label}
        {hint ? <span className="ml-1.5 text-[11px] font-normal text-slate-400">{hint}</span> : null}
      </span>
      {active ? <Check size={14} strokeWidth={2.5} className="shrink-0 text-[#2f80ed]" /> : null}
    </button>
  )
}

export function Select({
  value,
  onChange,
  options = [],
  groups,
  placeholder = 'Tanlang',
  variant = 'field',
  disabled = false,
  required = false,
  name,
  className,
  align = 'left',
  ariaLabel,
  icon,
  renderValue,
  menuHeader,
  groupLayout = 'list',
  minMenuWidth,
}) {
  const vid = useId()
  const btnRef = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const [hi, setHi] = useState(-1)
  const hiRef = useRef(-1)
  const skin = VARIANTS[variant] || VARIANTS.field
  const flat = useMemo(() => flatten(options, groups), [options, groups])
  const selected = flat.find((o) => same(o.value, value))
  const label = selected?.label || placeholder
  const empty = !selected

  const markHi = (i) => {
    hiRef.current = i
    setHi(i)
  }

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return undefined
    }
    const place = () => {
      const btn = btnRef.current
      const menu = menuRef.current
      if (!btn) return
      const r = btn.getBoundingClientRect()
      const minW = minMenuWidth || skin.minMenu || r.width
      const menuW = Math.min(Math.max(minW, r.width), window.innerWidth - 16)
      const menuH = menu?.offsetHeight || 240
      let left = align === 'right' ? r.right - menuW : r.left
      left = Math.min(Math.max(8, left), window.innerWidth - menuW - 8)
      const below = window.innerHeight - r.bottom - 12
      const above = r.top - 12
      const openUp = below < Math.min(menuH, 220) && above > below
      setPos({
        left,
        width: menuW,
        maxHeight: Math.max(160, openUp ? above : below),
        top: openUp ? undefined : r.bottom + 8,
        bottom: openUp ? window.innerHeight - r.top + 8 : undefined,
      })
    }
    place()
    const id = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, align, variant, flat.length, skin.minMenu, minMenuWidth])

  useEffect(() => {
    if (!open) return undefined
    const idx = Math.max(0, flat.findIndex((o) => same(o.value, value)))
    markHi(idx)
    const onPointer = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        btnRef.current?.focus()
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const cur = hiRef.current < 0 ? idx : hiRef.current
        const next = e.key === 'ArrowDown' ? Math.min(cur + 1, flat.length - 1) : Math.max(cur - 1, 0)
        markHi(next)
        menuRef.current?.querySelector(`[data-opt="${next}"]`)?.scrollIntoView({ block: 'nearest' })
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const opt = flat[hiRef.current < 0 ? idx : hiRef.current]
        if (opt && !opt.disabled) {
          onChange?.(opt.value)
          setOpen(false)
          btnRef.current?.focus()
        }
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, flat, value, onChange])

  const pick = (opt) => {
    if (opt.disabled) return
    onChange?.(opt.value)
    setOpen(false)
    btnRef.current?.focus()
  }

  return (
    <div className={cn(variant === 'field' || variant === 'soft' ? 'w-full' : 'relative inline-flex', className)}>
      {name ? <input type="hidden" name={name} value={value ?? ''} required={required} /> : null}
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={vid}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          skin.trigger,
          open ? skin.open : skin.idle,
          disabled && 'cursor-not-allowed opacity-50',
          empty && 'text-slate-400',
        )}
      >
        {icon ? <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#e8f1ff] text-[#2f80ed]">{icon}</span> : null}
        <span className={cn('min-w-0 truncate', (variant === 'field' || variant === 'soft') && 'flex-1')}>
          {renderValue ? renderValue(selected) : label}
        </span>
        <ChevronDown
          size={skin.chevron}
          className={cn('shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={vid}
              role="listbox"
              aria-label={ariaLabel || placeholder}
              style={{
                position: 'fixed',
                zIndex: 80,
                left: pos?.left ?? 0,
                width: pos?.width ?? 240,
                top: pos?.top,
                bottom: pos?.bottom,
                maxHeight: pos?.maxHeight ?? 280,
                visibility: pos ? 'visible' : 'hidden',
              }}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
            >
              <div className="overflow-y-auto p-1.5 scrollbar-thin" style={{ maxHeight: (pos?.maxHeight ?? 280) - 4 }}>
                {menuHeader ? (
                  <p className="px-2 pb-1.5 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{menuHeader}</p>
                ) : null}
                {groups?.length ? (
                  <div className="space-y-1.5">
                    {groups.map((g) => (
                      <div key={g.label} className="rounded-xl bg-slate-50/90 p-1.5">
                        <p className="px-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{g.label}</p>
                        <div className={groupLayout === 'grid' ? 'grid grid-cols-2 gap-1' : 'space-y-0.5'}>
                          {g.options.map((opt) => {
                            const i = flat.findIndex((o) => same(o.value, opt.value))
                            return (
                              <div key={String(opt.value)} data-opt={i}>
                                <OptionRow
                                  active={same(opt.value, value)}
                                  highlighted={i === hi}
                                  label={opt.label}
                                  hint={groupLayout === 'grid' ? undefined : opt.hint}
                                  onMouseEnter={() => markHi(i)}
                                  onClick={() => pick(opt)}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {flat.map((opt, i) => (
                      <div key={String(opt.value)} data-opt={i}>
                        <OptionRow
                          active={same(opt.value, value)}
                          highlighted={i === hi}
                          label={opt.label}
                          hint={opt.hint}
                          onMouseEnter={() => markHi(i)}
                          onClick={() => pick(opt)}
                        />
                      </div>
                    ))}
                    {!flat.length ? <p className="px-2.5 py-2 text-[13px] text-slate-400">Variant yo‘q</p> : null}
                  </div>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

export function SemesterSelect({ value, onChange, options = [], variant = 'toolbar', align = 'left' }) {
  const groups = useMemo(() => {
    const map = []
    for (const s of options) {
      const course = Math.ceil(Number(s) / 2)
      let group = map.find((g) => g.course === course)
      if (!group) {
        group = { course, label: `${course}-kurs`, options: [] }
        map.push(group)
      }
      group.options.push({ value: s, label: `${s}-semestr`, hint: `${course}-kurs` })
    }
    return map
  }, [options])

  const course = Math.ceil(Number(value) / 2)

  return (
    <Select
      value={value}
      onChange={onChange}
      groups={groups}
      variant={variant}
      align={align}
      minMenuWidth={300}
      ariaLabel="Semestr"
      menuHeader="Semestr tanlang"
      groupLayout="grid"
      icon={variant === 'toolbar' ? <CalendarDays size={14} /> : undefined}
      renderValue={
        variant === 'toolbar'
          ? () => (
              <span className="flex items-center gap-1.5">
                <span>{value}-semestr</span>
                <span className="text-[11px] font-medium text-slate-400">· {course}-kurs</span>
              </span>
            )
          : undefined
      }
    />
  )
}
