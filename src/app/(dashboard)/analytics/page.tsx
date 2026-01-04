import { createClient } from '@/lib/supabase/server'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { getShopLocation } from '@/lib/settings'

export const metadata = {
  title: 'Analytics | Lawn Care CRM',
  description: 'Business analytics and insights',
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const shopLocation = await getShopLocation()

  const { data: customers } = await supabase
    .from('customers')
    .select(
      'id, name, address, day, type, cost, has_additional_work, additional_work_cost, latitude, longitude'
    )
    .is('archived_at', null)

  const { data: customerMetrics } = await supabase
    .from('customer_metrics')
    .select('*')

  const { data: routeStats } = await supabase
    .from('route_statistics')
    .select('*')

  const { data: serviceHistory } = await supabase
    .from('service_history')
    .select('cost, service_date')

  return (
    <AnalyticsDashboard
      customers={customers || []}
      customerMetrics={customerMetrics || []}
      routeStats={routeStats || []}
      serviceHistory={serviceHistory || []}
      shopLocation={shopLocation}
    />
  )
}
