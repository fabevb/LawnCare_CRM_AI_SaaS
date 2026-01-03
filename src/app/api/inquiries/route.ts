import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyRecaptchaToken } from '@/lib/recaptcha'

// Simple, best-effort in-memory rate limiting per IP for this runtime
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 10

const requestLog = new Map<string, number[]>()

function isRateLimited(ip: string | null) {
  if (!ip) return false

  const now = Date.now()
  const timestamps = requestLog.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(ip, recent)
    return true
  }

  recent.push(now)
  requestLog.set(ip, recent)
  return false
}

export async function POST(request: NextRequest) {
  const ip =
    request.ip ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip')

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const {
    name,
    email,
    phone,
    address,
    propertyType,
    lotSize,
    servicesInterested,
    preferredContactMethod,
    preferredContactTime,
    notes,
    recaptchaToken,
  } = body as {
    name?: string
    email?: string
    phone?: string
    address?: string
    propertyType?: string
    lotSize?: string
    servicesInterested?: string[]
    preferredContactMethod?: string
    preferredContactTime?: string
    notes?: string
    recaptchaToken?: string
  }

  if (!name || !email || !address) {
    return NextResponse.json(
      { error: 'Name, email, and address are required.' },
      { status: 400 }
    )
  }

  const recaptchaResult = await verifyRecaptchaToken(recaptchaToken)
  if (!recaptchaResult.ok && process.env.RECAPTCHA_SECRET_KEY) {
    return NextResponse.json(
      { error: 'reCAPTCHA verification failed.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { error } = await supabase.from('inquiries').insert({
    name,
    email,
    phone: phone || null,
    address,
    property_type: propertyType || null,
    lot_size: lotSize || null,
    services_interested: servicesInterested && servicesInterested.length > 0 ? servicesInterested : null,
    preferred_contact_method: preferredContactMethod || null,
    preferred_contact_time: preferredContactTime || null,
    status: 'pending',
    notes: notes || null,
    source: 'Website',
  })

  if (error) {
    console.error('Error inserting inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}

