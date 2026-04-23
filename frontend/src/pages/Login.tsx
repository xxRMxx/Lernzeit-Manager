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
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}
