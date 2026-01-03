'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Customer } from '@/types/database.types'
import { createCustomer, updateCustomer } from '@/app/(dashboard)/customers/actions'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSuccess?: () => void
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function CustomerDialog({
  open,
  onOpenChange,
  customer = null,
  onSuccess,
}: CustomerDialogProps) {
  const router = useRouter()
  const isEdit = !!customer

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    address: customer?.address || '',
    type: customer?.type || 'Residential',
    cost: customer?.cost || 35,
    day: customer?.day || 'unscheduled',
    has_additional_work: customer?.has_additional_work || false,
    additional_work_cost: customer?.additional_work_cost || 0,
  })

  // Reset form when dialog opens/closes or customer changes
  useEffect(() => {
    if (open && customer) {
      setFormData({
        name: customer.name,
        address: customer.address,
        type: customer.type,
        cost: customer.cost,
        day: customer.day || 'unscheduled',
        has_additional_work: customer.has_additional_work,
        additional_work_cost: customer.additional_work_cost || 0,
      })
    } else if (open && !customer) {
      setFormData({
        name: '',
        address: '',
        type: 'Residential',
        cost: 35,
        day: 'unscheduled',
        has_additional_work: false,
        additional_work_cost: 0,
      })
    }
    setError(null)
  }, [open, customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validation
      if (!formData.name.trim()) {
        setError('Customer name is required')
        setIsSubmitting(false)
        return
      }

      if (!formData.address.trim()) {
        setError('Address is required')
        setIsSubmitting(false)
        return
      }

      if (formData.cost <= 0) {
        setError('Cost must be greater than 0')
        setIsSubmitting(false)
        return
      }

      if (formData.has_additional_work && formData.additional_work_cost <= 0) {
        setError('Additional work cost must be greater than 0')
        setIsSubmitting(false)
        return
      }

      const result = isEdit
        ? await updateCustomer({
            id: customer.id,
            name: formData.name.trim(),
            address: formData.address.trim(),
            type: formData.type as 'Residential' | 'Commercial' | 'Workshop',
            cost: Number(formData.cost),
            day: formData.day === 'unscheduled' ? null : formData.day,
            has_additional_work: formData.has_additional_work,
            additional_work_cost: formData.has_additional_work
              ? Number(formData.additional_work_cost)
              : null,
          })
        : await createCustomer({
            name: formData.name.trim(),
            address: formData.address.trim(),
            type: formData.type as 'Residential' | 'Commercial' | 'Workshop',
            cost: Number(formData.cost),
            day: formData.day === 'unscheduled' ? null : formData.day,
            has_additional_work: formData.has_additional_work,
            additional_work_cost: formData.has_additional_work
              ? Number(formData.additional_work_cost)
              : null,
          })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      // Success
      toast.success(
        isEdit
          ? `${formData.name} has been updated successfully`
          : `${formData.name} has been added to your customers`
      )
      onOpenChange(false)
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (err) {
      console.error('Form submission error:', err)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update customer information below.'
              : 'Fill in the details to add a new customer.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Row 1: Name and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'Residential' | 'Commercial' | 'Workshop') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State ZIP"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the full address for accurate location mapping
              </p>
            </div>

            {/* Row 3: Cost and Day */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Base Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="35.00"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="day">Service Day</Label>
                <Select
                  value={formData.day || 'unscheduled'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, day: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unscheduled">Unscheduled</SelectItem>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Additional Work */}
            <div className="space-y-3 rounded-lg border p-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="additional-work" className="text-base">
                    Additional Work
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Does this customer have extra services?
                  </p>
                </div>
                <Switch
                  id="additional-work"
                  checked={formData.has_additional_work}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, has_additional_work: checked })
                  }
                />
              </div>

              {formData.has_additional_work && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="additional-cost">Additional Work Cost ($)</Label>
                  <Input
                    id="additional-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15.00"
                    value={formData.additional_work_cost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additional_work_cost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEdit ? 'Update Customer' : 'Add Customer'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
