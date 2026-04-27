import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth'
import { auth } from './firebase'

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '')

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

async function syncWithBackend(user) {
  try {
    const token = await user.getIdToken()
    const displayName = user.displayName || user.providerData?.[0]?.displayName || user.email?.split('@')[0] || 'Jogador'
    let photoURL = user.photoURL || user.providerData?.[0]?.photoURL || null
    
    if (photoURL && photoURL.includes('googleusercontent.com')) {
      photoURL = photoURL.replace(/s\d+(-c)/, 's400$1')
    }

    await fetch(`${API_URL}/api/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ displayName, photoURL })
    })
  } catch (error) {
    console.warn('[Auth] Erro ao sincronizar com backend:', error)
  }
}

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password)
  await syncWithBackend(result.user)
  return result.user
}

export const signUpWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  await syncWithBackend(result.user)
  return result.user
}

export const logOut = async () => {
  await signOut(auth)
}

/**
 * Tenta login via Google.
 * No PC, o segredo é chamar o Popup síncronamente ao clique.
 */
export const signInWithGoogle = () => {
  // Disparo imediato para evitar bloqueio de popup pelo navegador
  return signInWithPopup(auth, googleProvider)
    .then(async (result) => {
      await syncWithBackend(result.user)
      return result.user
    })
    .catch((error) => {
      // Se falhar ou for bloqueado, o fallback é o redirect
      // O redirect na Vercel só funcionará se o navegador permitir cookies de terceiros
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.warn('[Auth] Popup bloqueado ou fechado, tentando redirect...')
        return signInWithRedirect(auth, googleProvider)
      }
      throw error
    })
}

export const handleAuthRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth)
    if (!result) return null
    await syncWithBackend(result.user)
    return result.user
  } catch (error) {
    console.error('[Auth] Erro no handleAuthRedirectResult:', error)
    return null
  }
}
