import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { SURVEYS, SURVEY_SCALE, formatSurveyDeadline, surveyColumn } from '../data/surveys'
import { RoleScreen } from '../components/StudentChrome'
import { PrimaryBtn, cn } from '../components/ui'
import { useCurrentUser, useStore } from '../store/useStore'
import emptyAssignmentsPng from '../assets/empty-assignments.png'

const COLUMNS = [
  { id: 'not_started', title: 'Boshlanmagan', bar: 'bg-[#f43f5e]' },
  { id: 'in_progress', title: 'Jarayonda', bar: 'bg-[#8b5cf6]' },
  { id: 'completed', title: 'Yakunlangan', bar: 'bg-[#eab308]' },
]

function EmptyColumn() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <img src={emptyAssignmentsPng} alt="" className="h-[108px] w-[108px] object-contain" />
      <p className="mt-3 text-[13px] font-medium text-[#9aa3b2]">So‘rovnomalar topilmadi</p>
    </div>
  )
}

function SurveysChrome({ title = 'So‘rovnomalar', back, children }) {
  const me = useCurrentUser()
  const student = me?.role === 'student'

  if (!student) {
    return (
      <div className="space-y-4 pb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {children}
      </div>
    )
  }

  return (
    <RoleScreen title={title} back={back}>
      {children}
    </RoleScreen>
  )
}

function SurveyCard({ survey, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[14px] bg-white p-3.5 text-left shadow-[0_6px_18px_rgba(15,23,42,0.06)] ring-1 ring-slate-100/80 transition hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
    >
      <p className="text-[13.5px] font-semibold leading-snug text-[#2b3340]">{survey.title}</p>
      <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-[#8b93a1]">
        <Clock size={13} strokeWidth={2} className="shrink-0 text-[#94a3b8]" />
        Tugash vaqti: {formatSurveyDeadline(survey.endsAt)}
      </p>
    </button>
  )
}

export default function SurveysPage() {
  const me = useCurrentUser()
  const navigate = useNavigate()
  const responses = useStore((s) => s.surveyResponses) || []

  const grouped = useMemo(() => {
    const buckets = { not_started: [], in_progress: [], completed: [] }
    SURVEYS.forEach((survey) => {
      const response = responses.find((r) => r.surveyId === survey.id && r.userId === me?.id)
      buckets[surveyColumn(response)].push(survey)
    })
    return buckets
  }, [me?.id, responses])

  return (
    <SurveysChrome>
      <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
        <div className="min-w-[780px] rounded-[18px] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:min-w-0">
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
          {COLUMNS.map((col) => {
            const items = grouped[col.id]
            return (
              <section
                key={col.id}
                className="flex min-h-[420px] flex-col rounded-[16px] bg-[#f3f5f8] p-3 sm:min-h-[520px] lg:min-h-[calc(100vh-220px)]"
              >
                <header className="mb-3 flex items-center gap-2 px-1 pt-0.5">
                  <span className={cn('h-4 w-[3px] rounded-full', col.bar)} />
                  <h2 className="text-[14px] font-semibold text-[#2b3340]">{col.title}</h2>
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-[#8b93a1] shadow-sm">
                    {items.length}
                  </span>
                </header>
                <div className="flex flex-1 flex-col gap-2.5">
                  {items.map((survey) => (
                    <SurveyCard key={survey.id} survey={survey} onOpen={() => navigate(`/surveys/${survey.id}`)} />
                  ))}
                  {!items.length && <EmptyColumn />}
                </div>
              </section>
            )
          })}
          </div>
        </div>
      </div>
    </SurveysChrome>
  )
}

export function SurveyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const me = useCurrentUser()
  const survey = SURVEYS.find((s) => s.id === id)
  const responses = useStore((s) => s.surveyResponses) || []
  const saveSurveyDraft = useStore((s) => s.saveSurveyDraft)
  const submitSurvey = useStore((s) => s.submitSurvey)
  const existing = responses.find((r) => r.surveyId === id && r.userId === me?.id)
  const done = existing?.status === 'completed'
  const [answers, setAnswers] = useState(() => ({ ...(existing?.answers || {}) }))
  const [error, setError] = useState('')

  if (!survey) {
    return (
      <SurveysChrome>
        <EmptyColumn />
      </SurveysChrome>
    )
  }

  const setAnswer = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
    setError('')
  }

  const body = (
    <div className="rounded-[18px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <h2 className="text-[20px] font-bold leading-snug text-[#2b3340]">{survey.title}</h2>
      <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#8b93a1]">
        <Clock size={14} /> Tugash vaqti: {formatSurveyDeadline(survey.endsAt)}
      </p>
      {done && (
        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">
          Bu so‘rovnoma yakunlangan. Javoblaringiz saqlangan.
        </p>
      )}
      <form
        className="mt-5 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (done) return
          const missing = survey.questions.some((q) => !answers[q.id])
          if (missing) {
            setError('Iltimos, barcha savollarga javob bering.')
            return
          }
          submitSurvey(survey.id, answers)
          navigate('/surveys')
        }}
      >
        {survey.questions.map((q, i) => (
          <fieldset key={q.id} className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
            <legend className="px-1 text-[14px] font-semibold text-[#2b3340]">
              {i + 1}. {q.text}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-5">
              {SURVEY_SCALE.map((opt) => {
                const checked = answers[q.id] === opt.value
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex cursor-pointer flex-col items-center rounded-xl border px-2 py-2.5 text-center text-[12px] font-medium transition',
                      checked
                        ? 'border-[#2f80ed] bg-[#e8f1ff] text-[#2f80ed]'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                      done && 'cursor-default',
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={q.id}
                      value={opt.value}
                      checked={checked}
                      disabled={done}
                      onChange={() => setAnswer(q.id, opt.value)}
                    />
                    <span className="text-[15px] font-bold">{opt.value}</span>
                    <span className="mt-0.5 leading-tight">{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
        {error && <p className="text-[13px] font-medium text-rose-600">{error}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          {!done && (
            <>
              <PrimaryBtn type="submit">Yuborish</PrimaryBtn>
              <button
                type="button"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#2b3340] hover:bg-slate-50"
                onClick={() => {
                  saveSurveyDraft(survey.id, answers)
                  navigate('/surveys')
                }}
              >
                Keyinroq davom etish
              </button>
            </>
          )}
          <button
            type="button"
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-[#2f80ed]"
            onClick={() => navigate('/surveys')}
          >
            Orqaga
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <SurveysChrome title="So‘rovnoma" back="/surveys">
      {body}
    </SurveysChrome>
  )
}
