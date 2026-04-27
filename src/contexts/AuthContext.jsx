import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { api } from '../services/api'
import { handleAuthRedirectResult } from '../services/auth'

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
  const isMountedRef = useRef(true)
  const cached = getCachedAuth()

  const [user, setUser] = useState(
    cached ? { ...cached, getIdToken: () => Promise.resolve('') } : null
  )
  const [profile, setProfile] = useState(cached?.profile || null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (firebaseUser) => {
    try {
      const data = await api.profile.get()
      if (isMountedRef.current) {
        setProfile(data)
        setCachedAuth(firebaseUser, data)
      }
    } catch (error) {
      console.warn('Erro ao buscar perfil:', error)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    // Intercepta o redirecionamento assim que o app carrega
    const handleRedirect = async () => {
      // Pequeno delay para garantir que os cookies/storage foram processados pelo browser
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        const resultUser = await handleAuthRedirectResult()
        if (resultUser && isMountedRef.current) {
          setUser(resultUser)
          await fetchProfile(resultUser)
        }
      } catch (err) {
        console.warn('Erro ao processar redirect do Auth:', err)
      } finally {
        if (isMountedRef.current) setLoading(false)
      }
    }

    handleRedirect()

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isMountedRef.current) {
        setUser(firebaseUser)
        if (firebaseUser) {
          await fetchProfile(firebaseUser)
        } else {
          setProfile(null)
          setCachedAuth(null, null)
        }
        setLoading(false)
      }
    })

    return () => {
      isMountedRef.current = false
      unsubscribe()
    }
  }, [fetchProfile])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user)
    }
  }, [user, fetchProfile])

  const contextValue = useMemo(() => ({
    user,
    profile,
    loading,
    refreshProfile
  }), [user, profile, loading, refreshProfile])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
