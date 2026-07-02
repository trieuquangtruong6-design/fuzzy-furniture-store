import { useQuery } from '@tanstack/react-query'
import { cartService } from '../../services/cartService'
import { useAuthStore } from '../../store/authStore'

export default function CartBadge() {
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const query = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.get,
    enabled: initialized && Boolean(user),
    staleTime: 30_000,
  })
  if (!user || !query.data?.itemCount) return null
  return <span className="cart-count-badge" aria-label={`${query.data.itemCount} items in cart`}>{query.data.itemCount}</span>
}

