import { useState, useEffect, useMemo } from 'react'
import { APPS, GROUP_ORDER } from './apps'

const STORAGE_KEY = 'koviloor-hub:lastOpened'

function getLastOpened() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
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

export default function App() {
  const [search, setSearch] = useState('')
  const [lastOpened, setLastOpenedState] = useState(getLastOpened())

  // Refresh "last opened" display every 30s
  useEffect(() => {
    const t = setInterval(() => setLastOpenedState(getLastOpened()), 30000)
    return () => clearInterval(t)
  }, [])

  const handleOpen = (app) => {
    if (!app.url) return
    setLastOpened(app.id)
    setLastOpenedState(getLastOpened())
    window.open(app.url, '_blank', 'noopener,noreferrer')
  }

  // Filter + group apps based on search
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? APPS.filter(
          (a) =>
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

  // Recently opened apps (top 4)
  const recent = useMemo(() => {
    return APPS
      .filter((a) => a.url && lastOpened[a.id])
      .sort((a, b) => lastOpened[b.id] - lastOpened[a.id])
      .slice(0, 4)
  }, [lastOpened])

  const totalApps = APPS.filter((a) => !a.comingSoon).length
  const visibleApps = Object.values(grouped).flat().length

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 48px' }}>
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8
          }}
        >
          <i
            className="ti ti-apps"
            style={{ fontSize: 28, color: 'var(--text-accent)' }}
            aria-hidden="true"
          ></i>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Apps Hub</h1>
        </div>
        <p
          style={{
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: 14
          }}
        >
          {totalApps} apps across {GROUP_ORDER.filter((g) => g !== 'Coming Soon').length} institutions
        </p>
      </header>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <i
          className="ti ti-search"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 18,
            color: 'var(--text-tertiary)',
            pointerEvents: 'none'
          }}
        ></i>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search apps..."
          style={{
            width: '100%',
            padding: '12px 14px 12px 42px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            color: 'var(--text-primary)',
            outline: 'none'
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--border-hover)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Clear search"
          >
            <i className="ti ti-x" style={{ fontSize: 16 }}></i>
          </button>
        )}
      </div>

      {/* Recent (only when not searching and has recents) */}
      {!search && recent.length > 0 && (
        <Section title="Recent" count={recent.length} icon="ti-clock">
          <Grid>
            {recent.map((app) => (
              <AppTile
                key={app.id}
                app={app}
                lastOpenedAt={lastOpened[app.id]}
                onOpen={handleOpen}
              />
            ))}
          </Grid>
        </Section>
      )}

      {/* Empty state */}
      {visibleApps === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <i
            className="ti ti-mood-empty"
            style={{ fontSize: 32, color: 'var(--text-tertiary)' }}
            aria-hidden="true"
          ></i>
          <p style={{ marginTop: 8 }}>No apps match "{search}"</p>
        </div>
      )}

      {/* Groups */}
      {GROUP_ORDER.map((groupName) => {
        const apps = grouped[groupName]
        if (!apps || apps.length === 0) return null
        return (
          <Section
            key={groupName}
            title={groupName}
            count={apps.length}
            icon={iconForGroup(groupName)}
          >
            <Grid>
              {apps.map((app) => (
                <AppTile
                  key={app.id}
                  app={app}
                  lastOpenedAt={lastOpened[app.id]}
                  onOpen={handleOpen}
                />
              ))}
            </Grid>
          </Section>
        )
      })}

      <footer
        style={{
          marginTop: 48,
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: 12
        }}
      >
        Koviloor Hub · maintained by Narayanan
      </footer>
    </div>
  )
}

function iconForGroup(name) {
  if (name.includes('Karaikudi')) return 'ti-building-store'
  if (name.includes('Koviloor')) return 'ti-temple'
  if (name.includes('Kasi')) return 'ti-mountain'
  if (name.includes('Coming')) return 'ti-clock'
  return 'ti-folder'
}

function Section({ title, count, icon, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14
        }}
      >
        <i
          className={`ti ${icon}`}
          style={{ fontSize: 18, color: 'var(--text-secondary)' }}
          aria-hidden="true"
        ></i>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
        <span
          style={{
            fontSize: 11,
            background: 'var(--bg-pill)',
            color: 'var(--text-secondary)',
            padding: '2px 8px',
            borderRadius: 999,
            fontWeight: 500
          }}
        >
          {count}
        </span>
      </div>
      {children}
    </section>
  )
}

function Grid({ children }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12
      }}
    >
      {children}
    </div>
  )
}

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
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background 120ms ease, border-color 120ms ease, transform 120ms ease',
        transform: hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hover && !disabled ? 'var(--shadow-hover)' : 'none',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 110
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--bg-pill)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i
            className={`ti ${app.icon}`}
            style={{ fontSize: 18, color: 'var(--text-accent)' }}
            aria-hidden="true"
          ></i>
        </div>
        {!disabled && (
          <i
            className="ti ti-arrow-up-right"
            style={{
              fontSize: 16,
              color: 'var(--text-tertiary)',
              opacity: hover ? 1 : 0.4,
              transition: 'opacity 120ms ease'
            }}
            aria-hidden="true"
          ></i>
        )}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{app.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {app.description}
        </div>
      </div>
      <div style={{ marginTop: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>
        {disabled
          ? 'Coming soon'
          : lastOpenedAt
          ? `Opened ${formatRelative(lastOpenedAt)}`
          : 'Not yet opened'}
      </div>
    </button>
  )
}
