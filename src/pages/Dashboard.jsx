import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, BookOpen, GraduationCap, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { DIRECTIONS, DIRECTION_LABELS, DIR_COLORS } from '../data/data.js'
import './Dashboard.css'

export default function Dashboard() {
  const { state } = useApp()
  const { groups, teachers, subjects, schedule, currentUser, pending } = state
  const navigate = useNavigate()
  const role = currentUser?.role
  const lessons = Object.values(schedule)

  const stats = useMemo(()=>{
    const th={}; lessons.forEach(l=>{if(l.teacherId)th[l.teacherId]=(th[l.teacherId]||0)+1})
    const dc={}; DIRECTIONS.forEach(d=>{dc[d]=lessons.filter(l=>l.groupName?.startsWith(d)).length})
    const top=teachers.map(t=>({...t,h:th[t.id]||0})).sort((a,b)=>b.h-a.h).slice(0,5)
    return { dc, top, maxH:top[0]?.h||1 }
  },[lessons,teachers])

  // Student: show only their group
  const studentGroup = role==='student' ? groups.find(g=>g.id===currentUser?.groupId) : null
  const studentLessons = studentGroup ? lessons.filter(l=>l.groupId===studentGroup.id) : []

  // Teacher: show only their schedule
  const teacherLessons = role==='teacher' ? lessons.filter(l=>l.teacherId===currentUser?.teacherId) : []

  return (
    <div className="page db au">
      <div className="ph">
        <div>
          <h1 className="pt">Добро пожаловать, {currentUser?.name.split(' ')[0]}!</h1>
          <p className="ps">Ala-Too Vocational School · 2025–2026 · {role==='admin'?'Администратор':role==='teacher'?'Учитель':'Студент'}</p>
        </div>
        {role==='admin' && (
          <div className="ptb">
            <button className="btn btn-primary" onClick={()=>navigate('/schedule')}><Zap size={13}/> Управлять</button>
          </div>
        )}
      </div>

      {/* Student view */}
      {role==='student' && studentGroup && (
        <div className="db-student-banner" style={{background:DIR_COLORS[studentGroup.direction]?.bg, borderColor:DIR_COLORS[studentGroup.direction]?.border}}>
          <div className="dsb-left">
            <div className="dsb-badge" style={{background:DIR_COLORS[studentGroup.direction]?.dot, color:'#fff'}}>{studentGroup.name}</div>
            <div>
              <div className="dsb-title">{DIRECTION_LABELS[studentGroup.direction]}</div>
              <div className="dsb-sub">{studentLessons.length} уроков в неделю</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/schedule')}>
            Расписание <ArrowRight size={13}/>
          </button>
        </div>
      )}

      {/* Teacher view */}
      {role==='teacher' && (
        <div className="db-teacher-banner">
          <div><div className="dsb-title">Ваших уроков в неделю</div>
          <div className="dsb-num mono">{teacherLessons.length}</div></div>
          <button className="btn btn-primary btn-sm" onClick={()=>navigate('/schedule')}>Моё расписание <ArrowRight size={13}/></button>
        </div>
      )}

      {/* Admin stats */}
      {role==='admin' && (
        <>
          <div className="db-cards">
            {[
              {l:'Групп',    v:groups.length,   i:GraduationCap, c:'var(--blue)',   bg:'var(--blue-l)'},
              {l:'Учителей', v:teachers.length,  i:Users,         c:'var(--purple)', bg:'var(--purple-l)'},
              {l:'Предметов',v:subjects.length,  i:BookOpen,      c:'var(--orange)', bg:'var(--orange-l)'},
              {l:'Уроков',   v:lessons.length,   i:CalendarDays,  c:'var(--green)',  bg:'var(--green-l)'},
            ].map(c=>(
              <div key={c.l} className="db-card" onClick={()=>{}}>
                <div className="db-card-icon" style={{background:c.bg,color:c.c}}><c.i size={20}/></div>
                <div className="db-card-val mono">{c.v}</div>
                <div className="db-card-lbl">{c.l}</div>
              </div>
            ))}
          </div>

          <div className="db-grid">
            <div className="card card-pad">
              <div className="card-title"><TrendingUp size={14}/> Уроки по направлениям</div>
              {DIRECTIONS.map(d=>{
                const cnt=stats.dc[d]||0, max=Math.max(...Object.values(stats.dc),1)
                const col=DIR_COLORS[d]
                return (
                  <div key={d} className="db-dir-row">
                    <span className="badge" style={{background:col.bg,color:col.text,border:`1px solid ${col.border}`}}>{d}</span>
                    <span className="db-dir-name">{DIRECTION_LABELS[d]}</span>
                    <div className="db-bar-wrap"><div className="db-bar" style={{width:`${cnt/max*100}%`,background:col.dot}}/></div>
                    <span className="db-cnt mono">{cnt}</span>
                  </div>
                )
              })}
            </div>

            <div className="card card-pad">
              <div className="card-title"><Users size={14}/> Нагрузка учителей</div>
              {stats.top.map((t,i)=>(
                <div key={t.id} className="db-t-row">
                  <span className="db-t-rank mono">#{i+1}</span>
                  <div className="db-t-av">{t.name[0]}</div>
                  <span className="db-t-name">{t.name}</span>
                  <div className="db-bar-wrap"><div className="db-bar" style={{width:`${t.h/stats.maxH*100}%`}}/></div>
                  <span className="db-cnt mono">{t.h}</span>
                </div>
              ))}
            </div>

            <div className="card card-pad db-groups-card">
              <div className="card-title"><GraduationCap size={14}/> Все группы</div>
              <div className="db-chips">
                {groups.map(g=>{
                  const col=DIR_COLORS[g.direction]
                  return (
                    <button key={g.id} className="db-chip" style={{background:col.bg,color:col.text,border:`1.5px solid ${col.border}`}}
                      onClick={()=>navigate(`/schedule?g=${g.id}`)}>
                      {g.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
