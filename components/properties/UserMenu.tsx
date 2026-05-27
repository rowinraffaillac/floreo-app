'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, User, Settings, LifeBuoy, LogOut } from 'lucide-react'

interface UserMenuProps {
  email: string
  initials: string
}

export default function UserMenu({ email, initials }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div
      ref={ref}
      onClick={() => setOpen(o => !o)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 10px 4px 4px',
        borderRadius: 999,
        background: 'var(--ivory)',
        border: `1px solid ${open ? 'var(--bd-light-hi)' : 'var(--bd-light)'}`,
        cursor: 'pointer',
        transition: 'border-color 0.18s ease',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: 'var(--navy)', color: 'var(--champagne)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-sora), sans-serif', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.04em',
      }}>
        {initials}
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {email}
      </span>
      <ChevronDown
        size={14}
        style={{ color: 'var(--ink-3)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }}
      />

      {/* Dropdown */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          width: 230, background: 'var(--white)',
          border: '1px solid var(--bd-light)',
          borderRadius: 'var(--r-lg)',
          padding: 6, boxShadow: 'var(--shadow-3)',
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transform: open ? 'none' : 'translateY(-4px)',
          transition: 'all 0.18s ease',
          zIndex: 50,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid var(--bd-light)', marginBottom: 4 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{email}</div>
        </div>

        {([
          { icon: User, label: 'Mon profil' },
          { icon: Settings, label: 'Paramètres' },
          { icon: LifeBuoy, label: 'Aide' },
        ] as const).map(({ icon: Icon, label }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 8, fontSize: 13,
            color: 'var(--ink-4)', cursor: 'default',
          }}>
            <Icon size={14} strokeWidth={1.8} />
            {label}
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(10,30,46,0.05)', color: 'var(--ink-4)', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>
              bientôt
            </span>
          </div>
        ))}

        <div style={{ height: 1, background: 'var(--bd-light)', margin: '4px 0' }} />

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, fontSize: 13,
              color: 'var(--danger)', background: 'transparent', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(181,64,61,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <LogOut size={14} strokeWidth={1.8} />
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}
