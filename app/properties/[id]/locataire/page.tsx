import Link from 'next/link'
import { getActiveLease } from '@/lib/actions/tenants'
import { terminateLease } from '@/lib/actions/tenants'
import { LEASE_TYPE_LABELS, REFERENCE_INDEX_LABELS } from '@/lib/types'

const fmt = (n: number | null) =>
  n != null ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n) : null

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function LocatairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = await params
  const { lease, tenant } = await getActiveLease(propertyId)

  if (!lease || !tenant) {
    return (
      <div style={{ padding: '28px 36px 60px' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
          Locataire
        </div>
        <h1 style={{ margin: '0 0 24px', fontFamily: 'var(--font-sora), sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--navy)' }}>
          Aucun locataire actif
        </h1>
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--bd-light-2)',
          borderRadius: 'var(--r-xl)',
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 400,
          boxShadow: 'var(--shadow-1)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>👤</div>
          <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-sora), sans-serif', fontSize: 17, fontWeight: 600, color: 'var(--navy)' }}>
            Ajouter un locataire
          </h2>
          <p style={{ margin: '0 0 22px', fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
            Créez le dossier locataire et le bail en une seule étape.
          </p>
          <Link
            href={`/properties/${propertyId}/locataire/new`}
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'linear-gradient(180deg, var(--champagne-3) 0%, var(--champagne) 50%, var(--champagne-2) 100%)',
              color: 'var(--navy)',
              border: '1px solid var(--champagne-2)',
              boxShadow: 'var(--shadow-cta)',
              fontWeight: 600,
              fontSize: 13.5,
              padding: '9px 18px',
              borderRadius: 'var(--r-md)',
              textDecoration: 'none',
            }}
          >
            Ajouter un locataire
          </Link>
        </div>
      </div>
    )
  }

  const insuranceDays = daysUntil(tenant.insurance_expiry_date)
  const leaseDays = daysUntil(lease.end_date)
  const revisionDays = daysUntil(lease.next_revision_date)

  return (
    <div style={{ padding: '28px 36px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 8 }}>
            Locataire actif
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-sora), sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--navy)' }}>
            {tenant.first_name} {tenant.last_name}
          </h1>
        </div>
        <Link
          href={`/properties/${propertyId}/locataire/edit`}
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

      {/* Alertes */}
      {(insuranceDays !== null && insuranceDays <= 60) && (
        <div style={{
          marginBottom: 20,
          background: 'var(--warning-bg)',
          border: '1px solid var(--warning-line)',
          borderRadius: 'var(--r-md)',
          padding: '11px 16px',
          fontSize: 13.5,
          color: 'var(--warning)',
        }}>
          {insuranceDays <= 0
            ? 'Assurance habitation expirée — demander le renouvellement'
            : `Assurance habitation expire dans ${insuranceDays} jour${insuranceDays > 1 ? 's' : ''}`}
        </div>
      )}
      {(revisionDays !== null && revisionDays <= 30 && revisionDays > 0) && (
        <div style={{
          marginBottom: 20,
          background: 'var(--info-bg)',
          border: '1px solid rgba(44,110,143,0.20)',
          borderRadius: 'var(--r-md)',
          padding: '11px 16px',
          fontSize: 13.5,
          color: 'var(--info)',
        }}>
          Révision de loyer prévue dans {revisionDays} jour{revisionDays > 1 ? 's' : ''}
        </div>
      )}

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Infos locataire */}
        <Card title="Informations">
          <Row label="Email" value={tenant.email} />
          <Row label="Téléphone" value={tenant.phone} />
          <Row label="Profession" value={tenant.profession} />
          <Row label="Revenus déclarés" value={fmt(tenant.declared_income) ? `${fmt(tenant.declared_income)} / mois` : null} />
          <Row label="Dépôt de garantie" value={fmt(tenant.deposit_amount)} />
        </Card>

        {/* Assurance */}
        <Card title="Assurance habitation">
          <Row label="Compagnie" value={tenant.insurance_company} />
          <Row label="N° de police" value={tenant.insurance_policy_number} />
          <Row
            label="Expiration"
            value={fmtDate(tenant.insurance_expiry_date)}
            warning={insuranceDays !== null && insuranceDays <= 60}
          />
          {!tenant.insurance_company && (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--warning)' }}>Assurance non renseignée</p>
          )}
        </Card>

        {/* Bail */}
        <Card title="Bail">
          <Row label="Type" value={LEASE_TYPE_LABELS[lease.type]} />
          <Row label="Entrée" value={fmtDate(lease.start_date)} />
          <Row label="Fin prévue" value={fmtDate(lease.end_date)} />
          {leaseDays !== null && leaseDays > 0 && (
            <Row label="Reste" value={`${leaseDays} jour${leaseDays > 1 ? 's' : ''}`} />
          )}
          <Row label="Renouvellement auto" value={lease.auto_renewal ? 'Oui' : 'Non'} />
        </Card>

        {/* Loyer */}
        <Card title="Loyer">
          <Row label="Loyer HC" value={fmt(lease.rent_amount) ? `${fmt(lease.rent_amount)} / mois` : null} />
          <Row label="Charges" value={lease.charges_amount > 0 ? `${fmt(lease.charges_amount)} / mois` : '0 €'} />
          <Row label="Total CC" value={`${fmt(lease.total_rent)} / mois`} highlight />
          <Row label="Dépôt de garantie" value={fmt(lease.deposit_amount)} />
          <Row label="Jour d'exigibilité" value={`Le ${lease.payment_day} du mois`} />
          <Row label="Indexation" value={lease.index_clause ? REFERENCE_INDEX_LABELS[lease.reference_index] : 'Non'} />
          <Row label="Prochaine révision" value={fmtDate(lease.next_revision_date)} warning={revisionDays !== null && revisionDays <= 30} />
        </Card>
      </div>

      {/* Notes */}
      {tenant.notes && (
        <div style={{ marginTop: 16 }}>
          <Card title="Notes">
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {tenant.notes}
            </p>
          </Card>
        </div>
      )}

      {/* Clôturer le bail */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--bd-light-2)' }}>
        <form action={async () => {
          'use server'
          await terminateLease(lease.id, tenant.id, propertyId)
        }}>
          <button
            type="submit"
            style={{
              fontSize: 12, color: 'var(--ink-4)', background: 'transparent', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.18s ease',
            }}
          >
            Clôturer le bail
          </button>
        </form>
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

function Row({ label, value, highlight, warning }: {
  label: string; value: string | null; highlight?: boolean; warning?: boolean
}) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}>
      <dt style={{ color: 'var(--ink-3)' }}>{label}</dt>
      <dd style={{
        margin: 0,
        fontWeight: 500,
        color: highlight ? 'var(--champagne-2)' : warning ? 'var(--warning)' : 'var(--ink)',
        fontFamily: typeof value === 'string' && /[\d€]/.test(value) ? 'var(--font-mono), monospace' : 'inherit',
      }}>
        {value}
      </dd>
    </div>
  )
}
