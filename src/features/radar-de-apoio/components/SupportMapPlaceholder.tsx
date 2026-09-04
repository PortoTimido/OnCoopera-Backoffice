import { Crosshair, MapPin, Minus, Plus } from 'lucide-react'
import type { Coordinates } from '../model/supportTypes'

export function SupportMapPlaceholder({ coordinates, onSelect }: { coordinates: Coordinates; onSelect: (coordinates: Coordinates) => void }) {
  function chooseLocation() {
    onSelect({ latitude: Number((coordinates.latitude + 0.001).toFixed(6)), longitude: Number((coordinates.longitude - 0.001).toFixed(6)) })
  }

  return <div className="grid gap-4 rounded-2xl border border-[#bbcac4]/35 bg-surface-mint p-4">
    <div className="relative grid h-56 place-items-center overflow-hidden rounded-xl bg-[#dbe8e4]" aria-label="Prévia da localização no mapa">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(30deg,transparent_49%,#b4c8c1_50%,transparent_51%),linear-gradient(120deg,transparent_49%,#b4c8c1_50%,transparent_51%)] [background-size:90px_70px]" />
      <MapPin className="relative text-brand-teal drop-shadow-md" fill="currentColor" size={40} strokeWidth={1.5} aria-hidden="true" />
      <div className="absolute bottom-2 right-2 flex overflow-hidden rounded-lg bg-white shadow-sm"><button aria-label="Aproximar mapa" className="grid h-7 w-7 place-items-center hover:bg-surface-soft" type="button"><Plus size={15} /></button><button aria-label="Afastar mapa" className="grid h-7 w-7 place-items-center border-l border-line hover:bg-surface-soft" type="button"><Minus size={15} /></button></div>
    </div>
    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#e6ece9] px-4 text-sm font-bold text-admin-text transition hover:bg-brand-mint/20 focus-visible:outline-2 focus-visible:outline-brand-mint" onClick={chooseLocation} type="button"><Crosshair size={16} aria-hidden="true" />Selecionar localização exata no mapa</button>
    <p className="sr-only" aria-live="polite">Localização selecionada: latitude {coordinates.latitude}, longitude {coordinates.longitude}.</p>
  </div>
}
