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

export function optimizeRouteNearestNeighbor<T extends RoutePoint>(
  points: T[],
  origin: RouteOrigin = SHOP_LOCATION
): T[] {
  if (points.length <= 1) return points

  const unvisited = [...points]
  const ordered: T[] = []
  let current = { lat: origin.lat, lng: origin.lng }

  while (unvisited.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity

    unvisited.forEach((point, index) => {
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
    if (nearest.latitude != null && nearest.longitude != null) {
      current = { lat: nearest.latitude, lng: nearest.longitude }
    }
  }

  return ordered
}
