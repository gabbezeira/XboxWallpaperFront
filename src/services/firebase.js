import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Inicialização ultra-robusta da persistência
// No PC, o IndexedDB é mais estável que o LocalStorage para o Firebase
const initAuth = async () => {
  if (typeof window !== 'undefined') {
    try {
      await setPersistence(auth, indexedDBLocalPersistence)
      console.log('%c[Firebase] Persistência IndexedDB ativada', 'color: #2ecc71')
    } catch {
      await setPersistence(auth, browserLocalPersistence)
      console.log('%c[Firebase] Persistência LocalStorage ativada', 'color: #f1c40f')
    }
  }
}

initAuth()

export default app
