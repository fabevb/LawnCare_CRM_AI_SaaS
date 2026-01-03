const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

export async function verifyRecaptchaToken(token: string | undefined) {
  const secret = process.env.RECAPTCHA_SECRET_KEY

  if (!secret || !token) {
    // reCAPTCHA is optional; if not fully configured, skip verification
    return { ok: true, score: null }
  }

  try {
    const params = new URLSearchParams()
    params.append('secret', secret)
    params.append('response', token)

    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!res.ok) {
      return { ok: false, score: null }
    }

    const data = (await res.json()) as {
      success?: boolean
      score?: number
    }

    return {
      ok: !!data.success,
      score: typeof data.score === 'number' ? data.score : null,
    }
  } catch {
    // Network or other failure – treat as soft failure to avoid blocking form
    return { ok: false, score: null }
  }
}

