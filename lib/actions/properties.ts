'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Property } from '@/lib/types'

export async function getProperties(): Promise<Property[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .neq('status', 'archive')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProperty(id: string): Promise<Property> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) redirect('/properties')
  return data
}

function parseNum(val: FormDataEntryValue | null): number | null {
  if (!val || val === '') return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function parseStr(val: FormDataEntryValue | null): string | null {
  const s = val as string
  return s && s.trim() !== '' ? s.trim() : null
}

export async function createProperty(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Upsert profile + subscription in case the auth trigger didn't fire at signup
  await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })
  await supabase.from('subscriptions').upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true })

  const name = parseStr(formData.get('name'))
  const address = parseStr(formData.get('address'))
  const city = parseStr(formData.get('city'))
  const postal_code = parseStr(formData.get('postal_code'))

  if (!name || !address || !city || !postal_code) {
    return { error: 'Les champs nom, adresse, ville et code postal sont obligatoires.' }
  }

  const { data, error } = await supabase
    .from('properties')
    .insert({
      owner_id: user.id,
      name,
      address,
      city,
      postal_code,
      country: 'FR',
      type: formData.get('type') as string || 'appartement',
      status: formData.get('status') as string || 'vacant',
      surface: parseNum(formData.get('surface')),
      rooms_count: parseNum(formData.get('rooms_count')),
      bedrooms_count: parseNum(formData.get('bedrooms_count')),
      floor: parseNum(formData.get('floor')),
      has_elevator: formData.get('has_elevator') === 'on',
      is_furnished: formData.get('is_furnished') === 'on',
      purchase_date: parseStr(formData.get('purchase_date')),
      purchase_price: parseNum(formData.get('purchase_price')),
      notary_fees: parseNum(formData.get('notary_fees')),
      agency_fees: parseNum(formData.get('agency_fees')),
      initial_works_cost: parseNum(formData.get('initial_works_cost')),
      estimated_value: parseNum(formData.get('estimated_value')),
      tax_regime: formData.get('tax_regime') as string || 'micro_foncier',
      ownership_type: formData.get('ownership_type') as string || 'nom_propre',
      property_tax: parseNum(formData.get('property_tax')),
      condo_charges: parseNum(formData.get('condo_charges')),
      notes: parseStr(formData.get('notes')),
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/properties')
  redirect(`/properties/${data.id}`)
}

export async function updateProperty(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const name = parseStr(formData.get('name'))
  const address = parseStr(formData.get('address'))
  const city = parseStr(formData.get('city'))
  const postal_code = parseStr(formData.get('postal_code'))

  if (!name || !address || !city || !postal_code) {
    return { error: 'Les champs nom, adresse, ville et code postal sont obligatoires.' }
  }

  const { error } = await supabase
    .from('properties')
    .update({
      name,
      address,
      city,
      postal_code,
      type: formData.get('type') as string,
      status: formData.get('status') as string,
      surface: parseNum(formData.get('surface')),
      rooms_count: parseNum(formData.get('rooms_count')),
      bedrooms_count: parseNum(formData.get('bedrooms_count')),
      floor: parseNum(formData.get('floor')),
      has_elevator: formData.get('has_elevator') === 'on',
      is_furnished: formData.get('is_furnished') === 'on',
      purchase_date: parseStr(formData.get('purchase_date')),
      purchase_price: parseNum(formData.get('purchase_price')),
      notary_fees: parseNum(formData.get('notary_fees')),
      agency_fees: parseNum(formData.get('agency_fees')),
      initial_works_cost: parseNum(formData.get('initial_works_cost')),
      estimated_value: parseNum(formData.get('estimated_value')),
      tax_regime: formData.get('tax_regime') as string,
      ownership_type: formData.get('ownership_type') as string,
      property_tax: parseNum(formData.get('property_tax')),
      condo_charges: parseNum(formData.get('condo_charges')),
      notes: parseStr(formData.get('notes')),
    })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/properties/${id}`)
  revalidatePath('/properties')
  redirect(`/properties/${id}`)
}

export async function archiveProperty(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('properties')
    .update({ status: 'archive' })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/properties')
  redirect('/properties')
}
