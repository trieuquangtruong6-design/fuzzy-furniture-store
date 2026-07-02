import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { cartProducts } from '../../data/products'
import Icon from '../common/Icon'

type CartProduct = (typeof cartProducts)[number]

export default function CartItem({ product }: { product: CartProduct }) {
  const [quantity, setQuantity] = useState(1)
  return (
    <li className="cart-product-box">
      <div className="horizontal-product-box">
        <div className="horizontal-product-img"><Link to={`/product/${product.id}`}><img className="img-fluid img" src={product.image} alt={product.name} /></Link></div>
        <div className="horizontal-product-details">
          <div className="d-flex align-items-center justify-content-between"><Link to={`/product/${product.id}`}><h4>{product.name}</h4></Link><Icon name="trash" className="trash" /></div>
          <ul className="product-info"><li>Qty : {quantity}</li><li><span className={`product-color ${product.colorClass}`} />{product.color}</li></ul>
          <div className="d-flex align-items-center justify-content-between mt-3"><h3 className="fw-semibold">${product.price} {product.oldPrice && <del className="light-text fw-normal">${product.oldPrice}</del>}</h3><div className="plus-minus"><button className="sub plus-minus-button" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Icon name="minus" /></button><input readOnly type="number" value={quantity} /><button className="add plus-minus-button" onClick={() => setQuantity(quantity + 1)}><Icon name="plus" /></button></div></div>
        </div>
      </div>
    </li>
  )
}
