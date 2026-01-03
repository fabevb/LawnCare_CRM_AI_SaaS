import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

describe('schema cascades', () => {
  it('route_stops cascades deletes from routes and customers', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20251007200405_create_route_stops.sql'),
      'utf-8'
    )

    expect(migration).toContain('route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE')
    expect(migration).toContain('customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE')
  })
})
