import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { makeGroups, makeTeachers, makeSubjects, DEMO_USERS, SUBJECT_COLORS } from '../data/data.js'
import { detectConflicts, seedSchedule, generateRandomSchedule } from '../utils/scheduleUtils.js'

const Ctx    = createContext()
const LS_KEY = 'eduplan_v5'

// ── Build users list from groups+teachers (links IDs) ─────────────────────
function buildUsers(groups, teachers) {
  return DEMO_USERS.map(u => {
    const out = { ...u }
    // Link teacher by __T0__, __T1__, ... index
    if (u.teacherId?.startsWith('__T')) {
      const idx = parseInt(u.teacherId.replace('__T', '').replace('__', ''))
      out.teacherId = teachers[idx]?.id || null
    }
    // Link student group by __G_SCA1A__ → group name SCA-1A
    if (u.groupId?.startsWith('__G_')) {
      const raw   = u.groupId.replace('__G_', '').replace('__', '')
      const match = raw.match(/^([A-Z]+)(\d)([AB])$/)
      if (match) {
        const gname = `${match[1]}-${match[2]}${match[3]}`
        const found = groups.find(g => g.name === gname)
        out.groupId = found?.id || null
        if (found) out.name = `Студент ${gname}`
      }
    }
    return out
  })
}

// ── Fresh initial state ────────────────────────────────────────────────────
function freshState() {
  const groups   = makeGroups()
  const teachers = makeTeachers()
  const subjects = makeSubjects()
  const users    = buildUsers(groups, teachers)
  return {
    currentUser: null,
    users,
    groups,
    teachers,
    subjects,
    schedule: seedSchedule(groups, teachers, subjects),
    pending:  {},
    toasts:   [],
  }
}

// ── Load from localStorage, fall back to fresh if corrupt ─────────────────
function initState() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw)
    if (!parsed?.groups || !parsed?.teachers || !parsed?.subjects || !parsed?.schedule) {
      localStorage.removeItem(LS_KEY)
      return freshState()
    }
    parsed.users   = buildUsers(parsed.groups, parsed.teachers) // always refresh
    parsed.toasts  = []
    parsed.pending = parsed.pending || {}
    return parsed
  } catch (e) {
    console.warn('EduPlan: localStorage corrupt, resetting.', e)
    try { localStorage.removeItem(LS_KEY) } catch {}
    return freshState()
  }
}

function mkToast(type, message) { return { id: uuidv4(), type, message } }

// ── Reducer ────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'LOGIN': {
      const user = state.users.find(u => u.username === action.username && u.password === action.password)
      if (!user) return { ...state, toasts: [mkToast('error', 'Неверный логин или пароль'), ...state.toasts.slice(0,3)] }
      return { ...state, currentUser: user, toasts: [mkToast('success', `Добро пожаловать, ${user.name}!`), ...state.toasts.slice(0,3)] }
    }
    case 'LOGOUT': return { ...state, currentUser: null, pending: {} }

    case 'STAGE_LESSON': {
      const { lesson } = action
      const c = detectConflicts({ ...state.schedule, ...state.pending }, lesson, lesson.id)
      if (c.length) return { ...state, toasts: [mkToast('error', c[0]), ...state.toasts.slice(0,3)] }
      return { ...state, pending: { ...state.pending, [lesson.id]: { ...lesson, _staged: true } },
        toasts: [mkToast('info', 'Изменение добавлено — нажмите Apply'), ...state.toasts.slice(0,3)] }
    }
    case 'APPLY_PENDING': {
      const newSchedule = { ...state.schedule }
      Object.values(state.pending).forEach(l => {
        const { _staged, ...clean } = l
        newSchedule[clean.id] = clean
      })
      return { ...state, schedule: newSchedule, pending: {},
        toasts: [mkToast('success', 'Все изменения применены!'), ...state.toasts.slice(0,3)] }
    }
    case 'DISCARD_PENDING':
      return { ...state, pending: {}, toasts: [mkToast('info', 'Изменения отменены'), ...state.toasts.slice(0,3)] }

    case 'ADD_LESSON': {
      const c = detectConflicts(state.schedule, action.lesson)
      if (c.length) return { ...state, toasts: [mkToast('error', c[0]), ...state.toasts.slice(0,3)] }
      return { ...state, schedule: { ...state.schedule, [action.lesson.id]: action.lesson },
        toasts: [mkToast('success', 'Урок добавлен'), ...state.toasts.slice(0,3)] }
    }
    case 'UPDATE_LESSON': {
      const c = detectConflicts(state.schedule, action.lesson, action.lesson.id)
      if (c.length) return { ...state, toasts: [mkToast('error', c[0]), ...state.toasts.slice(0,3)] }
      return { ...state, schedule: { ...state.schedule, [action.lesson.id]: action.lesson },
        toasts: [mkToast('success', 'Урок обновлён'), ...state.toasts.slice(0,3)] }
    }
    case 'DEL_LESSON': {
      const s = { ...state.schedule }; delete s[action.id]
      return { ...state, schedule: s, toasts: [mkToast('info', 'Урок удалён'), ...state.toasts.slice(0,3)] }
    }

    case 'SWAP_LESSONS': {
      const { id1, id2 } = action
      const l1 = state.schedule[id1], l2 = state.schedule[id2]
      if (!l1 || !l2) return state
      return { ...state,
        pending: { ...state.pending,
          [id1]: { ...l1, day: l2.day, slotId: l2.slotId, _staged: true },
          [id2]: { ...l2, day: l1.day, slotId: l1.slotId, _staged: true },
        },
        toasts: [mkToast('info', 'Уроки поменяны — нажмите Apply'), ...state.toasts.slice(0,3)] }
    }

    case 'GENERATE_RANDOM': {
      const newSched = generateRandomSchedule(state.groups, state.teachers, state.subjects)
      return { ...state, schedule: newSched, pending: {},
        toasts: [mkToast('success', 'Новое расписание сгенерировано для всех групп!'), ...state.toasts.slice(0,3)] }
    }

    case 'ADD_TEACHER':    return { ...state, teachers: [...state.teachers, action.item] }
    case 'UPDATE_TEACHER': return { ...state, teachers: state.teachers.map(t => t.id === action.item.id ? action.item : t) }
    case 'DEL_TEACHER':    return { ...state, teachers: state.teachers.filter(t => t.id !== action.id) }

    case 'ADD_SUBJECT':    return { ...state, subjects: [...state.subjects, action.item] }
    case 'UPDATE_SUBJECT': return { ...state, subjects: state.subjects.map(s => s.id === action.item.id ? action.item : s) }
    case 'DEL_SUBJECT':    return { ...state, subjects: state.subjects.filter(s => s.id !== action.id) }

    case 'DEL_GROUP':      return { ...state, groups: state.groups.filter(g => g.id !== action.id) }

    case 'DISMISS_TOAST':  return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }

    default: return state
  }
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, initState)

  useEffect(() => {
    try {
      const { toasts, ...rest } = state
      localStorage.setItem(LS_KEY, JSON.stringify(rest))
    } catch (e) {
      console.warn('EduPlan: could not save state', e)
    }
  }, [state])

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
