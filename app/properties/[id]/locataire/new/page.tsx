import TenantLeaseForm from '@/components/tenants/TenantLeaseForm'

export default async function NewTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = await params

  return (
    <div style={{ padding: '28px 36px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
          Nouveau locataire
        </div>
        <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-sora), sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--navy)' }}>
          Ajouter un locataire
        </h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-3)' }}>
          Le bail sera créé en même temps que le dossier locataire.
        </p>
      </div>
      <TenantLeaseForm propertyId={propertyId} />
    </div>
  )
}
