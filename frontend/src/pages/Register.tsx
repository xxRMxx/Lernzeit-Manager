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
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
