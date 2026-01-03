'use client'

import { useState, useMemo, useEffect } from 'react'
import { Customer } from '@/types/database.types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRole } from '@/components/auth/RoleProvider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Map, List, Filter } from 'lucide-react'
import { CustomersTable } from './CustomersTable'
import { CustomersMap } from './CustomersMap'
import { CustomerDialog } from './CustomerDialog'
import { CustomersImportExportDialog } from './CustomersImportExportDialog'
import { toast } from 'sonner'
import { DeleteCustomerDialog } from './DeleteCustomerDialog'

interface ShopLocation {
  lat: number
  lng: number
  address: string
}

interface CustomersViewProps {
  initialCustomers: Customer[]
  errorMessage?: string
  inquiryByCustomerIdx: Record<string, string>
  shopLocation: ShopLocation
}

export function CustomersView({
  initialCustomers,
  errorMessage,
  inquiryByCustomerId,
  shopLocation,
}: CustomersViewProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const { isAdmin } = useRole()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [view, setView] = useState<'table' | 'map'>('table')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'inquiry'>('all')
  const [tableFocusedCustomerId, setTableFocusedCustomerId] = useState<string | null>(null)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [mapFocusedCustomerId, setMapFocusedCustomerId] = useState<string | null>(null)

  useEffect(() => {
    setCustomers(initialCustomers)
  }, [initialCustomers])

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditDialogOpen(true)
  }

  const handleDelete = (customer: Customer) => {
    if (!isAdmin) {
      toast.error('Admin access required to delete customers.')
      return
    }
    setSelectedCustomer(customer)
    setDeleteDialogOpen(true)
  }

  const handleViewOnMap = (customer: Customer) => {
    setMapFocusedCustomerId(customer.id)
    setView('map')
  }

  const handleViewInTable = (customerId: string) => {
    setTableFocusedCustomerId(customerId)
    setView('table')
  }

  useEffect(() => {
    if (view !== 'table' || !tableFocusedCustomerId) return
    const element = document.querySelector(
      `[data-customer-row-id="${tableFocusedCustomerId}"]`
    ) as HTMLElement | null
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    const timeout = setTimeout(() => {
      setTableFocusedCustomerId(null)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [
    view,
    tableFocusedCustomerId,
    customers,
    searchQuery,
    selectedDay,
    selectedType,
    sourceFilter,
    inquiryByCustomerId,
  ])

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDay =
        selectedDay === 'all' ||
        (selectedDay === 'unscheduled' ? !customer.day : customer.day === selectedDay)

      const matchesType =
        selectedType === 'all' || customer.type === selectedType

      const matchesSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'inquiry' &&
          inquiryByCustomerId &&
          inquiryByCustomerId[customer.id])

      return matchesSearch && matchesDay && matchesType && matchesSource
    })
  }, [customers, searchQuery, selectedDay, selectedType, sourceFilter, inquiryByCustomerId])

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = filteredCustomers.reduce((sum, c) => {
      const base = Number(c.cost) || 0
      const extra =
        c.has_additional_work && c.additional_work_cost
          ? Number(c.additional_work_cost)
          : 0
      return sum + base + extra
    }, 0)

    return {
      total: filteredCustomers.length,
      residential: filteredCustomers.filter((c) => c.type === 'Residential').length,
      commercial: filteredCustomers.filter((c) => c.type === 'Commercial').length,
      totalRevenue,
    }
  }, [filteredCustomers])

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-white px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage and view all your lawn care customers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
            >
              {isAdmin ? 'Import / Export' : 'Export CSV'}
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-white p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Customers</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-white p-4">
            <div className="text-sm font-medium text-muted-foreground">Residential</div>
            <div className="text-2xl font-bold">{stats.residential}</div>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-white p-4">
            <div className="text-sm font-medium text-muted-foreground">Commercial</div>
            <div className="text-2xl font-bold">{stats.commercial}</div>
          </div>
          <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-white p-4">
            <div className="text-sm font-medium text-muted-foreground">Monthly Revenue</div>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, address, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              <SelectItem value="unscheduled">Unscheduled</SelectItem>
              {daysOfWeek.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>

          {inquiryByCustomerId && Object.keys(inquiryByCustomerId).length > 0 && (
            <Select
              value={sourceFilter}
              onValueChange={(value) =>
                setSourceFilter(value as 'all' | 'inquiry')
              }
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="inquiry">From Inquiries</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* View Toggle */}
          <div className="flex gap-1 rounded-lg border p-1 bg-slate-100">
            <Button
              variant={view === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('table')}
              className={view === 'table' ? 'bg-white shadow' : ''}
            >
              <List className="h-4 w-4 mr-2" />
              Table
            </Button>
            <Button
              variant={view === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('map')}
              className={view === 'map' ? 'bg-white shadow' : ''}
            >
              <Map className="h-4 w-4 mr-2" />
              Map
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedDay !== 'all' || selectedType !== 'all' || sourceFilter !== 'all' || searchQuery) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 rounded-full hover:bg-slate-200"
                >
                  x
                </button>
              </Badge>
            )}
            {selectedDay !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Day: {selectedDay == 'unscheduled' ? 'Unscheduled' : selectedDay}
                <button
                  onClick={() => setSelectedDay('all')}
                  className="ml-1 rounded-full hover:bg-slate-200"
                >
                  x
                </button>
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Type: {selectedType}
                <button
                  onClick={() => setSelectedType('all')}
                  className="ml-1 rounded-full hover:bg-slate-200"
                >
                  x
                </button>
              </Badge>
            )}
            {sourceFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Source: From inquiries
                <button
                  onClick={() => setSourceFilter('all')}
                  className="ml-1 rounded-full hover:bg-slate-200"
                >
                  x
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedDay('all')
                setSelectedType('all')
                setSourceFilter('all')
              }}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-slate-50">
        {view === 'table' ? (
          <CustomersTable
            customers={filteredCustomers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewOnMap={handleViewOnMap}
            inquiryByCustomerId={inquiryByCustomerId}
            focusedCustomerId={tableFocusedCustomerId}
            onInlineUpdate={(updated) =>
              setCustomers((prev) =>
                prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
              )
            }
            canDelete={isAdmin}
          />
        ) : (
          <CustomersMap
            customers={filteredCustomers}
            focusedCustomerId={mapFocusedCustomerId}
            onViewInTable={handleViewInTable}
            shopLocation={shopLocation}
          />
        )}
      </div>

      {/* Dialogs */}
      <CustomerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        customer={null}
      />

      <CustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={selectedCustomer}
      />

      <DeleteCustomerDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        customer={selectedCustomer}
      />

      <CustomersImportExportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        customers={customers}
        isAdmin={isAdmin}
      />
    </div>
  )
}
