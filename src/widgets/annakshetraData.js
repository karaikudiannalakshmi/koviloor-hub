// Annakshetra Bills (Firestore): pending submissions + today's entries
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { getDb, ensureSignedIn } from '../firebase/init'

export async function fetchAnnakshetraSummary() {
  await ensureSignedIn()
  const { instance: db } = getDb('annakshetra')

  let pending = 0
  let todayCount = 0

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  try {
    const billsSnap = await getDocs(collection(db, 'bills'))
    billsSnap.forEach((doc) => {
      const data = doc.data()
      const status = (data.status || data.submissionStatus || '').toString().toLowerCase()

      // Pending = not yet submitted/paid
      if (!status || status === 'pending' || status === 'draft' || status === 'unpaid') {
        pending++
      }

      // Created today?
      const createdAt = data.createdAt || data.entryDate || data.billDate
      if (createdAt) {
        let date
        if (createdAt instanceof Timestamp) date = createdAt.toDate()
        else if (typeof createdAt === 'string') date = new Date(createdAt)
        else if (typeof createdAt === 'number') date = new Date(createdAt)

        if (date && date >= startOfDay) todayCount++
      }
    })
  } catch (err) {
    console.warn('Annakshetra fetch error:', err.message)
  }

  return {
    pending,
    todayCount,
    dataAvailable: true
  }
}
