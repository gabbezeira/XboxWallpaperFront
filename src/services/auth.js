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
 * Tenta login via Popup primeiro (melhor UX no PC).
 * Se for bloqueado ou falhar, cai automaticamente para Redirect (Xbox/Mobile).
 */
export const signInWithGoogle = () => {
  console.log('[Auth] Iniciando fluxo Google...')
  
  // IMPORTANTE: Chamamos signInWithPopup sem 'await' ou promessas antes
  // para que o navegador reconheça o clique do usuário e não barre o popup.
  return signInWithPopup(auth, googleProvider)
    .then(async (result) => {
      console.log('[Auth] Login via Popup OK')
      await syncWithBackend(result.user)
      return result.user
    })
    .catch((error) => {
      // Se o popup foi bloqueado ou fechado, tentamos o Redirect
      if (
        error.code === 'auth/popup-blocked' || 
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-closed-by-user'
      ) {
        console.log('[Auth] Popup não disponível, iniciando Redirect...')
        return signInWithRedirect(auth, googleProvider)
      }
      console.error('[Auth] Erro no login Google:', error)
      throw error
    })
}

export const handleAuthRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth)
    if (!result) return null

    console.log('[Auth] Usuário capturado do redirecionamento:', result.user.email)
    await syncWithBackend(result.user)
    return result.user
  } catch (error) {
    console.error('[Auth] Erro no handleAuthRedirectResult:', error)
    return null
  }
}
