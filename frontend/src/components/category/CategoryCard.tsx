import { Link } from 'react-router-dom'
import type { Category } from '../../types/catalog'
import Icon from '../common/Icon'

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <li>
      <Link to="/categories" className="d-flex align-items-center">
        <div className="ps-3"><h2>{category.name}</h2><h4 className="mt-1">Total {category.count} item available</h4><div className="arrow"><Icon name="arrow-right" className="right-arrow" /></div></div>
        <div className="categories-img"><img className="img-fluid img" src={category.image} alt={category.name} /></div>
      </Link>
    </li>
  )
}
