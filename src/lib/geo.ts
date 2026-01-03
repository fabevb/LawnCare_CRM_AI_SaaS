const EARTH_RADIUS_MILES = 3959

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_MILES * c
}

export function haversineMilesKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): { miles: number; km: number } {
  const miles = haversineMiles(lat1, lng1, lat2, lng2)
  const km = miles * 1.60934
  return { miles, km }
}

