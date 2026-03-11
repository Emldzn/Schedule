import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Users, GraduationCap, CheckCircle, XCircle, ArrowLeftRight } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { DIRECTIONS, DIRECTION_LABELS, DIR_COLORS, DAYS, TIME_SLOTS } from '../data/data.js'
import ScheduleGrid from '../components/schedule/ScheduleGrid.jsx'
import LessonModal from '../components/modals/LessonModal.jsx'
import './SchedulePage.css'

// Teacher read-only grid — inline, no require()
function TeacherGrid({ lessons }) {
  const map = {}
  lessons.forEach(l => { map[`${l.day}_${l.slotId}`] = l })

  return (
    <div style={{overflowX:'auto',borderRadius:'var(--r)',border:'1.5px solid var(--border)',boxShadow:'var(--shadow-sm)'}}>
      <div style={{display:'grid',gridTemplateColumns:'52px repeat(10,minmax(90px,1fr))',minWidth:980,background:'var(--bg2)'}}>
        {/* Header row */}
        <div style={{background:'var(--bg3)',borderRight:'1.5px solid var(--border)',borderBottom:'1.5px solid var(--border)'}}/>
        {TIME_SLOTS.map(s => (
          <div key={s.id} style={{background:'var(--bg3)',borderRight:'1.5px solid var(--border)',borderBottom:'1.5px solid var(--border)',padding:'10px 5px 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
            <span style={{fontSize:15,fontWeight:800,fontFamily:'JetBrains Mono,monospace',color:'var(--text)'}}>{s.id}</span>
            <span style={{fontSize:10,color:'var(--text2)'}}>{s.start}</span>
          </div>
        ))}
        {/* Day rows */}
        {DAYS.map((day, di) => (
          <React.Fragment key={di}>
            <div style={{background:'var(--bg3)',borderRight:'1.5px solid var(--border)',borderBottom:'1.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:11,fontWeight:700,color:'var(--text2)'}}>{day}</span>
            </div>
            {TIME_SLOTS.map(slot => {
              const lesson = map[`${di}_${slot.id}`]
              return (
                <div key={slot.id} style={{borderRight:'1.5px solid var(--border)',borderBottom:'1.5px solid var(--border)',minHeight:74,background:lesson?lesson.subjectColor:'transparent',borderLeft:lesson?`3px solid ${lesson.subjectBorder}`:''}}>
                  {lesson && (
                    <div style={{padding:'8px 9px',height:'100%',display:'flex',flexDirection:'column',gap:2}}>
                      <div style={{fontSize:11,fontWeight:700,color:lesson.subjectText}}>{lesson.subjectShort}</div>
                      <div style={{fontSize:9,color:'var(--text3)',fontFamily:'JetBrains Mono,monospace'}}>{lesson.room}</div>
                      <div style={{fontSize:9,color:'var(--text2)',marginTop:'auto',fontFamily:'JetBrains Mono,monospace'}}>{lesson.groupName}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default function SchedulePage() {
  const { state, dispatch } = useApp()
  const { groups, teachers, schedule, pending, currentUser } = state
  const [params, setParams] = useSearchParams()
  const role = currentUser?.role

  const [viewMode, setViewMode]   = useState('group')
  const [selGroup, setSelGroup]   = useState(params.get('g') || '')
  const [selTeacher, setSelTeacher] = useState('')
  const [filterDir, setFilterDir] = useState('')
  const [filterCrs, setFilterCrs] = useState('')
  const [addModal, setAddModal]   = useState(false)

  useEffect(() => { const g = params.get('g'); if (g) setSelGroup(g) }, [params])

  // Auto-select based on role
  useEffect(() => {
    if (role === 'student' && currentUser?.groupId) {
      setSelGroup(currentUser.groupId)
    }
    if (role === 'teacher' && currentUser?.teacherId) {
      setSelTeacher(currentUser.teacherId)
      setViewMode('teacher')
    }
  }, [role])

  const filteredGroups = groups.filter(g =>
    (!filterDir || g.direction === filterDir) &&
    (!filterCrs || g.course === Number(filterCrs))
  )

  const selGroupObj   = groups.find(g => g.id === selGroup)
  const selTeacherObj = teachers.find(t => t.id === selTeacher)

  const teacherLessons = Object.values({ ...schedule, ...pending })
    .filter(l => l.teacherId === selTeacher)

  const canEdit = role === 'admin' || role === 'teacher'
  const pendingCount = Object.keys(pending).length

  return (
    <div className="sp">
      {/* ── Left panel ── */}
      <div className="sp-side">
        <div className="sp-side-hd">
          {(role === 'admin' || role === 'teacher') ? (
            <div className="sp-tabs">
              <button className={`sp-tab${viewMode==='group'?' active':''}`}   onClick={() => setViewMode('group')}>
                <GraduationCap size={13}/> Группы
              </button>
              <button className={`sp-tab${viewMode==='teacher'?' active':''}`} onClick={() => setViewMode('teacher')}>
                <Users size={13}/> Учителя
              </button>
            </div>
          ) : (
            <div style={{padding:'8px 4px',fontSize:13,fontWeight:700,color:'var(--text2)',display:'flex',alignItems:'center',gap:6}}>
              <GraduationCap size={14}/> Моя группа
            </div>
          )}
        </div>

        {viewMode === 'group' && (
          <>
            {role === 'admin' && (
              <div className="sp-filters">
                <select className="inp" style={{fontSize:12,padding:'5px 28px 5px 9px'}} value={filterDir} onChange={e=>setFilterDir(e.target.value)}>
                  <option value="">Все направления</option>
                  {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="inp" style={{fontSize:12,padding:'5px 28px 5px 9px'}} value={filterCrs} onChange={e=>setFilterCrs(e.target.value)}>
                  <option value="">Все курсы</option>
                  {[1,2,3].map(c => <option key={c} value={c}>{c} курс</option>)}
                </select>
              </div>
            )}
            <div className="sp-list">
              {filteredGroups.map(g => {
                const col = DIR_COLORS[g.direction]
                return (
                  <button key={g.id}
                    className={`sp-item${selGroup===g.id?' active':''}`}
                    style={selGroup===g.id ? {'--ac':col.text,'--ab':col.bg,'--abd':col.border} : {}}
                    onClick={() => { setSelGroup(g.id); setParams({g:g.id}) }}
                  >
                    <span className="sp-item-dot" style={{background:col.dot}}/>
                    <div>
                      <span className="sp-item-name mono">{g.name}</span>
                      <span className="sp-item-sub">{g.course} курс</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {viewMode === 'teacher' && (
          <div className="sp-list">
            {teachers.map(t => {
              const cnt = Object.values(schedule).filter(l => l.teacherId === t.id).length
              return (
                <button key={t.id}
                  className={`sp-item${selTeacher===t.id?' active':''}`}
                  style={selTeacher===t.id ? {'--ac':'var(--purple)','--ab':'var(--purple-l)','--abd':'#ddd6fe'} : {}}
                  onClick={() => setSelTeacher(t.id)}
                >
                  <div className="sp-item-av">{t.name[0]}</div>
                  <div>
                    <span className="sp-item-name">{t.name}</span>
                    <span className="sp-item-sub">{cnt} уроков</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Main area ── */}
      <div className="sp-main">

        {/* ━━━ APPLY BANNER — всегда сверху и заметно ━━━ */}
        {pendingCount > 0 && (
          <div className="sp-apply-banner">
            <div className="sp-apply-left">
              <div className="sp-apply-badge">{pendingCount}</div>
              <div>
                <div className="sp-apply-title">Есть ожидающие изменения</div>
                <div className="sp-apply-sub">Нажмите «Apply» чтобы применить их ко всем расписаниям, или «Отменить» для сброса</div>
              </div>
            </div>
            <div className="sp-apply-actions">
              <button className="btn btn-green" onClick={() => dispatch({type:'APPLY_PENDING'})}>
                <CheckCircle size={15}/> Apply — применить
              </button>
              <button className="btn btn-ghost" onClick={() => dispatch({type:'DISCARD_PENDING'})}>
                <XCircle size={15}/> Отменить
              </button>
            </div>
          </div>
        )}

        {/* Group schedule */}
        {viewMode === 'group' && selGroupObj && (
          <>
            <div className="sp-mhd">
              <div>
                <h2 className="sp-title">
                  Расписание — <span style={{color:DIR_COLORS[selGroupObj.direction]?.text}}>{selGroupObj.name}</span>
                </h2>
                <p className="sp-sub">
                  {DIRECTION_LABELS[selGroupObj.direction]} · {selGroupObj.course} курс · Подгруппа {selGroupObj.subgroup}
                  {!canEdit && ' · Только просмотр'}
                </p>
              </div>
              {canEdit && (
                <button className="btn btn-primary btn-sm" onClick={() => setAddModal(true)}>
                  <Plus size={13}/> Добавить урок
                </button>
              )}
            </div>
            <ScheduleGrid groupId={selGroup} readOnly={!canEdit}/>
          </>
        )}

        {viewMode === 'group' && !selGroupObj && (
          <div className="sp-empty">
            <div style={{fontSize:40}}>📅</div>
            <p>Выберите группу из списка слева</p>
          </div>
        )}

        {/* Teacher schedule */}
        {viewMode === 'teacher' && selTeacherObj && (
          <>
            <div className="sp-mhd">
              <div>
                <h2 className="sp-title">Расписание — {selTeacherObj.name}</h2>
                <p className="sp-sub">{teacherLessons.length} уроков в неделю · Только просмотр</p>
              </div>
            </div>
            <TeacherGrid lessons={teacherLessons}/>
          </>
        )}

        {viewMode === 'teacher' && !selTeacherObj && (
          <div className="sp-empty">
            <div style={{fontSize:40}}>👤</div>
            <p>Выберите учителя из списка слева</p>
          </div>
        )}
      </div>

      {addModal && <LessonModal defGroup={selGroup} onClose={() => setAddModal(false)}/>}
    </div>
  )
}
