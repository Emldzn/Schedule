import React, { useEffect } from 'react'
import { CheckCircle, XCircle, Info, X, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import './Toasts.css'

export default function Toasts() {
  const { state, dispatch } = useApp()
  const { toasts } = state
  useEffect(() => {
    if (!toasts.length) return
    const id = toasts[0].id
    const t = setTimeout(()=>dispatch({type:'DISMISS_TOAST',id}), 4500)
    return ()=>clearTimeout(t)
  }, [toasts])

  return (
    <div className="toasts">
      {toasts.slice(0,3).map(n => {
        const Icon = n.type==='success'?CheckCircle:n.type==='error'?XCircle:n.type==='warning'?AlertCircle:Info
        return (
          <div key={n.id} className={`toast toast-${n.type} au`}>
            <Icon size={15}/>
            <span>{n.message}</span>
            <button className="toast-x" onClick={()=>dispatch({type:'DISMISS_TOAST',id:n.id})}><X size={12}/></button>
          </div>
        )
      })}
    </div>
  )
}
