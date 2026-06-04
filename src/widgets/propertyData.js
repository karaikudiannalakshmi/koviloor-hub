// Property Management: count properties with arrears + total arrears amount
import { ref, get } from 'firebase/database'
import { getDb, ensureSignedIn } from '../firebase/init'

export async function fetchPropertySummary() {
  await ensureSignedIn()
  const { instance: db } = getDb('property')

  let totalProperties = 0
  let withArrears = 0
  let totalArrears = 0

  try {
    // Common root paths to try
    const candidates = ['properties', 'tenants', 'rentals']
    let data = null
    for (const path of candidates) {
      const snap = await get(ref(db, path))
      if (snap.exists()) {
        data = snap.val()
        break
      }
    }

    if (data && typeof data === 'object') {
      Object.values(data).forEach((prop) => {
        if (!prop || typeof prop !== 'object') return
        totalProperties++

        // Try common arrears/balance field names
        const arrears = Number(
          prop.arrears ?? prop.balance ?? prop.outstanding ?? prop.due ?? 0
        )
        if (arrears > 0) {
          withArrears++
          totalArrears += arrears
        }
      })
    }
  } catch (err) {
    console.warn('Property fetch error:', err.message)
  }

  return {
    totalProperties,
    withArrears,
    totalArrears: Math.round(totalArrears),
    dataAvailable: totalProperties > 0
  }
}
