import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, BookOpen, GraduationCap, LogOut, ChevronRight, Shuffle } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { DIR_COLORS } from '../../data/data.js'
import './Sidebar.css'

const ALL_NAV = [
  { to:'/',          icon:LayoutDashboard, label:'Дашборд',    roles:['admin','teacher','student'], exact:true },
  { to:'/schedule',  icon:CalendarDays,    label:'Расписание',  roles:['admin','teacher','student'] },
  { to:'/teachers',  icon:Users,           label:'Учителя',     roles:['admin'] },
  { to:'/subjects',  icon:BookOpen,        label:'Предметы',    roles:['admin'] },
  { to:'/groups',    icon:GraduationCap,   label:'Группы',      roles:['admin','teacher'] },
]

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const { currentUser, groups, schedule, pending } = state
  const navigate = useNavigate()
  const role = currentUser?.role
  const pendingCount = Object.keys(pending).length

  const nav = ALL_NAV.filter(n => n.roles.includes(role))

  const userGroup = role==='student'
    ? groups.find(g=>g.id===currentUser?.groupId)
    : null

  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="sb-brand-icon"><CalendarDays size={18}/></div>
        <div>
          <div className="sb-brand-name">EduPlan</div>
          <div className="sb-brand-sub">Ala-Too Vocational</div>
        </div>
      </div>

      {/* User profile */}
      <div className="sb-user">
        <div className="sb-user-av" style={{background: role==='admin' ? '#fef3c7' : role==='teacher' ? '#ede9fe' : '#ecfdf5'}}>
          {currentUser?.name[0]}
        </div>
        <div className="sb-user-info">
          <div className="sb-user-name">{currentUser?.name}</div>
          <span className={`badge role-${role}`}>
            {role==='admin'?'Администратор':role==='teacher'?'Учитель':'Студент'}
          </span>
        </div>
      </div>

      {userGroup && (
        <div className="sb-group-pill" style={{ background:DIR_COLORS[userGroup.direction]?.bg, borderColor:DIR_COLORS[userGroup.direction]?.border, color:DIR_COLORS[userGroup.direction]?.text }}>
          <GraduationCap size={12}/>
          <span className="mono">{userGroup.name}</span>
        </div>
      )}

      <nav className="sb-nav">
        {nav.map(({ to, icon:Icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({isActive})=>`sb-link${isActive?' active':''}`}>
            <Icon size={15}/>
            <span>{label}</span>
            <ChevronRight size={11} className="sb-arr"/>
          </NavLink>
        ))}
      </nav>

      {/* Pending changes banner */}
      {pendingCount > 0 && (
        <div className="sb-pending">
          <div className="sb-pending-txt">
            <span className="sb-pending-cnt">{pendingCount}</span>
            <span> ожид. изменений</span>
          </div>
          <div className="sb-pending-acts">
            <button className="btn btn-green btn-xs" onClick={()=>dispatch({type:'APPLY_PENDING'})}>Apply</button>
            <button className="btn btn-ghost btn-xs" onClick={()=>dispatch({type:'DISCARD_PENDING'})}>Отмена</button>
          </div>
        </div>
      )}

      {role==='admin' && (
        <div className="sb-tools">
          <button className="btn btn-ghost btn-sm" style={{width:'100%',justifyContent:'center'}}
            onClick={()=>{ if(window.confirm('Сгенерировать рандомное расписание для ВСЕХ групп?')) dispatch({type:'GENERATE_RANDOM'}) }}>
            <Shuffle size={13}/> Рандом расписание
          </button>
        </div>
      )}

      <div className="sb-foot">
        <div className="sb-stats">
          {[['Групп',Object.keys(schedule).length?groups.length:0],['Уроков',Object.keys(schedule).length]].map(([l,v])=>(
            <div key={l} className="sb-stat"><span className="sb-stat-v mono">{v}</span><span className="sb-stat-l">{l}</span></div>
          ))}
        </div>
        <button className="sb-logout" onClick={()=>dispatch({type:'LOGOUT'})}>
          <LogOut size={14}/> Выйти
        </button>
      </div>
    </aside>
  )
}
