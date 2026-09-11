export const SURVEYS = [
  {
    id: 'sv1',
    title: 'Oliy ta’lim muassasasida ta’lim sifati va boshqaruv tizimidan talabalar qoniqish darajasini baholash',
    endsAt: '2026-07-31T15:47:00',
    questions: [
      {
        id: 'q1',
        text: 'O‘quv dasturlari va fanlar mazmuni sizning kutganingizga qanchalik mos?',
      },
      {
        id: 'q2',
        text: 'O‘qituvchilarning dars o‘tish uslubi va tushuntirishini qanday baholaysiz?',
      },
      {
        id: 'q3',
        text: 'O‘quv jarayonini tashkil etish (jadval, auditoriya, materiallar) qanchalik qulay?',
      },
      {
        id: 'q4',
        text: 'Ma’muriyat va dekanatning talabalarga munosabatini qanday baholaysiz?',
      },
      {
        id: 'q5',
        text: 'Umumiy ta’lim sifatidan qoniqish darajangiz?',
      },
    ],
  },
  {
    id: 'sv2',
    title: 'Kutubxona va raqamli resurslardan foydalanish bo‘yicha so‘rovnoma',
    endsAt: '2026-09-20T18:00:00',
    questions: [
      {
        id: 'q1',
        text: 'Elektron kutubxonadagi adabiyotlar yetarlimi?',
      },
      {
        id: 'q2',
        text: 'Kitob bron qilish va o‘qish jarayoni qulaymi?',
      },
      {
        id: 'q3',
        text: 'Kutubxona xizmatidan umumiy qoniqish darajangiz?',
      },
    ],
  },
  {
    id: 'sv3',
    title: 'Talaba yotoqxonasi va ijtimoiy sharoitlar bo‘yicha so‘rovnoma',
    endsAt: '2026-06-15T12:00:00',
    questions: [
      {
        id: 'q1',
        text: 'Yashash sharoitlari (xona, tozalik, internet) qanchalik qoniqarli?',
      },
      {
        id: 'q2',
        text: 'Ovqatlanish va maishiy xizmatlarni qanday baholaysiz?',
      },
      {
        id: 'q3',
        text: 'Ijtimoiy muhit va xavfsizlik darajasi?',
      },
    ],
  },
]

export const SURVEY_SCALE = [
  { value: '1', label: 'Juda past' },
  { value: '2', label: 'Past' },
  { value: '3', label: 'O‘rtacha' },
  { value: '4', label: 'Yaxshi' },
  { value: '5', label: 'A’lo' },
]

export function formatSurveyDeadline(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function surveyColumn(response) {
  if (!response) return 'not_started'
  if (response.status === 'completed') return 'completed'
  return 'in_progress'
}
