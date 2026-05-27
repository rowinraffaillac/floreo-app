import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PropertyForm from '@/components/properties/PropertyForm'

export default async function NewPropertyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      {/* Topbar */}
      <header style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--bd-light)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        color: 'var(--ink-3)',
      }}>
        <Link href="/properties" style={{ color: 'var(--ink-2)', textDecoration: 'none', transition: 'color 0.18s' }}>
          Mes biens
        </Link>
        <span>›</span>
        <span style={{ color: 'var(--ink)', fontWeight: 500 }}>Nouveau bien</span>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
            Nouveau bien
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-sora), sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--navy)' }}>
            Ajouter un bien
          </h1>
        </div>
        <PropertyForm />
      </div>
    </div>
  )
}
