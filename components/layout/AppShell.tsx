'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, UserRound, TrendingUp, Wrench,
  FolderOpen, CalendarClock, Landmark, Users, ArrowLeft, Building2,
} from 'lucide-react'
import type { Property } from '@/lib/types'

const NAV_ITEMS = [
  { href: '',             label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/locataire',   label: 'Locataire',     icon: UserRound },
  { href: '/finances',    label: 'Finances',      icon: TrendingUp,    soon: true },
  { href: '/travaux',     label: 'Travaux',       icon: Wrench,        soon: true },
  { href: '/documents',   label: 'Documents',     icon: FolderOpen,    soon: true },
  { href: '/echeances',   label: 'Échéances',     icon: CalendarClock, soon: true },
  { href: '/fiscalite',   label: 'Fiscalité',     icon: Landmark,      soon: true },
  { href: '/acces',       label: 'Accès',         icon: Users,         soon: true },
]

const LoyriaMark = ({ size = 22 }: { size?: number }) => (
  <svg
    width={Math.round(size * 0.75)}
    height={size}
    viewBox="0 0 60 80"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path d="M8,8 L24,8 L24,52 L52,52 L52,68 L8,68 Z" fill="#D8C28A" />
    <path d="M52,8 L52,40 L40,40 L40,24 L20,24 L20,8 Z" fill="#D8C28A" />
  </svg>
)

interface AppShellProps {
  property: Property
  children: React.ReactNode
}

export default function AppShell({ property, children }: AppShellProps) {
  const pathname = usePathname()
  const base = `/properties/${property.id}`

  return (
    <div
      className="flex"
      style={{ minHeight: '100vh', background: 'var(--ivory)' }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          background: 'var(--navy)',
          padding: '22px 14px 16px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--cream)',
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '4px 10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <LoyriaMark size={24} />
          <span style={{
            fontFamily: 'var(--font-sora), sans-serif',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '0.12em',
            color: 'var(--cream)',
          }}>
            LOYRIA
          </span>
        </div>

        {/* Back link */}
        <Link
          href="/properties"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 12px',
            marginBottom: 14,
            borderRadius: 'var(--r-md)',
            background: 'rgba(247,243,234,0.04)',
            border: '1px solid var(--bd-dark)',
            color: 'var(--cream-2)',
            fontSize: 12.5,
            transition: 'all 0.18s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(247,243,234,0.07)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(247,243,234,0.04)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream-2)'
          }}
        >
          <ArrowLeft size={13} />
          <span>Mes biens</span>
        </Link>

        {/* Section label */}
        <div style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--cream-4)',
          padding: '0 12px 8px',
          fontWeight: 600,
        }}>
          {property.name}
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const href = `${base}${item.href}`
            const isActive = item.href === ''
              ? pathname === base
              : pathname.startsWith(href)

            return (
              <Link
                key={item.href}
                href={item.soon ? '#' : href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  borderRadius: 'var(--r-md)',
                  color: isActive ? 'var(--champagne)' : item.soon ? 'var(--cream-4)' : 'var(--cream-2)',
                  fontSize: 13.5,
                  fontWeight: 500,
                  position: 'relative',
                  transition: 'all 0.18s ease',
                  background: isActive ? 'rgba(216,194,138,0.12)' : 'transparent',
                  cursor: item.soon ? 'default' : 'pointer',
                  letterSpacing: '0.005em',
                  textDecoration: 'none',
                  border: 'none',
                }}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    left: -14,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    background: 'var(--champagne)',
                    borderRadius: '0 2px 2px 0',
                  }} />
                )}
                <Icon
                  size={16}
                  style={{
                    color: isActive ? 'var(--champagne)' : item.soon ? 'var(--cream-4)' : 'var(--cream-3)',
                    flexShrink: 0,
                    strokeWidth: 1.7,
                  }}
                />
                <span>{item.label}</span>
                {item.soon && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    background: 'rgba(247,243,234,0.08)',
                    color: 'var(--cream-4)',
                    padding: '2px 6px',
                    borderRadius: 6,
                    fontWeight: 500,
                  }}>
                    bientôt
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          {/* Property mini card */}
          <div style={{
            background: 'rgba(247,243,234,0.04)',
            border: '1px solid var(--bd-dark)',
            borderRadius: 'var(--r-lg)',
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: 'rgba(216,194,138,0.12)',
              border: '1px solid rgba(216,194,138,0.20)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--champagne)',
              flexShrink: 0,
            }}>
              <Building2 size={14} strokeWidth={1.7} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {property.name}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--cream-3)', marginTop: 2 }}>
                {property.city}{property.surface ? ` · ${property.surface} m²` : ''}
              </div>
            </div>
          </div>

          {/* Logout */}
          <form action="/auth/signout" method="post">
            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                fontSize: 12.5,
                color: 'var(--cream-4)',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--r-md)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                fontFamily: 'inherit',
              }}
            >
              <span>⎋</span>
              <span>Déconnexion</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--ivory)' }}>
        {children}
      </main>
    </div>
  )
}
