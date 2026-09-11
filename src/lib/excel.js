import * as XLSX from 'xlsx'
import { STATUS, calcPercentage } from './attendance'
import { inRange } from './utils'

export function exportAttendanceExcel({ users, groups, records, studentId, period, filename }) {
  const students = users.filter((u) => u.role === 'student' && (!studentId || u.id === studentId))
  const rows = []

  students.forEach((s) => {
    const group = groups.find((g) => g.id === s.groupId)
    const list = records.filter(
      (r) => r.studentId === s.id && (!period || period === 'all' || inRange(r.date, period)),
    )
    if (!list.length) {
      rows.push({
        ID: s.studentId,
        'F.I.Sh.': s.name,
        Guruh: group?.name || '—',
        Telefon: s.phone,
        Sana: '—',
        Holat: 'Ma’lumot yo‘q',
        Vaqt: '—',
        Izoh: '—',
        'Davomat %': calcPercentage(records.filter((r) => r.studentId === s.id)),
      })
      return
    }
    list.forEach((r) => {
      rows.push({
        ID: s.studentId,
        'F.I.Sh.': s.name,
        Guruh: group?.name || '—',
        Telefon: s.phone,
        Sana: r.date,
        Fan: r.subject || '—',
        Holat: STATUS[r.status]?.label || r.status,
        Vaqt: r.time || '—',
        Izoh: r.comment || '—',
        'Davomat %': calcPercentage(records.filter((rec) => rec.studentId === s.id)),
      })
    })
  })

  const sheet = XLSX.utils.json_to_sheet(rows)
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'Davomat')
  XLSX.writeFile(book, filename || 'davomat.xlsx')
}
