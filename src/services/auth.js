import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
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
    
    // Se for Google, tenta pegar uma versão de alta resolução da foto
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
    console.warn('Erro ao sincronizar com backend:', error)
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
  // Uso estrito de Redirect para garantir compatibilidade com PWA/UWP no Xbox
  await signInWithRedirect(auth, googleProvider)
}

export const handleAuthRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth)
    if (!result) return null

    const user = result.user
    
    // Atualiza/Cria perfil no backend assim que volta do redirecionamento
    await syncWithBackend(user)

    return user
  } catch (error) {
    console.error('Erro no handleAuthRedirectResult:', error)
    throw error
  }
}
