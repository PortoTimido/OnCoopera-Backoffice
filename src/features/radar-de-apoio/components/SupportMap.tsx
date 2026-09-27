import { useEffect, useRef, useState } from 'react'
import { getGoogleMapsApiKey } from '../api/googleGeocoding'
import type { Coordinates } from '../model/supportTypes'

let mapsSdkPromise: Promise<void> | null = null

function loadMapsSdk() {
  const apiKey = getGoogleMapsApiKey()
  if (!apiKey) return Promise.reject(new Error('MISSING_API_KEY'))
  if (window.google?.maps) return Promise.resolve()
  if (mapsSdkPromise) return mapsSdkPromise

  mapsSdkPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById('google-maps-sdk') as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('MAPS_SDK_ERROR')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-sdk'
    script.async = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&language=pt-BR&region=BR`
    script.onload = () => window.google?.maps ? resolve() : reject(new Error('MAPS_SDK_ERROR'))
    script.onerror = () => reject(new Error('MAPS_SDK_ERROR'))
    document.head.append(script)
  }).catch((error: unknown) => {
    mapsSdkPromise = null
    throw error
  })

  return mapsSdkPromise
}

type SupportMapProps = {
  coordinates: Coordinates
  isGeocoding: boolean
  geocodingMessage: string
  onSelect: (coordinates: Coordinates) => void
}

export function SupportMap({ coordinates, geocodingMessage, isGeocoding, onSelect }: SupportMapProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const onSelectRef = useRef(onSelect)
  const coordinatesRef = useRef(coordinates)
  const [loadError, setLoadError] = useState('')

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { coordinatesRef.current = coordinates }, [coordinates])

  useEffect(() => {
    let active = true
    void loadMapsSdk().then(() => {
      if (!active || !elementRef.current) return
      const position = { lat: coordinatesRef.current.latitude, lng: coordinatesRef.current.longitude }
      const map = new google.maps.Map(elementRef.current, { center: position, disableDefaultUI: true, zoom: 16 })
      const marker = new google.maps.Marker({ draggable: true, map, position, title: 'Localização do estabelecimento' })
      marker.addListener('dragend', () => {
        const position = marker.getPosition()
        if (position) onSelectRef.current({ latitude: position.lat(), longitude: position.lng() })
      })
      mapRef.current = map
      markerRef.current = marker
    }).catch((error: unknown) => {
      if (!active) return
      setLoadError(error instanceof Error && error.message === 'MISSING_API_KEY' ? 'Configure a chave do Google Maps para exibir o mapa.' : 'Não foi possível carregar o mapa. Tente novamente mais tarde.')
    })
    return () => {
      active = false
      markerRef.current?.setMap(null)
      markerRef.current = null
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const position = { lat: coordinates.latitude, lng: coordinates.longitude }
    markerRef.current?.setPosition(position)
    mapRef.current?.panTo(position)
  }, [coordinates.latitude, coordinates.longitude])

  const status = loadError || (isGeocoding ? 'Localizando endereço no mapa...' : geocodingMessage)
  return <div className="grid gap-3 rounded-2xl border border-[#bbcac4]/35 bg-surface-mint p-4">
    <div className="relative h-56 overflow-hidden rounded-xl bg-[#dbe8e4]" aria-label="Mapa da localização do estabelecimento" ref={elementRef} role="application" />
    {status ? <p aria-live="polite" className="text-xs text-muted" role="status">{status}</p> : null}
  </div>
}
