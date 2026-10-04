import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, authReady } from '../services/firebase';
import { api } from '../services/api';
import { invalidateCache } from '../services/apiCache';
import { handleAuthRedirectResult } from '../services/auth';

const CACHED_PROFILE_KEY = 'spartan_user_profile';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const isMountedRef = useRef(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(CACHED_PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(CACHED_PROFILE_KEY);
      return saved ? Boolean(JSON.parse(saved)?.isAdmin) : false;
    } catch {
      return false;
    }
  });
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
      try {
        const saved = localStorage.getItem(CACHED_PROFILE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.isAdmin = adminStatus;
          localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(parsed));
        }
      } catch {}
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
        const fullProfile = {
          ...data,
          uid: firebaseUser.uid,
          maxImages: data?.maxImages || 8,
        };
        setProfile(fullProfile);
        try {
          localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(fullProfile));
        } catch {}
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
          try {
            const saved = localStorage.getItem(CACHED_PROFILE_KEY);
            const parsed = saved ? JSON.parse(saved) : null;
            if (parsed && parsed.uid && parsed.uid !== firebaseUser.uid) {
              setProfile(null);
              localStorage.removeItem(CACHED_PROFILE_KEY);
            }
          } catch {}
          await Promise.all([
            fetchProfile(firebaseUser),
            checkAdminClaim(firebaseUser),
          ]);
        } else {
          setProfile(null);
          setIsAdmin(false);
          try {
            localStorage.removeItem(CACHED_PROFILE_KEY);
          } catch {}
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
    if (user) {
      invalidateCache('/api/wallpapers/profile');
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  const refreshAdminStatus = useCallback(async () => {
    if (user) await checkAdminClaim(user, true);
  }, [user, checkAdminClaim]);

  const emailVerified = Boolean(user?.emailVerified);
  const needsEmailVerification = Boolean(
    user &&
    user.providerData?.some((p) => p.providerId === 'password') &&
    !user.emailVerified
  );

  useEffect(() => {
    if (!user || user.emailVerified) return undefined;

    const checkVerificationOnFocus = async () => {
      if (document.visibilityState === 'visible') {
        try {
          await user.reload();
          if (user.emailVerified && isMountedRef.current) {
            setUser({ ...user });
            await refreshProfile();
          }
        } catch {}
      }
    };

    document.addEventListener('visibilitychange', checkVerificationOnFocus);
    window.addEventListener('focus', checkVerificationOnFocus);

    return () => {
      document.removeEventListener('visibilitychange', checkVerificationOnFocus);
      window.removeEventListener('focus', checkVerificationOnFocus);
    };
  }, [user, refreshProfile]);

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      isAdmin,
      loading,
      authError,
      emailVerified,
      needsEmailVerification,
      refreshProfile,
      refreshAdminStatus,
    }),
    [
      user,
      profile,
      isAdmin,
      loading,
      authError,
      emailVerified,
      needsEmailVerification,
      refreshProfile,
      refreshAdminStatus,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
