import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { api } from '../services/api'
import { handleAuthRedirectResult } from '../services/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const isMountedRef = useRef(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return
    try {
      const data = await api.profile.get()
      if (isMountedRef.current) {
        setProfile(data)
      }
    } catch (error) {
      console.warn('Erro ao buscar perfil:', error)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    const initializeAuth = async () => {
      try {
        // 1. Processa o resultado do redirecionamento (Google/Microsoft)
        // Isso consome o resultado do redirecionamento e faz o login oficial
        const resultUser = await handleAuthRedirectResult()
        
        if (resultUser && isMountedRef.current) {
          setUser(resultUser)
          await fetchProfile(resultUser)
        }
      } catch (err) {
        console.error('Erro ao processar redirect do Auth:', err)
      } finally {
        // 2. Ouve mudanças de estado (Login/Logout/Persistência Nativa)
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (isMountedRef.current) {
            setUser(firebaseUser)
            if (firebaseUser) {
              await fetchProfile(firebaseUser)
            } else {
              setProfile(null)
            }
            setLoading(false)
          }
        })

        return () => {
          unsubscribe()
        }
      }
    }

    const authCleanupPromise = initializeAuth()

    return () => {
      isMountedRef.current = false
      authCleanupPromise.then(cleanup => cleanup && cleanup())
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
