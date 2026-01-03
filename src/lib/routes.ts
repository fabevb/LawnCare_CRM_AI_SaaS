import { SHOP_LOCATION } from './config'
import { haversineMiles } from './geo'

interface RoutePoint {
  latitude: number | null
  longitude: number | null
}

interface RouteOrigin {
  lat: number
  lng: number
}

type IndexedPoint<T extends RoutePoint> = {
  point: T
  index: number
}

export function optimizeRouteNearestNeighborWithIndices<T extends RoutePoint>(
  points: T[],
  origin: RouteOrigin = SHOP_LOCATION
) {
  if (points.length <= 1) {
    return { ordered: points, orderIndices: points.map((_, idx) => idx) }
  }

  const unvisited: Array<IndexedPoint<T>> = points.map((point, index) => ({
    point,
    index,
  }))
  const ordered: Array<IndexedPoint<T>> = []
  let current = { lat: origin.lat, lng: origin.lng }

  while (unvisited.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity

    unvisited.forEach((item, index) => {
      const { point } = item
      if (point.latitude == null || point.longitude == null) return
      const distance = haversineMiles(
        current.lat,
        current.lng,
        point.latitude,
        point.longitude
      )
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    const nearest = unvisited.splice(nearestIndex, 1)[0]
    ordered.push(nearest)
    if (nearest.point.latitude != null && nearest.point.longitude != null) {
      current = { lat: nearest.point.latitude, lng: nearest.point.longitude }
    }
  }

  return {
    ordered: ordered.map((item) => item.point),
    orderIndices: ordered.map((item) => item.index),
  }
}

export function optimizeRouteNearestNeighbor<T extends RoutePoint>(
  points: T[],
  origin: RouteOrigin = SHOP_LOCATION
): T[] {
  return optimizeRouteNearestNeighborWithIndices(points, origin).ordered
}
