'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Tenant, Lease } from '@/lib/types'

function parseNum(val: FormDataEntryValue | null): number | null {
  if (!val || val === '') return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function parseStr(val: FormDataEntryValue | null): string | null {
  const s = val as string
  return s && s.trim() !== '' ? s.trim() : null
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

export async function getActiveLease(propertyId: string): Promise<{
  lease: Lease | null
  tenant: Tenant | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lease } = await supabase
    .from('leases')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'actif')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!lease) return { lease: null, tenant: null }

  const { data: lt } = await supabase
    .from('lease_tenants')
    .select('tenant_id')
    .eq('lease_id', lease.id)
    .eq('is_primary', true)
    .maybeSingle()

  if (!lt) return { lease, tenant: null }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', lt.tenant_id)
    .maybeSingle()

  return { lease, tenant }
}

export async function getActiveLeases(
  propertyIds: string[]
): Promise<Record<string, { lease: Lease; tenant: Tenant | null }>> {
  if (propertyIds.length === 0) return {}
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: leases } = await supabase
    .from('leases')
    .select('*')
    .in('property_id', propertyIds)
    .eq('status', 'actif')
    .order('start_date', { ascending: false })

  if (!leases || leases.length === 0) return {}

  const leaseMap: Record<string, Lease> = {}
  for (const lease of leases as Lease[]) {
    if (!leaseMap[lease.property_id]) leaseMap[lease.property_id] = lease
  }

  const leaseIds = Object.values(leaseMap).map(l => l.id)
  const { data: lts } = await supabase
    .from('lease_tenants')
    .select('lease_id, tenant_id')
    .in('lease_id', leaseIds)
    .eq('is_primary', true)

  if (!lts || lts.length === 0) {
    return Object.fromEntries(
      Object.entries(leaseMap).map(([pid, lease]) => [pid, { lease, tenant: null }])
    )
  }

  const tenantIds = lts.map(lt => lt.tenant_id)
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .in('id', tenantIds)

  const tenantById: Record<string, Tenant> = {}
  for (const t of (tenants ?? []) as Tenant[]) tenantById[t.id] = t
  const ltByLeaseId: Record<string, string> = {}
  for (const lt of lts) ltByLeaseId[lt.lease_id] = lt.tenant_id

  const result: Record<string, { lease: Lease; tenant: Tenant | null }> = {}
  for (const [propertyId, lease] of Object.entries(leaseMap)) {
    const tenantId = ltByLeaseId[lease.id]
    result[propertyId] = { lease, tenant: tenantId ? (tenantById[tenantId] ?? null) : null }
  }
  return result
}

export async function getTenant(id: string): Promise<Tenant> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error) redirect('/properties')
  return data
}

export async function getLease(id: string): Promise<Lease> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('leases')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error) redirect('/properties')
  return data
}

export async function createTenantWithLease(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const propertyId = formData.get('property_id') as string
  const firstName = parseStr(formData.get('first_name'))
  const lastName = parseStr(formData.get('last_name'))
  const startDate = parseStr(formData.get('start_date'))
  const rentAmount = parseNum(formData.get('rent_amount'))

  if (!firstName || !lastName) return { error: 'Le prénom et le nom du locataire sont obligatoires.' }
  if (!startDate) return { error: 'La date d\'entrée est obligatoire.' }
  if (!rentAmount) return { error: 'Le loyer est obligatoire.' }

  // 1. Créer le locataire
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      owner_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email: parseStr(formData.get('email')),
      phone: parseStr(formData.get('phone')),
      profession: parseStr(formData.get('profession')),
      declared_income: parseNum(formData.get('declared_income')),
      deposit_amount: parseNum(formData.get('deposit_amount')),
      insurance_company: parseStr(formData.get('insurance_company')),
      insurance_policy_number: parseStr(formData.get('insurance_policy_number')),
      insurance_expiry_date: parseStr(formData.get('insurance_expiry_date')),
      status: 'actif',
      notes: parseStr(formData.get('tenant_notes')),
    })
    .select()
    .single()

  if (tenantError) return { error: tenantError.message }

  // 2. Calculer la date de fin et la prochaine révision
  const durationMonths = parseNum(formData.get('duration_months'))
  const endDate = durationMonths ? addMonths(startDate, durationMonths) : null
  const chargesAmount = parseNum(formData.get('charges_amount')) ?? 0
  const indexClause = formData.get('index_clause') === 'on'
  const nextRevisionDate = indexClause ? addMonths(startDate, 12) : null

  // 3. Créer le bail
  const { data: lease, error: leaseError } = await supabase
    .from('leases')
    .insert({
      property_id: propertyId,
      owner_id: user.id,
      type: formData.get('lease_type') as string || 'location_nue',
      start_date: startDate,
      duration_months: durationMonths,
      end_date: endDate,
      auto_renewal: formData.get('auto_renewal') === 'on',
      rent_amount: rentAmount,
      charges_amount: chargesAmount,
      total_rent: rentAmount + chargesAmount,
      deposit_amount: parseNum(formData.get('deposit_amount')),
      payment_day: parseNum(formData.get('payment_day')) ?? 1,
      index_clause: indexClause,
      reference_index: formData.get('reference_index') as string || 'irl',
      next_revision_date: nextRevisionDate,
      status: 'actif',
      notes: parseStr(formData.get('lease_notes')),
    })
    .select()
    .single()

  if (leaseError) return { error: leaseError.message }

  // 4. Lier locataire au bail
  const { error: linkError } = await supabase
    .from('lease_tenants')
    .insert({ lease_id: lease.id, tenant_id: tenant.id, is_primary: true })

  if (linkError) return { error: linkError.message }

  // 5. Mettre à jour le statut du bien
  await supabase
    .from('properties')
    .update({ status: 'loue' })
    .eq('id', propertyId)
    .eq('owner_id', user.id)

  revalidatePath(`/properties/${propertyId}`)
  revalidatePath(`/properties/${propertyId}/locataire`)
  revalidatePath('/properties')
  redirect(`/properties/${propertyId}/locataire`)
}

export async function updateTenant(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const propertyId = formData.get('property_id') as string

  const { error } = await supabase
    .from('tenants')
    .update({
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: parseStr(formData.get('email')),
      phone: parseStr(formData.get('phone')),
      profession: parseStr(formData.get('profession')),
      declared_income: parseNum(formData.get('declared_income')),
      deposit_amount: parseNum(formData.get('deposit_amount')),
      insurance_company: parseStr(formData.get('insurance_company')),
      insurance_policy_number: parseStr(formData.get('insurance_policy_number')),
      insurance_expiry_date: parseStr(formData.get('insurance_expiry_date')),
      notes: parseStr(formData.get('tenant_notes')),
    })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/properties/${propertyId}/locataire`)
  redirect(`/properties/${propertyId}/locataire`)
}

export async function terminateLease(leaseId: string, tenantId: string, propertyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('leases')
    .update({ status: 'resilie' })
    .eq('id', leaseId)
    .eq('owner_id', user.id)

  await supabase
    .from('tenants')
    .update({ status: 'sorti' })
    .eq('id', tenantId)
    .eq('owner_id', user.id)

  await supabase
    .from('properties')
    .update({ status: 'vacant' })
    .eq('id', propertyId)
    .eq('owner_id', user.id)

  revalidatePath(`/properties/${propertyId}`)
  revalidatePath(`/properties/${propertyId}/locataire`)
  revalidatePath('/properties')
  redirect(`/properties/${propertyId}/locataire`)
}
