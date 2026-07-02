import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'

import { wishlistService } from '../../services/wishlistService'
import { useAuthStore } from '../../store/authStore'

interface WishlistButtonProps {
  productId: string
  className?: string
}

export default function WishlistButton({ productId, className = 'like-btn animate active inactive' }: WishlistButtonProps) {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const wishlist = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.get,
    enabled: Boolean(user),
  })
  const isSaved = wishlist.data?.items.some((item) => item.product.id === productId) ?? false
  const toggle = useMutation({
    mutationFn: () => isSaved ? wishlistService.remove(productId) : wishlistService.add(productId),
    onSuccess: (data) => queryClient.setQueryData(['wishlist'], data),
  })

  function handleClick() {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    toggle.mutate()
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isSaved}
      disabled={toggle.isPending}
      onClick={handleClick}
      style={{ background: 'transparent', border: 0, padding: 0 }}
    >
      <img
        className="outline-icon"
        src={isSaved ? '/fuzzy/assets/images/svg/like-fill.svg' : '/fuzzy/assets/images/svg/like.svg'}
        alt=""
      />
    </button>
  )
}
