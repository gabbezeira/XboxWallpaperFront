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

export const signInWithGoogle = async () => {
  const isLocalhost = window.location.hostname === 'localhost'
  
  // No localhost, o Popup é 100% confiável e evita problemas de cookies de terceiros
  // No Xbox/Vercel, usamos o Redirect para compatibilidade
  if (isLocalhost) {
    console.log('[Auth] Usando Popup para login no localhost')
    const result = await signInWithPopup(auth, googleProvider)
    await syncWithBackend(result.user)
    return result.user
  } else {
    console.log('[Auth] Usando Redirect para login em produção')
    await signInWithRedirect(auth, googleProvider)
  }
}

export const handleAuthRedirectResult = async () => {
  try {
    // Garante persistência local antes de checar o resultado
    await setPersistence(auth, browserLocalPersistence)
    
    const result = await getRedirectResult(auth)
    if (!result) return null

    const user = result.user
    await syncWithBackend(user)
    return user
  } catch (error) {
    console.error('[Auth] Erro no handleAuthRedirectResult:', error)
    throw error
  }
}
