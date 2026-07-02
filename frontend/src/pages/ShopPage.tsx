import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../services/apiClient'
import { productService } from '../services/productService'
import './ShopPage.scss'
import WishlistButton from '../components/wishlist/WishlistButton'

export default function ShopPage() {
  const [params] = useSearchParams()
  const category = params.get('category') ?? undefined
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [sort, setSort] = useState('newest')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)
  const query = useInfiniteQuery({
    queryKey: ['products', category, deferredSearch, sort, color, size, minPrice, maxPrice],
    queryFn: ({ pageParam }) => productService.products({
      category,
      search: deferredSearch || undefined,
      sort,
      color: color || undefined,
      size: size || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      cursor: pageParam,
      limit: 6,
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.pageInfo.nextCursor ?? undefined,
  })
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query

  useEffect(() => {
    const old = document.body.className
    document.body.className = ''
    return () => { document.body.className = old }
  }, [])
  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [filterOpen])
  useEffect(() => {
    const node = sentinel.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) void fetchNextPage()
    }, { rootMargin: '200px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const products = query.data?.pages.flatMap((page) => page.products) ?? []
  const activeFilters = [color, size, minPrice, maxPrice].filter(Boolean).length + (sort !== 'newest' ? 1 : 0)

  return <div className="shop-page">
    <header className="section-t-space"><div className="custom-container"><div className="header-panel"><a href="/categories"><i className="iconsax back-btn" data-icon="arrow-left" /></a><h3>{category ?? 'Shop'}</h3><a href="/notification" className="notification"><i className="iconsax notification-icon" data-icon="bell-2" /></a></div></div></header>
    <section><div className="custom-container"><form className="theme-form search-head" onSubmit={(event) => event.preventDefault()}><div className="form-group"><div className="form-input"><input className="form-control search" type="search" inputMode="search" enterKeyHint="search" aria-label="Search products" placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} /><i className="iconsax search-icon" data-icon="search-normal-2" /></div><button type="button" className="btn filter-btn mt-0" aria-label="Filter and sort products" aria-expanded={filterOpen} onClick={() => setFilterOpen(true)}><i className="iconsax filter-icon" data-icon="media-sliders-3" />{activeFilters > 0 && <span>{activeFilters}</span>}</button></div></form></div></section>

    <section className="section-b-space"><div className="custom-container">
      {query.isLoading && <div className="row g-3" aria-label="Loading products">{Array.from({ length: 6 }, (_, index) => <div className="col-6" key={index}><div className="product-skeleton"><span /><i /><i /></div></div>)}</div>}
      {query.isError && <div className="shop-feedback"><p>{getApiErrorMessage(query.error)}</p><button className="btn theme-btn" onClick={() => query.refetch()}>Try again</button></div>}
      {!query.isLoading && !query.isError && !products.length && <div className="shop-feedback"><h2>No products found</h2><p>Try changing your search or filters.</p></div>}
      <div className="row g-3">{products.map((product) => <div className="col-6" key={product.id}><div className="product-box"><div className="product-box-img"><a href={`/product/${product.slug}`}><img className="img" src={product.images[0]?.imageUrl || '/fuzzy/assets/images/product/1.png'} alt={product.name} loading="lazy" /></a><div className="cart-box"><a href={`/product/${product.slug}`} className="cart-bag" aria-label={`View ${product.name}`}><i className="iconsax bag" data-icon="basket-2" /></a></div></div><WishlistButton productId={product.id} /><div className="product-box-detail"><h4>{product.name}</h4><h5>{product.category.name}</h5><div className="bottom-panel"><div className="price"><h4>${product.salePrice ?? product.price} {product.salePrice && <del className="pev-price">${product.price}</del>}</h4></div><div className="rating"><img src="/fuzzy/assets/images/svg/Star.svg" alt="" /><h6>{product.totalStock}</h6></div></div></div></div></div>)}</div>
      <div className="shop-load-more" ref={sentinel}>{query.isFetchingNextPage && <span>Loading more...</span>}</div>
    </div></section>

    {filterOpen && <div className="filter-sheet-backdrop" role="presentation" onMouseDown={() => setFilterOpen(false)}>
      <section className="filter-sheet" role="dialog" aria-modal="true" aria-labelledby="filter-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="filter-sheet__handle" />
        <div className="filter-sheet__header"><h2 id="filter-title">Filter & Sort</h2><button type="button" aria-label="Close filters" onClick={() => setFilterOpen(false)}>×</button></div>
        <div className="filter-sheet__body theme-form">
          <label>Sort by<select className="form-control" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="price_asc">Price low to high</option><option value="price_desc">Price high to low</option><option value="name_asc">Name</option></select></label>
          <div className="filter-sheet__row"><label>Color<select className="form-control" value={color} onChange={(event) => setColor(event.target.value)}><option value="">All colors</option>{['BLACK', 'WHITE', 'BROWN', 'GRAY', 'BEIGE'].map((code) => <option key={code}>{code}</option>)}</select></label><label>Size<select className="form-control" value={size} onChange={(event) => setSize(event.target.value)}><option value="">All sizes</option>{['S', 'M', 'L'].map((code) => <option key={code}>{code}</option>)}</select></label></div>
          <div className="filter-sheet__row"><label>Minimum price<input className="form-control" type="number" inputMode="decimal" min="0" placeholder="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} /></label><label>Maximum price<input className="form-control" type="number" inputMode="decimal" min="0" placeholder="Any" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></label></div>
        </div>
        <div className="filter-sheet__actions"><button className="btn gray-btn mt-0" onClick={() => { setSort('newest'); setColor(''); setSize(''); setMinPrice(''); setMaxPrice('') }}>Clear</button><button className="btn theme-btn mt-0" onClick={() => setFilterOpen(false)}>Show results</button></div>
      </section>
    </div>}
  </div>
}
