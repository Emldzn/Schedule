import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Clear old cache versions
;['eduplan_v3', 'eduplan_v4', 'sched_v2'].forEach(k => {
  try { localStorage.removeItem(k) } catch {}
})

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  componentDidCatch(err) {
    console.error('EduPlan crash:', err)
    // Wipe localStorage and reload once
    try {
      if (!sessionStorage.getItem('_reloaded')) {
        sessionStorage.setItem('_reloaded', '1')
        localStorage.clear()
        window.location.reload()
      }
    } catch {}
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',gap:16,fontFamily:'sans-serif',color:'#1a1f36'}}>
          <div style={{fontSize:40}}>⚠️</div>
          <h2 style={{fontWeight:800}}>Произошла ошибка</h2>
          <p style={{color:'#8890b0'}}>Страница обновится автоматически…</p>
          <button onClick={()=>{localStorage.clear();window.location.reload()}}
            style={{padding:'10px 24px',background:'#3b6ef8',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:14}}>
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App/>
    </ErrorBoundary>
  </React.StrictMode>
)
