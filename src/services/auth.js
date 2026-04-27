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
  // Forçamos o uso de Popup em todos os ambientes (Local e Vercel)
  // O Popup evita o problema de bloqueio de cookies de terceiros que mata o Redirect na Vercel
  try {
    console.log('[Auth] Iniciando login via Popup...')
    const result = await signInWithPopup(auth, googleProvider)
    console.log('[Auth] Login via Popup realizado com sucesso')
    await syncWithBackend(result.user)
    return result.user
  } catch (error) {
    console.error('[Auth] Erro no login via Popup:', error)
    
    // Se o Popup for bloqueado pelo navegador, tentamos o Redirect como última alternativa
    if (error.code === 'auth/popup-blocked') {
      console.log('[Auth] Popup bloqueado, tentando Redirect...')
      await signInWithRedirect(auth, googleProvider)
    } else {
      throw error
    }
  }
}

export const handleAuthRedirectResult = async () => {
  try {
    // Adicionamos um timeout manual para não deixar o app travado se o Firebase falhar
    const redirectPromise = getRedirectResult(auth)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 5000)
    )

    const result = await Promise.race([redirectPromise, timeoutPromise]).catch(err => {
      if (err.message === 'timeout') {
        console.warn('[Auth] Tempo limite atingido ao verificar redirecionamento (possível bloqueio de cookies)')
        return null
      }
      throw err
    })

    if (!result) return null

    const user = result.user
    await syncWithBackend(user)
    return user
  } catch (error) {
    console.error('[Auth] Erro no handleAuthRedirectResult:', error)
    return null
  }
}
