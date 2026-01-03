import { describe, expect, it } from 'vitest'
import { optimizeRouteNearestNeighborWithIndices } from './routes'

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
