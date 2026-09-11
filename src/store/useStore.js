import { persist } from 'zustand/middleware'
import { create } from 'zustand'
import { seed } from '../data/seed'
import { nextStudentId, uid } from '../lib/utils'

const DATA_KEYS = [
  'users',
  'groups',
  'schedule',
  'attendance',
  'assignments',
  'books',
  'announcements',
  'vacancies',
  'posts',
  'complaints',
  'tickets',
  'notifications',
  'surveyResponses',
  'currentUserId',
]

const notify = (set, get, payload) => {
  const actor = get().users.find((u) => u.id === get().currentUserId)
  const item = {
    id: uid('n'),
    read: false,
    createdAt: new Date().toISOString(),
    folder: 'inbox',
    from: actor?.role === 'super_admin' ? 'Super Admin' : actor?.name || 'Super Admin',
    fromId: actor?.id || 'u_admin',
    type: 'system',
    ...payload,
  }
  set({ notifications: [item, ...get().notifications] })
}

export const useStore = create(
  persist(
    (set, get) => ({
      ...seed,
      currentUserId: null,

      login: (identity, password) => {
        const q = String(identity || '')
          .trim()
          .toLowerCase()
        const user = get().users.find((u) => {
          if (u.password !== password) return false
          if (u.email.toLowerCase() === q) return true
          if (u.studentId && u.studentId.toLowerCase() === q) return true
          return false
        })
        if (!user) return { ok: false, error: 'ID yoki parol noto‘g‘ri' }
        if (user.blocked) return { ok: false, error: 'Hisobingiz bloklangan. Super Admin bilan bog‘laning.' }
        set({ currentUserId: user.id })
        return { ok: true, user }
      },

      logout: () => set({ currentUserId: null }),

      register: ({ name, email, phone, password, role, groupId }) => {
        const users = get().users
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: 'Bu email allaqachon ro‘yxatdan o‘tgan' }
        }
        if (users.some((u) => u.phone.replace(/\s/g, '') === phone.replace(/\s/g, ''))) {
          return { ok: false, error: 'Bu telefon raqam allaqachon ishlatilgan' }
        }
        const safeRole = role === 'teacher' ? 'teacher' : 'student'
        const user = {
          id: uid('u'),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role: safeRole,
          blocked: false,
          createdAt: new Date().toISOString(),
          avatarColor: '#147a36',
          ...(safeRole === 'student'
            ? { studentId: nextStudentId(users), groupId: groupId || get().groups[0]?.id }
            : { subject: 'Umumiy', groupIds: get().groups.map((g) => g.id).slice(0, 2) }),
        }
        set({ users: [...users, user], currentUserId: user.id })
        notify(set, get, {
          userId: 'u_admin',
          title: 'Yangi foydalanuvchi',
          body: `${user.name} ${safeRole === 'student' ? 'talaba' : 'o‘qituvchi'} sifatida ro‘yxatdan o‘tdi.`,
          type: 'user',
        })
        return { ok: true, user }
      },

      markAttendance: ({ studentId, groupId, status, comment, subject, date: dateArg }) => {
        const me = get().users.find((u) => u.id === get().currentUserId)
        const date = dateArg || new Date().toISOString().slice(0, 10)
        const time = status === 'absent' ? '' : new Date().toTimeString().slice(0, 5)
        const records = get().attendance.filter(
          (r) => !(r.studentId === studentId && r.date === date && r.subject === subject),
        )
        const rec = {
          id: uid('a'),
          studentId,
          groupId,
          date,
          subject: subject || 'Dars',
          status,
          time,
          comment: comment || '',
          teacherId: me?.id,
        }
        set({ attendance: [rec, ...records] })
        if (status === 'late' && comment) {
          notify(set, get, {
            userId: 'u_admin',
            title: 'Kechikish izohi',
            body: `${get().users.find((u) => u.id === studentId)?.name}: ${comment}`,
            type: 'attendance',
          })
        }
        return rec
      },

      setUserBlocked: (userId, blocked) => {
        set({
          users: get().users.map((u) => (u.id === userId ? { ...u, blocked } : u)),
        })
        notify(set, get, {
          userId,
          title: blocked ? 'Hisob bloklandi' : 'Hisob ochildi',
          body: blocked
            ? 'Super Admin hisobingizni vaqtincha blokladi.'
            : 'Hisobingiz qayta faollashtirildi.',
          type: 'account',
        })
      },

      upsertUser: (user) => {
        const users = get().users
        const exists = users.some((u) => u.id === user.id)
        if (exists) set({ users: users.map((u) => (u.id === user.id ? { ...u, ...user } : u)) })
        else {
          const next = { ...user, id: user.id || uid('u') }
          if (next.role === 'student' && !next.studentId) next.studentId = nextStudentId(users)
          set({ users: [...users, next] })
        }
      },

      addGroup: (group) => set({ groups: [...get().groups, { id: uid('g'), ...group }] }),

      addSchedule: (payload) => {
        const item = { id: uid('sch'), room: '', date: '', weekday: 1, ...payload }
        set({ schedule: [item, ...get().schedule] })
        return item
      },

      updateSchedule: (id, payload) =>
        set({
          schedule: get().schedule.map((s) => (s.id === id ? { ...s, ...payload } : s)),
        }),

      removeSchedule: (id) => set({ schedule: get().schedule.filter((s) => s.id !== id) }),

      addAssignment: (payload) => {
        const item = {
          id: uid('as'),
          submissions: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          teacherId: get().currentUserId,
          ...payload,
        }
        set({ assignments: [item, ...get().assignments] })
        get()
          .users.filter((u) => u.role === 'student' && u.groupId === item.groupId)
          .forEach((s) =>
            notify(set, get, {
              userId: s.id,
              title: 'Yangi topshiriq',
              body: item.title,
              type: 'assignment',
            }),
          )
        return item
      },

      submitAssignment: (assignmentId, fileName) => {
        const meId = get().currentUserId
        set({
          assignments: get().assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  submissions: [
                    ...a.submissions.filter((s) => s.studentId !== meId),
                    { studentId: meId, submittedAt: new Date().toISOString(), fileName },
                  ],
                }
              : a,
          ),
        })
      },

      addBook: (payload) => {
        const item = {
          id: uid('b'),
          views: 0,
          createdAt: new Date().toISOString(),
          uploadedBy: get().currentUserId,
          pages: payload.pages || [{ title: payload.title, body: payload.description || 'PDF yuklandi.' }],
          ...payload,
        }
        set({ books: [item, ...get().books] })
        get()
          .users.filter((u) => u.role === 'student')
          .forEach((s) =>
            notify(set, get, {
              userId: s.id,
              title: 'Yangi kitob',
              body: `${item.title} kutubxonaga qo‘shildi.`,
              type: 'library',
            }),
          )
        return item
      },

      bumpViews: (collection, id) => {
        set({
          [collection]: get()[collection].map((item) => (item.id === id ? { ...item, views: (item.views || 0) + 1 } : item)),
        })
      },

      addAnnouncement: (payload) => {
        const item = {
          id: uid('an'),
          views: 0,
          createdAt: new Date().toISOString(),
          authorId: get().currentUserId,
          ...payload,
        }
        set({ announcements: [item, ...get().announcements] })
        get()
          .users.filter((u) => u.id !== get().currentUserId)
          .forEach((u) =>
            notify(set, get, {
              userId: u.id,
              title: 'E’lon',
              body: item.title,
              type: 'announcement',
            }),
          )
        return item
      },

      addVacancy: (payload) => {
        const item = {
          id: uid('v'),
          views: 0,
          createdAt: new Date().toISOString(),
          authorId: get().currentUserId,
          ...payload,
        }
        set({ vacancies: [item, ...get().vacancies] })
        return item
      },

      addPost: (payload) => {
        const item = {
          id: uid('p'),
          views: 0,
          createdAt: new Date().toISOString(),
          authorId: get().currentUserId,
          ...payload,
        }
        set({ posts: [item, ...get().posts] })
        return item
      },

      addComplaint: ({ teacherId, subject, body }) => {
        const me = get().users.find((u) => u.id === get().currentUserId)
        const item = {
          id: uid('c'),
          studentId: me.id,
          teacherId,
          subject,
          body,
          status: 'new',
          adminNote: '',
          createdAt: new Date().toISOString(),
        }
        set({ complaints: [item, ...get().complaints] })
        notify(set, get, {
          userId: 'u_admin',
          title: 'Yangi shikoyat',
          body: `${me.name}: ${subject}`,
          type: 'complaint',
        })
        notify(set, get, {
          userId: me.id,
          title: 'Shikoyat qabul qilindi',
          body: `${subject} — holat: Yangi.`,
          type: 'complaint',
        })
        return item
      },

      updateComplaint: (id, { status, adminNote }) => {
        const prev = get().complaints.find((c) => c.id === id)
        set({
          complaints: get().complaints.map((c) => (c.id === id ? { ...c, status, adminNote } : c)),
        })
        if (prev) {
          const statusLabel = { new: 'Yangi', review: 'Ko‘rib chiqilmoqda', resolved: 'Muammo hal bo‘ldi' }[status]
          notify(set, get, {
            userId: prev.studentId,
            title: 'Shikoyat holati yangilandi',
            body: `${prev.subject}: ${statusLabel}${adminNote ? `. ${adminNote}` : ''}`,
            type: 'complaint',
          })
        }
      },

      addTicket: ({ subject, text, attachments = [], channel = 'ticket' }) => {
        const me = get().users.find((u) => u.id === get().currentUserId)
        const item = {
          id: uid('tck'),
          userId: me.id,
          subject,
          status: 'open',
          channel,
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: uid('m'),
              userId: me.id,
              text,
              attachments,
              createdAt: new Date().toISOString(),
            },
          ],
        }
        set({ tickets: [item, ...get().tickets] })
        notify(set, get, {
          userId: 'u_admin',
          title: 'Support',
          body: `${me.name}: ${subject}`,
          type: 'support',
        })
        return item
      },

      ensureSupportChat: () => {
        const me = get().users.find((u) => u.id === get().currentUserId)
        if (!me) return null
        const existing = get().tickets.find((t) => t.userId === me.id && t.channel === 'chat' && t.status !== 'closed')
        if (existing) return existing
        const item = {
          id: uid('tck'),
          userId: me.id,
          subject: 'Support',
          status: 'open',
          channel: 'chat',
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: uid('m'),
              userId: 'u_admin',
              text: 'Assalomu alaykum! Support xizmatiga xush kelibsiz. Xabar, rasm yoki fayl yuborishingiz mumkin.',
              attachments: [],
              createdAt: new Date().toISOString(),
            },
          ],
        }
        set({ tickets: [item, ...get().tickets] })
        return item
      },

      replyTicket: (ticketId, payload) => {
        const me = get().users.find((u) => u.id === get().currentUserId)
        const text = typeof payload === 'string' ? payload : payload?.text || ''
        const attachments = typeof payload === 'string' ? [] : payload?.attachments || []
        const asUserId = typeof payload === 'string' ? undefined : payload?.asUserId
        const sender = asUserId ? get().users.find((u) => u.id === asUserId) : me
        if (!sender) return
        if (!String(text).trim() && !attachments.length) return
        set({
          tickets: get().tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    {
                      id: uid('m'),
                      userId: sender.id,
                      text,
                      attachments,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : t,
          ),
        })
        const ticket = get().tickets.find((t) => t.id === ticketId)
        const preview = text || attachments.map((f) => f.name).join(', ')
        if (ticket && sender.role === 'super_admin') {
          if (asUserId) return
          notify(set, get, {
            userId: ticket.userId,
            title: 'Support javobi',
            body: preview,
            type: 'support',
          })
        } else if (ticket) {
          notify(set, get, {
            userId: 'u_admin',
            title: 'Support xabari',
            body: `${sender.name}: ${preview}`,
            type: 'support',
          })
        }
      },

      markNotifRead: (id) =>
        set({
          notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }),

      markAllRead: (userId) =>
        set({
          notifications: get().notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
        }),

      sendMessage: ({ toUserId, title, body, draftId }) => {
        const me = get().users.find((u) => u.id === get().currentUserId)
        if (!me) return { ok: false, error: 'Kirish talab qilinadi' }
        const users = get().users
        const targets =
          toUserId === '__all_students__'
            ? users.filter((u) => u.role === 'student' && u.id !== me.id)
            : users.filter((u) => u.id === toUserId)
        if (!targets.length) return { ok: false, error: 'Qabul qiluvchi tanlanmagan' }

        const fromLabel = me.role === 'super_admin' ? 'Super Admin' : me.name
        const now = new Date().toISOString()
        let list = get().notifications
        if (draftId) list = list.filter((n) => n.id !== draftId)

        const inboxItems = targets.map((target) => ({
          id: uid('n'),
          userId: target.id,
          title: title.trim(),
          body: body.trim(),
          read: false,
          type: 'message',
          from: fromLabel,
          fromId: me.id,
          toId: target.id,
          toName: target.role === 'super_admin' ? 'Super Admin' : target.name,
          folder: 'inbox',
          createdAt: now,
        }))

        const sent = {
          id: uid('n'),
          userId: me.id,
          title: title.trim(),
          body: body.trim(),
          read: true,
          type: 'message',
          from: fromLabel,
          fromId: me.id,
          toId: targets.length === 1 ? targets[0].id : '__all_students__',
          toName:
            targets.length === 1
              ? targets[0].role === 'super_admin'
                ? 'Super Admin'
                : targets[0].name
              : `Barcha talabalar (${targets.length})`,
          folder: 'sent',
          createdAt: now,
        }

        set({ notifications: [...inboxItems, sent, ...list] })
        return { ok: true }
      },

      saveDraft: ({ toUserId, toName, title, body, draftId }) => {
        const me = get().users.find((u) => u.id === get().currentUserId)
        if (!me) return null
        const item = {
          id: draftId || uid('n'),
          userId: me.id,
          title: (title || '').trim() || 'Mavzusiz',
          body: (body || '').trim(),
          read: true,
          type: 'message',
          from: me.role === 'super_admin' ? 'Super Admin' : me.name,
          fromId: me.id,
          toId: toUserId || '',
          toName: toName || '',
          folder: 'draft',
          createdAt: new Date().toISOString(),
        }
        set({ notifications: [item, ...get().notifications.filter((n) => n.id !== item.id)] })
        return item
      },

      moveNotif: (id, folder) =>
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, prevFolder: n.folder, folder } : n,
          ),
        }),

      removeNotif: (id) =>
        set({
          notifications: get().notifications.filter((n) => n.id !== id),
        }),

      saveSurveyDraft: (surveyId, answers) => {
        const meId = get().currentUserId
        const prev = (get().surveyResponses || []).find((r) => r.surveyId === surveyId && r.userId === meId)
        if (prev?.status === 'completed') return
        const rest = (get().surveyResponses || []).filter((r) => !(r.surveyId === surveyId && r.userId === meId))
        set({
          surveyResponses: [
            {
              id: uid('sr'),
              surveyId,
              userId: meId,
              status: 'in_progress',
              answers: { ...answers },
              updatedAt: new Date().toISOString(),
            },
            ...rest,
          ],
        })
      },

      submitSurvey: (surveyId, answers) => {
        const meId = get().currentUserId
        const rest = (get().surveyResponses || []).filter((r) => !(r.surveyId === surveyId && r.userId === meId))
        set({
          surveyResponses: [
            {
              id: uid('sr'),
              surveyId,
              userId: meId,
              status: 'completed',
              answers: { ...answers },
              updatedAt: new Date().toISOString(),
            },
            ...rest,
          ],
        })
      },

      resetDemo: () => set({ ...seed, currentUserId: null }),
    }),
    {
      name: 'tizimsedu-db-v3',
      version: 6,
      migrate: (persisted, version) => {
        let next = persisted
        if (version < 4) next = { ...next, books: seed.books }
        if (version < 5) next = { ...next, surveyResponses: next.surveyResponses || [] }
        if (version < 6) {
          const existing = Array.isArray(next.notifications) ? next.notifications : []
          const ids = new Set(existing.map((n) => n.id))
          const extras = seed.notifications.filter((n) => !ids.has(n.id))
          next = {
            ...next,
            notifications: [
              ...existing.map((n) => ({
                ...n,
                folder: n.folder || 'inbox',
                from: n.from || 'Super Admin',
                fromId: n.fromId || 'u_admin',
              })),
              ...extras,
            ],
          }
        }
        return next
      },
      partialize: (state) => Object.fromEntries(DATA_KEYS.map((k) => [k, state[k]])),
    },
  ),
)

export function useCurrentUser() {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId) || null)
}
