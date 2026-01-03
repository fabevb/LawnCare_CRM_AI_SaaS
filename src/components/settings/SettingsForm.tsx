'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { saveSettings } from '@/app/(dashboard)/settings/actions'
import { Building2, Bell, MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { SettingsValues } from '@/lib/settings'

interface SettingsFormProps {
  initialSettings: SettingsValues
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState(() => ({
    businessName: initialSettings.businessName || '',
    businessEmail: initialSettings.businessEmail || '',
    businessPhone: initialSettings.businessPhone || '',
    shopAddress: initialSettings.shopAddress || '',
    shopLat: String(initialSettings.shopLat ?? ''),
    shopLng: String(initialSettings.shopLng ?? ''),
    notifyNewInquiryEmail: initialSettings.notifyNewInquiryEmail,
    notifyNewInquirySms: initialSettings.notifyNewInquirySms,
    notifyRouteCompletedEmail: initialSettings.notifyRouteCompletedEmail,
    notifyRouteCompletedSms: initialSettings.notifyRouteCompletedSms,
  }))

  useEffect(() => {
    setFormData({
      businessName: initialSettings.businessName || '',
      businessEmail: initialSettings.businessEmail || '',
      businessPhone: initialSettings.businessPhone || '',
      shopAddress: initialSettings.shopAddress || '',
      shopLat: String(initialSettings.shopLat ?? ''),
      shopLng: String(initialSettings.shopLng ?? ''),
      notifyNewInquiryEmail: initialSettings.notifyNewInquiryEmail,
      notifyNewInquirySms: initialSettings.notifyNewInquirySms,
      notifyRouteCompletedEmail: initialSettings.notifyRouteCompletedEmail,
      notifyRouteCompletedSms: initialSettings.notifyRouteCompletedSms,
    })
  }, [initialSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const businessName = formData.businessName.trim()
    const shopAddress = formData.shopAddress.trim()
    const shopLat = Number(formData.shopLat)
    const shopLng = Number(formData.shopLng)

    if (!businessName) {
      const message = 'Business name is required.'
      setError(message)
      toast.error(message)
      setIsSaving(false)
      return
    }

    if (!shopAddress) {
      const message = 'Shop address is required.'
      setError(message)
      toast.error(message)
      setIsSaving(false)
      return
    }

    if (!Number.isFinite(shopLat) || shopLat < -90 || shopLat > 90) {
      const message = 'Latitude must be between -90 and 90.'
      setError(message)
      toast.error(message)
      setIsSaving(false)
      return
    }

    if (!Number.isFinite(shopLng) || shopLng < -180 || shopLng > 180) {
      const message = 'Longitude must be between -180 and 180.'
      setError(message)
      toast.error(message)
      setIsSaving(false)
      return
    }

    let result: { error?: string } | undefined

    try {
      result = await saveSettings({
        businessName,
        businessEmail: formData.businessEmail.trim() || null,
        businessPhone: formData.businessPhone.trim() || null,
        shopAddress,
        shopLat,
        shopLng,
        notifyNewInquiryEmail: formData.notifyNewInquiryEmail,
        notifyNewInquirySms: formData.notifyNewInquirySms,
        notifyRouteCompletedEmail: formData.notifyRouteCompletedEmail,
        notifyRouteCompletedSms: formData.notifyRouteCompletedSms,
      })
    } catch (err) {
      console.error('Save settings failed:', err)
      const message = 'Failed to save settings.'
      setError(message)
      toast.error(message)
      setIsSaving(false)
      return
    }

    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setIsSaving(false)
      return
    }

    toast.success('Settings saved successfully')
    setIsSaving(false)
    router.refresh()
  }

  const handleReset = () => {
    setFormData({
      businessName: initialSettings.businessName || '',
      businessEmail: initialSettings.businessEmail || '',
      businessPhone: initialSettings.businessPhone || '',
      shopAddress: initialSettings.shopAddress || '',
      shopLat: String(initialSettings.shopLat ?? ''),
      shopLng: String(initialSettings.shopLng ?? ''),
      notifyNewInquiryEmail: initialSettings.notifyNewInquiryEmail,
      notifyNewInquirySms: initialSettings.notifyNewInquirySms,
      notifyRouteCompletedEmail: initialSettings.notifyRouteCompletedEmail,
      notifyRouteCompletedSms: initialSettings.notifyRouteCompletedSms,
    })
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Business Profile
          </CardTitle>
          <CardDescription>
            Name and contact details shown on your public inquiry page.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName">
              Business Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, businessName: e.target.value }))
              }
              placeholder="Lawn Care CRM"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business Email</Label>
            <Input
              id="businessEmail"
              type="email"
              value={formData.businessEmail}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, businessEmail: e.target.value }))
              }
              placeholder="hello@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business Phone</Label>
            <Input
              id="businessPhone"
              value={formData.businessPhone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, businessPhone: e.target.value }))
              }
              placeholder="(555) 123-4567"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            Shop Location
          </CardTitle>
          <CardDescription>
            Used for distance calculations and route optimization.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shopAddress">
              Shop Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shopAddress"
              value={formData.shopAddress}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shopAddress: e.target.value }))
              }
              placeholder="16 Cherokee Dr, St Peters, MO"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopLat">
              Latitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shopLat"
              type="number"
              step="0.000001"
              min="-90"
              max="90"
              value={formData.shopLat}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shopLat: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopLng">
              Longitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shopLng"
              type="number"
              step="0.000001"
              min="-180"
              max="180"
              value={formData.shopLng}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shopLng: e.target.value }))
              }
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose which events should trigger alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div>
              <div className="font-medium">New inquiry received</div>
              <p className="text-xs text-muted-foreground">
                Triggered when a new quote request is submitted.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.notifyNewInquiryEmail}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, notifyNewInquiryEmail: checked }))
                  }
                />
                <span className="text-sm">Email</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.notifyNewInquirySms}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, notifyNewInquirySms: checked }))
                  }
                />
                <span className="text-sm">SMS</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div>
              <div className="font-medium">Route completed</div>
              <p className="text-xs text-muted-foreground">
                Triggered when a scheduled route is marked complete.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.notifyRouteCompletedEmail}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, notifyRouteCompletedEmail: checked }))
                  }
                />
                <span className="text-sm">Email</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.notifyRouteCompletedSms}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, notifyRouteCompletedSms: checked }))
                  }
                />
                <span className="text-sm">SMS</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
          Reset
        </Button>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </form>
  )
}
