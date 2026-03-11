import { v4 as uuidv4 } from 'uuid'
import { DAYS, TIME_SLOTS, SUBJECT_COLORS } from '../data/data.js'

export function detectConflicts(schedule, lesson, excludeId = null) {
  const all = Object.values(schedule).filter(l => l.id !== excludeId)
  const c = []
  if (lesson.teacherId) {
    const tc = all.find(l => l.teacherId === lesson.teacherId && l.day === lesson.day && l.slotId === lesson.slotId)
    if (tc) c.push(`Учитель уже занят (группа ${tc.groupName})`)
  }
  const gc = all.find(l => l.groupId === lesson.groupId && l.day === lesson.day && l.slotId === lesson.slotId)
  if (gc) c.push(`Группа уже имеет урок (${gc.subjectShort})`)
  if (lesson.room) {
    const rc = all.find(l => l.room === lesson.room && l.day === lesson.day && l.slotId === lesson.slotId)
    if (rc) c.push(`Аудитория ${lesson.room} занята (${rc.groupName})`)
  }
  return c
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart Schedule Generator
// Rules:
//  • Every group gets exactly LESSONS_PER_DAY lessons Mon–Fri, ZERO on Saturday
//  • Lessons always fill slots 1→LESSONS_PER_DAY consecutively — NO GAPS
//  • All groups: same start (slot 1), same end (slot LESSONS_PER_DAY)
//  • Equal lesson count across all groups
//  • Subjects distributed evenly, no same subject twice on one day
//  • Teacher double-booking avoided where possible
// ─────────────────────────────────────────────────────────────────────────────

const LESSONS_PER_DAY = 5        // slots 1–5 every day → 25 lessons/week per group
const SCHOOL_DAYS     = [0,1,2,3,4]  // Mon(0)–Fri(4)

export function generateRandomSchedule(groups, teachers, subjects) {
  const schedule = {}
  const tOccupied = new Set() // `${teacherId}_${day}_${slot}`

  // teacher lookup by subject name
  const tBySubj = {}
  teachers.forEach(t => {
    t.subjects.forEach(s => {
      if (!tBySubj[s]) tBySubj[s] = []
      tBySubj[s].push(t)
    })
  })

  const pickTeacher = (subjName, day, slot) => {
    const pool = [...(tBySubj[subjName] || [])].sort(() => Math.random() - 0.5)
    return pool.find(t => !tOccupied.has(`${t.id}_${day}_${slot}`)) || null
  }

  groups.forEach(group => {
    // Build a weekly subject pool: 25 slots total
    // Spread subjects so the same subject doesn't appear twice in one day
    // and total weekly hours are respected

    // Step 1: expand subjects into a flat list respecting weeklyHours (cap at 4/week)
    let pool = []
    const shuffledSubj = [...subjects].sort(() => Math.random() - 0.5)
    shuffledSubj.forEach(s => {
      const n = Math.min(s.weeklyHours, 4)
      for (let i = 0; i < n; i++) pool.push(s)
    })

    // Step 2: pad/trim to exactly 25
    const target = LESSONS_PER_DAY * SCHOOL_DAYS.length
    while (pool.length < target) pool.push(shuffledSubj[pool.length % shuffledSubj.length])
    pool = pool.slice(0, target)

    // Step 3: assign to days such that each day gets exactly LESSONS_PER_DAY,
    //         and no subject repeats on the same day
    // Shuffle pool first
    pool.sort(() => Math.random() - 0.5)

    // Build 5 day-buckets, each of size LESSONS_PER_DAY, no duplicates per day
    const dayBuckets = SCHOOL_DAYS.map(() => [])
    const remaining  = [...pool]

    for (let pass = 0; pass < 3 && remaining.length > 0; pass++) {
      for (let di = 0; di < SCHOOL_DAYS.length; di++) {
        const bucket = dayBuckets[di]
        if (bucket.length >= LESSONS_PER_DAY) continue
        // Find a subject not already in this day's bucket
        const idx = remaining.findIndex(s => !bucket.some(b => b.id === s.id))
        if (idx === -1) {
          // Allow duplicate if no choice
          if (remaining.length > 0) { bucket.push(remaining.shift()) }
        } else {
          bucket.push(...remaining.splice(idx, 1))
        }
      }
    }
    // Final fill if still short
    SCHOOL_DAYS.forEach((_, di) => {
      while (dayBuckets[di].length < LESSONS_PER_DAY) {
        dayBuckets[di].push(subjects[Math.floor(Math.random() * subjects.length)])
      }
    })

    // Step 4: place lessons — consecutive slots 1..LESSONS_PER_DAY
    SCHOOL_DAYS.forEach((day, di) => {
      dayBuckets[di].forEach((subj, slotIdx) => {
        const slotId  = slotIdx + 1   // 1-based, consecutive
        const teacher = pickTeacher(subj.name, day, slotId)
        const col     = SUBJECT_COLORS[subj.colorIdx] || SUBJECT_COLORS[0]
        const id      = uuidv4()

        schedule[id] = {
          id,
          groupId:      group.id,
          groupName:    group.name,
          day,
          slotId,
          subjectId:    subj.id,
          subjectName:  subj.name,
          subjectShort: subj.short,
          subjectColor: col.bg,
          subjectText:  col.text,
          subjectBorder:col.border,
          teacherId:    teacher?.id    || null,
          teacherName:  teacher?.name  || null,
          teacherShort: teacher?.short || null,
          room:         subj.room,
        }

        if (teacher) tOccupied.add(`${teacher.id}_${day}_${slotId}`)
      })
    })
  })

  return schedule
}

export function seedSchedule(groups, teachers, subjects) {
  return generateRandomSchedule(groups, teachers, subjects)
}
