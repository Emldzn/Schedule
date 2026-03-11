import React, { useState } from 'react'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '../context/AppContext.jsx'
import { SUBJECT_COLORS, DIRECTIONS, DIRECTION_LABELS, DIR_COLORS } from '../data/data.js'
import { useNavigate } from 'react-router-dom'
import './OtherPages.css'

// ── Teacher Modal ──
function TModal({ item, onClose }) {
  const { dispatch } = useApp()
  const isEdit = !!item
  const [form, setForm] = useState({ name:item?.name||'', short:item?.short||'' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = () => {
    if (!form.name.trim()) return
    dispatch({ type:isEdit?'UPDATE_TEACHER':'ADD_TEACHER', item:{ id:item?.id||uuidv4(), ...form, subjects:item?.subjects||[] } })
    onClose()
  }
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head"><span className="modal-title">{isEdit?'Редактировать':'Добавить учителя'}</span><button className="btn-icon" onClick={onClose}><X size={15}/></button></div>
        <div className="modal-body">
          <div className="fg"><label className="fl">Полное имя *</label><input className="inp" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Aziz Umarov"/></div>
          <div className="fg"><label className="fl">Краткое имя</label><input className="inp" value={form.short} onChange={e=>set('short',e.target.value)} placeholder="Aziz"/></div>
        </div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Отмена</button><button className="btn btn-primary" onClick={save} disabled={!form.name.trim()}>{isEdit?'Сохранить':'Добавить'}</button></div>
      </div>
    </div>
  )
}

export function TeachersPage() {
  const { state, dispatch } = useApp()
  const { teachers, schedule } = state
  const [q,setQ] = useState('')
  const [modal,setModal] = useState(null)
  const lessons = Object.values(schedule)
  const hours = id => lessons.filter(l=>l.teacherId===id).length
  const filtered = teachers.filter(t=>t.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="page au">
      <div className="ph">
        <div><h1 className="pt">Учителя</h1><p className="ps">{teachers.length} учителей</p></div>
        <button className="btn btn-primary" onClick={()=>setModal({type:'add'})}><Plus size={13}/> Добавить</button>
      </div>
      <div className="search-wrap" style={{marginBottom:18}}>
        <Search size={13} className="search-icon"/>
        <input className="inp search-inp" placeholder="Поиск по имени..." value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      <div className="tc-list">
        {filtered.map(t=>(
          <div key={t.id} className="tc-row">
            <div className="tc-av">{t.name[0]}</div>
            <div className="tc-info"><div className="tc-name">{t.name}</div><div className="tc-short mono">{t.short}</div></div>
            <div className="tc-load">
              <div className="tc-h mono">{hours(t.id)}</div>
              <div className="tc-hl">уроков</div>
              <div className="tc-bar-wrap"><div className="tc-bar" style={{width:`${Math.min(hours(t.id)/20*100,100)}%`}}/></div>
            </div>
            <div className="tc-acts">
              <button className="btn-icon btn-sm" onClick={()=>setModal({type:'edit',item:t})}><Edit2 size={13}/></button>
              <button className="btn-icon btn-sm" onClick={()=>dispatch({type:'DEL_TEACHER',id:t.id})}><Trash2 size={13}/></button>
            </div>
          </div>
        ))}
      </div>
      {modal?.type==='add' && <TModal onClose={()=>setModal(null)}/>}
      {modal?.type==='edit' && <TModal item={modal.item} onClose={()=>setModal(null)}/>}
    </div>
  )
}

// ── Subject Modal ──
function SModal({ item, onClose }) {
  const { dispatch } = useApp()
  const isEdit = !!item
  const [form, setForm] = useState({ name:item?.name||'', short:item?.short||'', room:item?.room||'', colorIdx:item?.colorIdx??0, weeklyHours:item?.weeklyHours||2 })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = () => {
    if (!form.name.trim()) return
    dispatch({ type:isEdit?'UPDATE_SUBJECT':'ADD_SUBJECT', item:{ id:item?.id||uuidv4(), ...form, colorIdx:Number(form.colorIdx) } })
    onClose()
  }
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head"><span className="modal-title">{isEdit?'Редактировать предмет':'Добавить предмет'}</span><button className="btn-icon" onClick={onClose}><X size={15}/></button></div>
        <div className="modal-body">
          <div className="fg"><label className="fl">Название *</label><input className="inp" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Web Development"/></div>
          <div className="fr">
            <div className="fg"><label className="fl">Сокращение</label><input className="inp" value={form.short} onChange={e=>set('short',e.target.value)} placeholder="Web"/></div>
            <div className="fg"><label className="fl">Аудитория</label><input className="inp" value={form.room} onChange={e=>set('room',e.target.value)} placeholder="C402"/></div>
          </div>
          <div className="fr">
            <div className="fg"><label className="fl">Часов в нед.</label><input className="inp" type="number" min={1} max={8} value={form.weeklyHours} onChange={e=>set('weeklyHours',Number(e.target.value))}/></div>
            <div className="fg"><label className="fl">Цвет</label>
              <div className="sc-colors">{SUBJECT_COLORS.map((c,i)=>(
                <button key={i} className={`sc-sw${form.colorIdx===i?' sel':''}`} style={{background:c.bg,border:`2px solid ${c.border}`}} onClick={()=>set('colorIdx',i)}/>
              ))}</div>
            </div>
          </div>
        </div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Отмена</button><button className="btn btn-primary" onClick={save} disabled={!form.name.trim()}>{isEdit?'Сохранить':'Добавить'}</button></div>
      </div>
    </div>
  )
}

export function SubjectsPage() {
  const { state, dispatch } = useApp()
  const { subjects, schedule } = state
  const [q,setQ] = useState('')
  const [modal,setModal] = useState(null)
  const lessons = Object.values(schedule)
  const cnt = id => lessons.filter(l=>l.subjectId===id).length
  const filtered = subjects.filter(s=>s.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="page au">
      <div className="ph">
        <div><h1 className="pt">Предметы</h1><p className="ps">{subjects.length} предметов в базе</p></div>
        <button className="btn btn-primary" onClick={()=>setModal({type:'add'})}><Plus size={13}/> Добавить</button>
      </div>
      <div className="search-wrap" style={{marginBottom:18}}>
        <Search size={13} className="search-icon"/>
        <input className="inp search-inp" placeholder="Поиск..." value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      <div className="sc-grid">
        {filtered.map(s=>{
          const col = SUBJECT_COLORS[s.colorIdx]||SUBJECT_COLORS[0]
          return (
            <div key={s.id} className="sc-card" style={{'--sbg':col.bg,'--stxt':col.text,'--sbd':col.border}}>
              <div className="sc-top">
                <div className="sc-pill">{s.short||s.name.slice(0,4)}</div>
                <div className="sc-acts">
                  <button className="btn-icon" style={{width:28,height:28,padding:0}} onClick={()=>setModal({type:'edit',item:s})}><Edit2 size={12}/></button>
                  <button className="btn-icon" style={{width:28,height:28,padding:0}} onClick={()=>dispatch({type:'DEL_SUBJECT',id:s.id})}><Trash2 size={12}/></button>
                </div>
              </div>
              <div className="sc-name">{s.name}</div>
              <div className="sc-meta">
                {s.room&&<span className="tag">{s.room}</span>}
                <span className="tag">{s.weeklyHours}ч/нед</span>
                <span className="tag">{cnt(s.id)} уроков</span>
              </div>
            </div>
          )
        })}
      </div>
      {modal?.type==='add'  && <SModal onClose={()=>setModal(null)}/>}
      {modal?.type==='edit' && <SModal item={modal.item} onClose={()=>setModal(null)}/>}
    </div>
  )
}

// ── Groups Page ──
export function GroupsPage() {
  const { state, dispatch } = useApp()
  const { groups, schedule } = state
  const navigate = useNavigate()
  const [q,setQ] = useState('')
  const [fdir,setFdir] = useState('')
  const [fcrs,setFcrs] = useState('')
  const lessons = Object.values(schedule)
  const lc = id => lessons.filter(l=>l.groupId===id).length

  const filtered = groups.filter(g =>
    (!q || g.name.toLowerCase().includes(q.toLowerCase())) &&
    (!fdir || g.direction===fdir) && (!fcrs || g.course===Number(fcrs))
  )
  const byDir = {}
  filtered.forEach(g=>{
    if(!byDir[g.direction]) byDir[g.direction]={}
    const k=`${g.course} курс`
    if(!byDir[g.direction][k]) byDir[g.direction][k]=[]
    byDir[g.direction][k].push(g)
  })

  return (
    <div className="page au">
      <div className="ph">
        <div><h1 className="pt">Группы</h1><p className="ps">{groups.length} групп · {DIRECTIONS.length} направлений · 1–3 курсы</p></div>
      </div>
      <div className="gp-toolbar">
        <div className="search-wrap"><Search size={13} className="search-icon"/><input className="inp search-inp" placeholder="Поиск..." value={q} onChange={e=>setQ(e.target.value)}/></div>
        <select className="inp" style={{width:155,fontSize:12}} value={fdir} onChange={e=>setFdir(e.target.value)}>
          <option value="">Все направления</option>
          {DIRECTIONS.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        <select className="inp" style={{width:120,fontSize:12}} value={fcrs} onChange={e=>setFcrs(e.target.value)}>
          <option value="">Все курсы</option>
          {[1,2,3].map(c=><option key={c} value={c}>{c} курс</option>)}
        </select>
      </div>

      <div className="gp-sections">
        {Object.entries(byDir).map(([d,courses])=>{
          const col=DIR_COLORS[d]
          return (
            <div key={d} className="gp-section">
              <div className="gp-sec-hd" style={{background:col.bg,borderColor:col.border}}>
                <span className="badge" style={{background:col.dot,color:'#fff',padding:'3px 10px'}}>{d}</span>
                <span className="gp-sec-label">{DIRECTION_LABELS[d]}</span>
              </div>
              <div className="gp-body">
                {Object.entries(courses).map(([k,gs])=>(
                  <div key={k} className="gp-crs-row">
                    <div className="gp-crs-lbl">{k}</div>
                    <div className="gp-crs-cards">
                      {gs.map(g=>(
                        <div key={g.id} className="gp-card" style={{'--gc':col.dot,'--gbg':col.bg,'--gbd':col.border,'--gtxt':col.text}} onClick={()=>navigate(`/schedule?g=${g.id}`)}>
                          <div className="gp-card-name mono">{g.name}</div>
                          <div className="gp-card-sub">Подгруппа {g.subgroup}</div>
                          <span className="tag" style={{fontSize:10}}>{lc(g.id)} уроков</span>
                          <button className="gp-del" onClick={e=>{e.stopPropagation();dispatch({type:'DEL_GROUP',id:g.id})}}><Trash2 size={11}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
