import {
  signInWithPopup,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  setPersistence,
  indexedDBLocalPersistence,
  getAdditionalUserInfo
} from 'firebase/auth'
import { auth } from './firebase'
import { API_URL } from './api'
const microsoftProvider = new OAuthProvider('microsoft.com')
microsoftProvider.addScope('openid')
microsoftProvider.addScope('profile')
microsoftProvider.addScope('email')
microsoftProvider.addScope('https://graph.microsoft.com/User.Read')
// Depois de alterar permissões no Azure, o usuário pode precisar revogar o app em
// account.microsoft.com/consent ou usar uma vez: setCustomParameters({ prompt: 'consent' })


async function ensureUserOnBackend(user, extraData = {}) {
  try {
    const token = await user.getIdToken()
    // Sempre garante que o nome e foto do usuário estão sincronizados no banco de dados.
    const displayName = extraData.displayName || user.displayName || user.providerData?.[0]?.displayName || user.email?.split('@')[0] || 'Jogador'
    const photoURL = extraData.photoURL || user.photoURL || user.providerData?.[0]?.photoURL || null

    await fetch(`${API_URL}/api/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ displayName, photoURL })
    })
  } catch (error) {
    console.warn('Erro ao sincronizar user com backend:', error)
  }
}

export const initPersistence = async () => {
  await setPersistence(auth, indexedDBLocalPersistence)
}

/**
 * Tenta obter URL direta (expira) ou bytes da foto via Microsoft Graph.
 */
async function fetchMicrosoftProfilePhoto(accessToken) {
  if (!accessToken) return null
  const headers = { Authorization: `Bearer ${accessToken}` }

  try {
    const meta = await fetch('https://graph.microsoft.com/v1.0/me/photo', { headers })
    if (meta.ok) {
      const data = await meta.json()
      const url = data['@microsoft.graph.downloadUrl']
      if (url) return { kind: 'url', url }
    } else if (import.meta.env.DEV) {
      const errText = await meta.text().catch(() => '')
      console.warn('[Microsoft Graph] GET /me/photo', meta.status, errText.slice(0, 200))
    }
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[Microsoft Graph] metadata', e)
  }

  const valuePaths = [
    'https://graph.microsoft.com/v1.0/me/photo/$value',
    'https://graph.microsoft.com/v1.0/me/photos/96x96/$value',
    'https://graph.microsoft.com/v1.0/me/photos/48x48/$value'
  ]
  for (const url of valuePaths) {
    try {
      const res = await fetch(url, { headers })
      if (res.ok) {
        const blob = await res.blob()
        if (blob.size > 0) {
          return {
            kind: 'blob',
            blob,
            contentType: res.headers.get('content-type') || 'image/jpeg'
          }
        }
      } else if (import.meta.env.DEV) {
        const errText = await res.text().catch(() => '')
        console.warn('[Microsoft Graph]', url, res.status, errText.slice(0, 120))
      }
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[Microsoft Graph] $value', url, e)
    }
  }

  return null
}

async function uploadProfilePhotoToBackend(user, blob, contentType) {
  const token = await user.getIdToken()
  const fd = new FormData()
  const ext = (contentType || '').includes('png') ? 'png' : 'jpg'
  fd.append('photo', blob, `profile.${ext}`)

  const res = await fetch(`${API_URL}/api/auth/profile-photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.photoURL || null
}

export const signInWithMicrosoft = () => {
  return signInWithPopup(auth, microsoftProvider)
    .then((result) => processMicrosoftLoginResult(result))
}

async function processMicrosoftLoginResult(result) {
  const credential = OAuthProvider.credentialFromResult(result)
  const accessToken = credential?.accessToken

  let extraInfoPicture = null
  try {
    const additional = getAdditionalUserInfo(result)
    extraInfoPicture = additional?.profile?.picture || null
  } catch {
    /* ignore */
  }

  const fromFirebase =
    result.user.photoURL || result.user.providerData?.find((p) => p.photoURL)?.photoURL || null

  let photoURL = fromFirebase || extraInfoPicture

  const graphResult = await fetchMicrosoftProfilePhoto(accessToken)
  if (graphResult?.kind === 'url' && graphResult.url) {
    photoURL = graphResult.url
  } else if (graphResult?.kind === 'blob' && graphResult.blob?.size) {
    try {
      photoURL = await uploadProfilePhotoToBackend(
        result.user,
        graphResult.blob,
        graphResult.contentType
      )
    } catch (e) {
      console.warn('Upload da foto Microsoft para o backend falhou:', e)
    }
  }

  if (photoURL) {
    await updateProfile(result.user, { photoURL })
  }

  await result.user.reload()
  await ensureUserOnBackend(result.user)
  return result.user
}

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password)
  await ensureUserOnBackend(result.user)
  return result.user
}

export const signUpWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  await ensureUserOnBackend(result.user, { displayName })
  return result.user
}

export const logOut = async () => {
  try { localStorage.removeItem('xbox_auth_cache') } catch { /* ignore */ }
  await signOut(auth)
}
