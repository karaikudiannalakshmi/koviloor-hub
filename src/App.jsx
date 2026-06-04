import { useState, useEffect, useMemo } from 'react'
import { APPS, GROUP_ORDER } from './apps'
import { fetchKalPayrollSummary } from './widgets/kalPayrollData'
import { fetchMadalayamPayrollSummary } from './widgets/madalayamPayrollData'
import { fetchKasiPayrollSummary } from './widgets/kasiPayrollData'
import { fetchPropertySummary } from './widgets/propertyData'
import { fetchAnnakshetraSummary } from './widgets/annakshetraData'
import { fetchGuruPoojaSummary } from './widgets/guruPoojaData'
import { fetchNwtSummary } from './widgets/nwtData'

const STORAGE_KEY = 'koviloor-hub:lastOpened'
const AUTH_KEY = 'koviloor-hub:auth'
const HUB_PASSWORD = import.meta.env.VITE_HUB_PASSWORD || 'koviloor@2026'
const AUTH_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// ─── Helpers ────────────────────────────────────────────────────────────
function getLastOpened() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}
function setLastOpened(id) {
  try {
    const data = getLastOpened()
    data[id] = Date.now()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}
function formatRelative(ts) {
  if (!ts) return null
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
function iconForGroup(name) {
  if (name.includes('Karaikudi')) return 'ti-building-store'
  if (name.includes('Koviloor')) return 'ti-temple'
  if (name.includes('Kasi')) return 'ti-mountain'
  if (name.includes('Coming')) return 'ti-clock'
  return 'ti-folder'
}
function isAuthValid() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return false
    const { expires } = JSON.parse(raw)
    return expires && Date.now() < expires
  } catch { return false }
}
function setAuthValid() {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    expires: Date.now() + AUTH_DURATION_MS
  }))
}

// ─── Password Gate ──────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const submit = (e) => {
    e?.preventDefault?.()
    if (input === HUB_PASSWORD) {
      setAuthValid()
      onUnlock()
    } else {
      setError(true)
      setInput('')
      setTimeout(() => setError(false), 600)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 32, maxWidth: 360, width: '100%',
        textAlign: 'center'
      }}>
        <i className="ti ti-apps" style={{
          fontSize: 36, color: 'var(--text-accent)', display: 'block', marginBottom: 12
        }} aria-hidden="true"></i>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 600 }}>Koviloor Hub</h1>
        <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: 13 }}>
          Enter password to continue
        </p>
        <div style={{ position: 'relative' }}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(e)}
            autoFocus
            placeholder="Password"
            style={{
              width: '100%', padding: '12px 14px',
              background: 'var(--bg-input)',
              border: `1px solid ${error ? '#d44' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)', fontSize: 14,
              color: 'var(--text-primary)', outline: 'none',
              transition: 'border-color 200ms'
            }}
          />
        </div>
        <button
          onClick={submit}
          style={{
            marginTop: 12, width: '100%', padding: '12px',
            background: 'var(--text-accent)', color: 'white',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 14, fontWeight: 600
          }}
        >
          Unlock
        </button>
        {error && (
          <p style={{ marginTop: 12, color: '#d44', fontSize: 12 }}>
            Incorrect password
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Stat Card ──────────────────────────────────────────────────────────
function StatCard({ icon, label, loading, error, primary, secondary, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left',
        background: hover ? 'var(--bg-card-hover)' : 'var(--bg-stat)',
        border: `1px solid ${hover ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: 14,
        cursor: 'pointer', transition: 'all 120ms ease',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover ? 'var(--shadow-hover)' : 'none',
        color: 'var(--text-primary)', minHeight: 96,
        display: 'flex', flexDirection: 'column', gap: 6
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
        <i className={`ti ${icon}`} style={{ fontSize: 14 }} aria-hidden="true"></i>
        <span style={{ fontWeight: 500 }}>{label}</span>
      </div>
      {loading ? (
        <>
          <div className="skeleton" style={{ height: 22, width: '60%', marginTop: 4 }}></div>
          <div className="skeleton" style={{ height: 12, width: '80%', marginTop: 4 }}></div>
        </>
      ) : error ? (
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
          No data
        </span>
      ) : (
        <>
          <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>{primary}</div>
          {secondary && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
              {secondary}
            </div>
          )}
        </>
      )}
    </button>
  )
}

// ─── Today Section ──────────────────────────────────────────────────────
function TodaySection({ onOpenApp }) {
  const [kal, setKal] = useState({ loading: true })
  const [madalayam, setMadalayam] = useState({ loading: true })
  const [kasi, setKasi] = useState({ loading: true })
  const [property, setProperty] = useState({ loading: true })
  const [annak, setAnnak] = useState({ loading: true })
  const [pooja, setPooja] = useState({ loading: true })
  const [nwt, setNwt] = useState({ loading: true })

  useEffect(() => {
    const safely = (fn, setter) =>
      fn().then((r) => setter({ loading: false, data: r }))
        .catch((e) => {
          console.warn(e)
          setter({ loading: false, error: true })
        })

    safely(fetchKalPayrollSummary, setKal)
    safely(fetchMadalayamPayrollSummary, setMadalayam)
    safely(fetchKasiPayrollSummary, setKasi)
    safely(fetchPropertySummary, setProperty)
    safely(fetchAnnakshetraSummary, setAnnak)
    safely(fetchGuruPoojaSummary, setPooja)
    safely(fetchNwtSummary, setNwt)
  }, [])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const findApp = (id) => APPS.find((a) => a.id === id)

  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
        <i className="ti ti-sun" style={{ fontSize: 18, color: 'var(--text-accent)' }} aria-hidden="true"></i>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Today</h2>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{today}</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10
      }}>
        <StatCard
          icon="ti-cash" label="KAL Payroll"
          loading={kal.loading}
          error={kal.error || !kal.data?.dataAvailable}
          primary={kal.data ? `${kal.data.presentToday}/${kal.data.totalEmps} present` : '—'}
          secondary={kal.data?.pendingAdvances ? `${kal.data.pendingAdvances} pending advances` : 'Catering operations'}
          onClick={() => onOpenApp(findApp('kal-payroll'))}
        />
        <StatCard
          icon="ti-cash" label="Madalayam Payroll"
          loading={madalayam.loading}
          error={madalayam.error || !madalayam.data?.dataAvailable}
          primary={madalayam.data ? `${madalayam.data.presentToday}/${madalayam.data.totalEmps} present` : '—'}
          secondary={madalayam.data?.pendingAdvances ? `${madalayam.data.pendingAdvances} pending advances` : 'Temple staff'}
          onClick={() => onOpenApp(findApp('koviloor-payroll'))}
        />
        <StatCard
          icon="ti-cash" label="Kasi Payroll"
          loading={kasi.loading}
          error={kasi.error || !kasi.data?.dataAvailable}
          primary={kasi.data ? `${kasi.data.presentToday}/${kasi.data.totalEmps} present` : '—'}
          secondary={kasi.data?.hoursToday ? `${kasi.data.hoursToday} hrs today` : 'KVKF Varanasi'}
          onClick={() => onOpenApp(findApp('kasi-payroll'))}
        />
        <StatCard
          icon="ti-building" label="Property"
          loading={property.loading}
          error={property.error || !property.data?.dataAvailable}
          primary={
            property.data
              ? property.data.withArrears > 0
                ? `${property.data.withArrears} in arrears`
                : 'All paid up'
              : '—'
          }
          secondary={
            property.data?.totalArrears
              ? `₹${property.data.totalArrears.toLocaleString('en-IN')} outstanding`
              : `${property.data?.totalProperties || 0} properties`
          }
          onClick={() => onOpenApp(findApp('property'))}
        />
        <StatCard
          icon="ti-receipt" label="Annakshetra"
          loading={annak.loading}
          error={annak.error}
          primary={annak.data ? `${annak.data.pending} pending` : '—'}
          secondary={annak.data?.todayCount ? `${annak.data.todayCount} entries today` : 'Vendor bills'}
          onClick={() => onOpenApp(findApp('annakshetra'))}
        />
        <StatCard
          icon="ti-flame" label="Guru Pooja"
          loading={pooja.loading}
          error={pooja.error || !pooja.data?.dataAvailable}
          primary={pooja.data?.dataAvailable
            ? pooja.data.daysAway === 0 ? 'Today!'
              : pooja.data.daysAway === 1 ? 'Tomorrow'
              : `In ${pooja.data.daysAway} days`
            : '—'}
          secondary={pooja.data?.dataAvailable
            ? `${pooja.data.dateLabel}${pooja.data.saint ? ' · ' + pooja.data.saint : ''}`
            : 'Open app to see schedule'}
          onClick={() => onOpenApp(findApp('guru-pooja'))}
        />
        <StatCard
          icon="ti-graduation-cap" label="NWT Scholarship"
          loading={nwt.loading}
          error={nwt.error || !nwt.data?.dataAvailable}
          primary={nwt.data?.dataAvailable
            ? nwt.data.renewalsThisMonth > 0
              ? `${nwt.data.renewalsThisMonth} renewals due`
              : 'No renewals this month'
            : '—'}
          secondary={nwt.data?.activeLoans
            ? `${nwt.data.activeLoans} active loans`
            : 'Student loans'}
          onClick={() => onOpenApp(findApp('nwt-scholarship'))}
        />
      </div>
    </section>
  )
}

// ─── App Tile ───────────────────────────────────────────────────────────
function AppTile({ app, lastOpenedAt, onOpen }) {
  const [hover, setHover] = useState(false)
  const disabled = !app.url

  return (
    <button
      onClick={() => onOpen(app)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        textAlign: 'left',
        background: hover && !disabled ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${hover && !disabled ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 120ms ease',
        transform: hover && !disabled ? 'translateY(-1px)' : 'none',
        boxShadow: hover && !disabled ? 'var(--shadow-hover)' : 'none',
        color: 'var(--text-primary)',
        display: 'flex', flexDirection: 'column', gap: 10, minHeight: 110
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: 'var(--bg-pill)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <i className={`ti ${app.icon}`} style={{ fontSize: 18, color: 'var(--text-accent)' }} aria-hidden="true"></i>
        </div>
        {!disabled && (
          <i className="ti ti-arrow-up-right" style={{
            fontSize: 16, color: 'var(--text-tertiary)',
            opacity: hover ? 1 : 0.4, transition: 'opacity 120ms ease'
          }} aria-hidden="true"></i>
        )}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{app.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {app.description}
        </div>
      </div>
      <div style={{ marginTop: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>
        {disabled ? 'Coming soon'
          : lastOpenedAt ? `Opened ${formatRelative(lastOpenedAt)}`
          : 'Not yet opened'}
      </div>
    </button>
  )
}

function Section({ title, count, icon, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 18, color: 'var(--text-secondary)' }} aria-hidden="true"></i>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
        <span style={{
          fontSize: 11, background: 'var(--bg-pill)', color: 'var(--text-secondary)',
          padding: '2px 8px', borderRadius: 999, fontWeight: 500
        }}>{count}</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12
      }}>{children}</div>
    </section>
  )
}

// ─── Main App ───────────────────────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked] = useState(isAuthValid())
  const [search, setSearch] = useState('')
  const [lastOpened, setLastOpenedState] = useState(getLastOpened())

  useEffect(() => {
    const t = setInterval(() => setLastOpenedState(getLastOpened()), 30000)
    return () => clearInterval(t)
  }, [])

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  const handleOpen = (app) => {
    if (!app || !app.url) return
    setLastOpened(app.id)
    setLastOpenedState(getLastOpened())
    window.open(app.url, '_blank', 'noopener,noreferrer')
  }

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? APPS.filter((a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.group.toLowerCase().includes(q)
        )
      : APPS
    const map = {}
    filtered.forEach((a) => {
      if (!map[a.group]) map[a.group] = []
      map[a.group].push(a)
    })
    return map
  }, [search])

  const totalApps = APPS.filter((a) => !a.comingSoon).length
  const visibleApps = Object.values(grouped).flat().length

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 48px' }}>
      <header style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <i className="ti ti-apps" style={{ fontSize: 24, color: 'var(--text-accent)' }} aria-hidden="true"></i>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Koviloor Hub</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>
          {totalApps} apps · live status above
        </p>
      </header>

      {/* TODAY section with live Firebase data */}
      <TodaySection onOpenApp={handleOpen} />

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <i className="ti ti-search" aria-hidden="true" style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 18, color: 'var(--text-tertiary)', pointerEvents: 'none'
        }}></i>
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search apps..."
          style={{
            width: '100%', padding: '12px 14px 12px 42px',
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', fontSize: 14,
            color: 'var(--text-primary)', outline: 'none'
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} aria-label="Clear search"
            style={{
              position: 'absolute', right: 10, top: '50%',
              transform: 'translateY(-50%)', background: 'transparent',
              border: 'none', color: 'var(--text-tertiary)', padding: 6,
              borderRadius: 6, display: 'flex', alignItems: 'center'
            }}>
            <i className="ti ti-x" style={{ fontSize: 16 }}></i>
          </button>
        )}
      </div>

      {/* Empty state */}
      {visibleApps === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <i className="ti ti-mood-empty" style={{ fontSize: 32, color: 'var(--text-tertiary)' }} aria-hidden="true"></i>
          <p style={{ marginTop: 8 }}>No apps match "{search}"</p>
        </div>
      )}

      {/* Groups */}
      {GROUP_ORDER.map((groupName) => {
        const apps = grouped[groupName]
        if (!apps || apps.length === 0) return null
        return (
          <Section key={groupName} title={groupName} count={apps.length} icon={iconForGroup(groupName)}>
            {apps.map((app) => (
              <AppTile key={app.id} app={app} lastOpenedAt={lastOpened[app.id]} onOpen={handleOpen} />
            ))}
          </Section>
        )
      })}

      <footer style={{
        marginTop: 48, textAlign: 'center',
        color: 'var(--text-tertiary)', fontSize: 12
      }}>
        Koviloor Hub · maintained by Narayanan
      </footer>
    </div>
  )
}
