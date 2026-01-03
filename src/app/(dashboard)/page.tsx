import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, MapPin, DollarSign, TrendingUp } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  contacted: 'bg-blue-100 text-blue-700',
  quoted: 'bg-purple-100 text-purple-700',
  converted: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-slate-100 text-slate-600',
  spam: 'bg-red-100 text-red-700',
}


export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: customerMetrics }, { data: routeStats }, { data: recentInquiries }] = await Promise.all([
    supabase.from('customer_metrics').select('lifetime_revenue'),
    supabase.from('route_statistics').select('*'),
    supabase
      .from('inquiries')
      .select('id, name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const { data: customers } = await supabase.from('customers').select('id')

  const totalCustomers = customers?.length || 0
  const totalRoutes = routeStats?.length || 0

  const totalLifetimeRevenue =
    customerMetrics?.reduce((sum, metric) => sum + Number(metric.lifetime_revenue || 0), 0) || 0

  const totalRouteStops =
    routeStats?.reduce(
      (sum, r) => sum + Number(r.total_stops || 0),
      0
    ) || 0

  const totalCompletedStops =
    routeStats?.reduce(
      (sum, r) => sum + Number(r.completed_stops || 0),
      0
    ) || 0

  const efficiency =
    totalRouteStops > 0
      ? Math.round((totalCompletedStops / totalRouteStops) * 100)
      : 0

  const today = new Date()
  const todayIso = today.toISOString().split('T')[0]
  const todayRoutes =
    routeStats?.filter((r) => r.date === todayIso) || []

  const todayRouteDays = Array.from(
    new Set(todayRoutes.map((r) => r.day_of_week))
  )

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Live snapshot of your customers and routes.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active in your database
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRoutes}</div>
            <p className="text-xs text-muted-foreground">
              Planned or completed routes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalLifetimeRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From all recorded services
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Route Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {efficiency}
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Stops completed across all routes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>
              {todayRoutes.length > 0
                ? `Routes scheduled for ${today.toLocaleDateString()}`
                : 'No routes scheduled for today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayRoutes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create a route from the Routes page to see it here.
              </p>
            ) : (
              <ul className="space-y-1 text-sm text-muted-foreground">
                {todayRoutes.map((route) => (
                  <li key={route.id}>
                    <span className="font-medium">{route.day_of_week}</span> ·{' '}
                    {route.total_stops} stops
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>At a Glance</CardTitle>
            <CardDescription>Where your work is concentrated</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium">{totalRouteStops}</span> total stops
                planned across all routes
              </li>
              <li>
                <span className="font-medium">{totalCompletedStops}</span> stops
                marked as completed
              </li>
              {todayRouteDays.length > 0 && (
                <li>
                  Today&apos;s route days:{' '}
                  <span className="font-medium">
                    {todayRouteDays.join(', ')}
                  </span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
            <CardDescription>Latest leads from your public form</CardDescription>
          </CardHeader>
          <CardContent>
            {!recentInquiries || recentInquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inquiries yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentInquiries.map((inquiry) => (
                  <li key={inquiry.id} className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{inquiry.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={STATUS_STYLES[inquiry.status || 'pending'] || 'bg-slate-100 text-slate-700'}
                    >
                      {inquiry.status || 'pending'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 text-sm">
              <Link href="/inquiries" className="text-emerald-600 hover:underline">
                View all inquiries
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
