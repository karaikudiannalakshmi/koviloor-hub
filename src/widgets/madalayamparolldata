// Madalayam Payroll: today's attendance summary
// Data structure (from screenshot): att_2026_5, att_2026_6, emps, loan_2026_6, etc.
import { ref, get } from 'firebase/database'
import { getDb, ensureSignedIn } from '../firebase/init'

export async function fetchMadalayamPayrollSummary() {
  await ensureSignedIn()
  const { instance: db } = getDb('madalayamPayroll')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const todayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  let presentToday = 0
  let totalEmps = 0
  let pendingAdvances = 0

  // Attendance for this month
  try {
    const attSnap = await get(ref(db, `att_${year}_${month}`))
    if (attSnap.exists()) {
      const node = attSnap.val()
      Object.values(node).forEach((empRecord) => {
        if (empRecord && typeof empRecord === 'object') {
          const v = empRecord[todayKey] ?? empRecord[String(day)] ?? empRecord[day]
          if (v !== undefined && v !== null && v !== '') {
            const s = String(v).toLowerCase()
            if (s === 'p' || s === '1' || s === '0.5' || s.startsWith('p') || s === 'true') {
              presentToday++
            }
          }
        }
      })
    }
  } catch {}

  // Total active employees
  try {
    const empsSnap = await get(ref(db, 'emps'))
    if (empsSnap.exists()) {
      const emps = empsSnap.val()
      totalEmps = Object.values(emps).filter((e) => {
        if (!e || typeof e !== 'object') return false
        const status = (e.status || e.active || '').toString().toLowerCase()
        return status === '' || status === 'active' || status === 'true' || e.active === true
      }).length
      if (totalEmps === 0) totalEmps = Object.keys(emps).length
    }
  } catch {}

  // Pending advances/loans
  try {
    const loanSnap = await get(ref(db, `loan_${year}_${month}`))
    if (loanSnap.exists()) {
      const loans = loanSnap.val()
      Object.values(loans).forEach((rec) => {
        if (rec && typeof rec === 'object') {
          const bal = Number(rec.balance ?? rec.outstanding ?? 0)
          if (bal > 0) pendingAdvances++
        }
      })
    }
  } catch {}

  return {
    presentToday,
    totalEmps,
    pendingAdvances,
    dataAvailable: totalEmps > 0
  }
}
