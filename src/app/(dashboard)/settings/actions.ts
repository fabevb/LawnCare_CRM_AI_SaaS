'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SaveSettingsInput {
  businessName: string
  businessEmail?: string | null
  businessPhone?: string | null
  shopAddress: string
  shopLat: number
  shopLng: number
  notifyNewInquiryEmail: boolean
  notifyNewInquirySms: boolean
  notifyRouteCompletedEmail: boolean
  notifyRouteCompletedSms: boolean
}

export async function saveSettings(input: SaveSettingsInput) {
  const businessName = input.businessName?.trim() || ''
  const shopAddress = input.shopAddress?.trim() || ''
  const shopLat = Number(input.shopLat)
  const shopLng = Number(input.shopLng)

  if (!businessName) {
    return { error: 'Business name is required.' }
  }

  if (!shopAddress) {
    return { error: 'Shop address is required.' }
  }

  if (!Number.isFinite(shopLat) || shopLat < -90 || shopLat > 90) {
    return { error: 'Latitude must be between -90 and 90.' }
  }

  if (!Number.isFinite(shopLng) || shopLng < -180 || shopLng > 180) {
    return { error: 'Longitude must be between -180 and 180.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('settings')
    .upsert(
      {
        singleton: true,
        business_name: businessName,
        business_email: input.businessEmail?.trim() || null,
        business_phone: input.businessPhone?.trim() || null,
        shop_address: shopAddress,
        shop_lat: shopLat,
        shop_lng: shopLng,
        notify_new_inquiry_email: input.notifyNewInquiryEmail,
        notify_new_inquiry_sms: input.notifyNewInquirySms,
        notify_route_completed_email: input.notifyRouteCompletedEmail,
        notify_route_completed_sms: input.notifyRouteCompletedSms,
      },
      { onConflict: 'singleton' }
    )

  if (error) {
    console.error('Error saving settings:', error)
    return { error: 'Failed to save settings.' }
  }

  revalidatePath('/settings')
  revalidatePath('/inquiry')
  revalidatePath('/customers')
  revalidatePath('/routes')
  revalidatePath('/analytics')

  return { success: true }
}
