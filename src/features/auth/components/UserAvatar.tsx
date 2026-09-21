import { cx } from '../../../lib/cx'
import type { AuthenticatedUser } from '../model/authTypes'
import { useUserAvatar } from '../hooks/useUserAvatar'

type UserAvatarProps = {
  className?: string
  user: AuthenticatedUser | null
}

export function UserAvatar({ className, user }: UserAvatarProps) {
  const { avatarUrl, initials } = useUserAvatar(user)

  if (avatarUrl) {
    return <img className={cx('rounded-full object-cover', className)} src={avatarUrl} alt="" aria-hidden="true" />
  }

  return (
    <span
      className={cx('grid place-items-center rounded-full bg-brand-teal font-semibold text-white', className)}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  )
}
