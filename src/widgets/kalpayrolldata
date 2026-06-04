// Fetches today's attendance summary + pending advances from KAL Payroll
import { ref, get } from 'firebase/database'
import { getDb, ensureSignedIn } from '../firebase/init'

export async function fetchKalPayrollSummary() {
  await ensureSignedIn()
  const { instance: db } = getDb('kalPayroll')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-indexed
  const day = now.getDate()
  const todayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // Try to read today's attendance and employee count.
  // KAL Payroll structure varies; we try common keys gracefully.
  const tries = [
    `att_${year}_${month}`,
    `attendance_${year}_${month}`,
    `attendance/${year}/${month}`,
    `att/${year}/${month}`
  ]

  let attendanceNode = null
  for (const path of tries) {
    try {
      const snap = await get(ref(db, path))
      if (snap.exists()) {
        attendanceNode = snap.val()
        break
      }
    } catch {}
  }

  // Count today's present from the attendance node
  let presentToday = 0
  let totalToday = 0

  if (attendanceNode && typeof attendanceNode === 'object') {
    Object.values(attendanceNode).forEach((empRecord) => {
      if (empRecord && typeof empRecord === 'object') {
        const todayVal = empRecord[todayKey] ?? empRecord[String(day)] ?? empRecord[day]
        if (todayVal !== undefined && todayVal !== null && todayVal !== '') {
          totalToday++
          // "P", "1", "0.5", true, etc. all count as present
          const s = String(todayVal).toLowerCase()
          if (s === 'p' || s === '1' || s === '0.5' || s === 'true' || s.startsWith('p')) {
            presentToday++
          }
        }
      }
    })
  }

  // Total employees
  let totalEmps = 0
  try {
    const empsSnap = await get(ref(db, 'emps'))
    if (empsSnap.exists()) {
      totalEmps = Object.keys(empsSnap.val()).length
    }
  } catch {}

  // Pending advances - try common loan/advance nodes
  let pendingAdvances = 0
  for (const path of [`loan_${year}_${month}`, 'loans', 'advances', `advances_${year}_${month}`]) {
    try {
      const snap = await get(ref(db, path))
      if (snap.exists()) {
        const data = snap.val()
        Object.values(data).forEach((rec) => {
          if (rec && typeof rec === 'object') {
            const status = (rec.status || rec.state || '').toString().toLowerCase()
            const balance = Number(rec.balance ?? rec.outstanding ?? rec.amount ?? 0)
            if (balance > 0 || status === 'pending' || status === 'open') {
              pendingAdvances++
            }
          }
        })
        if (pendingAdvances > 0) break
      }
    } catch {}
  }

  return {
    presentToday,
    totalEmps,
    totalMarked: totalToday,
    pendingAdvances,
    dataAvailable: totalEmps > 0 || totalToday > 0
  }
}
