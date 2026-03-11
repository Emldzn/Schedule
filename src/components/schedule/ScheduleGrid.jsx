import React, { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, ArrowLeftRight } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { DAYS, TIME_SLOTS, SUBJECT_COLORS } from '../../data/data.js'
import LessonModal from '../modals/LessonModal.jsx'
import './ScheduleGrid.css'

export default function ScheduleGrid({ groupId, readOnly=false }) {
  const { state, dispatch } = useApp()
  const { schedule, pending } = state
  const [modal, setModal] = useState(null)
  const [swapFirst, setSwapFirst] = useState(null) // lesson id to swap

  // Merge schedule with pending
  const merged = useMemo(() => {
    const base = { ...schedule }
    Object.values(pending).forEach(l => { base[l.id] = l })
    return base
  }, [schedule, pending])

  const map = useMemo(() => {
    const m = {}
    Object.values(merged)
      .filter(l => l.groupId === groupId)
      .forEach(l => { m[`${l.day}_${l.slotId}`] = l })
    return m
  }, [merged, groupId])

  const getColor = (lesson) => {
    const col = SUBJECT_COLORS.find(c=>c.bg===lesson.subjectColor) || SUBJECT_COLORS[0]
    return { bg:lesson.subjectColor||col.bg, text:lesson.subjectText||col.text, border:lesson.subjectBorder||col.border }
  }

  const handleCell = (day, slotId) => {
    if (readOnly) return
    const key = `${day}_${slotId}`
    const lesson = map[key]

    if (swapFirst) {
      if (lesson && lesson.id !== swapFirst) {
        dispatch({ type:'SWAP_LESSONS', id1:swapFirst, id2:lesson.id })
        setSwapFirst(null)
      } else if (!lesson) {
        setSwapFirst(null)
      }
      return
    }

    if (lesson) setModal({ type:'edit', lesson })
    else setModal({ type:'add', day, slot:slotId })
  }

  const del = (e, id) => { e.stopPropagation(); dispatch({ type:'DEL_LESSON', id }) }
  const startSwap = (e, id) => { e.stopPropagation(); setSwapFirst(id); }

  return (
    <div className="sg-outer">
      {swapFirst && (
        <div className="sg-swap-banner">
          <ArrowLeftRight size={14}/>
          <span>Нажмите на другой урок чтобы поменять местами</span>
          <button className="btn btn-ghost btn-xs" onClick={()=>setSwapFirst(null)}>Отмена</button>
        </div>
      )}

      <div className="sg-wrap">
        <div className="sg">
          <div className="sg-corner"/>
          {TIME_SLOTS.map(s=>(
            <div key={s.id} className="sg-th">
              <span className="sg-th-n mono">{s.id}</span>
              <span className="sg-th-t">{s.start}</span>
              <span className="sg-th-t2">{s.end}</span>
            </div>
          ))}

          {DAYS.map((day,di)=>(
            <React.Fragment key={di}>
              <div className="sg-dh"><span>{day}</span></div>
              {TIME_SLOTS.map(slot=>{
                const lesson = map[`${di}_${slot.id}`]
                const isStaged = lesson?._staged
                const isSwapTarget = swapFirst && lesson && lesson.id !== swapFirst
                const isSwapSrc    = swapFirst === lesson?.id
                const col = lesson ? getColor(lesson) : null

                return (
                  <div key={slot.id}
                    className={`sg-cell${lesson?' filled':''}${isStaged?' staged':''}${isSwapTarget?' swap-target':''}${isSwapSrc?' swap-src':''}`}
                    style={col ? {'--lbg':col.bg,'--ltxt':col.text,'--lbrd':col.border} : {}}
                    onClick={()=>handleCell(di,slot.id)}
                  >
                    {lesson ? (
                      <div className="sg-lesson">
                        <div className="sg-lname">{lesson.subjectShort}</div>
                        {lesson.room && <div className="sg-lroom mono">{lesson.room}</div>}
                        {lesson.teacherShort && <div className="sg-lteach">{lesson.teacherShort}</div>}
                        {isStaged && <div className="sg-staged-dot"/>}
                        {!readOnly && (
                          <div className="sg-acts">
                            <button className="sg-act" title="Поменять местами" onClick={e=>startSwap(e,lesson.id)}><ArrowLeftRight size={9}/></button>
                            <button className="sg-act" title="Редактировать" onClick={e=>{e.stopPropagation();setModal({type:'edit',lesson})}}><Edit2 size={9}/></button>
                            <button className="sg-act sg-act-del" title="Удалить" onClick={e=>del(e,lesson.id)}><Trash2 size={9}/></button>
                          </div>
                        )}
                      </div>
                    ) : (
                      !readOnly && <div className="sg-plus"><Plus size={11}/></div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {modal?.type==='edit' && <LessonModal lesson={modal.lesson} onClose={()=>setModal(null)}/>}
      {modal?.type==='add'  && <LessonModal defGroup={groupId} defDay={modal.day} defSlot={modal.slot} onClose={()=>setModal(null)}/>}
    </div>
  )
}
