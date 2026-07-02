import { useEffect } from 'react'

export default function ProductDetailPage() {
  useEffect(() => {
    const previousClass = document.body.className
    document.body.className = "details-page"
    return () => {
      document.body.className = previousClass
    }
  }, [])

  return (
    <div>
      <div className="top-image">
        <img className="product-header img-fluid" src="/fuzzy/assets/images/background/header-bg.png" alt="header-bg" />
      </div>
      <header className="product-page-header">
        <div className="header-panel">
          <a href="/categories" className="product-back">
            <i className="iconsax back-btn" data-icon="arrow-left" />
          </a>
          <h3 className="title">Chairs</h3>
          <div className="d-flex gap-2">
            <a href="/search" className="search">
              <i className="iconsax icons" data-icon="search-normal-2" />
            </a>
            <div className="like-btn animate active inactive">
              <img className="outline-icon" src="/fuzzy/assets/images/svg/like.svg" alt="like" />
              <img className="fill-icon" src="/fuzzy/assets/images/svg/like-fill.svg" alt="like" />
              <div className="effect-group">
                <span className="effect" />
                <span className="effect" />
                <span className="effect" />
                <span className="effect" />
                <span className="effect" />
              </div>
            </div>
          </div>
        </div>
      </header>
      <section>
        <div className="product-image-slider">
          <div className="swiper product-1 ms-4">
            <div className="swiper-wrapper">
              <div className="swiper-slide">
                <img className="img-fluid product-img" src="/fuzzy/assets/images/product/26.png" alt="p26" />
              </div>
              <div className="swiper-slide">
                <img className="img-fluid product-img" src="/fuzzy/assets/images/product/27.png" alt="p27" />
              </div>
              <div className="swiper-slide">
                <img className="img-fluid product-img" src="/fuzzy/assets/images/product/26.png" alt="p26" />
              </div>
              <div className="swiper-slide">
                <img className="img-fluid product-img" src="/fuzzy/assets/images/product/27.png" alt="p27" />
              </div>
            </div>
            <div className="product-info d-flex justify-content-between">
              <div className="swiper-pagination" />
              <ul className="color-variation">
                <li className="product-color color1" />
                <li className="product-color color2" />
                <li className="product-color color3" />
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-0">
        <div className="custom-container">
          <div className="product-details">
            <div className="product-name">
              <h2 className="theme-color">Buddy Chair</h2>
              <h6>20% OFF</h6>
            </div>
            <div className="ratings mt-1">
              <div className="d-flex align-items-center gap-1">
                <h4 className="theme-color fw-normal">4.0</h4>
                <ul className="rating-stars">
                  <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" /></li>
                  <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" /></li>
                  <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" /></li>
                  <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" /></li>
                  <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/star1.svg" alt="star" /></li>
                </ul>
                <h4 className="reviews">156 Reviews</h4>
              </div>
            </div>
            <div className="product-price">
              <h3>$102.25 <del>$120.00</del></h3>
              <div className="plus-minus">
                <i className="iconsax sub" data-icon="minus" />
                <input type="number" defaultValue={1} min={1} max={10} />
                <i className="iconsax add" data-icon="add" />
              </div>
            </div>
            <p>The buddy chair with modern comfort and durable fabric.</p>
            <div className="accordion details-accordion" id="accordionPanelsStayOpenExample">
              <div className="accordion-item">
                <div className="accordion-header" id="headingOne">
                  <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-p1">Dimensions</div>
                </div>
                <div id="panelsStayOpen-p1" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <table className="table table-bordered text-center m-0">
                      <thead>
                        <tr>
                          <th scope="col">Height</th>
                          <th scope="col">Width</th>
                          <th scope="col">Length</th>
                          <th scope="col">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>115 cm</td>
                          <td>85 cm</td>
                          <td>18 lb</td>
                          <td>5 kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <div className="accordion-header" id="headingTwo">
                  <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-p2">Check Delivery</div>
                </div>
                <div id="panelsStayOpen-p2" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <div className="input-group">
                      <input type="text" className="form-control" placeholder="Pincode" />
                      <button className="btn theme-btn" type="button" id="button-addon2">Check</button>
                    </div>
                    <ul className="address-type">
                      <li>
                        <i className="iconsax icon" data-icon="truck-fast" />
                        <h6>Free Delivery</h6>
                      </li>
                      <li>
                        <i className="iconsax icon" data-icon="dollar-circle" />
                        <h6>COD Available</h6>
                      </li>
                      <li>
                        <i className="iconsax icon" data-icon="box-rotate" />
                        <h6>21 days Return</h6>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <div className="accordion-header" id="headingThree">
                  <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-p3">Details</div>
                </div>
                <div id="panelsStayOpen-p3" className="accordion-collapse collapse show" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <div className="product-description">
                      <p>This product is eligible for returns and size replacements. Please initiate the return from the “My Orders” section <span>...Read More</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <div className="accordion-header" id="headingFour">
                  <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-p4">Reviews</div>
                </div>
                <div id="panelsStayOpen-p4" className="accordion-collapse collapse show" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                  <div className="accordion-body pb-0">
                    <div className="reviews-display">
                      <div className="d-flex justify-content-between">
                        <h4 className="theme-color">430 Reviews</h4>
                        <a href="#reviews" className="theme-color" data-bs-toggle="modal">View all</a>
                      </div>
                      <div className="reviews-box">
                        <div className="d-flex align-items-center gap-2">
                          <img className="img-fluid profile-pic" src="/fuzzy/assets/images/icons/profile2.png" alt="profile2" />
                          <div className="d-flex justify-content-between w-100">
                            <div>
                              <h4 className="theme-color">Rina Jones</h4>
                              <h4 className="light-text mt-1">Just Now</h4>
                            </div>
                            <div className="d-flex align-items-start">
                              <img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                              <h4 className="theme-color fw-normal">4.0</h4>
                            </div>
                          </div>
                        </div>
                        <p>I adore this item. Just fantastic!! they create the actual seen in the picture !!</p>
                      </div>
                      <div className="reviews-box">
                        <div className="d-flex align-items-center gap-2">
                          <img className="img-fluid profile-pic" src="/fuzzy/assets/images/icons/profile3.png" alt="profile2" />
                          <div className="d-flex justify-content-between w-100">
                            <div>
                              <h4 className="theme-color">Smith Williams</h4>
                              <h4 className="light-text mt-1">1 min ago</h4>
                            </div>
                            <div className="d-flex align-items-start">
                              <img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                              <h4 className="theme-color fw-normal">4.2</h4>
                            </div>
                          </div>
                        </div>
                        <p>The best product quality.! It's amazing, Love it...!!</p>
                      </div>
                      <a href="#my-review" className="my-review" data-bs-toggle="offcanvas" role="button">+ Write Your Review</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="similer-product section-b-space">
        <div className="custom-container">
          <div className="title">
            <h2>Similar Products</h2>
            <a href="/shop">View All</a>
          </div>
          <div className="swiper similer-product">
            <div className="swiper-wrapper">
              <div className="swiper-slide">
                <div className="product-box">
                  <div className="product-box-img">
                    <a href="/product/1"> <img className="img" src="/fuzzy/assets/images/product/1.png" alt="p1" /></a>
                    <div className="cart-box">
                      <a href="/cart" className="cart-bag">
                        <i className="iconsax bag" data-icon="basket-2" />
                      </a>
                    </div>
                  </div>
                  <div className="product-box-detail">
                    <h4>Buddy Chair</h4>
                    <h5>Modern saddle arms</h5>
                    <div className="bottom-panel">
                      <div className="price">
                        <h4>$14 <del className="pev-price">$20</del></h4>
                      </div>
                      <div className="rating">
                        <img src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                        <h6>4.5</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="swiper-slide">
                <div className="product-box">
                  <div className="product-box-img">
                    <a href="/product/1"> <img className="img" src="/fuzzy/assets/images/product/2.png" alt="p2" /></a>
                    <div className="cart-box">
                      <a href="/cart" className="cart-bag">
                        <i className="iconsax bag" data-icon="basket-2" />
                      </a>
                    </div>
                  </div>
                  <div className="product-box-detail">
                    <h4>Wingback Chair</h4>
                    <h5>Modern saddle arms</h5>
                    <div className="bottom-panel">
                      <div className="price">
                        <h4>$15 <del className="pev-price">$18</del></h4>
                      </div>
                      <div className="rating">
                        <img src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                        <h6>4.5</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="swiper-slide">
                <div className="product-box">
                  <div className="product-box-img">
                    <a href="/product/1"> <img className="img" src="/fuzzy/assets/images/product/14.png" alt="p14" /></a>
                    <div className="cart-box">
                      <a href="/cart" className="cart-bag">
                        <i className="iconsax bag" data-icon="basket-2" />
                      </a>
                    </div>
                  </div>
                  <div className="product-box-detail">
                    <h4>Winston Chair</h4>
                    <h5>Modern saddle arms</h5>
                    <div className="bottom-panel">
                      <div className="price">
                        <h4>$20 <del className="pev-price">$22</del></h4>
                      </div>
                      <div className="rating">
                        <img src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                        <h6>4.5</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="swiper-slide">
                <div className="product-box">
                  <div className="product-box-img">
                    <a href="/product/1"> <img className="img" src="/fuzzy/assets/images/product/15.png" alt="p15" /></a>
                    <div className="cart-box">
                      <a href="/cart" className="cart-bag">
                        <i className="iconsax bag" data-icon="basket-2" />
                      </a>
                    </div>
                  </div>
                  <div className="product-box-detail">
                    <h4>Beige Chair</h4>
                    <h5>Modern saddle arms</h5>
                    <div className="bottom-panel">
                      <div className="price">
                        <h4>$16 <del className="pev-price">$21</del></h4>
                      </div>
                      <div className="rating">
                        <img src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                        <h6>4.5</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="swiper-slide">
                <div className="product-box">
                  <div className="product-box-img">
                    <a href="/product/1"> <img className="img" src="/fuzzy/assets/images/product/16.png" alt="p16" /></a>
                    <div className="cart-box">
                      <a href="/cart" className="cart-bag">
                        <i className="iconsax bag" data-icon="basket-2" />
                      </a>
                    </div>
                  </div>
                  <div className="product-box-detail">
                    <h4>Dining Chair</h4>
                    <h5>Modern saddle arms</h5>
                    <div className="bottom-panel">
                      <div className="price">
                        <h4>$12 <del className="pev-price">$15</del></h4>
                      </div>
                      <div className="rating">
                        <img src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                        <h6>4.5</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="swiper-slide">
                <div className="product-box">
                  <div className="product-box-img">
                    <a href="/product/1">
                      <img className="img" src="/fuzzy/assets/images/product/17.png" alt="p17" />
                    </a>
                    <div className="cart-box">
                      <a href="/cart" className="cart-bag">
                        <i className="iconsax bag" data-icon="basket-2" />
                      </a>
                    </div>
                  </div>
                  <div className="product-box-detail">
                    <h4>Harbour Chair</h4>
                    <h5>Modern saddle arms</h5>
                    <div className="bottom-panel">
                      <div className="price">
                        <h4>$17 <del className="pev-price">$23</del></h4>
                      </div>
                      <div className="rating">
                        <img src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                        <h6>4.5</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="fixed-cart-btn section-b-space">
        <div className="custom-container">
          <a href="/cart" className="cart-box-sec">
            <div className="d-flex align-items-center gap-2">
              <i className="iconsax bag" data-icon="basket-2" />
              <h2>Add to cart</h2>
            </div>
            <h2>$102.25</h2>
          </a>
        </div>
      </section>
      <div className="offcanvas offcanvas-bottom my-review-offcanvas" tabIndex={-1} id="my-review">
        <div className="offcanvas-header review-head">
          <h4 className="offcanvas-title" id="offcanvasBottomLabel">Create Review</h4>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" />
        </div>
        <div className="offcanvas-body review-body">
          <div className="rating-sec d-flex align-items-center justify-content-start gap-1 border-0 p-0">
            <h4 className="theme-color fw-normal">Rating :</h4>
            <ul className="rating-stars">
              <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" /></li>
              <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" /></li>
              <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" /></li>
              <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" /></li>
              <li><img className="img-fluid stars" src="/fuzzy/assets/images/svg/star1.svg" alt="star" /></li>
            </ul>
          </div>
          <form className="theme-form">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group mt-3">
                  <label htmlFor="name" className="form-check-label">Name</label>
                  <input type="text" className="form-control" id="name" placeholder="Enter Your name" required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group mt-3">
                  <label htmlFor="email" className="form-check-label">Email</label>
                  <input type="text" className="form-control" id="email" placeholder="Email" required />
                </div>
              </div>
              <div className="col-md-12">
                <div className="form-group mt-3">
                  <label className="form-check-label" htmlFor="review">Review Title</label>
                  <input type="text" className="form-control" id="review" placeholder="Enter your Review Subjects" required />
                </div>
              </div>
              <div className="col-md-12">
                <div className="form-group mt-3">
                  <label className="form-check-label">Add a Photo or Video</label>
                  <div className="upload-image">
                    <div id="upload-file" className="my-dropzone" />
                    <div className="upload-icon">
                      <i className="iconsax add-icon" data-icon="add" />
                      <h6>Upload</h6>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="form-group mt-3">
                  <label htmlFor="review" className="form-check-label">Review</label>
                  <textarea className="form-control" placeholder="Write Your Review Here" id="exampleFormControlTextarea1" rows={3} defaultValue={""} />
                </div>
              </div>
              <div className="col-md-12">
                <a href="/product/1" className="btn theme-btn mt-3">Submit Your Review</a>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="modal review-modal fade" id="reviews" tabIndex={-1}>
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Customer Reviews</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <section className="section-b-space pt-0">
                <div className="reviews-display">
                  <div className="reviews-box">
                    <div className="d-flex align-items-center gap-2">
                      <img className="img-fluid profile-pic" src="/fuzzy/assets/images/icons/profile2.png" alt="profile2" />
                      <div className="d-flex justify-content-between w-100">
                        <div>
                          <h4 className="theme-color">Rina Jones</h4>
                          <h4 className="light-text mt-1">Just Now</h4>
                        </div>
                        <div className="d-flex align-items-start">
                          <img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                          <h4 className="theme-color fw-normal">4.0</h4>
                        </div>
                      </div>
                    </div>
                    <p>I adore this item. Just fantastic!! they create the actual seen in the picture !!</p>
                  </div>
                  <div className="reviews-box">
                    <div className="d-flex align-items-center gap-2">
                      <img className="img-fluid profile-pic" src="/fuzzy/assets/images/icons/profile3.png" alt="profile2" />
                      <div className="d-flex justify-content-between w-100">
                        <div>
                          <h4 className="theme-color">Smith Williams</h4>
                          <h4 className="light-text mt-1">1 min ago</h4>
                        </div>
                        <div className="d-flex align-items-start">
                          <img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                          <h4 className="theme-color fw-normal">4.2</h4>
                        </div>
                      </div>
                    </div>
                    <p>The best product quality.! It's amazing, Love it...!!</p>
                  </div>
                  <div className="reviews-box">
                    <div className="d-flex align-items-center gap-2">
                      <img className="img-fluid profile-pic" src="/fuzzy/assets/images/icons/profile1.png" alt="profile2" />
                      <div className="d-flex justify-content-between w-100">
                        <div>
                          <h4 className="theme-color">Marlin Watkin</h4>
                          <h4 className="light-text mt-1">30 min ago</h4>
                        </div>
                        <div className="d-flex align-items-start">
                          <img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                          <h4 className="theme-color fw-normal">4.5</h4>
                        </div>
                      </div>
                    </div>
                    <p>The most important idea is that the creator creates a fantastic picture.</p>
                  </div>
                  <div className="reviews-box">
                    <div className="d-flex align-items-center gap-2">
                      <img className="img-fluid profile-pic" src="/fuzzy/assets/images/icons/profile.png" alt="profile2" />
                      <div className="d-flex justify-content-between w-100">
                        <div>
                          <h4 className="theme-color">Agasya shaw</h4>
                          <h4 className="light-text mt-1">1 hour ago</h4>
                        </div>
                        <div className="d-flex align-items-start">
                          <img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                          <h4 className="theme-color fw-normal">4.2</h4>
                        </div>
                      </div>
                    </div>
                    <p>The most important idea is that the creator creates a beautiful picture of their item.</p>
                  </div>
                  <div className="reviews-box">
                    <div className="d-flex align-items-center gap-2">
                      <img className="img-fluid profile-pic" src="/fuzzy/assets/images/icons/profile2.png" alt="profile2" />
                      <div className="d-flex justify-content-between w-100">
                        <div>
                          <h4 className="theme-color">Zoe Raws</h4>
                          <h4 className="light-text mt-1">12 hour ago</h4>
                        </div>
                        <div className="d-flex align-items-start">
                          <img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                          <h4 className="theme-color fw-normal">4.3</h4>
                        </div>
                      </div>
                    </div>
                    <p>I adore this item. Just fantastic!! they create the actual seen in the picture !!</p>
                  </div>
                  <div className="reviews-box">
                    <div className="d-flex align-items-center gap-2">
                      <img className="img-fluid profile-pic" src="/fuzzy/assets/images/icons/profile3.png" alt="profile2" />
                      <div className="d-flex justify-content-between w-100">
                        <div>
                          <h4 className="theme-color">Alex Welsh</h4>
                          <h4 className="light-text mt-1">1 day ago</h4>
                        </div>
                        <div className="d-flex align-items-start">
                          <img className="img-fluid stars" src="/fuzzy/assets/images/svg/Star.svg" alt="star" />
                          <h4 className="theme-color fw-normal">4.6</h4>
                        </div>
                      </div>
                    </div>
                    <p>The best product quality is amazing and love it.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <section className="panel-space" />
    </div>
    
  )
}
