import { getProperty } from '@/lib/actions/properties'
import Link from 'next/link'
import {
  PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_PILL,
  TAX_REGIME_LABELS, OWNERSHIP_TYPE_LABELS
} from '@/lib/types'
import { archiveProperty } from '@/lib/actions/properties'

const fmt = (n: number | null) =>
  n != null ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n) : null

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await getProperty(id)

  const totalAcquisition =
    (property.purchase_price ?? 0) +
    (property.notary_fees ?? 0) +
    (property.agency_fees ?? 0) +
    (property.initial_works_cost ?? 0)

  const plusValue = property.estimated_value && totalAcquisition > 0
    ? property.estimated_value - totalAcquisition
    : null

  const pill = PROPERTY_STATUS_PILL[property.status]

  return (
    <div style={{ padding: '28px 36px 60px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 18, color: 'var(--ink-3)' }}>
        <Link href="/properties" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Mes biens</Link>
        <span>›</span>
        <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{property.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 8 }}>
            Vue générale · {property.city}
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
        <div style={{ display: 'flex', gap: 10 }}>
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
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <KpiCard label="Type" value={PROPERTY_TYPE_LABELS[property.type]} />
        <KpiCard label="Surface" value={property.surface ? `${property.surface} m²` : '—'} />
        <KpiCard label="Pièces" value={property.rooms_count ? `${property.rooms_count} pièce${property.rooms_count > 1 ? 's' : ''}` : '—'} />
        <KpiCard label="Régime fiscal" value={TAX_REGIME_LABELS[property.tax_regime]} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Caractéristiques */}
        <Card title="Caractéristiques">
          <Row label="Type" value={PROPERTY_TYPE_LABELS[property.type]} />
          <Row label="Surface" value={property.surface ? `${property.surface} m²` : null} />
          <Row label="Pièces" value={property.rooms_count?.toString() ?? null} />
          <Row label="Chambres" value={property.bedrooms_count?.toString() ?? null} />
          <Row label="Étage" value={property.floor?.toString() ?? null} />
          <Row label="Ascenseur" value={property.has_elevator ? 'Oui' : 'Non'} />
          <Row label="Meublé" value={property.is_furnished ? 'Oui' : 'Non'} />
          <Row label="Mode de détention" value={OWNERSHIP_TYPE_LABELS[property.ownership_type]} />
        </Card>

        {/* Patrimoine */}
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

        {/* Charges */}
        <Card title="Charges annuelles">
          <Row label="Taxe foncière" value={fmt(property.property_tax)} />
          <Row
            label="Charges copropriété"
            value={property.condo_charges
              ? `${fmt(property.condo_charges * 12)} / an (${fmt(property.condo_charges)} / mois)`
              : null}
          />
        </Card>

        {/* Notes */}
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

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--bd-light-2)',
      borderRadius: 'var(--r-xl)',
      padding: 20,
      boxShadow: 'var(--shadow-1)',
    }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-sora), sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--navy)', letterSpacing: '-0.015em' }}>
        {value}
      </div>
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
  label: string; value: string | null; highlight?: boolean; positive?: boolean
}) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
      <dt style={{ color: 'var(--ink-3)' }}>{label}</dt>
      <dd style={{
        margin: 0,
        fontWeight: 500,
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
