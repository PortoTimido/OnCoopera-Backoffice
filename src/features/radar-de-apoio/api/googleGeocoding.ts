import type { Coordinates } from '../model/supportTypes'

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()

export class GoogleGeocodingError extends Error {
  readonly code: string

  constructor(code: string) {
    super(code)
    this.code = code
  }
}

export type GeocodingAddress = {
  cep: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
}

export function getGoogleMapsApiKey() {
  return googleMapsApiKey
}

export function buildGeocodingAddress(address: GeocodingAddress) {
  return [
    address.street,
    address.number,
    address.neighborhood,
    address.city,
    address.state,
    address.cep,
    'Brasil',
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ')
}

export async function geocodeSupportAddress(
  address: GeocodingAddress,
  signal?: AbortSignal,
): Promise<Coordinates> {
  if (!googleMapsApiKey) throw new GoogleGeocodingError('MISSING_API_KEY')

  const query = new URLSearchParams({
    address: buildGeocodingAddress(address),
    key: googleMapsApiKey,
    language: 'pt-BR',
    region: 'BR',
  })
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${query}`, {
    signal,
  })
  if (!response.ok) throw new GoogleGeocodingError('NETWORK_ERROR')

  const payload = (await response.json()) as {
    status?: string
    results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }>
  }
  if (payload.status !== 'OK') throw new GoogleGeocodingError(payload.status ?? 'UNKNOWN_ERROR')

  const location = payload.results?.[0]?.geometry?.location
  if (typeof location?.lat !== 'number' || typeof location.lng !== 'number')
    throw new GoogleGeocodingError('ZERO_RESULTS')
  return { latitude: location.lat, longitude: location.lng }
}
