'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Customer } from '@/types/database.types'
import { useRole } from '@/components/auth/RoleProvider'
import { deleteCustomer, checkCustomerRoutes } from '@/app/(dashboard)/customers/actions'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onSuccess?: () => void
}

export function DeleteCustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: DeleteCustomerDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [routeCount, setRouteCount] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const { isAdmin } = useRole()

  // Check if customer is in any routes when dialog opens
  useEffect(() => {
    if (open && customer) {
      setIsChecking(true)
      checkCustomerRoutes(customer.id).then((result) => {
        if (result.success && result.routes) {
          setRouteCount(result.routes.length)
        }
        setIsChecking(false)
      })
    }
  }, [open, customer])

  const handleDelete = async () => {
    if (!customer) return

    setIsDeleting(true)

    try {
      const result = await deleteCustomer(customer.id)

      if (result.error) {
        toast.error(result.error)
        setIsDeleting(false)
        return
      }

      // Success
      const message =
        result.removedFromRoutes && result.removedFromRoutes > 0
          ? `${customer.name} has been deleted and removed from ${result.removedFromRoutes} route(s)`
          : `${customer.name} has been deleted successfully`

      toast.success(message)
      onOpenChange(false)
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('An unexpected error occurred')
      setIsDeleting(false)
    }
  }

  if (!customer) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Customer?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>{customer.name}</strong>?
            </p>

            {isChecking ? (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking route dependencies...
              </div>
            ) : routeCount > 0 ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mt-2">
                <p className="text-sm text-amber-900 font-medium">
                  ⚠️ This customer is in {routeCount} route{routeCount !== 1 ? 's' : ''}.
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  Deleting will remove them from all routes. This action cannot be undone.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                This action cannot be undone.
              </p>
            )}
            {!isAdmin ? (
              <p className="text-sm text-amber-700 mt-2">
                Admin access required to delete customers.
              </p>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting || isChecking || !isAdmin}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : isAdmin ? (
              'Delete Customer'
            ) : (
              'Admin only'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
