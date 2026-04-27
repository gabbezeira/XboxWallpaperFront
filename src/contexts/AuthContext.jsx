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
    if (!firebaseUser || !isMountedRef.current) return
    try {
      const data = await api.profile.get()
      if (isMountedRef.current) {
        setProfile(data)
      }
    } catch (error) {
      console.warn('[Auth] Erro ao buscar perfil:', error)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    console.log('[Auth] Inicializando sistema...')

    // 1. OUVINTE DE ESTADO (Eficiente e Grátis)
    // Esse ouvinte só dispara quando o estado REALMENTE muda.
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

    // 2. CAPTURA DE REDIRECT (Uma única vez ao carregar a página)
    const checkRedirect = async () => {
      // Só tentamos capturar o redirect se houver sinal de que viemos do Google na URL
      if (window.location.href.includes('apiKey=')) {
        try {
          const resultUser = await handleAuthRedirectResult()
          if (resultUser && isMountedRef.current) {
            setUser(resultUser)
            await fetchProfile(resultUser)
          }
        } catch (err) {
          console.error('[Auth] Erro no redirect:', err)
        }
      }
    }

    checkRedirect()

    return () => {
      isMountedRef.current = false
      unsubscribe()
    }
  }, [fetchProfile])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user)
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
