import { useState, useCallback } from 'react'

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

/**
 * useGeolocation — GPS detection + OpenStreetMap Nominatim reverse geocoding.
 *
 * @typedef {{ lat: number, lon: number, displayName: string, address: object }} LocationResult
 *
 * @returns {{
 *   location: LocationResult | null,
 *   loading: boolean,
 *   error: string | null,
 *   detect: () => Promise<LocationResult|null>,
 *   setLocation: (loc: LocationResult) => void,
 * }}
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const detect = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return null
    }

    setLoading(true)
    setError(null)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude: lat, longitude: lon } = coords

          try {
            const res = await fetch(
              `${NOMINATIM}?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'CivicWatch-App/2.0 (civic-issue-reporter)',
                },
              }
            )
            const data = await res.json()
            const result = {
              lat,
              lon,
              displayName: data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
              address: data.address || {},
            }
            setLocation(result)
            setLoading(false)
            resolve(result)
          } catch {
            // Geocoding failed but we still have coordinates
            const result = {
              lat,
              lon,
              displayName: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
              address: {},
            }
            setLocation(result)
            setLoading(false)
            resolve(result)
          }
        },
        (err) => {
          const msg =
            err.code === 1
              ? 'Location permission denied. Please enter address manually.'
              : err.code === 2
              ? 'Location unavailable. Please enter address manually.'
              : 'Location detection timed out.'
          setError(msg)
          setLoading(false)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
      )
    })
  }, [])

  return { location, loading, error, detect, setLocation }
}
