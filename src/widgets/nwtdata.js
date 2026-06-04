
// NWT Scholarship: upcoming renewals from the madalayam-payroll project where nwt_loans lives
// (User mentioned NWT uses Firestore with nwt_ prefix collections on koviloor-payroll/madalayam project)
import { collection, getDocs, Timestamp } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'
import { ensureSignedIn } from '../firebase/init'
import { initializeApp, getApps } from 'firebase/app'

// NWT data lives on koviloor-payroll project per the user's notes ("Firebase project shared as koviloor-payroll")
// We re-use the same app initialized for KAL Payroll but query via Firestore
let nwtDb = null

function getNwtDb() {
  if (nwtDb) return nwtDb
  const existing = getApps().find((a) => a.options.projectId === 'koviloor-payroll')
  if (existing) {
    nwtDb = getFirestore(existing)
  }
  return nwtDb
}

export async function fetchNwtSummary() {
  await ensureSignedIn()
  const db = getNwtDb()
  if (!db) return { dataAvailable: false }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  monthEnd.setHours(23, 59, 59)

  let renewalsThisMonth = 0
  let activeLoans = 0

  try {
    const snap = await getDocs(collection(db, 'nwt_loans'))
    snap.forEach((doc) => {
      const d = doc.data()
      const status = (d.status || '').toString().toLowerCase()
      if (status === 'active' || status === 'open' || status === 'disbursed') {
        activeLoans++
      }

      const nextRenewal = d.nextRenewalDate || d.renewalDate || d.dueDate
      if (nextRenewal) {
        let date
        if (nextRenewal instanceof Timestamp) date = nextRenewal.toDate()
        else date = new Date(nextRenewal)

        if (date && !isNaN(date) && date >= today && date <= monthEnd) {
          renewalsThisMonth++
        }
      }
    })
  } catch (err) {
    console.warn('NWT fetch error:', err.message)
    return { dataAvailable: false }
  }

  return {
    activeLoans,
    renewalsThisMonth,
    dataAvailable: true
  }
}
