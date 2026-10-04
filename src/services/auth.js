import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCustomToken,
  OAuthProvider,
} from 'firebase/auth';
import { auth } from './firebase';
import { clearAllCache } from './apiCache';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({ prompt: 'select_account' });

async function syncWithBackend(user) {
  try {
    const token = await user.getIdToken();
    const displayName =
      user.displayName ||
      user.providerData?.[0]?.displayName ||
      user.email?.split('@')[0] ||
      'Jogador';
    let photoURL = user.photoURL || user.providerData?.[0]?.photoURL || null;

    if (photoURL && photoURL.includes('googleusercontent.com')) {
      photoURL = photoURL.replace(/s\d+(-c)/, 's400$1');
    }

    await fetch(`${API_URL}/api/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ displayName, photoURL }),
    });
  } catch (error) {
    console.warn('[Auth] Erro ao sincronizar com backend:', error);
  }
}

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await syncWithBackend(result.user);
  return result.user;
};

export const signUpWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await syncWithBackend(result.user);
  return result.user;
};

export const logOut = async () => {
  try {
    localStorage.removeItem('spartan_user_profile');
  } catch {}
  clearAllCache();
  await signOut(auth);
  sessionStorage.clear();
};

export const signInWithMicrosoft = async () => {
  try {
    const result = await signInWithPopup(auth, microsoftProvider);
    await syncWithBackend(result.user);
    return result.user;
  } catch (err) {
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      sessionStorage.setItem('oauth_redirect', 'true');
      await signInWithRedirect(auth, microsoftProvider);
      return null;
    }
    throw err;
  }
};

export const loginWithCustomToken = async (customToken) => {
  const result = await signInWithCustomToken(auth, customToken);
  await syncWithBackend(result.user);
  return result.user;
};

export const handleAuthRedirectResult = async () => {
  const result = await getRedirectResult(auth);
  if (!result) return null;
  await syncWithBackend(result.user);
  return result.user;
};

