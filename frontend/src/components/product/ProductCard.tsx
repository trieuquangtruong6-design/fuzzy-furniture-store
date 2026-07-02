import { Link } from 'react-router-dom'
import type { Product } from '../../types/catalog'
import Icon from '../common/Icon'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-box">
      <div className="product-box-img">
        <Link to={`/product/${product.id}`}><img className="img" src={product.image} alt={product.name} /></Link>
        <div className="cart-box"><Link to="/cart" className="cart-bag" aria-label="Add to cart"><Icon name="bag" className="bag" /></Link></div>
      </div>
      <div className="like-btn animate active inactive">
        <img className="outline-icon" src="/fuzzy/assets/images/svg/like.svg" alt="Add to wishlist" />
      </div>
      <div className="product-box-detail">
        <h4>{product.name}</h4><h5>{product.subtitle}</h5>
        <div className="bottom-panel">
          <div className="price"><h3>${product.price}</h3>{product.oldPrice && <del>${product.oldPrice}</del>}</div>
          {product.rating && <div className="rating"><img src="/fuzzy/assets/images/svg/Star.svg" alt="Star" /><h6>{product.rating}</h6></div>}
        </div>
      </div>
    </div>
  )
}
