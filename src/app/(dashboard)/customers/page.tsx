import { createClient } from '@/lib/supabase/server'
import { CustomersView } from '@/components/customers/CustomersView'
import { getShopLocation } from '@/lib/settings'

export const metadata = {
  title: 'Customers | Lawn Care CRM',
  description: 'Manage your lawn care customers',
}

export default async function CustomersPage() {
  const supabase = await createClient()
  const shopLocation = await getShopLocation()

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  const { data: convertedInquiries } = await supabase
    .from('inquiries')
    .select('id, converted_customer_id')
    .not('converted_customer_id', 'is', null)

  const inquiryByCustomerId: Record<string, string> = {}
  convertedInquiries?.forEach((inq) => {
    if (inq.converted_customer_id) {
      inquiryByCustomerId[inq.converted_customer_id] = inq.id
    }
  })

  if (error) {
    console.error('Error fetching customers:', error)
  }

  return (
    <CustomersView
      initialCustomers={customers || []}
      errorMessage={error ? 'Failed to load customers. Please try again.' : undefined}
      inquiryByCustomerId={inquiryByCustomerId}
      shopLocation={shopLocation}
    />
  )
}
