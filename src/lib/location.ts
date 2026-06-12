export type CapturedLocation = {
  latitude: number
  longitude: number
  mapsUrl: string
  addressLine: string
  city: string
  country: string
}

function mapsUrlFromCoords(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`
}

async function reverseGeocode(lat: number, lng: number): Promise<Partial<CapturedLocation>> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return {}
    const data = (await res.json()) as {
      display_name?: string
      address?: {
        city?: string
        town?: string
        village?: string
        state?: string
        country?: string
        road?: string
        house_number?: string
      }
    }
    const a = data.address ?? {}
    const city = a.city || a.town || a.village || a.state || ''
    const country = a.country || ''
    const street = [a.house_number, a.road].filter(Boolean).join(' ')
    return {
      addressLine: street || data.display_name?.split(',')[0] || '',
      city,
      country,
    }
  } catch {
    return {}
  }
}

/** Browser GPS → home address + Google Maps link */
export async function captureLiveLocation(): Promise<CapturedLocation> {
  if (!navigator.geolocation) {
    throw new Error('Your phone or browser does not support location. Try another device.')
  }

  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    })
  })

  const { latitude, longitude } = pos.coords
  const geo = await reverseGeocode(latitude, longitude)

  return {
    latitude,
    longitude,
    mapsUrl: mapsUrlFromCoords(latitude, longitude),
    addressLine: geo.addressLine ?? '',
    city: geo.city ?? '',
    country: geo.country ?? '',
  }
}

export function isValidDeliveryLocation(mapsUrl: string): boolean {
  const u = mapsUrl.trim()
  if (u.length < 8) return false
  return (
    u.includes('google') ||
    u.includes('goo.gl') ||
    u.includes('maps') ||
    /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(u)
  )
}
