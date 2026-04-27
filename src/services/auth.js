import {
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  getAdditionalUserInfo
} from 'firebase/auth'
import { auth } from './firebase'

const microsoftProvider = new OAuthProvider('microsoft.com')
microsoftProvider.addScope('openid')
microsoftProvider.addScope('profile')
microsoftProvider.addScope('email')
microsoftProvider.addScope('User.Read')

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '')

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

async function fetchGraphPhoto(accessToken) {
  if (!accessToken) return null

  try {
    const res = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!res.ok) return null

    const blob = await res.blob()
    if (blob.size === 0) return null

    const token = await auth.currentUser.getIdToken()
    const fd = new FormData()
    fd.append('photo', blob, 'profile.jpg')

    const upload = await fetch(`${API_URL}/api/auth/profile-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    })

    if (upload.ok) {
      const data = await upload.json()
      return data.photoURL || null
    }
  } catch (e) {
    console.warn('Erro ao buscar foto do Graph:', e)
  }

  return null
}

export const signInWithMicrosoft = async () => {
  await signInWithRedirect(auth, microsoftProvider)
}

export const handleAuthRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth)
    if (!result) return null

    const credential = OAuthProvider.credentialFromResult(result)
    const accessToken = credential?.accessToken
    const user = result.user

    let photoURL = user.photoURL || user.providerData?.[0]?.photoURL || null
    let displayName = user.displayName || user.providerData?.[0]?.displayName || null

    if (!displayName) {
      try {
        const additional = getAdditionalUserInfo(result)
        displayName = additional?.profile?.displayName || additional?.profile?.name || user.email?.split('@')[0] || 'Jogador'
      } catch {
        displayName = user.email?.split('@')[0] || 'Jogador'
      }
    }

    const graphPhoto = await fetchGraphPhoto(accessToken)
    if (graphPhoto) {
      photoURL = graphPhoto
    }

    if (displayName || photoURL) {
      await updateProfile(user, {
        ...(displayName && { displayName }),
        ...(photoURL && { photoURL })
      })
    }

    await user.reload()
    await syncWithBackend(auth.currentUser)
    return auth.currentUser
  } catch (error) {
    console.error('Erro no handleAuthRedirectResult:', error)
    throw error
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
