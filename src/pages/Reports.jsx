import { useState } from 'react'
import { Download } from 'lucide-react'
import { useStore } from '../store/useStore'
import { calcPercentage } from '../lib/attendance'
import { exportAttendanceExcel } from '../lib/excel'
import { Field, PrimaryBtn, Select } from '../components/ui'

export default function Reports() {
  const users = useStore((s) => s.users)
  const groups = useStore((s) => s.groups)
  const attendance = useStore((s) => s.attendance)
  const complaints = useStore((s) => s.complaints)
  const [period, setPeriod] = useState('month')
  const [studentId, setStudentId] = useState('')
  const students = users.filter((u) => u.role === 'student')

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-muted">Talabalar</p>
          <p className="text-2xl font-extrabold">{students.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">O‘rtacha davomat</p>
          <p className="text-2xl font-extrabold">
            {Math.round((students.reduce((s, u) => s + calcPercentage(attendance.filter((a) => a.studentId === u.id)), 0) / Math.max(1, students.length)) * 10) / 10}%
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">Shikoyatlar</p>
          <p className="text-2xl font-extrabold">{complaints.length}</p>
        </div>
      </div>
      <div className="card space-y-3 p-5">
        <h3 className="font-bold">Davomat Excel</h3>
        <Field label="Davr">
          <Select
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'week', label: '1 haftalik' },
              { value: 'month', label: '1 oylik' },
              { value: 'all', label: 'To‘liq' },
            ]}
          />
        </Field>
        <Field label="Talaba">
          <Select
            value={studentId}
            onChange={setStudentId}
            options={[{ value: '', label: 'Barcha talabalar' }, ...students.map((s) => ({ value: s.id, label: `${s.name} · ${s.studentId}` }))]}
          />
        </Field>
        <PrimaryBtn
          onClick={() =>
            exportAttendanceExcel({
              users,
              groups,
              records: attendance,
              studentId: studentId || null,
              period,
              filename: `hisobot-davomat-${period}.xlsx`,
            })
          }
        >
          <Download size={16} /> Yuklab olish
        </PrimaryBtn>
      </div>
    </div>
  )
}
