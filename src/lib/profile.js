const FEMALE_NAMES = new Set([
  'Dilnoza',
  'Madina',
  'Nilufar',
  'Zarina',
  'Sevinch',
  'Nodira',
  'Malika',
])

const FATHER_NAMES = [
  'Ikromjon',
  'Karimjon',
  'Abdulla',
  'Rustam',
  'Olimjon',
  'Sherzod',
  'Jamshid',
  'Anvar',
  'Bekzod',
  'Sardor',
]

const FACULTY_META = {
  'Axborot texnologiyalari': {
    faculty: 'Axborot texnologiyalari fakulteti',
    specialty: 'Kompyuter ilmlari va dasturlash texnologiyalari (yo‘nalishlar bo‘yicha)',
  },
  Iqtisodiyot: {
    faculty: 'Iqtisodiyot fakulteti',
    specialty: 'Iqtisodiyot (tarmoqlar va sohalar bo‘yicha)',
  },
}

export const UNIVERSITY = 'tizimsEdu oliy ta’lim muassasasi'

function hash32(value) {
  let h = 2166136261
  for (const ch of String(value || '')) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function inferGender(name) {
  const first = String(name || '')
    .trim()
    .split(/\s+/)[0]
  return FEMALE_NAMES.has(first) ? 'female' : 'male'
}

function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 3) return { firstName: parts[0], lastName: parts[1], rest: parts.slice(2).join(' ') }
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1], rest: '' }
  return { firstName: parts[0] || '', lastName: '', rest: '' }
}

function birthDateFrom(id, course = 3) {
  const h = hash32(id)
  const year = 2008 - Number(course || 3)
  const month = String((h % 12) + 1).padStart(2, '0')
  const day = String((h % 27) + 1).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function pinflFrom({ id, gender, birthDate }) {
  const g = gender === 'female' ? '6' : '5'
  const [year, month, day] = String(birthDate).split('-')
  const serial = String(hash32(id) % 10_000_000).padStart(7, '0')
  return `${g}${day}${month}${String(year).slice(-2)}${serial}`
}

function passportFrom(id) {
  const n = String(hash32(`${id}-pass`) % 10_000_000).padStart(7, '0')
  return `AA ${n}`
}

export function formatDateUz(iso) {
  if (!iso) return '—'
  const [y, m, d] = String(iso).slice(0, 10).split('-')
  if (!y || !m || !d) return iso
  return `${d}.${m}.${y}`
}

export function profileOf(me, group) {
  const gender = me?.gender || inferGender(me?.name)
  const parsed = splitName(me?.name)
  const firstName = me?.firstName || parsed.firstName
  const lastName = me?.lastName || parsed.lastName
  const middleName = me?.middleName || FATHER_NAMES[hash32(me?.id) % FATHER_NAMES.length]
  const course = group?.course || (me?.role === 'student' ? 1 : null)
  const birthDate = me?.birthDate || birthDateFrom(me?.id, course || 3)
  const pinfl = me?.pinfl || pinflFrom({ id: me?.id, gender, birthDate })
  const meta = FACULTY_META[group?.faculty] || {
    faculty: group?.faculty ? `${group.faculty} fakulteti` : '—',
    specialty: group?.faculty || '—',
  }
  const suffix = gender === 'female' ? 'QIZI' : 'O‘G‘LI'
  const officialName = [lastName, firstName, middleName, me?.role === 'student' ? suffix : '']
    .filter(Boolean)
    .join(' ')
    .toUpperCase()

  return {
    firstName,
    lastName,
    middleName,
    gender,
    genderLabel: gender === 'female' ? 'Ayol' : 'Erkak',
    birthDate,
    nationality: me?.nationality || 'O‘zbek',
    citizenship: me?.citizenship || 'O‘zbekiston',
    pinfl,
    passport: me?.passport || passportFrom(me?.id),
    address: me?.address || 'Toshkent shahar, Yunusobod tumani',
    region: me?.region || 'Toshkent shahri',
    district: me?.district || 'Yunusobod tumani',
    course,
    groupName: group?.name || '',
    faculty: meta.faculty,
    specialty: meta.specialty,
    university: UNIVERSITY,
    studentId: me?.studentId || me?.id || '—',
    officialName,
    photo: me?.photo || '',
  }
}
