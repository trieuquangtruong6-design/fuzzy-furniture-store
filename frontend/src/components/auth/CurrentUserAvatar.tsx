import { useAuthStore } from '../../store/authStore'

const DEFAULT_AVATAR_URL = '/fuzzy/assets/images/icons/profile1.png'

interface CurrentUserAvatarProps {
  className?: string
  alt?: string
}

export default function CurrentUserAvatar({
  className,
  alt = 'profile',
}: CurrentUserAvatarProps) {
  const avatarUrl = useAuthStore((state) => state.user?.avatarUrl)

  return <img className={className} src={avatarUrl || DEFAULT_AVATAR_URL} alt={alt} />
}
