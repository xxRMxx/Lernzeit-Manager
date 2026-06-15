import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GoalList from './pages/Goals/GoalList'
import GoalDetail from './pages/Goals/GoalDetail'
import Stopwatch from './pages/Stopwatch'
import Planning from './pages/Planning'
import Settings from './pages/Settings'
import Admin from './pages/Admin'

export default function App() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/goals" element={<GoalList />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
          <Route path="/stopwatch" element={<Stopwatch />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={user?.role === 'ADMIN' ? <Admin /> : <Navigate to="/" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
