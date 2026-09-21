import { useEffect, useState } from 'react'
import type { AuthenticatedUser } from '../model/authTypes'
import { cacheUserImage, getCachedUserImageUrl } from '../model/userImageCache'

export function getUserInitials(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return ''
  }

  if (words.length === 1) {
    return words[0]!.charAt(0).toUpperCase()
  }

  const firstInitial = words[0]!.charAt(0)
  const lastInitial = words[words.length - 1]!.charAt(0)

  return `${firstInitial}${lastInitial}`.toUpperCase()
}

export function useUserAvatar(user: AuthenticatedUser | null) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    let isCancelled = false

    async function resolveAvatar() {
      setAvatarUrl(null)

      if (!user?.id || !user.imagemUrl) {
        return
      }

      const cachedUrl = await getCachedUserImageUrl(user.id)

      if (cachedUrl) {
        if (isCancelled) {
          URL.revokeObjectURL(cachedUrl)
          return
        }

        objectUrl = cachedUrl
        setAvatarUrl(cachedUrl)
        return
      }

      try {
        const response = await fetch(user.imagemUrl)

        if (!response.ok) {
          return
        }

        const blob = await response.blob()

        if (isCancelled) {
          return
        }

        await cacheUserImage(user.id, blob)
        const freshUrl = URL.createObjectURL(blob)
        objectUrl = freshUrl
        setAvatarUrl(freshUrl)
      } catch {
        // Sem conexão com o armazenamento de imagens: mantém o fallback de iniciais.
      }
    }

    resolveAvatar()

    return () => {
      isCancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [user?.id, user?.imagemUrl])

  return {
    avatarUrl,
    initials: getUserInitials(user?.nome),
  }
}
