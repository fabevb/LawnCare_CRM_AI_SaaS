import { describe, expect, it } from 'vitest'
import { buildStopOrderIds, getCompletionPlan, optimizeRouteNearestNeighborWithIndices } from './routes'

describe('optimizeRouteNearestNeighborWithIndices', () => {
  it('returns order indices that map to the original input order', () => {
    const points = [
      { id: 'far', latitude: 0, longitude: 10 },
      { id: 'near', latitude: 0, longitude: 1 },
      { id: 'mid', latitude: 0, longitude: 5 },
    ]

    const { ordered, orderIndices } = optimizeRouteNearestNeighborWithIndices(points, {
      lat: 0,
      lng: 0,
    })

    expect(orderIndices).toEqual([1, 2, 0])
    expect(ordered.map((point) => point.id)).toEqual(['near', 'mid', 'far'])
  })

  it('keeps fallback reorder indices aligned with add-stop ordering', () => {
    const input = [
      { id: 'existing-1', latitude: 0, longitude: 6 },
      { id: 'existing-2', latitude: 0, longitude: 2 },
      { id: 'new-stop', latitude: 0, longitude: 4 },
    ]

    const { ordered, orderIndices } = optimizeRouteNearestNeighborWithIndices(input, {
      lat: 0,
      lng: 0,
    })

    const reordered = orderIndices.map((idx) => input[idx])
    expect(reordered.map((point) => point.id)).toEqual(ordered.map((point) => point.id))
  })
})

describe('buildStopOrderIds', () => {
  it('fills the new stop id into the ordered list', () => {
    const orderedEntries = [{ stopId: 'stop-1' }, { stopId: null }, { stopId: 'stop-2' }]
    const result = buildStopOrderIds(orderedEntries, 'new-stop')

    expect(result).toEqual(['stop-1', 'new-stop', 'stop-2'])
  })
})

describe('getCompletionPlan', () => {
  it('short-circuits when the route is already completed', () => {
    const plan = getCompletionPlan('completed', '2026-01-01T00:00:00Z')

    expect(plan.alreadyCompleted).toBe(true)
  })

  it('returns timing metadata for incomplete routes', () => {
    const plan = getCompletionPlan('in_progress', '2026-01-01T00:00:00Z')

    expect(plan.alreadyCompleted).toBe(false)
    if (!plan.alreadyCompleted) {
      expect(plan.startIso).toBe('2026-01-01T00:00:00Z')
      expect(plan.durationMinutes).toBeGreaterThanOrEqual(0)
    }
  })
})
