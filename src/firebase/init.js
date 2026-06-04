// Initializes all Firebase apps and signs into each anonymously.
// Each project gets a uniquely named app so they don't collide.
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'

const configs = {
  kalPayroll: {
    apiKey: 'AIzaSyDOCusASMq_ZUWwksdOGZT7WibyeMCJfKY',
    authDomain: 'koviloor-payroll.firebaseapp.com',
    databaseURL: 'https://koviloor-payroll-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'koviloor-payroll',
    storageBucket: 'koviloor-payroll.firebasestorage.app',
    messagingSenderId: '164444642831',
    appId: '1:164444642831:web:26bc4c11522f8af4144d7a'
  },
  madalayamPayroll: {
    apiKey: 'AIzaSyDIxIRK0-mnnwa-7-cMroQePwPeBKQVty0',
    authDomain: 'koviloor-madalayam-payroll.firebaseapp.com',
    databaseURL: 'https://koviloor-madalayam-payroll-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'koviloor-madalayam-payroll',
    storageBucket: 'koviloor-madalayam-payroll.firebasestorage.app',
    messagingSenderId: '765784272349',
    appId: '1:765784272349:web:63bc4312d2fe468e90da34'
  },
  kasiPayroll: {
    apiKey: 'AIzaSyCz032o3ovghzuWZGEn6FGQaPmQ7mIdQ9Y',
    authDomain: 'kasi-varanasi-payroll.firebaseapp.com',
    projectId: 'kasi-varanasi-payroll',
    storageBucket: 'kasi-varanasi-payroll.firebasestorage.app',
    messagingSenderId: '524376873360',
    appId: '1:524376873360:web:6c261b2c8ad2abd716fb15'
  },
  property: {
    apiKey: 'AIzaSyCou7UrqUZ2ItYIfRgP_qANC8vHmk41Fs4',
    authDomain: 'koviloor-property.firebaseapp.com',
    databaseURL: 'https://koviloor-property-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'koviloor-property',
    storageBucket: 'koviloor-property.firebasestorage.app',
    messagingSenderId: '1033158120765',
    appId: '1:1033158120765:web:e671abefc8b6656147a154'
  },
  annakshetra: {
    apiKey: 'AIzaSyAD2fCKmZ0vP42wBAbChuZQs1NSHr0tLiE',
    authDomain: 'annakshetra-bills.firebaseapp.com',
    projectId: 'annakshetra-bills',
    storageBucket: 'annakshetra-bills.firebasestorage.app',
    messagingSenderId: '663796063397',
    appId: '1:663796063397:web:5b04f52df825bb957e014c'
  }
}

// Initialize each Firebase app with a unique name (second arg)
const apps = {}
const dbs = {}
const auths = {}

Object.entries(configs).forEach(([key, cfg]) => {
  const app = initializeApp(cfg, key)
  apps[key] = app
  auths[key] = getAuth(app)

  // Choose DB type based on which config has databaseURL
  if (cfg.databaseURL) {
    dbs[key] = { type: 'rtdb', instance: getDatabase(app) }
  } else {
    dbs[key] = { type: 'firestore', instance: getFirestore(app) }
  }
})

// Sign into each project anonymously. Resolves once all are signed in.
let signInPromise = null
export function ensureSignedIn() {
  if (signInPromise) return signInPromise

  signInPromise = Promise.all(
    Object.entries(auths).map(([key, auth]) => {
      return new Promise((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
          if (user) {
            unsub()
            resolve()
          }
        })
        signInAnonymously(auth).catch((err) => {
          console.warn(`[${key}] anonymous sign-in failed:`, err.message)
          // Don't reject — just resolve so other widgets still work
          resolve()
        })
      })
    })
  )

  return signInPromise
}

export function getDb(projectKey) {
  return dbs[projectKey]
}
