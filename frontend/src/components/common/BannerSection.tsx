import { Link } from 'react-router-dom'
import Icon from './Icon'

interface BannerSectionProps {
  image?: string
}

export default function BannerSection({ image = 'banner-1.jpg' }: BannerSectionProps) {
  return (
    <section className="banner-wapper">
      <div className="custom-container">
        <div className="banner-bg">
          <img className="img-fluid img-bg w-100" src={`/fuzzy/assets/images/banner/${image}`} alt="Furniture offer" />
          <div className="banner-content"><h2 className="fw-semibold">Best Selling</h2><h4>Comforts &amp; Modern life Stylish Sofa</h4></div>
          <Link to="/categories" className="more-btn"><h4>View More</h4><Icon name="arrow-right" className="right-arrow" /></Link>
        </div>
      </div>
    </section>
  )
}
