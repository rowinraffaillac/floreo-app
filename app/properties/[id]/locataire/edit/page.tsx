import { redirect } from 'next/navigation'
import { getActiveLease } from '@/lib/actions/tenants'
import TenantLeaseForm from '@/components/tenants/TenantLeaseForm'

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = await params
  const { lease, tenant } = await getActiveLease(propertyId)

  if (!tenant || !lease) redirect(`/properties/${propertyId}/locataire`)

  return (
    <div style={{ padding: '28px 36px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
          Modification
        </div>
        <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-sora), sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--navy)' }}>
          {tenant.first_name} {tenant.last_name}
        </h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-3)' }}>Modifier le dossier locataire</p>
      </div>
      <TenantLeaseForm propertyId={propertyId} tenant={tenant} lease={lease} />
    </div>
  )
}
