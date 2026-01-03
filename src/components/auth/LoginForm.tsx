'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DEFAULT_REDIRECT = '/'

type Status = {
  type: 'error' | 'success' | 'info'
  message: string
}

type LoginFormProps = {
  redirectTo?: string
  message?: string
}

function getSafeRedirect(target?: string) {
  if (!target || !target.startsWith('/') || target.startsWith('//')) {
    return DEFAULT_REDIRECT
  }
  return target
}

export default function LoginForm({ redirectTo, message }: LoginFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const safeRedirect = getSafeRedirect(redirectTo)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingLink, setIsSendingLink] = useState(false)

  const handlePasswordSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setStatus({
        type: 'error',
        message: 'Email and password are required.',
      })
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })
    setIsSubmitting(false)

    if (error) {
      setStatus({ type: 'error', message: error.message })
      return
    }

    setStatus({ type: 'success', message: 'Signed in. Redirecting...' })
    router.push(safeRedirect)
    router.refresh()
  }

  const handleMagicLink = async () => {
    setStatus(null)
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setStatus({ type: 'error', message: 'Email is required for a magic link.' })
      return
    }

    setIsSendingLink(true)
    const origin = window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${origin}${safeRedirect}`,
      },
    })
    setIsSendingLink(false)

    if (error) {
      setStatus({ type: 'error', message: error.message })
      return
    }

    setStatus({ type: 'info', message: 'Check your email for a magic sign-in link.' })
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600">
          Sign in to access your lawn care dashboard.
        </p>
      </div>

      {message ? (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {message}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handlePasswordSignIn}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs uppercase tracking-wide text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleMagicLink}
        disabled={isSendingLink}
      >
        {isSendingLink ? 'Sending link...' : 'Send magic link'}
      </Button>

      {status ? (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            status.type === 'error'
              ? 'border border-rose-200 bg-rose-50 text-rose-800'
              : status.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-slate-200 bg-slate-50 text-slate-700'
          }`}
        >
          {status.message}
        </div>
      ) : null}
    </div>
  )
}


