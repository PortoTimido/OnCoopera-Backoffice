const cacheName = 'oncoopera.user-images'

function buildCacheKey(userId: string) {
  return `https://oncoopera.local/cached-user-images/${userId}`
}

function canUseCache() {
  return typeof window !== 'undefined' && 'caches' in window
}

export async function getCachedUserImageUrl(userId: string): Promise<string | null> {
  if (!canUseCache()) {
    return null
  }

  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(buildCacheKey(userId))

  if (!cachedResponse) {
    return null
  }

  const blob = await cachedResponse.blob()
  return URL.createObjectURL(blob)
}

export async function cacheUserImage(userId: string, blob: Blob): Promise<void> {
  if (!canUseCache()) {
    return
  }

  const cache = await caches.open(cacheName)
  await cache.put(buildCacheKey(userId), new Response(blob))
}

export async function clearCachedUserImage(userId: string): Promise<void> {
  if (!canUseCache()) {
    return
  }

  const cache = await caches.open(cacheName)
  await cache.delete(buildCacheKey(userId))
}
