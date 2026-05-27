'use client'

import { useActionState } from 'react'
import type { LeaseType, ReferenceIndex, Tenant, Lease } from '@/lib/types'
import { LEASE_TYPE_LABELS, REFERENCE_INDEX_LABELS } from '@/lib/types'
import { createTenantWithLease, updateTenant } from '@/lib/actions/tenants'

interface TenantLeaseFormProps {
  propertyId: string
  tenant?: Tenant
  lease?: Lease
}

const LEASE_TYPES: { value: LeaseType; label: string; duration: number }[] = [
  { value: 'location_nue', label: 'Location nue', duration: 36 },
  { value: 'location_meublee', label: 'Location meublée', duration: 12 },
  { value: 'bail_etudiant', label: 'Bail étudiant', duration: 9 },
  { value: 'bail_mobilite', label: 'Bail mobilité', duration: 10 },
  { value: 'colocation', label: 'Colocation', duration: 12 },
]

const REFERENCE_INDEXES: { value: ReferenceIndex; label: string }[] = [
  { value: 'irl', label: 'IRL' },
  { value: 'icc', label: 'ICC' },
  { value: 'ilat', label: 'ILAT' },
]

export default function TenantLeaseForm({ propertyId, tenant, lease }: TenantLeaseFormProps) {
  const isEdit = !!tenant
  const action = isEdit ? updateTenant : createTenantWithLease
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 640 }}>
      <input type="hidden" name="property_id" value={propertyId} />
      {tenant && <input type="hidden" name="id" value={tenant.id} />}

      {state?.error && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-line)',
          borderRadius: 10,
          padding: '11px 16px',
          fontSize: 13.5,
          color: 'var(--danger)',
        }}>
          {state.error}
        </div>
      )}

      {/* Locataire */}
      <Section title="Locataire">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Prénom" required>
            <input name="first_name" defaultValue={tenant?.first_name ?? ''} required placeholder="Marie" style={inp} />
          </Field>
          <Field label="Nom" required>
            <input name="last_name" defaultValue={tenant?.last_name ?? ''} required placeholder="Dupont" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Email">
            <input name="email" type="email" defaultValue={tenant?.email ?? ''} placeholder="marie@exemple.com" style={inp} />
          </Field>
          <Field label="Téléphone">
            <input name="phone" defaultValue={tenant?.phone ?? ''} placeholder="06 12 34 56 78" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Profession">
            <input name="profession" defaultValue={tenant?.profession ?? ''} placeholder="Ingénieure" style={inp} />
          </Field>
          <Field label="Revenus mensuels nets (€)">
            <input name="declared_income" type="number" min="0" defaultValue={tenant?.declared_income ?? ''} placeholder="2 800" style={inp} />
          </Field>
        </div>
      </Section>

      {/* Assurance habitation */}
      <Section title="Assurance habitation">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Compagnie">
            <input name="insurance_company" defaultValue={tenant?.insurance_company ?? ''} placeholder="Maif" style={inp} />
          </Field>
          <Field label="Numéro de police">
            <input name="insurance_policy_number" defaultValue={tenant?.insurance_policy_number ?? ''} placeholder="123456789" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Date d'expiration">
            <input name="insurance_expiry_date" type="date" defaultValue={tenant?.insurance_expiry_date ?? ''} style={inp} />
          </Field>
        </div>
      </Section>

      {/* Bail — uniquement à la création */}
      {!isEdit && (
        <Section title="Bail">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Type de bail">
              <select name="lease_type" defaultValue="location_nue" style={inp}>
                {LEASE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Date d'entrée" required>
              <input name="start_date" type="date" required style={inp} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Durée (mois)">
              <input name="duration_months" type="number" min="1" defaultValue="36" placeholder="36" style={inp} />
            </Field>
            <Field label="Jour d'exigibilité">
              <input name="payment_day" type="number" min="1" max="31" defaultValue="1" style={inp} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Loyer HC (€)" required>
              <input name="rent_amount" type="number" min="0" required placeholder="650" style={inp} />
            </Field>
            <Field label="Charges (€)">
              <input name="charges_amount" type="number" min="0" defaultValue="0" placeholder="50" style={inp} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Dépôt de garantie (€)">
              <input name="deposit_amount" type="number" min="0" placeholder="1 300" style={inp} />
            </Field>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-2)' }}>
              <input type="checkbox" name="index_clause" defaultChecked style={{ accentColor: 'var(--champagne-2)', width: 15, height: 15 }} />
              Clause d'indexation
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-2)' }}>
              <input type="checkbox" name="auto_renewal" defaultChecked style={{ accentColor: 'var(--champagne-2)', width: 15, height: 15 }} />
              Renouvellement automatique
            </label>
          </div>
          <div style={{ maxWidth: 200 }}>
            <Field label="Indice de référence">
              <select name="reference_index" defaultValue="irl" style={inp}>
                {REFERENCE_INDEXES.map(i => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Notes sur le bail">
            <textarea name="lease_notes" rows={3} style={{ ...inp, resize: 'none' as const }} placeholder="Observations particulières..." />
          </Field>
        </Section>
      )}

      {/* Notes locataire */}
      <Section title="Notes">
        <textarea
          name="tenant_notes"
          defaultValue={tenant?.notes ?? ''}
          rows={3}
          style={{ ...inp, resize: 'none' as const }}
          placeholder="Notes internes sur ce locataire..."
        />
      </Section>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 4 }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            background: pending ? 'rgba(196,168,107,0.5)' : 'linear-gradient(180deg, var(--champagne-3) 0%, var(--champagne) 50%, var(--champagne-2) 100%)',
            color: 'var(--navy)',
            border: '1px solid var(--champagne-2)',
            boxShadow: pending ? 'none' : 'var(--shadow-cta)',
            fontWeight: 600,
            fontSize: 13.5,
            padding: '10px 22px',
            borderRadius: 'var(--r-md)',
            cursor: pending ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.18s ease',
          }}
        >
          {pending
            ? 'Enregistrement...'
            : isEdit ? 'Enregistrer les modifications' : 'Enregistrer le locataire et le bail'}
        </button>
        <a
          href={`/properties/${propertyId}/locataire`}
          style={{ fontSize: 13.5, color: 'var(--ink-3)', textDecoration: 'none', transition: 'color 0.18s ease' }}
        >
          Annuler
        </a>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, paddingBottom: 4, borderBottom: '1px solid var(--bd-light-2)' }}>
        {title}
      </div>
      {children}
    </section>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%',
  background: 'var(--white)',
  border: '1px solid var(--bd-light)',
  borderRadius: 8,
  padding: '9px 12px',
  color: 'var(--ink)',
  fontSize: 13.5,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.18s ease',
}
