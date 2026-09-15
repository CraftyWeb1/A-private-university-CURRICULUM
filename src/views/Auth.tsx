import { useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth'

export function AuthScreen() {
  const { signUp, signIn, hasLegacy } = useAuth()
  const [mode, setMode] = useState<'create' | 'login'>('create')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepNotebook, setKeepNotebook] = useState(hasLegacy)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'create') await signUp(name, email, password, keepNotebook)
      else await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="panel auth-card">
        <span className="arab">دار العلم</span>
        <span className="kicker">Dar al-Ilm</span>
        <h1>{mode === 'create' ? 'Make your space' : 'Welcome back'}</h1>
        <p className="lede" style={{ fontSize: 18 }}>
          {mode === 'create'
            ? 'A blank university of your own. Add schools, courses, a timetable — nothing here is anyone else’s.'
            : 'Open the notebook that belongs to this email.'}
        </p>
        <form className="stack" onSubmit={onSubmit}>
          {mode === 'create' ? (
            <label className="field">
              <span>Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </label>
          ) : null}
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              minLength={8}
              required
            />
          </label>
          {mode === 'create' && hasLegacy ? (
            <label className="auth-keep">
              <input
                type="checkbox"
                checked={keepNotebook}
                onChange={(e) => setKeepNotebook(e.target.checked)}
              />
              Keep the notebook already on this computer
            </label>
          ) : null}
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="gold" type="submit" disabled={busy}>
            {busy ? 'One moment…' : mode === 'create' ? 'Create space' : 'Log in'}
          </button>
        </form>
        <button
          className="linkish"
          type="button"
          onClick={() => {
            setError('')
            setMode((m) => (m === 'create' ? 'login' : 'create'))
          }}
        >
          {mode === 'create' ? 'I already have a space' : 'I need a new space'}
        </button>
      </div>
    </div>
  )
}
