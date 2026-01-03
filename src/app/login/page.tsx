import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/LoginForm'

const DEFAULT_REDIRECT = '/'

type LoginPageProps = {
  searchParams?: {
    redirectedFrom?: string
    reason?: string
  }
}

function getSafeRedirect(target?: string) {
  if (!target || !target.startsWith('/') || target.startsWith('//')) {
    return DEFAULT_REDIRECT
  }
  return target
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  const redirectTo = getSafeRedirect(searchParams?.redirectedFrom)

  if (data.user) {
    redirect(redirectTo)
  }

  const message =
    searchParams?.reason === 'auth-required'
      ? 'Please sign in to continue. Your session may have expired.'
      : undefined

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <LoginForm redirectTo={redirectTo} message={message} />
    </div>
  )
}

