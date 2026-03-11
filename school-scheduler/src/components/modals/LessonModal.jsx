import React, { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../../context/AppContext.jsx'
import { detectConflicts } from '../../utils/scheduleUtils.js'
import { DAYS, TIME_SLOTS, SUBJECT_COLORS } from '../../data/data.js'

export default function LessonModal({ lesson, onClose, defGroup, defDay, defSlot }) {
  const { state, dispatch } = useApp()
  const { groups, teachers, subjects, schedule, currentUser } = state
  const isEdit = !!lesson
  const isAdmin = currentUser?.role === 'admin'

  const [form, setForm] = useState({
    groupId:   lesson?.groupId   ?? defGroup ?? '',
    day:       lesson?.day       ?? defDay   ?? '',
    slotId:    lesson?.slotId    ?? defSlot  ?? '',
    subjectId: lesson?.subjectId ?? '',
    teacherId: lesson?.teacherId ?? '',
    room:      lesson?.room      ?? '',
  })
  const [conflicts, setConflicts] = useState([])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  useEffect(() => {
    if (form.subjectId && !form.room) {
      const s = subjects.find(x=>x.id===form.subjectId)
      if (s) set('room', s.room)
    }
  }, [form.subjectId])

  useEffect(() => {
    if (!form.groupId || form.day==='' || form.slotId==='' || !form.subjectId) { setConflicts([]); return }
    const grp  = groups.find(g=>g.id===form.groupId)
    const subj = subjects.find(s=>s.id===form.subjectId)
    if (!grp||!subj) return
    const trial = { id:lesson?.id||'__trial__', groupId:form.groupId, groupName:grp.name,
      day:Number(form.day), slotId:Number(form.slotId), subjectId:form.subjectId,
      teacherId:form.teacherId||null, room:form.room }
    setConflicts(detectConflicts(schedule, trial, lesson?.id))
  }, [form])

  const canSave = form.groupId && form.day!=='' && form.slotId!=='' && form.subjectId

  const save = () => {
    if (!canSave) return
    const grp  = groups.find(g=>g.id===form.groupId)
    const subj = subjects.find(s=>s.id===form.subjectId)
    const tch  = teachers.find(t=>t.id===form.teacherId)
    const col  = SUBJECT_COLORS[subj.colorIdx]||SUBJECT_COLORS[0]
    const obj = {
      id:lesson?.id||uuidv4(), groupId:form.groupId, groupName:grp.name,
      day:Number(form.day), slotId:Number(form.slotId),
      subjectId:subj.id, subjectName:subj.name, subjectShort:subj.short,
      subjectColor:col.bg, subjectText:col.text, subjectBorder:col.border,
      teacherId:tch?.id||null, teacherName:tch?.name||null, teacherShort:tch?.short||null,
      room:form.room||subj.room,
    }
    // Admin: direct apply. Teacher: stage for approval
    if (isAdmin) dispatch({ type: isEdit?'UPDATE_LESSON':'ADD_LESSON', lesson:obj })
    else dispatch({ type:'STAGE_LESSON', lesson:obj })
    onClose()
  }

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">{isEdit?'Редактировать урок':'Добавить урок'}</span>
          <button className="btn-icon" onClick={onClose}><X size={15}/></button>
        </div>
        <div className="modal-body">
          {!isAdmin && <div className="lm-info"><span>⚡ Изменение будет добавлено в "Ожидающие" — нажмите Apply чтобы применить</span></div>}
          {conflicts.length>0 && (
            <div className="conflict-bar"><AlertTriangle size={14}/><div>{conflicts.map((c,i)=><div key={i}>{c}</div>)}</div></div>
          )}
          <div className="fg">
            <label className="fl">Группа *</label>
            <select className="inp" value={form.groupId} onChange={e=>set('groupId',e.target.value)}>
              <option value="">— выбрать —</option>
              {[...groups].sort((a,b)=>a.name.localeCompare(b.name)).map(g=>(
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="fr">
            <div className="fg">
              <label className="fl">День *</label>
              <select className="inp" value={form.day} onChange={e=>set('day',e.target.value)}>
                <option value="">—</option>
                {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Слот *</label>
              <select className="inp" value={form.slotId} onChange={e=>set('slotId',e.target.value)}>
                <option value="">—</option>
                {TIME_SLOTS.map(s=><option key={s.id} value={s.id}>{s.id}. {s.start}–{s.end}</option>)}
              </select>
            </div>
          </div>
          <div className="fg">
            <label className="fl">Предмет *</label>
            <select className="inp" value={form.subjectId} onChange={e=>set('subjectId',e.target.value)}>
              <option value="">— выбрать —</option>
              {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Учитель</label>
            <select className="inp" value={form.teacherId} onChange={e=>set('teacherId',e.target.value)}>
              <option value="">Без учителя</option>
              {teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Аудитория</label>
            <input className="inp" value={form.room} onChange={e=>set('room',e.target.value)} placeholder="C402"/>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={save} disabled={!canSave}>{isAdmin?(isEdit?'Сохранить':'Добавить'):'Добавить в ожидание'}</button>
        </div>
      </div>
      <style>{`.lm-info{background:var(--blue-l);border:1.5px solid var(--blue-m);border-radius:var(--rs);padding:10px 12px;font-size:12px;color:var(--blue);}`}</style>
    </div>
  )
}
