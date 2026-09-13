export const TESTS = [
  {
    id: 't1',
    subject: 'Python dasturlash',
    type: 'Joriy nazorat',
    teacher: 'Aziz Rahimov',
    room: 'A-204',
    semester: 6,
    durationMin: 20,
    maxScore: 100,
    startsAt: '2026-09-10T08:00:00',
    endsAt: '2026-09-20T23:59:00',
    note: 'Nazariy savollar. ID karta shart emas — test onlayn topshiriladi.',
    questions: [
      {
        id: 'q1',
        text: 'Python da ro‘yxat (list) qaysi qavslar bilan yoziladi?',
        options: [
          { id: 'a', label: '{ }' },
          { id: 'b', label: '[ ]' },
          { id: 'c', label: '( )' },
          { id: 'd', label: '< >' },
        ],
        answer: 'b',
      },
      {
        id: 'q2',
        text: 'Funksiya e’lon qilish uchun qaysi kalit so‘z ishlatiladi?',
        options: [
          { id: 'a', label: 'func' },
          { id: 'b', label: 'function' },
          { id: 'c', label: 'def' },
          { id: 'd', label: 'lambda' },
        ],
        answer: 'c',
      },
      {
        id: 'q3',
        text: '`2 ** 3` ifodasining natijasi nima?',
        options: [
          { id: 'a', label: '6' },
          { id: 'b', label: '8' },
          { id: 'c', label: '9' },
          { id: 'd', label: '5' },
        ],
        answer: 'b',
      },
      {
        id: 'q4',
        text: '`for x in range(3)` sikli necha marta bajariladi?',
        options: [
          { id: 'a', label: '2' },
          { id: 'b', label: '3' },
          { id: 'c', label: '4' },
          { id: 'd', label: 'Cheksiz' },
        ],
        answer: 'b',
      },
      {
        id: 'q5',
        text: 'Qaysi usul matnni katta harflarga o‘tkazadi?',
        options: [
          { id: 'a', label: 'upper()' },
          { id: 'b', label: 'title()' },
          { id: 'c', label: 'capitalize()' },
          { id: 'd', label: 'strip()' },
        ],
        answer: 'a',
      },
      {
        id: 'q6',
        text: 'Lug‘at (dict) kalitlari qanday bo‘lishi kerak?',
        options: [
          { id: 'a', label: 'Takrorlanishi mumkin' },
          { id: 'b', label: 'Faqat son' },
          { id: 'c', label: 'Unikal' },
          { id: 'd', label: 'Faqat satr' },
        ],
        answer: 'c',
      },
    ],
  },
  {
    id: 't2',
    subject: 'Chiziqli algebra',
    type: 'Oraliq nazorat',
    teacher: 'Malika Yusupova',
    room: 'B-101',
    semester: 6,
    durationMin: 25,
    maxScore: 100,
    startsAt: '2026-09-11T08:00:00',
    endsAt: '2026-09-25T23:59:00',
    note: 'Matritsalar va determinantlar. Kalkulyatordan foydalanish ruxsat etiladi.',
    questions: [
      {
        id: 'q1',
        text: 'Birlik matritsa determinantining qiymati nima?',
        options: [
          { id: 'a', label: '0' },
          { id: 'b', label: '1' },
          { id: 'c', label: '−1' },
          { id: 'd', label: 'n' },
        ],
        answer: 'b',
      },
      {
        id: 'q2',
        text: 'Matritsaning teskari matritsasi qachon mavjud?',
        options: [
          { id: 'a', label: 'det = 0 bo‘lsa' },
          { id: 'b', label: 'det ≠ 0 bo‘lsa' },
          { id: 'c', label: 'Faqat kvadrat bo‘lmasa' },
          { id: 'd', label: 'Har doim' },
        ],
        answer: 'b',
      },
      {
        id: 'q3',
        text: 'Nol matritsaning rangi (rank) nima?',
        options: [
          { id: 'a', label: '0' },
          { id: 'b', label: '1' },
          { id: 'c', label: 'Satrlari soni' },
          { id: 'd', label: 'Ustunlari soni' },
        ],
        answer: 'a',
      },
      {
        id: 'q4',
        text: '2×3 va 3×2 matritsalar ko‘paytmasi qanday o‘lchamda bo‘ladi?',
        options: [
          { id: 'a', label: '2×2' },
          { id: 'b', label: '3×3' },
          { id: 'c', label: '2×3' },
          { id: 'd', label: 'Ko‘paytirib bo‘lmaydi' },
        ],
        answer: 'a',
      },
      {
        id: 'q5',
        text: 'Chiziqli tizimning yagona yechimi qachon bo‘ladi?',
        options: [
          { id: 'a', label: 'det A = 0' },
          { id: 'b', label: 'det A ≠ 0' },
          { id: 'c', label: 'Erkin o‘zgaruvchi bor' },
          { id: 'd', label: 'Tenglamalar soni kam' },
        ],
        answer: 'b',
      },
    ],
  },
  {
    id: 't3',
    subject: 'Ma’lumotlar bazasi',
    type: 'Yakuniy',
    teacher: 'Jamshid Qodirov',
    room: 'C-12',
    semester: 6,
    durationMin: 30,
    maxScore: 100,
    startsAt: '2026-09-01T08:00:00',
    endsAt: '2026-09-08T18:00:00',
    note: 'ER model, SQL so‘rovlar va 3NF. Kompyuter sinfida o‘tkazilgan.',
    questions: [
      {
        id: 'q1',
        text: 'Jadvaldagi har bir qatorni unikal aniqlaydigan maydon nima?',
        options: [
          { id: 'a', label: 'Foreign key' },
          { id: 'b', label: 'Primary key' },
          { id: 'c', label: 'Index' },
          { id: 'd', label: 'View' },
        ],
        answer: 'b',
      },
      {
        id: 'q2',
        text: 'Ma’lumotlarni o‘qish uchun asosiy SQL buyrug‘i qaysi?',
        options: [
          { id: 'a', label: 'INSERT' },
          { id: 'b', label: 'UPDATE' },
          { id: 'c', label: 'SELECT' },
          { id: 'd', label: 'DELETE' },
        ],
        answer: 'c',
      },
      {
        id: 'q3',
        text: '3NF ning maqsadi nima?',
        options: [
          { id: 'a', label: 'Indekslarni o‘chirish' },
          { id: 'b', label: 'Takrorlanishni kamaytirish' },
          { id: 'c', label: 'Jadvalni kengaytirish' },
          { id: 'd', label: 'Backup olish' },
        ],
        answer: 'b',
      },
      {
        id: 'q4',
        text: 'Ikki jadvalni bog‘lash operatori qaysi?',
        options: [
          { id: 'a', label: 'JOIN' },
          { id: 'b', label: 'MERGE' },
          { id: 'c', label: 'LINK' },
          { id: 'd', label: 'BIND' },
        ],
        answer: 'a',
      },
      {
        id: 'q5',
        text: 'Boshqa jadvalning primary keyiga ishora qiluvchi maydon nima?',
        options: [
          { id: 'a', label: 'Candidate key' },
          { id: 'b', label: 'Foreign key' },
          { id: 'c', label: 'Surrogate key' },
          { id: 'd', label: 'Composite key' },
        ],
        answer: 'b',
      },
      {
        id: 'q6',
        text: 'SQL injeksiyasidan himoya qilishning asosiy usuli?',
        options: [
          { id: 'a', label: 'SELECT * ishlatish' },
          { id: 'b', label: 'Parametrli so‘rovlar' },
          { id: 'c', label: 'Jadval nomini yashirish' },
          { id: 'd', label: 'Faqat DELETE ni taqiqlash' },
        ],
        answer: 'b',
      },
    ],
    presetAttempt: {
      status: 'completed',
      answers: { q1: 'b', q2: 'c', q3: 'b', q4: 'a', q5: 'b', q6: 'a' },
      startedAt: '2026-09-08T13:00:00',
      submittedAt: '2026-09-08T13:24:00',
    },
  },
  {
    id: 't4',
    subject: 'Dasturlash texnologiyalari II',
    type: 'Joriy nazorat',
    teacher: 'Aziz Rahimov',
    room: 'A-110',
    semester: 6,
    durationMin: 20,
    maxScore: 100,
    startsAt: '2026-09-18T09:00:00',
    endsAt: '2026-09-22T23:59:00',
    note: 'OOP, GIT va testing asoslari bo‘yicha qisqa test.',
    questions: [
      {
        id: 'q1',
        text: 'OOP da inkapsulyatsiya nima beradi?',
        options: [
          { id: 'a', label: 'Kodni yashirish va himoya' },
          { id: 'b', label: 'Faqat meros' },
          { id: 'c', label: 'Faqat interfeys' },
          { id: 'd', label: 'Kompilyatsiya' },
        ],
        answer: 'a',
      },
      {
        id: 'q2',
        text: 'Git da o‘zgarishlarni saqlash buyrug‘i?',
        options: [
          { id: 'a', label: 'git push' },
          { id: 'b', label: 'git commit' },
          { id: 'c', label: 'git clone' },
          { id: 'd', label: 'git init' },
        ],
        answer: 'b',
      },
      {
        id: 'q3',
        text: 'Unit-test nima uchun yoziladi?',
        options: [
          { id: 'a', label: 'UI dizayn' },
          { id: 'b', label: 'Kichik birliklarni tekshirish' },
          { id: 'c', label: 'Serverni sozlash' },
          { id: 'd', label: 'Ma’lumotlar bazasini tozalash' },
        ],
        answer: 'b',
      },
      {
        id: 'q4',
        text: 'REST API da resursni yangilashning odatiy metodi?',
        options: [
          { id: 'a', label: 'GET' },
          { id: 'b', label: 'PUT / PATCH' },
          { id: 'c', label: 'HEAD' },
          { id: 'd', label: 'OPTIONS' },
        ],
        answer: 'b',
      },
    ],
  },
  {
    id: 't5',
    subject: 'Web dizayn asoslari',
    type: 'Oraliq nazorat',
    teacher: 'Aziz Rahimov',
    room: 'D-08',
    semester: 6,
    durationMin: 15,
    maxScore: 100,
    startsAt: '2026-09-01T08:00:00',
    endsAt: '2026-09-05T18:00:00',
    note: 'HTML/CSS asoslari. Muddat o‘tgan — test yopilgan.',
    questions: [
      {
        id: 'q1',
        text: 'HTML da sarlavha tegi qaysi?',
        options: [
          { id: 'a', label: '<head>' },
          { id: 'b', label: '<h1>' },
          { id: 'c', label: '<title>' },
          { id: 'd', label: '<p>' },
        ],
        answer: 'b',
      },
      {
        id: 'q2',
        text: 'Flexbox asosiy konteyner xossasi?',
        options: [
          { id: 'a', label: 'display: flex' },
          { id: 'b', label: 'position: relative' },
          { id: 'c', label: 'float: left' },
          { id: 'd', label: 'overflow: hidden' },
        ],
        answer: 'a',
      },
      {
        id: 'q3',
        text: 'CSS da class selektor qanday yoziladi?',
        options: [
          { id: 'a', label: '#box' },
          { id: 'b', label: '.box' },
          { id: 'c', label: 'box' },
          { id: 'd', label: '*box' },
        ],
        answer: 'b',
      },
    ],
    presetAttempt: {
      status: 'completed',
      answers: { q1: 'b', q2: 'a', q3: 'b' },
      startedAt: '2026-09-04T14:00:00',
      submittedAt: '2026-09-04T14:12:00',
    },
  },
  {
    id: 't6',
    subject: 'Ingliz tili II',
    type: 'Joriy nazorat',
    teacher: 'Malika Yusupova',
    room: 'E-03',
    semester: 6,
    durationMin: 20,
    maxScore: 100,
    startsAt: '2026-08-20T08:00:00',
    endsAt: '2026-08-28T18:00:00',
    note: 'Grammar and reading. Onlayn topshirilgan.',
    questions: [
      {
        id: 'q1',
        text: 'Choose the correct form: She ____ to the library every day.',
        options: [
          { id: 'a', label: 'go' },
          { id: 'b', label: 'goes' },
          { id: 'c', label: 'going' },
          { id: 'd', label: 'gone' },
        ],
        answer: 'b',
      },
      {
        id: 'q2',
        text: 'Which word is a synonym of “rapid”?',
        options: [
          { id: 'a', label: 'slow' },
          { id: 'b', label: 'fast' },
          { id: 'c', label: 'late' },
          { id: 'd', label: 'quiet' },
        ],
        answer: 'b',
      },
      {
        id: 'q3',
        text: 'Past simple of “write” is:',
        options: [
          { id: 'a', label: 'writed' },
          { id: 'b', label: 'written' },
          { id: 'c', label: 'wrote' },
          { id: 'd', label: 'writes' },
        ],
        answer: 'c',
      },
      {
        id: 'q4',
        text: '“There are ____ books on the table.”',
        options: [
          { id: 'a', label: 'much' },
          { id: 'b', label: 'a' },
          { id: 'c', label: 'many' },
          { id: 'd', label: 'any' },
        ],
        answer: 'c',
      },
      {
        id: 'q5',
        text: 'Choose the correct article: ____ university',
        options: [
          { id: 'a', label: 'a' },
          { id: 'b', label: 'an' },
          { id: 'c', label: 'the only' },
          { id: 'd', label: '—' },
        ],
        answer: 'a',
      },
    ],
    presetAttempt: {
      status: 'completed',
      answers: { q1: 'b', q2: 'b', q3: 'c', q4: 'a', q5: 'a' },
      startedAt: '2026-08-27T10:05:00',
      submittedAt: '2026-08-27T10:18:00',
    },
  },
  {
    id: 't7',
    subject: 'Oliy matematika II',
    type: 'Oraliq nazorat',
    teacher: 'Malika Yusupova',
    room: 'B-210',
    semester: 6,
    durationMin: 30,
    maxScore: 100,
    startsAt: '2026-08-10T08:00:00',
    endsAt: '2026-08-18T18:00:00',
    note: 'Integrallar va qatorlar. Yakunlangan test.',
    questions: [
      {
        id: 'q1',
        text: '∫ x dx integrali nima?',
        options: [
          { id: 'a', label: 'x² / 2 + C' },
          { id: 'b', label: 'x + C' },
          { id: 'c', label: '1/x + C' },
          { id: 'd', label: 'ln x + C' },
        ],
        answer: 'a',
      },
      {
        id: 'q2',
        text: 'Hosila (derivative) nima o‘lchaydi?',
        options: [
          { id: 'a', label: 'Yuza' },
          { id: 'b', label: 'O‘zgarish tezligi' },
          { id: 'c', label: 'Hajm' },
          { id: 'd', label: 'O‘rtacha qiymat' },
        ],
        answer: 'b',
      },
      {
        id: 'q3',
        text: 'e^0 ning qiymati?',
        options: [
          { id: 'a', label: '0' },
          { id: 'b', label: '1' },
          { id: 'c', label: 'e' },
          { id: 'd', label: '−1' },
        ],
        answer: 'b',
      },
      {
        id: 'q4',
        text: 'Qator ∑ 1/n² qanday qator?',
        options: [
          { id: 'a', label: 'Divergent' },
          { id: 'b', label: 'Yig‘iluvchi (p=2)' },
          { id: 'c', label: 'Harmonik divergent' },
          { id: 'd', label: 'Geometrik' },
        ],
        answer: 'b',
      },
      {
        id: 'q5',
        text: 'lim x→0 (sin x / x) qiymati?',
        options: [
          { id: 'a', label: '0' },
          { id: 'b', label: '∞' },
          { id: 'c', label: '1' },
          { id: 'd', label: '−1' },
        ],
        answer: 'c',
      },
    ],
    presetAttempt: {
      status: 'completed',
      answers: { q1: 'a', q2: 'a', q3: 'b', q4: 'c', q5: 'c' },
      startedAt: '2026-08-16T11:00:00',
      submittedAt: '2026-08-16T11:22:00',
    },
  },
]

export function findTest(id) {
  return TESTS.find((t) => t.id === id)
}

export function formatExamDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

export function formatExamDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDuration(min) {
  if (!min) return '—'
  if (min < 60) return `${min} daqiqa`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} soat ${m} daq` : `${h} soat`
}

export function formatMmSs(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function gradeFromPercent(percent) {
  const p = Number(percent) || 0
  if (p >= 86) return { label: 'A’lo', tone: 'green', mark: 5 }
  if (p >= 71) return { label: 'Yaxshi', tone: 'blue', mark: 4 }
  if (p >= 56) return { label: 'Qoniqarli', tone: 'amber', mark: 3 }
  return { label: 'Qoniqarsiz', tone: 'red', mark: 2 }
}

export function scoreAnswers(test, answers = {}) {
  const questions = test?.questions || []
  let correct = 0
  let answered = 0
  questions.forEach((q) => {
    if (answers[q.id]) answered += 1
    if (answers[q.id] === q.answer) correct += 1
  })
  const total = questions.length
  const percent = total ? Math.round((correct / total) * 100) : 0
  return {
    correct,
    wrong: answered - correct,
    skipped: total - answered,
    total,
    percent,
    passed: percent >= 56,
    grade: gradeFromPercent(percent),
  }
}

export function remainingMs(test, attempt, now = Date.now()) {
  if (!attempt?.startedAt) return (test.durationMin || 0) * 60 * 1000
  const started = new Date(attempt.startedAt).getTime()
  const durationEnd = started + (test.durationMin || 0) * 60 * 1000
  const windowEnd = new Date(test.endsAt).getTime()
  return Math.max(0, Math.min(durationEnd, windowEnd) - now)
}

export function getAttempt(test, storeAttempts, userId) {
  const mine = (storeAttempts || []).find((a) => a.testId === test.id && a.userId === userId)
  if (mine) return mine
  if (test.presetAttempt) {
    return { ...test.presetAttempt, testId: test.id, userId, preset: true }
  }
  return null
}

export function resolveTestStatus(test, attempt, now = new Date()) {
  if (attempt?.status === 'completed') return 'completed'
  const start = new Date(test.startsAt)
  const end = new Date(test.endsAt)
  if (now < start) return 'upcoming'
  if (now > end) return 'closed'
  if (attempt?.status === 'in_progress') return 'in_progress'
  return 'open'
}

export const STATUS_META = {
  open: { label: 'Faol', tone: 'blue' },
  in_progress: { label: 'Davom etmoqda', tone: 'amber' },
  completed: { label: 'Yakunlangan', tone: 'green' },
  upcoming: { label: 'Kutilmoqda', tone: 'slate' },
  closed: { label: 'Muddat o‘tgan', tone: 'red' },
}

export const TYPE_TONE = {
  'Joriy nazorat': 'blue',
  'Oraliq nazorat': 'amber',
  Yakuniy: 'green',
}
