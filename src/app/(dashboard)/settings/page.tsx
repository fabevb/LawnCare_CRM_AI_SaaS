import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export const metadata = {
  title: 'Settings | Lawn Care CRM',
  description: 'Application settings',
}

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-white px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your application preferences</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Settings Coming Soon
            </CardTitle>
            <CardDescription>
              User preferences, business details, and integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center text-muted-foreground">
              <SettingsIcon className="mx-auto h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Settings In Development</p>
              <p className="text-sm">Business profile, shop location, notification preferences, and more</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
