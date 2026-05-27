import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProperties } from '@/lib/actions/properties'
import { PROPERTY_STATUS_LABELS, PROPERTY_STATUS_PILL, PROPERTY_TYPE_LABELS } from '@/lib/types'
import type { Property } from '@/lib/types'

const fmt = (n: number | null) =>
  n != null ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n) : null

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const properties = await getProperties()

  const initials = (user.email ?? 'U').slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      {/* Topbar */}
      <header style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--bd-light)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <Link href="/properties" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <svg width={Math.round(24 * 0.75)} height={24} viewBox="0 0 60 80">
            <path d="M8,8 L24,8 L24,52 L52,52 L52,68 L8,68 Z" fill="#0A1E2E" />
            <path d="M52,8 L52,40 L40,40 L40,24 L20,24 L20,8 Z" fill="#0A1E2E" />
          </svg>
          <span style={{
            fontFamily: 'var(--font-sora), sans-serif',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '0.12em',
            color: 'var(--navy)',
          }}>
            LOYRIA
          </span>
        </Link>

        <span style={{ fontFamily: 'var(--font-sora), sans-serif', fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}>
          Mes biens
        </span>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          background: 'var(--ivory)', border: '1px solid var(--bd-light)',
          borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--navy)', color: 'var(--champagne)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-sora), sans-serif', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.04em', flexShrink: 0,
            }}>
              {initials}
            </div>
            <span style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--bd-light)', flexShrink: 0 }} />
          <form action="/auth/signout" method="post">
            <button style={{
              padding: '6px 14px', fontSize: 13, color: 'var(--ink-3)',
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px 80px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
              Espace personnel
            </div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-sora), sans-serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--navy)' }}>
              Mes biens
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--ink-2)', fontSize: 14.5 }}>
              {properties.length === 0
                ? 'Ajoutez votre premier bien pour commencer.'
                : `${properties.length} bien${properties.length > 1 ? 's' : ''} dans votre patrimoine.`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/properties/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(180deg, var(--champagne-3) 0%, var(--champagne) 50%, var(--champagne-2) 100%)',
                color: 'var(--navy)',
                border: '1px solid var(--champagne-2)',
                boxShadow: 'var(--shadow-cta)',
                fontWeight: 600,
                fontSize: 13.5,
                padding: '9px 16px',
                borderRadius: 'var(--r-md)',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
            >
              + Ajouter un bien
            </Link>
          </div>
        </div>

        {/* Grid */}
        {properties.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
            <AddCard />
          </div>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: Property['status'] }) {
  const pill = PROPERTY_STATUS_PILL[status]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 9px',
      borderRadius: 999,
      fontSize: 11.5,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      background: pill.bg,
      color: pill.color,
      border: `1px solid ${pill.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: pill.dot, flexShrink: 0 }} />
      {PROPERTY_STATUS_LABELS[status]}
    </span>
  )
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`} style={{ display: 'flex', textDecoration: 'none' }}>
      <div style={{
        display: 'flex',
        width: '100%',
        background: 'var(--white)',
        border: '1px solid var(--bd-light-2)',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-1)',
        transition: 'all 0.22s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-2px)'
        el.style.borderColor = 'var(--bd-light-hi)'
        el.style.boxShadow = 'var(--shadow-3)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = ''
        el.style.borderColor = 'var(--bd-light-2)'
        el.style.boxShadow = 'var(--shadow-1)'
      }}
      >
        {/* Thumbnail */}
        <div style={{
          width: 140,
          flexShrink: 0,
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--petrol) 100%)',
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}>
          {/* Grid pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(216,194,138,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(216,194,138,0.06) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }} />
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'rgba(216,194,138,0.10)',
            border: '1px solid rgba(216,194,138,0.20)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--champagne)',
            position: 'relative',
            zIndex: 1,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 600 }}>
                {property.address}
              </div>
              <h3 style={{ margin: '4px 0 2px', fontFamily: 'var(--font-sora), sans-serif', fontSize: 19, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--navy)' }}>
                {property.name}
              </h3>
              <div style={{ color: 'var(--ink-2)', fontSize: 13.5 }}>
                {property.city}{property.postal_code ? ` · ${property.postal_code}` : ''}
              </div>
            </div>
            <StatusPill status={property.status} />
          </div>

          {/* Meta */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 0',
            borderTop: '1px solid var(--bd-light-2)',
            borderBottom: '1px solid var(--bd-light-2)',
            color: 'var(--ink-2)',
            fontSize: 12.5,
          }}>
            {property.type && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {PROPERTY_TYPE_LABELS[property.type]}
              </span>
            )}
            {property.surface && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-5)', flexShrink: 0 }} />
                <span>{property.surface} m²</span>
              </>
            )}
            {property.rooms_count && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-5)', flexShrink: 0 }} />
                <span>{property.rooms_count} pièce{property.rooms_count > 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              {property.purchase_price ? (
                <>
                  <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 18, fontWeight: 600, color: 'var(--navy)', letterSpacing: '-0.015em' }}>
                    {fmt(property.purchase_price)}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Prix d'acquisition</div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Prix non renseigné</div>
              )}
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--navy)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
              fontWeight: 500,
              padding: '7px 14px',
            }}>
              Gérer →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function AddCard() {
  return (
    <Link href="/properties/new" style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{
        background: 'transparent',
        border: '2px dashed var(--bd-light-hi)',
        borderRadius: 22,
        minHeight: 160,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        color: 'var(--ink-3)',
        textAlign: 'center',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--champagne)'
        el.style.background = 'rgba(216,194,138,0.04)'
        el.style.color = 'var(--navy)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--bd-light-hi)'
        el.style.background = 'transparent'
        el.style.color = 'var(--ink-3)'
      }}
      >
        <div>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--ivory)',
            border: '1px solid var(--bd-light)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 14px',
          }}>
            <span style={{ fontSize: 22 }}>+</span>
          </div>
          <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500 }}>Ajouter un bien</h4>
          <p style={{ margin: 0, fontSize: 12.5 }}>Maison, appartement, studio…</p>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--bd-light-2)',
      borderRadius: 22,
      padding: '60px 40px',
      textAlign: 'center',
      maxWidth: 480,
      margin: '0 auto',
      boxShadow: 'var(--shadow-1)',
    }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>🏠</div>
      <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-sora), sans-serif', fontSize: 20, color: 'var(--navy)' }}>
        Ajoutez votre premier bien
      </h2>
      <p style={{ margin: '0 0 24px', color: 'var(--ink-2)', fontSize: 14 }}>
        Centralisez la gestion de vos appartements, maisons et locaux dans un seul outil.
      </p>
      <Link
        href="/properties/new"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(180deg, var(--champagne-3) 0%, var(--champagne) 50%, var(--champagne-2) 100%)',
          color: 'var(--navy)',
          border: '1px solid var(--champagne-2)',
          boxShadow: 'var(--shadow-cta)',
          fontWeight: 600,
          fontSize: 14,
          padding: '11px 22px',
          borderRadius: 12,
          textDecoration: 'none',
        }}
      >
        Ajouter un bien
      </Link>
    </div>
  )
}
