'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false) }
      else { router.push('/dashboard'); router.refresh() }
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) { setError(error.message); setLoading(false) }
      else { setSuccess(true) }
    }
  }

  if (success) {
    return (
      <div style={bgStyle}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: 40 }}>
          <div style={{ fontSize: 44, marginBottom: 18 }}>📬</div>
          <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--font-sora), sans-serif', fontSize: 22, fontWeight: 600, color: 'var(--cream)', letterSpacing: '-0.02em' }}>
            Vérifiez votre email
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--cream-3)', lineHeight: 1.65 }}>
            Un lien de confirmation a été envoyé à <strong style={{ color: 'var(--cream)' }}>{email}</strong>.
            Cliquez dessus pour activer votre compte.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={bgStyle}>
      {/* Back link */}
      <Link href="/" style={{
        position: 'absolute', top: 28, left: 32,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: 'var(--cream-2)', fontSize: 13.5, textDecoration: 'none',
        transition: 'color 0.18s ease',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Retour
      </Link>

      {/* Card */}
      <div style={cardStyle}>
        {/* Logo vertical */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <svg height={60} width={45} viewBox="0 0 60 80" aria-hidden="true">
            <path d="M8,8 L24,8 L24,52 L52,52 L52,68 L8,68 Z" fill="#D8C28A" />
            <path d="M52,8 L52,40 L40,40 L40,24 L20,24 L20,8 Z" fill="#D8C28A" />
          </svg>
          <span style={{ fontFamily: 'var(--font-sora), sans-serif', fontWeight: 600, fontSize: 26, letterSpacing: '0.14em', color: 'var(--champagne)' }}>
            LOYRIA
          </span>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(247,243,234,0.05)',
          border: '1px solid var(--bd-dark)',
          borderRadius: 12, padding: 4,
          marginBottom: 24,
        }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(null) }} style={{
              flex: 1, background: mode === m ? 'rgba(216,194,138,0.10)' : 'transparent',
              border: 'none',
              borderBottom: mode === m ? '2px solid var(--champagne)' : '2px solid transparent',
              color: mode === m ? 'var(--champagne)' : 'var(--cream-3)',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              {m === 'login' ? 'Se connecter' : 'S\'inscrire'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{
              background: 'var(--danger-bg)', border: '1px solid var(--danger-line)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11.5, color: 'var(--cream-2)', fontWeight: 500 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="vous@exemple.com" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: 'var(--cream-2)', fontWeight: 500 }}>
              Mot de passe
              {mode === 'login' && <span style={{ color: 'var(--cream-3)', fontWeight: 400, cursor: 'pointer', fontSize: 11 }}>Mot de passe oublié ?</span>}
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required minLength={mode === 'register' ? 8 : undefined}
              placeholder={mode === 'register' ? '8 caractères minimum' : '••••••••'} style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', marginTop: 8,
            background: loading ? 'rgba(216,194,138,0.5)' : 'linear-gradient(180deg, var(--champagne-3) 0%, var(--champagne) 50%, var(--champagne-2) 100%)',
            color: 'var(--navy)', border: '1px solid var(--champagne-2)',
            boxShadow: loading ? 'none' : 'var(--shadow-cta)',
            fontWeight: 600, fontSize: 14, padding: '12px 0', borderRadius: 10,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.18s ease',
          }}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            {!loading && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--cream-4)', fontSize: 11.5, textTransform: 'uppercase' as const, letterSpacing: '0.14em', margin: '2px 0' }}>
            <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--bd-dark-hi), transparent)' }} />
            ou
            <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--bd-dark-hi), transparent)' }} />
          </div>

          {/* Google button */}
          <button type="button" style={{
            width: '100%', background: 'transparent', border: '1px solid var(--bd-dark-hi)',
            color: 'var(--cream)', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
            padding: '11px 0', borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'all 0.18s ease',
          }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.20455c0-.63818-.0573-1.25182-.1636-1.84091H9v3.48136h4.8436c-.2086 1.125-.8427 2.07818-1.7959 2.71636v2.25818h2.9087c1.7018-1.56682 2.6836-3.87409 2.6836-6.61499z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.4673-.80591 5.9564-2.18045l-2.9087-2.25818c-.8059.54-1.8368.85909-3.0477.85909-2.3441 0-4.32818-1.58318-5.03591-3.71045H.957275v2.33182C2.43818 15.9832 5.48182 18 9 18z" fill="#34A853"/>
              <path d="M3.96409 10.71c-.18-.54-.28227-1.11682-.28227-1.71s.10227-1.17.28227-1.71V4.95818H.957273C.347727 6.17318 0 7.54773 0 9s.347727 2.82682.957273 4.04182L3.96409 10.71z" fill="#FBBC05"/>
              <path d="M9 3.57955c1.32136 0 2.50773.45409 3.4405 1.34591l2.5814-2.58136C13.4632.890455 11.4259 0 9 0 5.48182 0 2.43818 2.01682.957275 4.95818L3.96409 7.29c.70773-2.12727 2.69181-3.71045 5.03591-3.71045z" fill="#EA4335"/>
            </svg>
            {mode === 'login' ? 'Continuer avec Google' : 'S\'inscrire avec Google'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ ...bgStyle, display: 'flex' }} />}>
      <AuthContent />
    </Suspense>
  )
}

const bgStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(700px 500px at 80% 100%, rgba(216,194,138,0.15) 0%, transparent 60%), radial-gradient(600px 400px at 20% 0%, rgba(15,52,53,0.50) 0%, transparent 55%), var(--navy)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '40px 20px', position: 'relative', overflow: 'hidden',
  color: 'var(--cream)',
}

const cardStyle: React.CSSProperties = {
  width: '100%', maxWidth: 460,
  background: 'rgba(247,243,234,0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(216,194,138,0.18)',
  borderRadius: 22, padding: 36,
  boxShadow: '0 30px 60px -20px rgba(0,0,0,0.50), inset 0 1px 0 rgba(247,243,234,0.04)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(247,243,234,0.04)',
  border: '1px solid rgba(247,243,234,0.18)',
  borderRadius: 'var(--r-md)',
  color: 'var(--cream)',
  fontFamily: 'inherit', fontSize: 14,
  padding: '11px 13px',
  outline: 'none', boxSizing: 'border-box',
  transition: 'all 0.18s ease',
}
