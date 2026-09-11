import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { EXAMS } from '../data/catalog'
import { RoleScreen, SoftCard } from '../components/StudentChrome'
import { useCurrentUser } from '../store/useStore'
import emptyAssignmentsPng from '../assets/empty-assignments.png'

function EmptyExamsCard() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-[18px] bg-white px-6 py-14 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:min-h-[280px]">
      <div className="flex flex-col items-center text-center">
        <img src={emptyAssignmentsPng} alt="" className="h-[156px] w-[156px] object-contain" />
        <p className="mt-2 text-[14px] font-medium text-[#8b93a1]">Imtihonlar topilmadi</p>
      </div>
    </div>
  )
}

function ExamsChrome({ children }) {
  const me = useCurrentUser()
  const student = me?.role === 'student'

  if (!student) {
    return (
      <div className="space-y-4 pb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Imtihonlar</h1>
        {children}
      </div>
    )
  }

  return (
    <RoleScreen title="Imtihonlar">{children}</RoleScreen>
  )
}

export default function ExamsPage() {
  return (
    <ExamsChrome>
      <EmptyExamsCard />
    </ExamsChrome>
  )
}

export function ExamDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const exam = EXAMS.find((e) => e.id === id)
  if (!exam) {
    return (
      <ExamsChrome>
        <EmptyExamsCard />
      </ExamsChrome>
    )
  }
  return (
    <RoleScreen title={exam.type} back="/exams">
      <SoftCard>
        <h2 className="text-[20px] font-bold leading-snug">{exam.subject}</h2>
        <div className="mt-4 space-y-3 text-[15px] text-slate-600">
          <p className="flex items-center gap-2">
            <CalendarDays size={18} className="text-brand-700" /> {exam.date}
          </p>
          <p className="flex items-center gap-2">
            <Clock size={18} className="text-brand-700" /> {exam.time}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={18} className="text-brand-700" /> {exam.room}
          </p>
        </div>
        <p className="mt-4 leading-relaxed text-slate-600">{exam.note}</p>
        <button type="button" onClick={() => navigate('/exams')} className="mt-5 text-[13px] font-semibold text-[#2f80ed]">
          Orqaga
        </button>
      </SoftCard>
    </RoleScreen>
  )
}
