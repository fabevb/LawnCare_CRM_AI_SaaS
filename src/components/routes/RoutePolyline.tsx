'use client'

import { useMap } from '@vis.gl/react-google-maps'
import { useEffect, useState } from 'react'

interface RoutePolylineProps {
  directions: google.maps.DirectionsResult
}

export function RoutePolyline({ directions }: RoutePolylineProps) {
  const map = useMap()
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)

  useEffect(() => {
    if (!map || !directions) return

    // Create renderer if it doesn't exist
    if (!directionsRenderer) {
      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // We're showing custom markers
        polylineOptions: {
          strokeColor: '#3b82f6', // Blue color matching our theme
          strokeWeight: 4,
          strokeOpacity: 0.7
        }
      })
      setDirectionsRenderer(renderer)
      renderer.setDirections(directions)
    } else {
      // Update existing renderer
      directionsRenderer.setDirections(directions)
    }

    // Cleanup
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null)
      }
    }
  }, [map, directions, directionsRenderer])

  return null
}
