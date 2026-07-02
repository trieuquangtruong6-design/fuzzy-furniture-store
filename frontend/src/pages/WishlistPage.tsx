import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import CartBadge from '../components/cart/CartBadge'
import { getApiErrorMessage } from '../services/apiClient'
import { wishlistService } from '../services/wishlistService'

export default function WishlistPage() {
  const queryClient = useQueryClient()
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: wishlistService.get })
  const remove = useMutation({
    mutationFn: wishlistService.remove,
    onSuccess: (data) => queryClient.setQueryData(['wishlist'], data),
  })

  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = ''
    return () => {
      document.body.className = previousClass
    }
  }, [])

  return (
    <div>
      <header className="section-t-space">
        <div className="custom-container">
          <div className="header-panel">
            <a href="/profile"><i className="iconsax back-btn" data-icon="arrow-left" /></a>
            <h3>Wishlist</h3>
          </div>
        </div>
      </header>

      <section>
        <div className="custom-container">
          {wishlist.isLoading && <div className="cart-feedback">Loading wishlist...</div>}
          {wishlist.isError && <div className="cart-feedback">{getApiErrorMessage(wishlist.error)}</div>}
          {!wishlist.isLoading && !wishlist.data?.items.length && (
            <div className="empty-tab">
              <img className="img-fluid empty-img img1 w-100" src="/fuzzy/assets/images/gif/wishlist.gif" alt="" />
              <h2>Your Wishlist is Empty!!</h2>
              <p>Save products you love and find them here later.</p>
              <a className="btn theme-btn w-100" href="/shop">Explore products</a>
            </div>
          )}
          <div className="row g-3">
            {wishlist.data?.items.map(({ product }) => (
              <div className="col-12" key={product.id}>
                <div className="horizontal-product-box">
                  <a href={`/product/${product.slug}`} className="horizontal-product-img">
                    <img
                      className="img-fluid img"
                      src={product.image?.imageUrl || '/fuzzy/assets/images/product/1.png'}
                      alt={product.image?.alt || product.name}
                    />
                  </a>
                  <div className="horizontal-product-details">
                    <div className="d-flex align-items-center justify-content-between">
                      <h4>{product.name}</h4>
                      <button
                        type="button"
                        className="close-button"
                        aria-label={`Remove ${product.name} from wishlist`}
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(product.id)}
                      >
                        <i className="iconsax" data-icon="add" />
                      </button>
                    </div>
                    <h5>{product.category.name} · {product.totalStock} in stock</h5>
                    <div className="d-flex align-items-center justify-content-between mt-3">
                      <h3 className="fw-semibold">
                        ${product.salePrice ?? product.price}
                        {product.salePrice && <del className="light-text fw-normal"> ${product.price}</del>}
                      </h3>
                      <a href={`/product/${product.slug}`} className="cart-bag" aria-label={`View ${product.name}`}>
                        <i className="iconsax bag" data-icon="basket-2" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel-space" />
      <div className="navbar-menu">
        <ul>
          <li><a href="/home"><div className="icon"><img className="unactive" src="/fuzzy/assets/images/svg/home.svg" alt="home" /><img className="active" src="/fuzzy/assets/images/svg/home-fill.svg" alt="home" /></div></a></li>
          <li><a href="/categories"><div className="icon"><img className="unactive" src="/fuzzy/assets/images/svg/categories.svg" alt="categories" /><img className="active" src="/fuzzy/assets/images/svg/categories-fill.svg" alt="categories" /></div></a></li>
          <li><a href="/cart"><div className="icon"><img className="unactive" src="/fuzzy/assets/images/svg/bag.svg" alt="bag" /><img className="active" src="/fuzzy/assets/images/svg/bag-fill.svg" alt="bag" /><CartBadge /></div></a></li>
          <li className="active"><a href="/wishlist"><div className="icon"><img className="unactive" src="/fuzzy/assets/images/svg/heart.svg" alt="heart" /><img className="active" src="/fuzzy/assets/images/svg/heart-fill.svg" alt="heart" /></div></a></li>
          <li><a href="/profile"><div className="icon"><img className="unactive" src="/fuzzy/assets/images/svg/profile.svg" alt="profile" /><img className="active" src="/fuzzy/assets/images/svg/profile-fill.svg" alt="profile" /></div></a></li>
        </ul>
      </div>
    </div>
  )
}
