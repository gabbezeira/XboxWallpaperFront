import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithPopup,
  OAuthProvider
} from 'firebase/auth'
import { auth } from './firebase'

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '')

const microsoftProvider = new OAuthProvider('microsoft.com')
// Parâmetro customizado para evitar login silencioso na conta errada, útil no Edge do Xbox
microsoftProvider.setCustomParameters({
  prompt: 'select_account'
})
microsoftProvider.addScope('openid')
microsoftProvider.addScope('profile')
microsoftProvider.addScope('email')
microsoftProvider.addScope('user.read')

async function syncWithBackend(user) {
  try {
    const token = await user.getIdToken()
    const displayName = user.displayName || user.providerData?.[0]?.displayName || user.email?.split('@')[0] || 'Jogador'
    const photoURL = user.photoURL || user.providerData?.[0]?.photoURL || null

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

export const signInWithMicrosoft = async () => {
  // Alterado para Popup: O fluxo de Redirect sofre bloqueios severos no Edge (Xbox)
  // devido ao Tracking Prevention, que apaga o IndexedDB entre os redirecionamentos de domínio.
  const result = await signInWithPopup(auth, microsoftProvider)
  
  // Sincroniza logo após o popup fechar com sucesso
  await syncWithBackend(result.user)
  return result.user
}

export const handleAuthRedirectResult = async () => {
  // Mantido apenas por compatibilidade com a chamada no AuthContext,
  // mas o fluxo agora é totalmente gerido pelo popup acima.
  return null
}
