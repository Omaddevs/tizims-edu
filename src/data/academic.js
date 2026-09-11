export const SEMESTER_META = [
  { id: 1, range: '4-sen, 2023 › 30-dek, 2023' },
  { id: 2, range: '8-yan, 2024 › 20-iyul, 2024' },
  { id: 3, range: '9-sen, 2024 › 5-apr, 2025' },
  { id: 4, range: '10-fev, 2025 › 26-iyul, 2025' },
  { id: 5, range: '8-sen, 2025 › 14-fev, 2026' },
  { id: 6, range: '16-fev, 2026 › 25-iyul, 2026' },
  { id: 7, range: '1-sen, 2026 › 15-fev, 2027' },
  { id: 8, range: '16-fev, 2027 › 25-iyul, 2027' },
]

const IT_PAST = {
  1: [
    { name: 'Informatika va axborot texnologiyalari', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Oliy matematika I', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Ingliz tili I', type: 'Majburiy', hours: 120, credit: 4 },
    { name: 'O‘zbekiston tarixi', type: 'Majburiy', hours: 90, credit: 3 },
    { name: 'Jismoniy tarbiya', type: 'Majburiy', hours: 60, credit: 2 },
  ],
  2: [
    { name: 'Oliy matematika II', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Dasturlash asoslari', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Ingliz tili II', type: 'Majburiy', hours: 120, credit: 4 },
    { name: 'Falsafa', type: 'Majburiy', hours: 90, credit: 3 },
    { name: 'Kompyuter tarmoqlari asoslari', type: 'Tanlov', hours: 120, credit: 4 },
  ],
  3: [
    { name: 'Diskret matematika va matematik mantiq I', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Dasturlash texnologiyalari I', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Operatsion tizimlar', type: 'Majburiy', hours: 150, credit: 5 },
    { name: 'Ma’lumotlar tuzilmasi', type: 'Majburiy', hours: 150, credit: 5 },
    { name: 'Web dizayn asoslari', type: 'Tanlov', hours: 90, credit: 3 },
  ],
  4: [
    { name: 'Diskret matematika va matematik mantiq II', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Java texnologiyalari', type: 'Tanlov', hours: 120, credit: 4 },
    { name: 'Tizimli dasturlash I', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Ma’lumotlar bazasi', type: 'Majburiy', hours: 150, credit: 5 },
    { name: 'Kompyuter grafikasi', type: 'Tanlov', hours: 90, credit: 3 },
  ],
  5: [
    { name: 'Dasturlash texnologiyalari II', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Sun’iy intellekt asoslari', type: 'Majburiy', hours: 150, credit: 5 },
    { name: 'Kiberxavfsizlik', type: 'Majburiy', hours: 120, credit: 4 },
    { name: 'Loyiha boshqaruvi', type: 'Tanlov', hours: 90, credit: 3 },
    { name: 'Mobil ilovalar', type: 'Tanlov', hours: 120, credit: 4 },
  ],
}

const ECO_PAST = {
  1: [
    { name: 'Iqtisodiyot nazariyasi', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Oliy matematika I', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Ingliz tili I', type: 'Majburiy', hours: 120, credit: 4 },
    { name: 'O‘zbekiston tarixi', type: 'Majburiy', hours: 90, credit: 3 },
    { name: 'Jismoniy tarbiya', type: 'Majburiy', hours: 60, credit: 2 },
  ],
  2: [
    { name: 'Mikroiqtisodiyot', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Statistika', type: 'Majburiy', hours: 150, credit: 5 },
    { name: 'Ingliz tili II', type: 'Majburiy', hours: 120, credit: 4 },
    { name: 'Falsafa', type: 'Majburiy', hours: 90, credit: 3 },
    { name: 'Moliya asoslari', type: 'Tanlov', hours: 120, credit: 4 },
  ],
  3: [
    { name: 'Makroiqtisodiyot', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Buxgalteriya hisobi', type: 'Majburiy', hours: 180, credit: 6 },
    { name: 'Ekonometrika', type: 'Majburiy', hours: 150, credit: 5 },
    { name: 'Menejment', type: 'Majburiy', hours: 120, credit: 4 },
    { name: 'Marketing', type: 'Tanlov', hours: 90, credit: 3 },
  ],
}

function hashStr(s) {
  let h = 0
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

export function subjectScores(name, seed = '') {
  const h = hashStr(`${name}|${seed}`)
  const joriy = 15 + (h % 12)
  const oraliq = 12 + ((h >>> 4) % 8)
  const yakuniy = 32 + ((h >>> 8) % 16)
  const total = joriy + oraliq + yakuniy
  return { joriy, joriyMax: 30, oraliq, oraliqMax: 20, yakuniy, yakuniyMax: 50, total, totalMax: 100 }
}

function uniqueScheduleSubjects(schedule, groupId) {
  const rows = []
  for (const s of schedule.filter((x) => x.groupId === groupId)) {
    if (rows.some((r) => r.name === s.subject)) continue
    rows.push({
      name: s.subject,
      type: s.type === 'tanlov' ? 'Tanlov' : 'Majburiy',
      hours: s.hours || 120,
      credit: s.credit || 4,
    })
  }
  return rows
}

export function academicSemesters({ group, schedule, studentId }) {
  const course = group?.course || 1
  const maxSem = Math.min(8, course * 2)
  const catalog = String(group?.faculty || '').toLowerCase().includes('iqtisod') ? ECO_PAST : IT_PAST
  const current = uniqueScheduleSubjects(schedule || [], group?.id)

  return SEMESTER_META.filter((s) => s.id <= maxSem).map((meta) => {
    const subjects = meta.id === maxSem && current.length ? current : catalog[meta.id] || current
    return {
      ...meta,
      subjects: subjects.map((sub) => ({
        ...sub,
        scores: subjectScores(sub.name, `${studentId || 'anon'}-${meta.id}`),
      })),
    }
  })
}

export function gpaFromSubjects(subjects) {
  const credits = subjects.reduce((n, s) => n + Number(s.credit || 0), 0)
  if (!credits) return { gpa: 0, credits: 0, debt: 0, total: 0 }
  const points = subjects.reduce((n, s) => n + ((s.scores?.total || 0) / 100) * 4 * Number(s.credit || 0), 0)
  const debt = subjects.filter((s) => (s.scores?.total || 0) < 60).length
  return { gpa: points / credits, credits, debt, total: subjects.length }
}

export function gpaRows(semesters) {
  const byYear = new Map()
  for (const sem of semesters) {
    const yearIndex = Math.ceil(sem.id / 2)
    const start = 2022 + yearIndex
    const key = `${start}-${start + 1}`
    if (!byYear.has(key)) byYear.set(key, { year: key, course: yearIndex, subjects: [] })
    byYear.get(key).subjects.push(...sem.subjects)
  }
  const years = [...byYear.values()].sort((a, b) => b.year.localeCompare(a.year))
  return years.map((y, i) => {
    const stats = gpaFromSubjects(y.subjects)
    return {
      year: y.year,
      course: y.course,
      gpa: stats.gpa,
      credits: stats.credits,
      debt: stats.debt,
      total: stats.total,
      method: i === 0 ? 'Umumiy GPA' : 'Yillik GPA',
    }
  })
}
