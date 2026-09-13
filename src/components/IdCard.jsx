import { useMemo } from 'react'
import { Phone, UserRound } from 'lucide-react'
import iauRauLogo from '../assets/iau-rau.png'
import { ROLE_LABEL, initials } from '../lib/utils'
import { cn } from './ui'

function hash32(value) {
  let h = 2166136261
  for (const ch of String(value || '')) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function cardExpiry(profile, role) {
  const year = new Date().getFullYear()
  if (role === 'student') {
    return `31-Avg-${year + Math.max(1, 4 - Number(profile?.course || 1))}`
  }
  return `31-Dek-${year + 2}`
}

function QrMark({ seed, size = 88 }) {
  const n = 25
  const cells = useMemo(() => {
    const out = Array.from({ length: n * n }, () => 0)
    let h = hash32(seed)
    const set = (x, y, v = 1) => {
      if (x >= 0 && y >= 0 && x < n && y < n) out[y * n + x] = v
    }
    const finder = (ox, oy) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6
          const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4
          set(ox + x, oy + y, edge || inner ? 1 : 0)
        }
      }
    }
    finder(0, 0)
    finder(n - 7, 0)
    finder(0, n - 7)
    for (let i = 8; i < n - 8; i++) set(i, 6, i % 2)
    for (let i = 8; i < n - 8; i++) set(6, i, i % 2)
    for (let i = 0; i < n * n; i++) {
      const x = i % n
      const y = Math.floor(i / n)
      const inFinder = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)
      const timing = x === 6 || y === 6
      if (!inFinder && !timing) out[i] = ((h >>> (i % 31)) ^ Math.imul(i + 3, 2654435761)) & 1
    }
    return out
  }, [seed])

  return (
    <svg width={size} height={size} viewBox={`-1.5 -1.5 ${n + 3} ${n + 3}`} className="idc-qr" aria-hidden>
      <rect x="-1.5" y="-1.5" width={n + 3} height={n + 3} fill="#ffffff" />
      {cells.map((on, i) =>
        on ? <rect key={i} x={i % n} y={Math.floor(i / n)} width="1" height="1" fill="#0f172a" /> : null,
      )}
    </svg>
  )
}

function IdBarcode({ value }) {
  const bits = useMemo(() => {
    const s = String(value || 'TIZIMS')
    let out = '11010010000'
    let h = hash32(s)
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0
      for (let b = 0; b < 11; b++) out += String((h >>> b) & 1)
      out += '0'
    }
    return `${out}1100011101011`
  }, [value])

  return (
    <svg
      width="196"
      height="40"
      viewBox={`0 0 ${bits.length} 40`}
      preserveAspectRatio="none"
      className="idc-barcode h-9 w-[168px] sm:h-10 sm:w-[200px]"
      aria-hidden
    >
      <rect width={bits.length} height="40" fill="#ffffff" />
      {bits.split('').map((bit, i) =>
        bit === '1' ? <rect key={i} x={i} y="0" width="1" height="40" fill="#0f172a" /> : null,
      )}
    </svg>
  )
}

function MetaLine({ icon: Icon, label, value }) {
  return (
    <p className="idc-meta flex items-start gap-2 text-[12px] leading-snug sm:text-[12.5px]">
      <Icon size={14} strokeWidth={2.1} className="idc-icon mt-[1px] shrink-0" />
      <span>
        {label}: <span className="idc-value font-semibold">{value || '—'}</span>
      </span>
    </p>
  )
}

export function TizimsIdCard({ me, profile, className }) {
  const student = me?.role === 'student'
  const name = profile?.displayName || me?.name || '—'
  const badge = student
    ? profile?.groupName || (profile?.course ? `${profile.course}-kurs` : ROLE_LABEL.student)
    : me?.subject || ROLE_LABEL[me?.role] || me?.role
  const cardId = profile?.studentId || me?.studentId || me?.id || '—'
  const qrSeed = `TIZIMSEDU|${cardId}|${name}|${profile?.pinfl || ''}`
  const expiry = cardExpiry(profile, me?.role)

  return (
    <article className={cn('tizims-id-card w-full max-w-[580px] overflow-hidden rounded-[18px]', className)}>
      <header className="idc-header bg-[#2f80ed] px-3 py-2 sm:px-4 sm:py-2.5">
        <img
          src={iauRauLogo}
          alt="International Agriculture University"
          className="idc-brand mx-auto block h-auto w-[78%] max-w-[78%] object-contain object-center"
          draggable={false}
        />
      </header>

      <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-[18px]">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="h-[96px] w-[78px] shrink-0 overflow-hidden rounded-[10px] bg-[#eef1f6] sm:h-[112px] sm:w-[90px]">
            {profile?.photo ? (
              <img src={profile.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span
                className="grid h-full w-full place-items-center text-[22px] font-bold text-white sm:text-[26px]"
                style={{ background: me?.avatarColor || '#147a36' }}
              >
                {initials(name)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="idc-name text-[17px] font-bold leading-tight sm:text-[20px]">{name}</h2>
            <span className="mt-1.5 inline-flex rounded-[6px] bg-[#2f80ed] px-2 py-[3px] text-[11px] font-semibold text-white sm:text-[12px]">
              {badge}
            </span>
            <div className="mt-2.5 space-y-1.5">
              <MetaLine icon={UserRound} label={student ? 'Talaba ID' : 'Xodim ID'} value={cardId} />
              <MetaLine icon={Phone} label="Telefon" value={me?.phone} />
            </div>
          </div>

          <div className="hidden shrink-0 sm:block">
            <QrMark seed={qrSeed} size={92} />
          </div>
        </div>

        <div className="mt-3 flex justify-end sm:hidden">
          <QrMark seed={qrSeed} size={84} />
        </div>

        <div className="mt-3.5 flex items-end justify-between gap-3 border-t border-[#eef1f6] pt-3">
          <IdBarcode value={cardId} />
          <div className="shrink-0 text-right">
            <p className="idc-valid-label text-[9px] font-semibold uppercase tracking-[0.14em]">Amal qiladi</p>
            <p className="idc-valid-date mt-0.5 text-[12px] font-semibold sm:text-[13px]">{expiry}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
