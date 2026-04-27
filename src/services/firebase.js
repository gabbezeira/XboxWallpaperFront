import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // Se estivermos no localhost, usamos o próprio localhost como authDomain para evitar bloqueio de cookies
  // O proxy no vite.config.js cuidará de encaminhar para o Firebase
  authDomain: (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
    ? window.location.host 
    : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Força a persistência local para garantir que o login não suma ao recarregar
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(err => {
    console.error('[Firebase] Erro ao definir persistência:', err)
  })
}

export default app
