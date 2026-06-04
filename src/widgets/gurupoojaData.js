// Guru Pooja: pull next upcoming pooja date from madalayam project
// (Falls back to a static placeholder if data not found)
import { ref, get } from 'firebase/database'
import { getDb, ensureSignedIn } from '../firebase/init'

export async function fetchGuruPoojaSummary() {
  await ensureSignedIn()
  const { instance: db } = getDb('madalayamPayroll')

  // Try several common paths where Guru Pooja schedule might live
  const tryPaths = ['gurupooja', 'guru_pooja', 'poojaSchedule', 'gp_schedule']

  let next = null
  for (const p of tryPaths) {
    try {
      const snap = await get(ref(db, p))
      if (snap.exists()) {
        const data = snap.val()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = []
        const walk = (obj) => {
          if (!obj || typeof obj !== 'object') return
          Object.values(obj).forEach((v) => {
            if (v && typeof v === 'object') {
              const dateStr = v.date || v.poojaDate || v.scheduledDate
              const saint = v.saint || v.name || v.title || ''
              if (dateStr) {
                const d = new Date(dateStr)
                if (!isNaN(d) && d >= today) {
                  upcoming.push({ date: d, saint })
                }
              } else {
                walk(v)
              }
            }
          })
        }
        walk(data)

        upcoming.sort((a, b) => a.date - b.date)
        if (upcoming.length > 0) {
          next = upcoming[0]
          break
        }
      }
    } catch {}
  }

  if (!next) {
    return { dataAvailable: false }
  }

  const daysAway = Math.ceil((next.date - new Date()) / (1000 * 60 * 60 * 24))
  const dateLabel = next.date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  })

  return {
    dateLabel,
    daysAway,
    saint: next.saint,
    dataAvailable: true
  }
}
