import { useEffect, useState } from 'react'

const fullHdWidth = 1920
const maximumScale = 2

function getScale() {
  return Math.min(maximumScale, Math.max(1, window.innerWidth / fullHdWidth))
}

/** Mirrors the high-resolution CSS tokens for canvas-based dashboard widgets. */
export function useBackofficeScale() {
  const [scale, setScale] = useState(getScale)

  useEffect(() => {
    const updateScale = () => setScale(getScale())

    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  return scale
}
