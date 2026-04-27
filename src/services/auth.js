import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithRedirect,
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

export const signInWithGoogle = () => {
  console.log('[Auth] Iniciando login via Redirect (Otimizado para Xbox/PC)...')
  // Usamos Redirect direto para garantir consistência entre PC/Xbox/Mobile
  // Não usamos async/await aqui no início para o clique ser processado instantaneamente pelo navegador
  return signInWithRedirect(auth, googleProvider)
}

export const handleAuthRedirectResult = async () => {
  try {
    // Define persistência antes de checar
    await setPersistence(auth, browserLocalPersistence)
    
    // Aumentamos o timeout para 10 segundos para conexões mais lentas ou PCs
    const redirectPromise = getRedirectResult(auth)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 10000)
    )

    const result = await Promise.race([redirectPromise, timeoutPromise]).catch(err => {
      if (err.message === 'timeout') {
        console.warn('[Auth] Tempo limite de 10s atingido no redirecionamento')
        return null
      }
      throw err
    })

    if (!result) return null

    console.log('[Auth] Usuário capturado do redirecionamento:', result.user.email)
    await syncWithBackend(result.user)
    return result.user
  } catch (error) {
    console.error('[Auth] Erro no handleAuthRedirectResult:', error)
    return null
  }
}
