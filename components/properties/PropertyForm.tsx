'use client'

import { useActionState } from 'react'
import type { Property, PropertyType, PropertyStatus, TaxRegime, OwnershipType } from '@/lib/types'
import { createProperty, updateProperty } from '@/lib/actions/properties'

interface PropertyFormProps {
  property?: Property
}

const TYPES: { value: PropertyType; label: string }[] = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'studio', label: 'Studio' },
  { value: 'immeuble', label: 'Immeuble' },
  { value: 'parking', label: 'Parking' },
  { value: 'garage', label: 'Garage' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'autre', label: 'Autre' },
]

const STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'loue', label: 'Loué' },
  { value: 'en_travaux', label: 'En travaux' },
  { value: 'en_recherche', label: 'En recherche de locataire' },
  { value: 'vendu', label: 'Vendu' },
]

const TAX_REGIMES: { value: TaxRegime; label: string }[] = [
  { value: 'micro_foncier', label: 'Micro-foncier' },
  { value: 'reel', label: 'Réel' },
  { value: 'lmnp', label: 'LMNP' },
  { value: 'sci', label: 'SCI' },
  { value: 'autre', label: 'Autre' },
]

const OWNERSHIP_TYPES: { value: OwnershipType; label: string }[] = [
  { value: 'nom_propre', label: 'Nom propre' },
  { value: 'sci', label: 'SCI' },
  { value: 'indivision', label: 'Indivision' },
  { value: 'societe', label: 'Société' },
]

export default function PropertyForm({ property }: PropertyFormProps) {
  const action = property ? updateProperty : createProperty
  const [state, formAction, pending] = useActionState(action, null)

  const p = property

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 640 }}>
      {p && <input type="hidden" name="id" value={p.id} />}

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

      {/* Informations générales */}
      <Section title="Informations générales">
        <Field label="Nom du bien" required>
          <input name="name" defaultValue={p?.name ?? ''} required placeholder="ex: Appartement Lyon Part-Dieu" style={inp} />
        </Field>
        <Field label="Adresse" required>
          <input name="address" defaultValue={p?.address ?? ''} required placeholder="ex: 12 rue de la République" style={inp} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Ville" required>
            <input name="city" defaultValue={p?.city ?? ''} required placeholder="Lyon" style={inp} />
          </Field>
          <Field label="Code postal" required>
            <input name="postal_code" defaultValue={p?.postal_code ?? ''} required placeholder="69001" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Type">
            <select name="type" defaultValue={p?.type ?? 'appartement'} style={inp}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Statut">
            <select name="status" defaultValue={p?.status ?? 'vacant'} style={inp}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* Caractéristiques */}
      <Section title="Caractéristiques">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <Field label="Surface (m²)">
            <input name="surface" type="number" step="0.01" min="0" defaultValue={p?.surface ?? ''} placeholder="58" style={inp} />
          </Field>
          <Field label="Pièces">
            <input name="rooms_count" type="number" min="0" defaultValue={p?.rooms_count ?? ''} placeholder="3" style={inp} />
          </Field>
          <Field label="Chambres">
            <input name="bedrooms_count" type="number" min="0" defaultValue={p?.bedrooms_count ?? ''} placeholder="2" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Étage">
            <input name="floor" type="number" min="0" defaultValue={p?.floor ?? ''} placeholder="2" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-2)' }}>
            <input type="checkbox" name="has_elevator" defaultChecked={p?.has_elevator ?? false} style={{ accentColor: 'var(--champagne-2)', width: 15, height: 15 }} />
            Ascenseur
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-2)' }}>
            <input type="checkbox" name="is_furnished" defaultChecked={p?.is_furnished ?? false} style={{ accentColor: 'var(--champagne-2)', width: 15, height: 15 }} />
            Meublé
          </label>
        </div>
      </Section>

      {/* Informations patrimoniales */}
      <Section title="Informations patrimoniales">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Date d'acquisition">
            <input name="purchase_date" type="date" defaultValue={p?.purchase_date ?? ''} style={inp} />
          </Field>
          <Field label="Prix d'achat (€)">
            <input name="purchase_price" type="number" min="0" defaultValue={p?.purchase_price ?? ''} placeholder="150 000" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <Field label="Frais de notaire (€)">
            <input name="notary_fees" type="number" min="0" defaultValue={p?.notary_fees ?? ''} placeholder="10 000" style={inp} />
          </Field>
          <Field label="Frais d'agence (€)">
            <input name="agency_fees" type="number" min="0" defaultValue={p?.agency_fees ?? ''} placeholder="5 000" style={inp} />
          </Field>
          <Field label="Travaux initiaux (€)">
            <input name="initial_works_cost" type="number" min="0" defaultValue={p?.initial_works_cost ?? ''} placeholder="15 000" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Valeur estimée actuelle (€)">
            <input name="estimated_value" type="number" min="0" defaultValue={p?.estimated_value ?? ''} placeholder="180 000" style={inp} />
          </Field>
          <Field label="Taxe foncière annuelle (€)">
            <input name="property_tax" type="number" min="0" defaultValue={p?.property_tax ?? ''} placeholder="800" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Charges copropriété / mois (€)">
            <input name="condo_charges" type="number" min="0" defaultValue={p?.condo_charges ?? ''} placeholder="120" style={inp} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Régime fiscal">
            <select name="tax_regime" defaultValue={p?.tax_regime ?? 'micro_foncier'} style={inp}>
              {TAX_REGIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Mode de détention">
            <select name="ownership_type" defaultValue={p?.ownership_type ?? 'nom_propre'} style={inp}>
              {OWNERSHIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* Notes */}
      <Section title="Notes">
        <textarea
          name="notes"
          defaultValue={p?.notes ?? ''}
          rows={4}
          placeholder="Notes internes sur ce bien..."
          style={{ ...inp, resize: 'none' as const }}
        />
      </Section>

      {/* Actions */}
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
          {pending ? 'Enregistrement...' : p ? 'Enregistrer les modifications' : 'Créer le bien'}
        </button>
        <a
          href={p ? `/properties/${p.id}` : '/properties'}
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
