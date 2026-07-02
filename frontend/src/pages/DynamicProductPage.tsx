import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../services/apiClient'
import { cartService } from '../services/cartService'
import { productService } from '../services/productService'
import { useAuthStore } from '../store/authStore'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import WishlistButton from '../components/wishlist/WishlistButton'

export default function DynamicProductPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const isOnline = useOnlineStatus()
  const product = useQuery({ queryKey: ['product', slug], queryFn: () => productService.detail(slug), enabled: Boolean(slug) })
  const related = useQuery({ queryKey: ['related', slug], queryFn: () => productService.related(slug), enabled: Boolean(slug) })
  const [variantId, setVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const add = useMutation({
    mutationFn: ({ productId, selectedVariantId, selectedQuantity }: { productId: string; selectedVariantId: string; selectedQuantity: number }) =>
      cartService.add(productId, selectedVariantId, selectedQuantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart)
      setMessage('Added to your cart.')
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  })

  useEffect(() => {
    const old = document.body.className
    document.body.className = 'details-page'
    return () => { document.body.className = old }
  }, [])
  useEffect(() => {
    if (product.data?.variants[0]) {
      setVariantId(product.data.variants[0].id)
      setQuantity(1)
    }
  }, [product.data])

  if (product.isLoading) return <div className="cart-feedback">Loading product...</div>
  if (!product.data) return <div className="cart-feedback">{getApiErrorMessage(product.error)}</div>
  const item = product.data
  const variant = item.variants.find((entry) => entry.id === variantId) ?? item.variants[0]

  function handleAdd() {
    if (!isOnline) {
      setMessage('You are offline. Reconnect to add items to your cart.')
      return
    }
    if (!user) {
      navigate('/login', { state: { from: `/product/${slug}` } })
      return
    }
    if (variant) add.mutate({ productId: item.id, selectedVariantId: variant.id, selectedQuantity: quantity })
  }

  return <div>
    <div className="top-image"><img className="product-header img-fluid" src="/fuzzy/assets/images/background/header-bg.png" alt="" /></div>
    <header className="product-page-header"><div className="header-panel"><a href="/shop" className="product-back"><i className="iconsax back-btn" data-icon="arrow-left" /></a><h3 className="title">{item.category.name}</h3></div></header>
    <section><div className="product-image-slider"><div className="swiper product-1 ms-4"><div className="swiper-wrapper">{item.images.map((image) => <div className="swiper-slide" key={image.imageUrl}><img className="img-fluid product-img" src={image.imageUrl} alt={image.alt} /></div>)}</div></div></div></section>
    <section className="pt-0"><div className="custom-container"><div className="product-details">
      <div className="product-name"><h2 className="theme-color">{item.name}</h2>{item.salePrice && <h6>SALE</h6>}<WishlistButton productId={item.id} className="like-btn" /></div>
      <div className="product-price"><h3>${variant?.price ?? item.salePrice ?? item.price} {item.salePrice && <del>${item.price}</del>}</h3></div>
      <p>{item.description}</p>
      <div className="form-group"><label className="form-label">Color / Size</label><select className="form-control" value={variantId} onChange={(event) => { setVariantId(event.target.value); setQuantity(1); setMessage('') }}>{item.variants.map((entry) => <option key={entry.id} value={entry.id}>{entry.color?.name ?? '-'} / {entry.size?.name ?? '-'} · {entry.stock} in stock</option>)}</select></div>
      <div className="form-group mt-3"><label className="form-label">Quantity</label><input className="form-control" type="number" min="1" max={variant?.stock ?? 1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(variant?.stock ?? 1, Number(event.target.value) || 1)))} /></div>
      {message && <p className="mt-3" role="status">{message}</p>}
    </div></div></section>
    <section className="similer-product section-b-space"><div className="custom-container"><div className="title"><h2>Similar Products</h2></div><div className="row g-3">{related.data?.map((entry) => <div className="col-6" key={entry.id}><div className="product-box"><div className="product-box-img"><a href={`/product/${entry.slug}`}><img className="img" src={entry.images[0]?.imageUrl} alt={entry.name} /></a></div><div className="product-box-detail"><h4>{entry.name}</h4><h3>${entry.salePrice ?? entry.price}</h3></div></div></div>)}</div></div></section>
    <div className="footer-modal"><button type="button" className="btn theme-btn w-100" disabled={!variant || variant.stock < 1 || !isOnline || add.isPending} onClick={handleAdd}>{!isOnline ? 'Offline' : !variant?.stock ? 'Out of Stock' : add.isPending ? 'Adding...' : 'Add to Cart'}</button></div>
  </div>
}
