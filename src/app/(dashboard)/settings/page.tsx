import { SettingsForm } from '@/components/settings/SettingsForm'
import { getSettings } from '@/lib/settings'
import { getUserRole } from '@/lib/roles'

export const metadata = {
  title: 'Settings | Lawn Care CRM',
  description: 'Application settings',
}

export default async function SettingsPage() {
  const { role } = await getUserRole()

  if (role !== 'admin') {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b bg-white px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Configure your business profile and preferences</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 p-8">
          <div className="mx-auto max-w-2xl rounded-lg border bg-white p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-900">Admin access required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Only admins can manage settings.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const settings = await getSettings()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-white px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your business profile and preferences</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">
          <SettingsForm initialSettings={settings} />
        </div>
      </div>
    </div>
  )
}
