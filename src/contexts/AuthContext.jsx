import { createContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { api } from '../services/api'
import { initPersistence, handleAuthRedirectResult } from '../services/auth'

export const AuthContext = createContext(null)

const CACHE_KEY = 'xbox_auth_cache'

function getCachedAuth() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}

function setCachedAuth(user, profile) {
  try {
    if (user) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          profile
        })
      )
    } else {
      localStorage.removeItem(CACHE_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }) {
  const cached = getCachedAuth()

  const [user, setUser] = useState(
    cached ? { ...cached, getIdToken: () => Promise.resolve('') } : null
  )
  const [profile, setProfile] = useState(cached?.profile || null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (firebaseUser) => {
    try {
      const data = await api.profile.get()
      setProfile(data)
      setCachedAuth(firebaseUser, data)
    } catch (error) {
      console.warn('Erro ao buscar perfil:', error)
    }
  }

  useEffect(() => {
    initPersistence()
      .then(() => handleAuthRedirectResult())
      .catch(console.warn)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        await fetchProfile(firebaseUser)
      } else {
        setProfile(null)
        setCachedAuth(null, null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
