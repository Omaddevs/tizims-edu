export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function nextStudentId(users) {
  const year = new Date().getFullYear()
  const nums = users
    .filter((u) => u.role === 'student' && u.studentId)
    .map((u) => Number(String(u.studentId).split('-').pop()))
    .filter((n) => Number.isFinite(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `STU-${year}-${String(next).padStart(4, '0')}`
}

export function formatPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('998') && digits.length >= 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
  }
  return value
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hozir'
  if (mins < 60) return `${mins} daqiqa oldin`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} kun oldin`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} hafta oldin`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} oy oldin`
  const years = Math.floor(months / 12)
  return `${years} yil oldin`
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function inRange(dateISO, period) {
  const d = new Date(dateISO)
  const now = new Date()
  if (period === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - 7)
    return d >= start
  }
  if (period === 'month') {
    const start = new Date(now)
    start.setMonth(now.getMonth() - 1)
    return d >= start
  }
  return true
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function formatBytes(bytes) {
  if (!bytes) return '—'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export const ROLE_LABEL = {
  super_admin: 'Super Admin',
  teacher: 'O‘qituvchi',
  student: 'Talaba',
}
