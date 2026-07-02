import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../services/productService'

export default function CategoriesPage() {
  const [search, setSearch] = useState('')
  const categories = useQuery({ queryKey: ['categories'], queryFn: productService.categories })
  useEffect(() => { const old = document.body.className; document.body.className = ''; return () => { document.body.className = old } }, [])
  const items = (categories.data ?? []).filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
  return <div>
    <header className="section-t-space"><div className="custom-container"><div className="header-panel"><h3>Categories</h3><a href="/notification" className="notification"><i className="iconsax notification-icon" data-icon="bell-2" /></a></div></div></header>
    <section><div className="custom-container"><form className="theme-form search-head" onSubmit={(e) => e.preventDefault()}><div className="form-group"><div className="form-input w-100"><input className="form-control search" placeholder="Search here..." value={search} onChange={(e) => setSearch(e.target.value)} /><i className="iconsax search-icon" data-icon="search-normal-2" /></div></div></form></div></section>
    <section><div className="custom-container"><ul className="categories-list">{items.map((item, index) => <li className={index === 0 ? 'mt-0' : ''} key={item.id}><a href={`/shop?category=${item.slug}`} className="d-flex align-items-center"><div className="ps-3"><h2>{item.name}</h2><h4 className="mt-1">Total {item._count.products} item available</h4><div className="arrow"><i className="iconsax right-arrow" data-icon="arrow-right" /></div></div><div className="categories-img"><img className="img-fluid categories img" src={item.imageUrl || '/fuzzy/assets/images/product/1.png'} alt={item.name} loading="lazy" /></div></a></li>)}</ul></div></section>
    <section className="panel-space" />
  </div>
}
