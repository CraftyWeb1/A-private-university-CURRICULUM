import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  claimLegacy,
  hasUnclaimedLegacy,
  loadLegacyStore,
  saveUserStore,
} from './storage'

const USERS_KEY = 'dar-al-ilm-users'
const SESSION_KEY = 'dar-al-ilm-session'

export type Account = {
  id: string
  name: string
  email: string
  salt: string
  hash: string
  createdAt: string
}

export type SessionUser = {
  id: string
  name: string
  email: string
}

function readUsers(): Account[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Account[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsers(users: Account[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string) {
  const clean = hex.length % 2 ? `0${hex}` : hex
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

async function hashPassword(password: string, salt: Uint8Array) {
  const saltBuffer = Uint8Array.from(salt)
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuffer, iterations: 120_000, hash: 'SHA-256' },
    key,
    256,
  )
  return bytesToHex(new Uint8Array(bits))
}

function publicUser(account: Account): SessionUser {
  return { id: account.id, name: account.name, email: account.email }
}

function currentUserFromSession(): SessionUser | null {
  const id = readSessionId()
  if (!id) return null
  const account = readUsers().find((u) => u.id === id)
  return account ? publicUser(account) : null
}

type AuthApi = {
  user: SessionUser | null
  hasLegacy: boolean
  signUp: (name: string, email: string, password: string, keepNotebook: boolean) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const Ctx = createContext<AuthApi | null>(null)

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Auth missing')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => currentUserFromSession())

  const api = useMemo<AuthApi>(
    () => ({
      user,
      hasLegacy: hasUnclaimedLegacy(),
      signUp: async (name, email, password, keepNotebook) => {
        const trimmedName = name.trim()
        const normalized = email.trim().toLowerCase()
        if (!trimmedName) throw new Error('Give your space a name.')
        if (!normalized.includes('@')) throw new Error('That email does not look right.')
        if (password.length < 8) throw new Error('Password needs at least 8 characters.')
        const users = readUsers()
        if (users.some((u) => u.email === normalized)) {
          throw new Error('An account with that email already exists. Log in instead.')
        }
        const salt = crypto.getRandomValues(new Uint8Array(16))
        const account: Account = {
          id: crypto.randomUUID(),
          name: trimmedName,
          email: normalized,
          salt: bytesToHex(salt),
          hash: await hashPassword(password, salt),
          createdAt: new Date().toISOString(),
        }
        writeUsers([...users, account])
        if (keepNotebook && hasUnclaimedLegacy()) {
          saveUserStore(account.id, loadLegacyStore())
          claimLegacy(account.id)
        }
        localStorage.setItem(SESSION_KEY, account.id)
        setUser(publicUser(account))
      },
      signIn: async (email, password) => {
        const normalized = email.trim().toLowerCase()
        const account = readUsers().find((u) => u.email === normalized)
        if (!account) throw new Error('No space with that email.')
        const nextHash = await hashPassword(password, hexToBytes(account.salt))
        if (nextHash !== account.hash) throw new Error('Wrong password.')
        localStorage.setItem(SESSION_KEY, account.id)
        setUser(publicUser(account))
      },
      signOut: () => {
        localStorage.removeItem(SESSION_KEY)
        setUser(null)
        window.location.hash = '#/'
      },
    }),
    [user],
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
