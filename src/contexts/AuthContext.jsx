import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, authReady } from '../services/firebase';
import { api } from '../services/api';
import { handleAuthRedirectResult } from '../services/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const isMountedRef = useRef(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser || !isMountedRef.current) return;
    try {
      const data = await api.profile.get();
      if (isMountedRef.current) {
        setProfile(data);
      }
    } catch (error) {
      console.warn('[Auth] Erro ao buscar perfil:', error);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    let unsubscribe = () => {};

    const init = async () => {
      await authReady;

      try {
        const resultUser = await handleAuthRedirectResult();
        if (resultUser && isMountedRef.current) {
          setUser(resultUser);
          await fetchProfile(resultUser);
        }
      } catch (err) {
        console.error('[Auth] Erro ao capturar resultado do redirect:', err);
        if (isMountedRef.current) {
          setAuthError('Erro ao completar o login. Tente novamente.');
        }
      }

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMountedRef.current) return;
        setUser(firebaseUser);
        if (firebaseUser) {
          await fetchProfile(firebaseUser);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    };

    init();

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user);
  }, [user, fetchProfile]);

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      loading,
      authError,
      refreshProfile,
    }),
    [user, profile, loading, authError, refreshProfile],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
