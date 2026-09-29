import type { Coordinates } from '../model/supportTypes'

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
const googlePlacesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY?.trim()

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
  if (!googlePlacesApiKey) throw new GoogleGeocodingError('MISSING_API_KEY')

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googlePlacesApiKey,
      'X-Goog-FieldMask': 'places.location',
    },
    body: JSON.stringify({
      textQuery: buildGeocodingAddress(address),
      languageCode: 'pt-BR',
      regionCode: 'BR',
    }),
  })
  if (!response.ok) throw new GoogleGeocodingError('NETWORK_ERROR')

  const payload = (await response.json()) as {
    places?: Array<{ location?: { latitude?: number; longitude?: number } }>
  }

  const location = payload.places?.[0]?.location
  if (typeof location?.latitude !== 'number' || typeof location.longitude !== 'number')
    throw new GoogleGeocodingError('ZERO_RESULTS')
  return { latitude: location.latitude, longitude: location.longitude }
}
