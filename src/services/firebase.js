import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)

let analytics
if (typeof window !== 'undefined') {
  analyticsIsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app)
      }
    })
    .catch(() => {
      // analytics not available (SSR / unsupported browser)
    })
}

const auth = getAuth(app)
const firestore = getFirestore(app)

export { app, analytics, auth, firestore }
