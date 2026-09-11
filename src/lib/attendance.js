export const STATUS = {
  present: { label: 'Kelgan', color: 'green', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  late: { label: 'Kechikkan', color: 'amber', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  absent: { label: 'Kelmadi', color: 'red', className: 'bg-rose-50 text-rose-700 border-rose-200' },
}

export function calcPercentage(records = []) {
  if (!records.length) return 100
  const score = records.reduce((sum, r) => {
    if (r.status === 'present') return sum + 1
    if (r.status === 'late') return sum + 0.7
    return sum
  }, 0)
  return Math.round((score / records.length) * 1000) / 10
}

export function percentTone(pct) {
  if (pct >= 85) return { tone: 'green', bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' }
  if (pct >= 70) return { tone: 'yellow', bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' }
  return { tone: 'red', bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' }
}

export function summarize(records = []) {
  return {
    present: records.filter((r) => r.status === 'present').length,
    late: records.filter((r) => r.status === 'late').length,
    absent: records.filter((r) => r.status === 'absent').length,
    total: records.length,
    percentage: calcPercentage(records),
  }
}
