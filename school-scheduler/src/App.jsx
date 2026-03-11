import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Toasts from './components/layout/Toasts.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SchedulePage from './pages/SchedulePage.jsx'
import { TeachersPage, SubjectsPage, GroupsPage } from './pages/OtherPages.jsx'
import './App.css'

function PrivateRoute({ element, roles }) {
  const { state } = useApp()
  const { currentUser } = state
  if (!currentUser) return <Navigate to="/login" replace/>
  if (roles && !roles.includes(currentUser.role)) return <Navigate to="/" replace/>
  return element
}

function Layout() {
  return (
    <div className="layout">
      <Sidebar/>
      <main className="main">
        <Routes>
          <Route path="/"         element={<PrivateRoute element={<Dashboard/>}/>}/>
          <Route path="/schedule" element={<PrivateRoute element={<SchedulePage/>}/>}/>
          <Route path="/teachers" element={<PrivateRoute element={<TeachersPage/>} roles={['admin']}/>}/>
          <Route path="/subjects" element={<PrivateRoute element={<SubjectsPage/>} roles={['admin']}/>}/>
          <Route path="/groups"   element={<PrivateRoute element={<GroupsPage/>}  roles={['admin','teacher']}/>}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </main>
    </div>
  )
}

function AppRouter() {
  const { state } = useApp()
  return (
    <Routes>
      <Route path="/login" element={state.currentUser ? <Navigate to="/" replace/> : <LoginPage/>}/>
      <Route path="/*" element={state.currentUser ? <Layout/> : <Navigate to="/login" replace/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRouter/>
        <Toasts/>
      </AppProvider>
    </HashRouter>
  )
}
