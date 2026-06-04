// Kasi Payroll uses Firestore. Fetch today's attendance + hours.
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { getDb, ensureSignedIn } from '../firebase/init'

export async function fetchKasiPayrollSummary() {
  await ensureSignedIn()
  const { instance: db } = getDb('kasiPayroll')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const todayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  let presentToday = 0
  let totalEmps = 0
  let hoursToday = 0

  // Count employees
  try {
    const empsSnap = await getDocs(collection(db, 'employees'))
    totalEmps = empsSnap.size

    // For each employee, try to read their attendance/hours doc for today
    for (const empDoc of empsSnap.docs) {
      try {
        const attRef = doc(db, 'employees', empDoc.id, 'attendance', todayKey)
        const attSnap = await getDoc(attRef)
        if (attSnap.exists()) {
          const data = attSnap.data()
          const isPresent =
            data.present === true ||
            data.status === 'P' ||
            data.status === 'present' ||
            Number(data.hours || 0) > 0
          if (isPresent) {
            presentToday++
            hoursToday += Number(data.hours || data.hoursWorked || 0)
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('Kasi payroll fetch error:', err.message)
  }

  return {
    presentToday,
    totalEmps,
    hoursToday: Math.round(hoursToday),
    dataAvailable: totalEmps > 0
  }
}
