import { SettingsForm } from '@/components/settings/SettingsForm'
import { getSettings } from '@/lib/settings'

export const metadata = {
  title: 'Settings | Lawn Care CRM',
  description: 'Application settings',
}

export default async function SettingsPage() {
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
