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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAdminClaim = useCallback(async (firebaseUser, forceRefresh = false) => {
    if (!firebaseUser) {
      if (isMountedRef.current) setIsAdmin(false);
      return false;
    }
    try {
      const tokenResult = await firebaseUser.getIdTokenResult(forceRefresh);
      const adminStatus = Boolean(tokenResult.claims.admin);
      if (isMountedRef.current) setIsAdmin(adminStatus);
      return adminStatus;
    } catch {
      if (isMountedRef.current) setIsAdmin(false);
      return false;
    }
  }, []);

  const fetchProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser || !isMountedRef.current) return;
    try {
      const data = await api.profile.get();
      if (isMountedRef.current) {
        setProfile({
          ...data,
          maxImages: data?.maxImages || 8,
        });
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
          await Promise.all([
            fetchProfile(resultUser),
            checkAdminClaim(resultUser),
          ]);
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
          await Promise.all([
            fetchProfile(firebaseUser),
            checkAdminClaim(firebaseUser),
          ]);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
      });
    };

    init();

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [fetchProfile, checkAdminClaim]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user);
  }, [user, fetchProfile]);

  const refreshAdminStatus = useCallback(async () => {
    if (user) await checkAdminClaim(user, true);
  }, [user, checkAdminClaim]);

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      isAdmin,
      loading,
      authError,
      refreshProfile,
      refreshAdminStatus,
    }),
    [user, profile, isAdmin, loading, authError, refreshProfile, refreshAdminStatus],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
