import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const LoyriaMark = ({ size = 22 }: { size?: number }) => (
  <svg width={Math.round(size * 0.75)} height={size} viewBox="0 0 60 80" aria-hidden="true">
    <path d="M8,8 L24,8 L24,52 L52,52 L52,68 L8,68 Z" fill="#0A1E2E" />
    <path d="M52,8 L52,40 L40,40 L40,24 L20,24 L20,8 Z" fill="#0A1E2E" />
  </svg>
)

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      {/* Nav */}
      <nav style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--bd-light)',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 1200,
        margin: '0 auto',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LoyriaMark size={24} />
          <span style={{
            fontFamily: 'var(--font-sora), sans-serif',
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: '0.12em',
            color: 'var(--navy)',
          }}>
            LOYRIA
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            href="/login"
            style={{ fontSize: 13.5, color: 'var(--ink-2)', textDecoration: 'none', transition: 'color 0.18s', fontWeight: 500 }}
          >
            Connexion
          </Link>
          <Link
            href="/register"
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'linear-gradient(180deg, var(--champagne-3) 0%, var(--champagne) 50%, var(--champagne-2) 100%)',
              color: 'var(--navy)',
              border: '1px solid var(--champagne-2)',
              boxShadow: 'var(--shadow-cta)',
              fontWeight: 600,
              fontSize: 13.5,
              padding: '8px 16px',
              borderRadius: 'var(--r-md)',
              textDecoration: 'none',
            }}
          >
            Commencer gratuitement
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '96px 40px 80px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.16em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 18 }}>
          Gestion locative
        </div>
        <h1 style={{ margin: '0 0 20px', fontFamily: 'var(--font-sora), sans-serif', fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--navy)', lineHeight: 1.15 }}>
          Votre patrimoine locatif,<br />
          <span style={{ color: 'var(--champagne-2)' }}>enfin ordonné</span>
        </h1>
        <p style={{ margin: '0 auto 40px', maxWidth: 520, fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.65 }}>
          Gérez vos propriétés, suivez vos loyers et gardez vos documents au même endroit.
          Simple, propre, pensé pour les bailleurs sérieux.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <Link
            href="/register"
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'linear-gradient(180deg, var(--champagne-3) 0%, var(--champagne) 50%, var(--champagne-2) 100%)',
              color: 'var(--navy)',
              border: '1px solid var(--champagne-2)',
              boxShadow: 'var(--shadow-cta)',
              fontWeight: 600,
              fontSize: 15,
              padding: '12px 26px',
              borderRadius: 12,
              textDecoration: 'none',
            }}
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/login"
            style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 15,
              fontWeight: 500,
              padding: '11px 26px',
              borderRadius: 12,
              border: '1px solid var(--bd-light-hi)',
              background: 'var(--white)',
              color: 'var(--ink)',
              textDecoration: 'none',
            }}
          >
            Se connecter
          </Link>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 80, textAlign: 'left' }}>
          {[
            { icon: '🏠', title: 'Multi-propriétés', desc: 'Gérez tous vos biens depuis un seul tableau de bord' },
            { icon: '💶', title: 'Suivi des loyers', desc: 'Visualisez les paiements et détectez les impayés instantanément' },
            { icon: '📄', title: 'Documents centralisés', desc: 'Contrats, quittances et diagnostics toujours à portée' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'var(--white)',
              border: '1px solid var(--bd-light-2)',
              borderRadius: 'var(--r-xl)',
              padding: '24px 22px',
              boxShadow: 'var(--shadow-1)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-sora), sans-serif' }}>
                {f.title}
              </h3>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
