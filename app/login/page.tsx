'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const LoyriaMark = () => (
  <svg width={18} height={24} viewBox="0 0 60 80" aria-hidden="true">
    <path d="M8,8 L24,8 L24,52 L52,52 L52,68 L8,68 Z" fill="#D8C28A" />
    <path d="M52,8 L52,40 L40,40 L40,24 L20,24 L20,8 Z" fill="#D8C28A" />
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <LoyriaMark />
            <span style={{
              fontFamily: 'var(--font-sora), sans-serif',
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '0.14em',
              color: 'var(--cream)',
            }}>
              LOYRIA
            </span>
          </div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-sora), sans-serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--cream)' }}>
            Connexion
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--cream-3)' }}>
            Accédez à votre espace bailleur
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          style={{
            background: 'rgba(247,243,234,0.04)',
            border: '1px solid rgba(247,243,234,0.10)',
            borderRadius: 18,
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-line)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12.5, color: 'var(--cream-3)', marginBottom: 8, fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="vous@exemple.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, color: 'var(--cream-3)', marginBottom: 8, fontWeight: 500 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(216,194,138,0.5)' : 'linear-gradient(180deg, var(--champagne-3) 0%, var(--champagne) 50%, var(--champagne-2) 100%)',
              color: 'var(--navy)',
              border: '1px solid var(--champagne-2)',
              boxShadow: loading ? 'none' : 'var(--shadow-cta)',
              fontWeight: 600,
              fontSize: 14,
              padding: '11px 0',
              borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.18s ease',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p style={{ margin: 0, textAlign: 'center', fontSize: 13, color: 'var(--cream-4)' }}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color: 'var(--champagne)', textDecoration: 'none', fontWeight: 500 }}>
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(247,243,234,0.06)',
  border: '1px solid rgba(247,243,234,0.12)',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--cream)',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.18s ease',
}
