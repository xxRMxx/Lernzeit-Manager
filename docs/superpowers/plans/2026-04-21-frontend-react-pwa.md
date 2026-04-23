# Frontend: React PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React TypeScript PWA aufbauen, die die Django REST API konsumiert und auf Desktop + Mobile (installierbar) funktioniert.

**Architecture:** Vite + React + TypeScript im `frontend/`-Verzeichnis. React Query für Server-State, Zustand für Auth-State. Tailwind CSS für mobile-first Design. PWA via vite-plugin-pwa.

**Voraussetzung:** Backend-Plan vollständig abgeschlossen und Server läuft auf `http://localhost:8000`.

**Tech Stack:** Vite 5, React 18, TypeScript, Tailwind CSS 3, React Query (TanStack), Zustand, Axios, vite-plugin-pwa, React Router 6

---

## Dateistruktur

```
frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── public/
│   └── icons/              – PWA-Icons (512x512, 192x192)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── api/
    │   ├── client.ts        – Axios-Instanz mit Token-Interceptor
    │   ├── auth.ts          – Auth-Endpunkte + React Query Hooks
    │   ├── goals.ts         – Goals CRUD + Hooks
    │   ├── sessions.ts      – Sessions + Hooks
    │   ├── milestones.ts    – Milestones + Hooks
    │   └── dashboard.ts     – Dashboard-Hook
    ├── store/
    │   └── auth.ts          – Zustand-Store: Token, User
    ├── components/
    │   ├── Layout.tsx        – Shell mit Nav
    │   ├── BottomNav.tsx     – Mobile-Navigation
    │   ├── Sidebar.tsx       – Desktop-Navigation
    │   └── ProtectedRoute.tsx
    └── pages/
        ├── Login.tsx
        ├── Register.tsx
        ├── Dashboard.tsx
        ├── Goals/
        │   ├── GoalList.tsx
        │   ├── GoalDetail.tsx
        │   └── GoalForm.tsx
        ├── Stopwatch.tsx
        ├── Milestones.tsx
        ├── Planning.tsx
        └── Settings.tsx
```

---

### Task 1: React-Projekt aufsetzen

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`

- [ ] **Schritt 1: Vite-Projekt anlegen**

```bash
cd /path/to/Lernzeit-Manager
npm create vite@latest frontend -- --template react-ts
cd frontend
```

- [ ] **Schritt 2: Dependencies installieren**

```bash
npm install \
  @tanstack/react-query \
  axios \
  zustand \
  react-router-dom \
  @tanstack/react-query-devtools

npm install -D \
  tailwindcss \
  postcss \
  autoprefixer \
  vite-plugin-pwa \
  @types/node
```

- [ ] **Schritt 3: Tailwind initialisieren**

```bash
npx tailwindcss init -p
```

- [ ] **Schritt 4: `frontend/tailwind.config.js` anpassen**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Schritt 5: `frontend/src/index.css` – Tailwind-Direktiven eintragen**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Schritt 6: `frontend/vite.config.ts` schreiben**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lernzeit-Manager',
        short_name: 'Lernzeit',
        description: 'Verwalte deine Lernziele',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

---

### Task 2: API-Client und Auth-Store

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/store/auth.ts`
- Create: `frontend/src/api/auth.ts`

- [ ] **Schritt 1: `frontend/src/api/client.ts` schreiben**

```typescript
import axios from 'axios'
import { useAuthStore } from '../store/auth'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default client
```

- [ ] **Schritt 2: `frontend/src/store/auth.ts` schreiben**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  display_name: string
}

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth' }
  )
)
```

- [ ] **Schritt 3: `frontend/src/api/auth.ts` schreiben**

```typescript
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import client from './client'
import { useAuthStore } from '../store/auth'

interface LoginData { email: string; password: string }
interface RegisterData { email: string; password1: string; password2: string }

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginData) =>
      client.post<{ key: string }>('/auth/login/', data).then((r) => r.data),
    onSuccess: async (data) => {
      const me = await client.get('/users/me/', {
        headers: { Authorization: `Token ${data.key}` },
      })
      setAuth(data.key, me.data)
      navigate('/')
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterData) =>
      client.post<{ key: string }>('/auth/registration/', data).then((r) => r.data),
    onSuccess: async (data) => {
      const me = await client.get('/users/me/', {
        headers: { Authorization: `Token ${data.key}` },
      })
      setAuth(data.key, me.data)
      navigate('/')
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => client.post('/auth/logout/'),
    onSettled: () => {
      logout()
      navigate('/login')
    },
  })
}
```

---

### Task 3: API-Hooks für Goals, Sessions, Dashboard

**Files:**
- Create: `frontend/src/api/goals.ts`
- Create: `frontend/src/api/sessions.ts`
- Create: `frontend/src/api/dashboard.ts`

- [ ] **Schritt 1: `frontend/src/api/goals.ts` schreiben**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'

export interface Goal {
  id: string
  title: string
  description: string
  target_hours: number
  start_date: string | null
  end_date: string | null
  visibility: 'PRIVATE' | 'SHARED' | 'COLLABORATIVE'
  created_at: string
  owner: { id: number; email: string; display_name: string }
  memberships: Membership[]
  plans: Plan[]
  milestones: Milestone[]
}

export interface Membership {
  id: number
  user: { id: number; email: string; display_name: string }
  role: 'VIEWER' | 'CONTRIBUTOR'
  joined_at: string
}

export interface Plan {
  id: string
  weekly_hours: number
  created_at: string
}

export interface Milestone {
  id: string
  title: string
  target_date: string | null
  note: string
  status: 'OPEN' | 'DONE'
  created_by: { id: number; email: string; display_name: string }
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => client.get<Goal[]>('/goals/').then((r) => r.data),
  })
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => client.get<Goal>(`/goals/${id}/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Goal>) =>
      client.post<Goal>('/goals/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useUpdateGoal(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Goal>) =>
      client.patch<Goal>(`/goals/${id}/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', id] })
      qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/goals/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useGoalStats(id: string) {
  return useQuery({
    queryKey: ['goals', id, 'stats'],
    queryFn: () =>
      client.get<{
        own_hours: number
        total_hours: number
        target_hours: number
        progress_percent: number
        session_count: number
      }>(`/goals/${id}/stats/`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useAddMember(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { user_id: number; role: string }) =>
      client.post(`/goals/${goalId}/members/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}

export function useRemoveMember(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) =>
      client.delete(`/goals/${goalId}/members/${userId}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}

export function useCreateMilestone(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; target_date?: string; note?: string }) =>
      client.post<Milestone>(`/goals/${goalId}/milestones/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}

export function useUpdateMilestone(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Milestone> & { id: string }) =>
      client.patch<Milestone>(`/goals/${goalId}/milestones/${id}/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}

export function useCreatePlan(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { weekly_hours: number }) =>
      client.post(`/goals/${goalId}/plans/`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', goalId] }),
  })
}
```

- [ ] **Schritt 2: `frontend/src/api/sessions.ts` schreiben**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import client from './client'

export interface Session {
  id: string
  started_at: string
  duration_seconds: number
  note: string
  user: { id: number; email: string; display_name: string }
}

export function useSaveSession(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { started_at: string; duration_seconds: number; note?: string }) =>
      client.post<Session>(`/goals/${goalId}/sessions/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', goalId, 'stats'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
```

- [ ] **Schritt 3: `frontend/src/api/dashboard.ts` schreiben**

```typescript
import { useQuery } from '@tanstack/react-query'
import client from './client'

export interface DashboardEntry {
  id: string
  title: string
  visibility: string
  own_hours: number
  target_hours: number
  progress_percent: number
  open_milestones: number
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => client.get<DashboardEntry[]>('/dashboard/').then((r) => r.data),
  })
}
```

---

### Task 4: App-Shell, Routing und Navigation

**Files:**
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/components/Layout.tsx`
- Create: `frontend/src/components/BottomNav.tsx`
- Create: `frontend/src/components/Sidebar.tsx`
- Create: `frontend/src/components/ProtectedRoute.tsx`

- [ ] **Schritt 1: `frontend/src/main.tsx` schreiben**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 } },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Schritt 2: `frontend/src/App.tsx` schreiben**

```tsx
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
import Milestones from './pages/Milestones'
import Planning from './pages/Planning'
import Settings from './pages/Settings'

export default function App() {
  const token = useAuthStore((s) => s.token)

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
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
```

- [ ] **Schritt 3: `frontend/src/components/ProtectedRoute.tsx` schreiben**

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
```

- [ ] **Schritt 4: `frontend/src/components/BottomNav.tsx` schreiben**

```tsx
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/goals', label: 'Ziele', icon: '🎯' },
  { to: '/stopwatch', label: 'Timer', icon: '⏱' },
  { to: '/milestones', label: 'Etappen', icon: '🏁' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-50">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs gap-1 ${
              isActive ? 'text-primary-600 font-semibold' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl">{l.icon}</span>
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Schritt 5: `frontend/src/components/Sidebar.tsx` schreiben**

```tsx
import { NavLink } from 'react-router-dom'
import { useLogout } from '../api/auth'

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/goals', label: 'Lernziele', icon: '🎯' },
  { to: '/stopwatch', label: 'Stoppuhr', icon: '⏱' },
  { to: '/milestones', label: 'Meilensteine', icon: '🏁' },
  { to: '/planning', label: 'Planung', icon: '📅' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function Sidebar() {
  const logout = useLogout()

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen p-4">
      <h1 className="text-lg font-bold text-primary-600 mb-6">Lernzeit</h1>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => logout.mutate()}
        className="text-sm text-gray-400 hover:text-red-500 text-left px-3 py-2"
      >
        Abmelden
      </button>
    </aside>
  )
}
```

- [ ] **Schritt 6: `frontend/src/components/Layout.tsx` schreiben**

```tsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 pb-20 md:pb-4 max-w-3xl mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
```

---

### Task 5: Auth-Seiten (Login + Register)

**Files:**
- Create: `frontend/src/pages/Login.tsx`
- Create: `frontend/src/pages/Register.tsx`

- [ ] **Schritt 1: `frontend/src/pages/Login.tsx` schreiben**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../api/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Anmelden</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {login.isError && (
            <p className="text-red-500 text-sm">Anmeldung fehlgeschlagen. Bitte prüfe deine Daten.</p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            className="bg-primary-600 text-white rounded-lg py-2 font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {login.isPending ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Noch kein Konto?{' '}
          <Link to="/register" className="text-primary-600 font-semibold">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Schritt 2: `frontend/src/pages/Register.tsx` schreiben**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRegister } from '../api/auth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const register = useRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({ email, password1, password2 })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Konto erstellen</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="password"
            placeholder="Passwort wiederholen"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {register.isError && (
            <p className="text-red-500 text-sm">Registrierung fehlgeschlagen.</p>
          )}
          <button
            type="submit"
            disabled={register.isPending}
            className="bg-primary-600 text-white rounded-lg py-2 font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {register.isPending ? 'Registrieren...' : 'Konto erstellen'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Schon ein Konto?{' '}
          <Link to="/login" className="text-primary-600 font-semibold">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
```

---

### Task 6: Dashboard-Seite

**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`

- [ ] **Schritt 1: `frontend/src/pages/Dashboard.tsx` schreiben**

```tsx
import { Link } from 'react-router-dom'
import { useDashboard } from '../api/dashboard'
import { useAuthStore } from '../store/auth'

function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="bg-primary-500 h-2 rounded-full transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: goals, isLoading } = useDashboard()

  if (isLoading) {
    return <div className="flex justify-center py-20 text-gray-400">Laden...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Hallo{user?.display_name ? `, ${user.display_name}` : ''}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Deine aktiven Lernziele</p>
      </div>

      {!goals?.length ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-medium">Noch keine Ziele</p>
          <Link
            to="/goals"
            className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700"
          >
            Erstes Ziel erstellen
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              to={`/goals/${goal.id}`}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="font-semibold text-gray-800">{goal.title}</h2>
                  {goal.visibility !== 'PRIVATE' && (
                    <span className="text-xs text-primary-500 font-medium">
                      {goal.visibility === 'SHARED' ? 'Geteilt' : 'Kollaborativ'}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-primary-600">
                  {goal.progress_percent.toFixed(0)}%
                </span>
              </div>
              <ProgressBar percent={goal.progress_percent} />
              <div className="flex justify-between mt-3 text-xs text-gray-400">
                <span>{goal.own_hours.toFixed(1)} / {goal.target_hours} Stunden</span>
                {goal.open_milestones > 0 && (
                  <span>🏁 {goal.open_milestones} offen</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### Task 7: Goals-Seiten

**Files:**
- Create: `frontend/src/pages/Goals/GoalList.tsx`
- Create: `frontend/src/pages/Goals/GoalDetail.tsx`
- Create: `frontend/src/pages/Goals/GoalForm.tsx`

- [ ] **Schritt 1: `frontend/src/pages/Goals/GoalForm.tsx` schreiben**

```tsx
import { useState } from 'react'
import { Goal } from '../../api/goals'

interface Props {
  initial?: Partial<Goal>
  onSubmit: (data: Partial<Goal>) => void
  onCancel: () => void
  isPending: boolean
}

export default function GoalForm({ initial, onSubmit, onCancel, isPending }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [targetHours, setTargetHours] = useState(String(initial?.target_hours ?? ''))
  const [startDate, setStartDate] = useState(initial?.start_date ?? '')
  const [endDate, setEndDate] = useState(initial?.end_date ?? '')
  const [visibility, setVisibility] = useState(initial?.visibility ?? 'PRIVATE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      description,
      target_hours: Number(targetHours),
      start_date: startDate || null,
      end_date: endDate || null,
      visibility: visibility as Goal['visibility'],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        placeholder="Titel *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <textarea
        placeholder="Beschreibung"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      />
      <input
        type="number"
        placeholder="Ziel-Stunden"
        value={targetHours}
        onChange={(e) => setTargetHours(e.target.value)}
        min="0"
        step="0.5"
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Startdatum</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Enddatum</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="PRIVATE">Privat</option>
        <option value="SHARED">Geteilt (nur lesen)</option>
        <option value="COLLABORATIVE">Kollaborativ</option>
      </select>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-primary-600 text-white rounded-lg py-2 font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? 'Speichern...' : 'Speichern'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 rounded-lg py-2 text-gray-600 hover:bg-gray-50"
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Schritt 2: `frontend/src/pages/Goals/GoalList.tsx` schreiben**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGoals, useCreateGoal } from '../../api/goals'
import GoalForm from './GoalForm'

export default function GoalList() {
  const { data: goals, isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const [showForm, setShowForm] = useState(false)

  if (isLoading) return <div className="py-20 text-center text-gray-400">Laden...</div>

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Lernziele</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700"
        >
          + Neu
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Neues Ziel</h2>
          <GoalForm
            onSubmit={(data) => createGoal.mutate(data, { onSuccess: () => setShowForm(false) })}
            onCancel={() => setShowForm(false)}
            isPending={createGoal.isPending}
          />
        </div>
      )}

      {!goals?.length && !showForm ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
          <p className="text-4xl mb-3">🎯</p>
          <p>Noch keine Ziele vorhanden</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {goals?.map((goal) => (
            <Link
              key={goal.id}
              to={`/goals/${goal.id}`}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-800">{goal.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{goal.target_hours} Stunden Ziel</p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Schritt 3: `frontend/src/pages/Goals/GoalDetail.tsx` schreiben**

```tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGoal, useGoalStats, useUpdateGoal, useDeleteGoal } from '../../api/goals'
import GoalForm from './GoalForm'

function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="w-full bg-gray-100 rounded-full h-3">
      <div className="bg-primary-500 h-3 rounded-full transition-all" style={{ width: `${clamped}%` }} />
    </div>
  )
}

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: goal, isLoading } = useGoal(id!)
  const { data: stats } = useGoalStats(id!)
  const updateGoal = useUpdateGoal(id!)
  const deleteGoal = useDeleteGoal()
  const [editing, setEditing] = useState(false)

  if (isLoading || !goal) return <div className="py-20 text-center text-gray-400">Laden...</div>

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-600">
        ← Zurück
      </button>

      {editing ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <GoalForm
            initial={goal}
            onSubmit={(data) => updateGoal.mutate(data, { onSuccess: () => setEditing(false) })}
            onCancel={() => setEditing(false)}
            isPending={updateGoal.isPending}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{goal.title}</h1>
              {goal.description && <p className="text-gray-500 text-sm mt-1">{goal.description}</p>}
            </div>
            <button onClick={() => setEditing(true)} className="text-sm text-primary-600 hover:underline">
              Bearbeiten
            </button>
          </div>

          {stats && (
            <div className="mt-4 space-y-2">
              <ProgressBar percent={stats.progress_percent} />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{stats.own_hours.toFixed(1)} / {stats.target_hours} Stunden</span>
                <span>{stats.progress_percent.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-gray-400">{stats.session_count} Sessions aufgezeichnet</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Meilensteine</h2>
        {goal.milestones.length === 0 ? (
          <p className="text-sm text-gray-400">Noch keine Meilensteine</p>
        ) : (
          <ul className="space-y-2">
            {goal.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-3 text-sm">
                <span>{m.status === 'DONE' ? '✅' : '⭕'}</span>
                <span className={m.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-700'}>
                  {m.title}
                </span>
                {m.target_date && <span className="text-gray-300 text-xs">{m.target_date}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Mitglieder</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">
              {goal.owner.email[0].toUpperCase()}
            </span>
            <div>
              <p className="text-gray-700">{goal.owner.display_name || goal.owner.email}</p>
              <p className="text-xs text-gray-400">Owner</p>
            </div>
          </div>
          {goal.memberships.map((m) => (
            <div key={m.id} className="flex items-center gap-3 text-sm">
              <span className="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-xs">
                {m.user.email[0].toUpperCase()}
              </span>
              <div>
                <p className="text-gray-700">{m.user.display_name || m.user.email}</p>
                <p className="text-xs text-gray-400">{m.role === 'CONTRIBUTOR' ? 'Mitwirkend' : 'Betrachter'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm('Ziel wirklich löschen?')) {
            deleteGoal.mutate(id!, { onSuccess: () => navigate('/goals') })
          }
        }}
        className="w-full text-red-500 text-sm hover:underline py-2"
      >
        Ziel löschen
      </button>
    </div>
  )
}
```

---

### Task 8: Stoppuhr-Seite

**Files:**
- Create: `frontend/src/pages/Stopwatch.tsx`

- [ ] **Schritt 1: `frontend/src/pages/Stopwatch.tsx` schreiben**

```tsx
import { useState, useEffect, useRef } from 'react'
import { useGoals } from '../api/goals'
import { useSaveSession } from '../api/sessions'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export default function Stopwatch() {
  const { data: goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [note, setNote] = useState('')
  const startedAtRef = useRef<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveSession = useSaveSession(selectedGoalId)

  useEffect(() => {
    if (running) {
      if (!startedAtRef.current) startedAtRef.current = new Date()
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current!.getTime()) / 1000))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const handleStop = () => {
    setRunning(false)
  }

  const handleSave = () => {
    if (!selectedGoalId || elapsed === 0 || !startedAtRef.current) return
    saveSession.mutate(
      {
        started_at: startedAtRef.current.toISOString(),
        duration_seconds: elapsed,
        note,
      },
      {
        onSuccess: () => {
          setElapsed(0)
          setNote('')
          startedAtRef.current = null
        },
      }
    )
  }

  const handleReset = () => {
    setRunning(false)
    setElapsed(0)
    startedAtRef.current = null
    setNote('')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Stoppuhr</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <select
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          disabled={running}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <option value="">Ziel auswählen...</option>
          {goals?.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>

        <div className="text-center">
          <p className="text-6xl font-mono font-bold text-gray-800 tracking-wider mb-8">
            {formatTime(elapsed)}
          </p>

          <div className="flex justify-center gap-4">
            {!running ? (
              <button
                onClick={() => setRunning(true)}
                disabled={!selectedGoalId}
                className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:opacity-40"
              >
                {elapsed > 0 ? 'Fortsetzen' : 'Start'}
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-yellow-600"
              >
                Pause
              </button>
            )}
            {elapsed > 0 && !running && (
              <>
                <button
                  onClick={handleReset}
                  className="border border-gray-300 text-gray-600 px-5 py-3 rounded-xl hover:bg-gray-50"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {elapsed > 0 && !running && (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-700">Session speichern</h2>
          <textarea
            placeholder="Notiz (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <button
            onClick={handleSave}
            disabled={saveSession.isPending}
            className="w-full bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {saveSession.isPending ? 'Speichern...' : `Session speichern (${formatTime(elapsed)})`}
          </button>
          {saveSession.isSuccess && (
            <p className="text-green-600 text-sm text-center">✓ Session gespeichert!</p>
          )}
        </div>
      )}
    </div>
  )
}
```

---

### Task 9: Meilensteine, Planung und Einstellungen

**Files:**
- Create: `frontend/src/pages/Milestones.tsx`
- Create: `frontend/src/pages/Planning.tsx`
- Create: `frontend/src/pages/Settings.tsx`

- [ ] **Schritt 1: `frontend/src/pages/Milestones.tsx` schreiben**

```tsx
import { useState } from 'react'
import { useGoals, useCreateMilestone, useUpdateMilestone, Milestone } from '../api/goals'

export default function Milestones() {
  const { data: goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const selectedGoal = goals?.find((g) => g.id === selectedGoalId)
  const createMilestone = useCreateMilestone(selectedGoalId)
  const updateMilestone = useUpdateMilestone(selectedGoalId)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !selectedGoalId) return
    createMilestone.mutate(
      { title: newTitle, target_date: newDate || undefined },
      { onSuccess: () => { setNewTitle(''); setNewDate('') } }
    )
  }

  const toggleStatus = (m: Milestone) => {
    updateMilestone.mutate({ id: m.id, status: m.status === 'OPEN' ? 'DONE' : 'OPEN' })
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Meilensteine</h1>

      <select
        value={selectedGoalId}
        onChange={(e) => setSelectedGoalId(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Ziel auswählen...</option>
        {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
      </select>

      {selectedGoal && (
        <>
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 shadow-sm flex gap-2">
            <input
              placeholder="Neuer Meilenstein..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={createMilestone.isPending}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              +
            </button>
          </form>

          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {selectedGoal.milestones.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">Noch keine Meilensteine</p>
            ) : (
              selectedGoal.milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleStatus(m)} className="text-xl flex-shrink-0">
                    {m.status === 'DONE' ? '✅' : '⭕'}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${m.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {m.title}
                    </p>
                    {m.target_date && <p className="text-xs text-gray-400">{m.target_date}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Schritt 2: `frontend/src/pages/Planning.tsx` schreiben**

```tsx
import { useState } from 'react'
import { useGoals, useCreatePlan } from '../api/goals'

export default function Planning() {
  const { data: goals } = useGoals()
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [weeklyHours, setWeeklyHours] = useState('')
  const selectedGoal = goals?.find((g) => g.id === selectedGoalId)
  const createPlan = useCreatePlan(selectedGoalId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoalId || !weeklyHours) return
    createPlan.mutate(
      { weekly_hours: Number(weeklyHours) },
      { onSuccess: () => setWeeklyHours('') }
    )
  }

  const latestPlan = selectedGoal?.plans[selectedGoal.plans.length - 1]

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Planung</h1>

      <select
        value={selectedGoalId}
        onChange={(e) => setSelectedGoalId(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Ziel auswählen...</option>
        {goals?.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
      </select>

      {selectedGoal && (
        <>
          {latestPlan && (
            <div className="bg-primary-50 rounded-2xl p-4">
              <p className="text-sm text-primary-700 font-medium">Aktueller Plan</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{latestPlan.weekly_hours}h</p>
              <p className="text-xs text-primary-400">pro Woche</p>
              {selectedGoal.target_hours > 0 && latestPlan.weekly_hours > 0 && (
                <p className="text-xs text-primary-500 mt-2">
                  ≈ {Math.ceil(selectedGoal.target_hours / latestPlan.weekly_hours)} Wochen bis zum Ziel
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-700">Neuen Plan erstellen</h2>
            <input
              type="number"
              placeholder="Stunden pro Woche"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              min="0.5"
              step="0.5"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={createPlan.isPending}
              className="w-full bg-primary-600 text-white rounded-lg py-2 font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              Plan speichern
            </button>
          </form>

          {selectedGoal.plans.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm">
              <h2 className="font-semibold text-gray-700 p-4 pb-2">Planhistorie</h2>
              <div className="divide-y divide-gray-100">
                {[...selectedGoal.plans].reverse().map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className={i === 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                      {p.weekly_hours}h/Woche
                    </span>
                    <span className="text-gray-300 text-xs">{new Date(p.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Schritt 3: `frontend/src/pages/Settings.tsx` schreiben**

```tsx
import { useAuthStore } from '../store/auth'
import { useLogout } from '../api/auth'

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Einstellungen</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Profil</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.display_name || 'Kein Anzeigename'}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Ziele teilen</h2>
        <p className="text-sm text-gray-400">
          Um Ziele mit anderen zu teilen, öffne ein Ziel und ändere die Sichtbarkeit
          auf „Geteilt" oder „Kollaborativ". Mitglieder können über die Ziel-Detailseite
          eingeladen werden.
        </p>
      </div>

      <button
        onClick={() => logout.mutate()}
        className="w-full bg-red-50 text-red-500 rounded-2xl py-3 font-semibold hover:bg-red-100"
      >
        Abmelden
      </button>
    </div>
  )
}
```

---

### Task 10: Frontend starten und prüfen

**Files:** keine neuen

- [ ] **Schritt 1: Sicherstellen, dass das Backend läuft**

```bash
cd backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8000
```

- [ ] **Schritt 2: Frontend-Dev-Server starten**

```bash
cd frontend && npm run dev
```

Erwartete Ausgabe: `Local: http://localhost:5173/`

- [ ] **Schritt 3: App im Browser öffnen und prüfen**

- `http://localhost:5173/` → Weiterleitung auf `/login`
- Registrieren mit einer Test-E-Mail
- Dashboard erscheint mit „Noch keine Ziele"
- Neues Ziel anlegen über `/goals`
- Stoppuhr öffnen, Ziel auswählen, Timer starten/stoppen/speichern
- Session auf dem Dashboard als Fortschritt sichtbar

- [ ] **Schritt 4: Mobile-Ansicht prüfen**

Browser-Devtools öffnen → Mobile-Ansicht (iPhone/Android). Bottom-Navigation soll erscheinen, Desktop-Sidebar soll verschwinden.

- [ ] **Schritt 5: Vom Handy im Heimnetz zugreifen**

PC-IP-Adresse ermitteln:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

Auf dem Handy (gleiches WLAN): `http://<PC-IP>:5173` öffnen.

**Hinweis:** Der Vite-Dev-Server akzeptiert Verbindungen von allen Interfaces. Das Backend läuft bereits auf `0.0.0.0:8000` und ist über den Vite-Proxy `/api` erreichbar.
