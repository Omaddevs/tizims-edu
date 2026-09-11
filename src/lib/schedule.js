export const WEEKDAYS = [
  { id: 1, short: 'Du', label: 'Dushanba' },
  { id: 2, short: 'Se', label: 'Seshanba' },
  { id: 3, short: 'Ch', label: 'Chorshanba' },
  { id: 4, short: 'Pa', label: 'Payshanba' },
  { id: 5, short: 'Ju', label: 'Juma' },
  { id: 6, short: 'Sh', label: 'Shanba' },
  { id: 7, short: 'Ya', label: 'Yakshanba' },
]

export const MONTHS_UZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
]

export const MONTHS_UZ_SHORT = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek']

export function isoDate(d) {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function weekdayFromDate(d) {
  return ((new Date(d).getDay() + 6) % 7) + 1
}

export function parseISO(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function formatUzLong(d) {
  const x = d instanceof Date ? d : parseISO(d)
  return `${x.getDate()}-${MONTHS_UZ[x.getMonth()].toLowerCase()}, ${x.getFullYear()}`
}

export function formatUzFull(d) {
  const x = d instanceof Date ? d : parseISO(d)
  const wd = WEEKDAYS[weekdayFromDate(x) - 1]
  return `${wd.label}, ${x.getDate()}-${MONTHS_UZ[x.getMonth()].toLowerCase()} ${x.getFullYear()}`
}

export function matchesDate(item, date) {
  const iso = isoDate(date)
  if (item.date) return item.date === iso
  return (item.weekday || 1) === weekdayFromDate(date)
}

export function addDays(d, n) {
  const x = d instanceof Date ? new Date(d) : parseISO(d)
  x.setDate(x.getDate() + n)
  return x
}

export function startOfWeek(d) {
  const x = d instanceof Date ? new Date(d) : parseISO(d)
  x.setHours(0, 0, 0, 0)
  return addDays(x, -(weekdayFromDate(x) - 1))
}

export function calendarCells(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const startOffset = (first.getDay() + 6) % 7
  const start = new Date(year, monthIndex, 1 - startOffset)
  return [...Array(42)].map((_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return {
      date,
      iso: isoDate(date),
      inMonth: date.getMonth() === monthIndex,
      day: date.getDate(),
    }
  })
}
