import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, BookOpen, GraduationCap, LogOut, ChevronRight, Shuffle, Menu, X } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { DIR_COLORS } from '../../data/data.js'
import './Sidebar.css'

const ALL_NAV = [
  { to:'/',         icon:LayoutDashboard, label:'Дашборд',   roles:['admin','teacher','student'], exact:true },
  { to:'/schedule', icon:CalendarDays,    label:'Расписание', roles:['admin','teacher','student'] },
  { to:'/teachers', icon:Users,           label:'Учителя',    roles:['admin'] },
  { to:'/subjects', icon:BookOpen,        label:'Предметы',   roles:['admin'] },
  { to:'/groups',   icon:GraduationCap,   label:'Группы',     roles:['admin','teacher'] },
]

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const { currentUser, groups, schedule, pending } = state
  const navigate    = useNavigate()
  const location    = useLocation()
  const role        = currentUser?.role
  const pendingCount = Object.keys(pending).length
  const [open, setOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false) }, [location.pathname])

  const nav = ALL_NAV.filter(n => n.roles.includes(role))
  const userGroup = role === 'student' ? groups.find(g => g.id === currentUser?.groupId) : null

  const SidebarContent = () => (
    <aside className={`sb${open ? ' open' : ''}`}>
      <div className="sb-brand">
        <div className="sb-brand-icon"><CalendarDays size={18}/></div>
        <div>
          <div className="sb-brand-name">EduPlan</div>
          <div className="sb-brand-sub">Ala-Too Vocational</div>
        </div>
        <button className="sb-close-btn" onClick={() => setOpen(false)}><X size={18}/></button>
      </div>

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
        <div className="sb-group-pill" style={{background:DIR_COLORS[userGroup.direction]?.bg,borderColor:DIR_COLORS[userGroup.direction]?.border,color:DIR_COLORS[userGroup.direction]?.text}}>
          <GraduationCap size={12}/>
          <span className="mono">{userGroup.name}</span>
        </div>
      )}

      <nav className="sb-nav">
        {nav.map(({ to, icon:Icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({isActive}) => `sb-link${isActive?' active':''}`}>
            <Icon size={15}/><span>{label}</span>
            <ChevronRight size={11} className="sb-arr"/>
          </NavLink>
        ))}
      </nav>

      {pendingCount > 0 && (
        <div className="sb-pending">
          <div className="sb-pending-txt">
            <span className="sb-pending-cnt">{pendingCount}</span>
            <span> ожид. изменений</span>
          </div>
          <div className="sb-pending-acts">
            <button className="btn btn-green btn-xs" onClick={() => dispatch({type:'APPLY_PENDING'})}>Apply</button>
            <button className="btn btn-ghost btn-xs" onClick={() => dispatch({type:'DISCARD_PENDING'})}>Отмена</button>
          </div>
        </div>
      )}

      {role === 'admin' && (
        <div className="sb-tools">
          <button className="btn btn-ghost btn-sm" style={{width:'100%',justifyContent:'center'}}
            onClick={() => { if(window.confirm('Сгенерировать рандомное расписание для ВСЕХ групп?')) dispatch({type:'GENERATE_RANDOM'}) }}>
            <Shuffle size={13}/> Рандом расписание
          </button>
        </div>
      )}

      <div className="sb-foot">
        <div className="sb-stats">
          {[['Групп',groups.length],['Уроков',Object.keys(schedule).length]].map(([l,v]) => (
            <div key={l} className="sb-stat">
              <span className="sb-stat-v mono">{v}</span>
              <span className="sb-stat-l">{l}</span>
            </div>
          ))}
        </div>
        <button className="sb-logout" onClick={() => dispatch({type:'LOGOUT'})}>
          <LogOut size={14}/> Выйти
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="mob-topbar">
        <button className="mob-burger" onClick={() => setOpen(true)}><Menu size={22}/></button>
        <span className="mob-topbar-brand">EduPlan</span>
        {pendingCount > 0 && (
          <button className="btn btn-green btn-xs" onClick={() => dispatch({type:'APPLY_PENDING'})}>
            Apply ({pendingCount})
          </button>
        )}
      </div>

      {/* Sidebar overlay */}
      <div className={`sb-overlay${open?' open':''}`} onClick={() => setOpen(false)}/>

      <SidebarContent/>

      {/* Mobile bottom nav */}
      <nav className="mob-botnav">
        <div className="mob-botnav-inner">
          {nav.slice(0,5).map(({ to, icon:Icon, label, exact }) => {
            const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} end={exact} className={({isActive}) => `mob-bn-link${isActive?' active':''}`}>
                <Icon size={20}/>
                <span>{label}</span>
              </NavLink>
            )
          })}
          <button className="mob-bn-link" onClick={() => dispatch({type:'LOGOUT'})}>
            <LogOut size={20}/><span>Выйти</span>
          </button>
        </div>
      </nav>
    </>
  )
}
