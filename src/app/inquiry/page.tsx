import InquiryForm from '@/components/inquiry/InquiryForm'
import { getBusinessProfile } from '@/lib/settings'

export default async function InquiryPage() {
  const business = await getBusinessProfile()

  return (
    <InquiryForm
      businessName={business.name}
      businessEmail={business.email}
      businessPhone={business.phone}
    />
  )
}
