import Link from 'next/link'
import { getProperty } from '@/lib/actions/properties'
import PropertyForm from '@/components/properties/PropertyForm'

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await getProperty(id)

  return (
    <div style={{ padding: '28px 36px 60px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 28, color: 'var(--ink-3)' }}>
        <Link href="/properties" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Mes biens</Link>
        <span>›</span>
        <Link href={`/properties/${id}`} style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>{property.name}</Link>
        <span>›</span>
        <span style={{ color: 'var(--ink)', fontWeight: 500 }}>Modifier</span>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
          Modification
        </div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-sora), sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--navy)' }}>
          {property.name}
        </h1>
      </div>

      <PropertyForm property={property} />
    </div>
  )
}
