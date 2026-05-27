import { getProperty, archiveProperty } from '@/lib/actions/properties'
import { getActiveLease } from '@/lib/actions/tenants'
import Link from 'next/link'
import {
  PROPERTY_STATUS_LABELS, PROPERTY_STATUS_PILL,
  PROPERTY_TYPE_LABELS, TAX_REGIME_LABELS, OWNERSHIP_TYPE_LABELS,
} from '@/lib/types'

const fmt = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
    : null

const fmtEur = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
    : '—'

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function nextPaymentDate(paymentDay: number): Date {
  const today = new Date()
  const d = new Date(today.getFullYear(), today.getMonth(), paymentDay)
  if (d <= today) d.setMonth(d.getMonth() + 1)
  return d
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [property, { lease, tenant }] = await Promise.all([
    getProperty(id),
    getActiveLease(id),
  ])

  const pill = PROPERTY_STATUS_PILL[property.status]

  // Patrimoine
  const totalAcquisition =
    (property.purchase_price ?? 0) +
    (property.notary_fees ?? 0) +
    (property.agency_fees ?? 0) +
    (property.initial_works_cost ?? 0)
  const plusValue = property.estimated_value && totalAcquisition > 0
    ? property.estimated_value - totalAcquisition
    : null

  // Loyer
  const annualRent = lease ? lease.total_rent * 12 : null
  const grossYield = lease && property.purchase_price && property.purchase_price > 0
    ? (lease.total_rent * 12) / property.purchase_price * 100
    : null

  // Occupation
  const occupancyMs = lease ? Date.now() - new Date(lease.start_date).getTime() : 0
  const occupancyDays = Math.max(0, Math.floor(occupancyMs / (1000 * 60 * 60 * 24)))
  const occupancyYears = Math.floor(occupancyDays / 365)
  const occupancyMonths = Math.floor((occupancyDays % 365) / 30)

  // Alertes
  const insuranceDays = tenant ? daysUntil(tenant.insurance_expiry_date) : null
  const revisionDays = lease?.next_revision_date ? daysUntil(lease.next_revision_date) : null

  const alerts: Array<{ text: string; level: 'warning' | 'danger' }> = []
  if (insuranceDays !== null && insuranceDays <= 60) {
    alerts.push({
      text: `Assurance expire dans ${insuranceDays} jour${insuranceDays > 1 ? 's' : ''}`,
      level: insuranceDays <= 15 ? 'danger' : 'warning',
    })
  }
  if (revisionDays !== null && revisionDays <= 30) {
    alerts.push({
      text: `Révision loyer dans ${revisionDays} jour${revisionDays > 1 ? 's' : ''}`,
      level: 'warning',
    })
  }

  // Événements
  type Evt = { label: string; dateStr: string; days: number }
  const events: Evt[] = []
  if (lease) {
    const np = nextPaymentDate(lease.payment_day)
    events.push({
      label: 'Prochain loyer',
      dateStr: np.toISOString().split('T')[0],
      days: Math.ceil((np.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    })
    if (lease.next_revision_date) {
      events.push({ label: 'Révision loyer', dateStr: lease.next_revision_date, days: daysUntil(lease.next_revision_date)! })
    }
    if (lease.end_date) {
      events.push({ label: 'Fin de bail', dateStr: lease.end_date, days: daysUntil(lease.end_date)! })
    }
  }
  if (tenant?.insurance_expiry_date) {
    events.push({ label: 'Expiration assurance', dateStr: tenant.insurance_expiry_date, days: daysUntil(tenant.insurance_expiry_date)! })
  }
  events.sort((a, b) => a.days - b.days)
  const upcomingEvents = events.slice(0, 4)

  return (
    <div style={{ padding: '28px 36px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 8 }}>
            Tableau de bord · {property.city}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-sora), sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--navy)' }}>
              {property.name}
            </h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 500,
              background: pill.bg, color: pill.color, border: `1px solid ${pill.border}`,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: pill.dot }} />
              {PROPERTY_STATUS_LABELS[property.status]}
            </span>
          </div>
          <div style={{ color: 'var(--ink-2)', fontSize: 14 }}>
            {property.address}, {property.city} {property.postal_code}
          </div>
        </div>
        <Link
          href={`/properties/${id}/edit`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13.5, fontWeight: 500, padding: '9px 16px',
            borderRadius: 'var(--r-md)', border: '1px solid var(--bd-light)',
            background: 'var(--white)', color: 'var(--ink)', textDecoration: 'none',
            transition: 'all 0.18s ease',
          }}
        >
          Modifier
        </Link>
      </div>

      {/* Bento grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 28 }}>

        {/* Loyer (span 7) */}
        <div style={{
          gridColumn: 'span 7',
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--petrol) 100%)',
          borderRadius: 22, padding: '28px 32px',
          position: 'relative', overflow: 'hidden', color: 'var(--cream)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(216,194,138,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(216,194,138,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--cream-3)', fontWeight: 600, marginBottom: 20 }}>
              Loyer mensuel
            </div>
            {lease ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 46, fontWeight: 600, color: 'var(--champagne)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {fmtEur(lease.total_rent)}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--cream-3)', marginTop: 8 }}>
                      Loyer total charges comprises
                    </div>
                  </div>
                  <RentRing />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid rgba(247,243,234,0.08)', paddingTop: 20 }}>
                  <StatCell label="Hors charges" value={fmtEur(lease.rent_amount)} />
                  <StatCell label="Charges" value={fmtEur(lease.charges_amount)} />
                  <StatCell label="Annuel" value={annualRent ? fmtEur(annualRent) : '—'} />
                  <StatCell label="Rendement brut" value={grossYield ? `${grossYield.toFixed(1)} %` : '—'} />
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 130, gap: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 32, opacity: 0.35 }}>🏠</div>
                <div style={{ color: 'var(--cream-3)', fontSize: 14 }}>Aucun bail actif</div>
                <Link href={`/properties/${id}/locataire`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(216,194,138,0.12)', border: '1px solid rgba(216,194,138,0.22)',
                  color: 'var(--champagne)', borderRadius: 8, padding: '7px 14px',
                  fontSize: 13, fontWeight: 500, textDecoration: 'none',
                }}>
                  Ajouter un locataire →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Occupation (span 5) */}
        <div style={{
          gridColumn: 'span 5',
          background: 'var(--white)', border: '1px solid var(--bd-light-2)',
          borderRadius: 22, padding: '28px 28px', boxShadow: 'var(--shadow-1)',
        }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 20 }}>
            Occupation
          </div>
          {lease && tenant ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-sora), sans-serif', fontSize: 20, fontWeight: 600, color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: 2 }}>
                  {tenant.first_name} {tenant.last_name}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Locataire principal</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14, borderTop: '1px solid var(--bd-light-2)' }}>
                <OccRow label="Entrée" value={fmtDate(lease.start_date) ?? '—'} />
                <OccRow label="Durée" value={
                  occupancyYears > 0
                    ? `${occupancyYears} an${occupancyYears > 1 ? 's' : ''}${occupancyMonths > 0 ? ` ${occupancyMonths} mois` : ''}`
                    : `${occupancyMonths} mois`
                } />
                {annualRent && <OccRow label="Loyer annuel" value={fmtEur(annualRent)} mono />}
                {grossYield != null && <OccRow label="Rendement brut" value={`${grossYield.toFixed(1)} %`} mono highlight />}
              </div>
            </div>
          ) : lease ? (
            <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Bail actif, locataire non renseigné</div>
          ) : (
            <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Bien vacant</div>
          )}
        </div>

        {/* Alertes (span 7) */}
        <div style={{
          gridColumn: 'span 7',
          background: 'var(--white)', border: '1px solid var(--bd-light-2)',
          borderRadius: 22, padding: '24px 28px', boxShadow: 'var(--shadow-1)',
        }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 16 }}>
            Alertes
          </div>
          {alerts.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontSize: 13.5, fontWeight: 500 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
              Aucune alerte en cours
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map((alert, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10,
                  background: alert.level === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                  border: `1px solid ${alert.level === 'danger' ? 'var(--danger-line)' : 'var(--warning-line)'}`,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: alert.level === 'danger' ? 'var(--danger)' : 'var(--warning)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: alert.level === 'danger' ? 'var(--danger)' : 'var(--warning)' }}>
                    {alert.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Événements (span 5) */}
        <div style={{
          gridColumn: 'span 5',
          background: 'var(--white)', border: '1px solid var(--bd-light-2)',
          borderRadius: 22, padding: '24px 28px', boxShadow: 'var(--shadow-1)',
        }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 16 }}>
            Prochains événements
          </div>
          {upcomingEvents.length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Aucun bail actif</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingEvents.map((evt, i) => {
                const d = new Date(evt.dateStr)
                const urgent = evt.days <= 7
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      flexShrink: 0, width: 44, height: 44, borderRadius: 10,
                      background: urgent ? 'var(--warning-bg)' : 'rgba(10,30,46,0.04)',
                      border: `1px solid ${urgent ? 'var(--warning-line)' : 'var(--bd-light)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 16, fontWeight: 700, color: urgent ? 'var(--warning)' : 'var(--navy)', lineHeight: 1 }}>
                        {d.getDate()}
                      </span>
                      <span style={{ fontSize: 9, textTransform: 'uppercase' as const, color: urgent ? 'var(--warning)' : 'var(--ink-3)', letterSpacing: '0.08em' }}>
                        {d.toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{evt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>
                        {evt.days === 0 ? "Aujourd'hui" : evt.days === 1 ? 'Demain' : `Dans ${evt.days} jours`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Détails du bien */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Caractéristiques">
          <Row label="Type" value={PROPERTY_TYPE_LABELS[property.type]} />
          <Row label="Surface" value={property.surface ? `${property.surface} m²` : null} />
          <Row label="Pièces" value={property.rooms_count?.toString() ?? null} />
          <Row label="Chambres" value={property.bedrooms_count?.toString() ?? null} />
          <Row label="Étage" value={property.floor?.toString() ?? null} />
          <Row label="Ascenseur" value={property.has_elevator ? 'Oui' : 'Non'} />
          <Row label="Meublé" value={property.is_furnished ? 'Oui' : 'Non'} />
          <Row label="Régime fiscal" value={TAX_REGIME_LABELS[property.tax_regime]} />
          <Row label="Mode de détention" value={OWNERSHIP_TYPE_LABELS[property.ownership_type]} />
        </Card>

        <Card title="Patrimoine">
          <Row label="Date d'acquisition" value={fmtDate(property.purchase_date)} />
          <Row label="Prix d'achat" value={fmt(property.purchase_price)} />
          <Row label="Frais de notaire" value={fmt(property.notary_fees)} />
          <Row label="Frais d'agence" value={fmt(property.agency_fees)} />
          <Row label="Travaux initiaux" value={fmt(property.initial_works_cost)} />
          {totalAcquisition > 0 && (
            <Row label="Coût total acquisition" value={fmt(totalAcquisition)} highlight />
          )}
          <Row label="Valeur estimée" value={fmt(property.estimated_value)} />
          {plusValue !== null && (
            <Row
              label="Plus-value latente"
              value={`${plusValue >= 0 ? '+' : ''}${fmt(plusValue)}`}
              highlight
              positive={plusValue >= 0}
            />
          )}
        </Card>

        <Card title="Charges annuelles">
          <Row label="Taxe foncière" value={fmt(property.property_tax)} />
          <Row
            label="Charges copropriété"
            value={property.condo_charges
              ? `${fmt(property.condo_charges * 12)} / an (${fmt(property.condo_charges)} / mois)`
              : null}
          />
        </Card>

        {property.notes && (
          <Card title="Notes">
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {property.notes}
            </p>
          </Card>
        )}
      </div>

      {/* Danger zone */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--bd-light-2)' }}>
        <form action={async () => { 'use server'; await archiveProperty(id) }}>
          <button
            type="submit"
            style={{
              fontSize: 12, color: 'var(--ink-4)', background: 'transparent', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.18s ease',
            }}
          >
            Archiver ce bien
          </button>
        </form>
      </div>
    </div>
  )
}

function RentRing({ size = 88 }: { size?: number }) {
  const r = (size - 10) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * 0.12
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, opacity: 0.75 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(216,194,138,0.15)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#D8C28A" strokeWidth="6"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <circle cx={size / 2} cy={size / 2} r={r * 0.52} fill="rgba(216,194,138,0.07)" />
    </svg>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--cream-4)', fontWeight: 500, marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.10em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 14, fontWeight: 600, color: 'var(--cream-2)', letterSpacing: '-0.01em' }}>
        {value}
      </div>
    </div>
  )
}

function OccRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{
        color: highlight ? 'var(--success)' : 'var(--ink)',
        fontFamily: mono ? 'var(--font-mono), monospace' : 'inherit',
        fontWeight: 500,
      }}>
        {value}
      </span>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--bd-light-2)',
      borderRadius: 'var(--r-xl)',
      padding: '22px 24px',
      boxShadow: 'var(--shadow-1)',
    }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 16 }}>
        {title}
      </div>
      <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </dl>
    </div>
  )
}

function Row({ label, value, highlight, positive }: {
  label: string; value: string | null | undefined; highlight?: boolean; positive?: boolean
}) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
      <dt style={{ color: 'var(--ink-3)' }}>{label}</dt>
      <dd style={{
        margin: 0, fontWeight: 500,
        color: highlight
          ? (positive ? 'var(--success)' : 'var(--champagne-2)')
          : 'var(--ink)',
        fontFamily: typeof value === 'string' && /[\d€]/.test(value) ? 'var(--font-mono), monospace' : 'inherit',
      }}>
        {value}
      </dd>
    </div>
  )
}
