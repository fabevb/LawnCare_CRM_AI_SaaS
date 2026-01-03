import { createClient } from '@/lib/supabase/server'
import { RouteBuilder } from '@/components/routes/RouteBuilder'

export const metadata = {
  title: 'Create Route | Lawn Care CRM',
  description: 'Build and optimize a new service route',
}

export default async function NewRoutePage() {
  const supabase = await createClient()

  // Get all customers with coordinates
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('name')

  return <RouteBuilder customers={customers || []} />
}
