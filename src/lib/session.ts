import type { UserSession } from '../types'
import { STORAGE_USER, type PlanId } from './constants'

export function loadSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER)
    if (!raw) return null
    const u = JSON.parse(raw) as UserSession
    if (!u?.email || !u?.plan) return null
    return u
  } catch {
    return null
  }
}

export function saveSession(user: UserSession): void {
  localStorage.setItem(STORAGE_USER, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_USER)
}

export function mockSignUp(email: string, password: string, name: string, plan: PlanId): UserSession {
  void password
  const user: UserSession = {
    email,
    name: name || email.split('@')[0] || 'Créateur',
    plan,
    createdAt: new Date().toISOString(),
  }
  saveSession(user)
  return user
}

export function mockSignIn(email: string, _password: string): UserSession {
  const existing = loadSession()
  if (existing && existing.email === email) return existing
  return mockSignUp(email, _password, email.split('@')[0] || 'Créateur', 'classic')
}
