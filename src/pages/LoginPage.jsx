import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { LogIn, GraduationCap, Eye, EyeOff, ShieldCheck, Users, BookOpen } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ username:'', password:'' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => { setForm(f => ({...f, [k]:v})); setError('') }

  const login = () => {
    const u = form.username.trim()
    const p = form.password.trim()
    if (!u || !p) { setError('Заполните все поля'); return }

    const found = state.users.find(x => x.username === u && x.password === p)
    if (!found) { setError('Неверный логин или пароль'); return }

    dispatch({ type:'LOGIN', username: u, password: p })
  }

  return (
    <div className="login-page">
      {/* Left info panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon"><GraduationCap size={24}/></div>
          <span className="login-brand-name">EduPlan</span>
        </div>

        <div className="login-hero">
          <h1 className="login-hero-title">Система управления расписанием</h1>
          <p className="login-hero-sub">Ala-Too Vocational School · Бишкек · 2025–2026</p>
        </div>

        <div className="login-roles">
          <div className="lr-item">
            <div className="lr-icon" style={{background:'#fef3c7', color:'#b45309'}}><ShieldCheck size={16}/></div>
            <div>
              <div className="lr-title">Администратор</div>
              <div className="lr-desc">Полное управление: расписание, учителя, группы, рандом-генерация</div>
            </div>
          </div>
          <div className="lr-item">
            <div className="lr-icon" style={{background:'#ede9fe', color:'#6d28d9'}}><Users size={16}/></div>
            <div>
              <div className="lr-title">Учитель</div>
              <div className="lr-desc">Просмотр расписания, предложение изменений через Apply</div>
            </div>
          </div>
          <div className="lr-item">
            <div className="lr-icon" style={{background:'#ecfdf5', color:'#065f46'}}><BookOpen size={16}/></div>
            <div>
              <div className="lr-title">Студент</div>
              <div className="lr-desc">Просмотр расписания своей группы</div>
            </div>
          </div>
        </div>

        <div className="login-footer-note">
          Вход только по логину и паролю. По вопросам обратитесь к администратору.
        </div>
      </div>

      {/* Right form */}
      <div className="login-right">
        <div className="login-box">
          <div className="login-box-logo">
            <div className="login-logo-icon">
              <GraduationCap size={26}/>
            </div>
            <h2 className="login-box-title">Добро пожаловать</h2>
            <p className="login-box-sub">Введите ваш логин и пароль</p>
          </div>

          <div className="login-form">
            <div className="fg">
              <label className="fl">Логин</label>
              <input
                className={`inp${error ? ' inp-err' : ''}`}
                value={form.username}
                onChange={e => set('username', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="Например: KubanychbekZh или SCA1A"
                autoFocus
              />
            </div>

            <div className="fg">
              <label className="fl">Пароль</label>
              <div style={{position:'relative'}}>
                <input
                  className={`inp${error ? ' inp-err' : ''}`}
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && login()}
                  placeholder="Введите пароль"
                  style={{paddingRight:42}}
                />
                <button className="pass-eye" type="button" onClick={() => setShow(s => !s)}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && <div className="login-error">⚠ {error}</div>}

            <button className="btn btn-primary login-btn" onClick={login}>
              <LogIn size={15}/> Войти
            </button>
          </div>

          {/* Simple note - no credentials shown */}
          <div className="login-hint-box">
            <div className="lhb-title">Как войти</div>
            <div className="lhb-row">
              <span className="lhb-role admin-chip">Администратор</span>
              <span className="lhb-val">Обратитесь к IT-отделу</span>
            </div>
            <div className="lhb-row">
              <span className="lhb-role teacher-chip">Учитель</span>
              <span className="lhb-val">Логин = ваше ИмяФамилия</span>
            </div>
            <div className="lhb-row">
              <span className="lhb-role student-chip">Студент</span>
              <span className="lhb-val">Логин = название группы</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
