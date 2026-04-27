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
    console.log('%c[Auth] Buscando perfil no backend...', 'color: #3498db')
    try {
      const data = await api.profile.get()
      if (isMountedRef.current) {
        setProfile(data)
        console.log('%c[Auth] Perfil carregado com sucesso', 'color: #2ecc71')
      }
    } catch (error) {
      console.warn('[Auth] Erro ao buscar perfil:', error)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    console.log('%c[Auth] Inicializando sistema de autenticação...', 'color: #f1c40f; font-weight: bold')

    // 1. OUVINTE DE ESTADO (O motor principal)
    // Ele deve rodar IMEDIATAMENTE e de forma independente
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('%c[Auth] Mudança de estado detectada:', 'color: #9b59b6', firebaseUser ? `Usuário: ${firebaseUser.email}` : 'Deslogado')
      
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

    // 2. CAPTURA DE REDIRECT (Processo paralelo)
    const checkRedirect = async () => {
      try {
        console.log('%c[Auth] Verificando resultado de redirecionamento...', 'color: #e67e22')
        const resultUser = await handleAuthRedirectResult()
        
        if (resultUser) {
          console.log('%c[Auth] Login via Redirect detectado com sucesso!', 'color: #2ecc71; font-weight: bold')
          if (isMountedRef.current) {
            setUser(resultUser)
            await fetchProfile(resultUser)
          }
        } else {
          console.log('%c[Auth] Nenhum redirecionamento pendente.', 'color: #7f8c8d')
        }
      } catch (err) {
        console.error('%c[Auth] Erro crítico no processamento do Redirect:', 'color: #e74c3c', err)
      }
    }

    checkRedirect()

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
