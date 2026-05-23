import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../api/auth'
import { GraduationCap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB] p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full -ml-48 -mb-48 blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Lernzeit-Manager</h1>
          <p className="text-slate-500 mt-2">Willkommen zurück! Bitte melde dich an.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">E-Mail Adresse</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passwort</label>
                <button type="button" className="text-[10px] font-bold text-indigo-500 hover:underline uppercase tracking-wider">Vergessen?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
            </div>

            {login.isError && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
                <span className="text-lg">⚠️</span>
                Anmeldung fehlgeschlagen. Bitte prüfe deine Daten.
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl py-4 font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:opacity-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {login.isPending ? 'Wird angemeldet...' : 'Anmelden'}
              {!login.isPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500">
              Noch kein Konto?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                Kostenlos registrieren
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <Sparkles size={16} className="text-indigo-300" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Besser lernen mit System</p>
        </div>
      </div>
    </div>
  )
}
