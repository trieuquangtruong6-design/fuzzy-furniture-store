import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '../services/apiClient'
import { adminCatalogService } from '../services/adminCatalogService'
import type { AdminProduct } from '../types/admin'
import './AdminProductsPage.scss'

const emptyForm = {
  name: '', slug: '', description: '', categoryId: '', price: '',
  salePrice: '', status: 'ACTIVE', isFeatured: false,
  imageUrl: '/fuzzy/assets/images/product/1.png', sku: '', stock: '0',
  colorId: '', sizeId: '',
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const products = useQuery({ queryKey: ['admin-products'], queryFn: adminCatalogService.products })
  const categories = useQuery({ queryKey: ['admin-categories'], queryFn: adminCatalogService.categories })
  const colors = useQuery({ queryKey: ['admin-colors'], queryFn: adminCatalogService.colors })
  const sizes = useQuery({ queryKey: ['admin-sizes'], queryFn: adminCatalogService.sizes })
  const selected = useMemo(
    () => products.data?.find((product) => product.id === selectedId) ?? null,
    [products.data, selectedId],
  )
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (products.data ?? []).filter((product) => {
      const matchesSearch = !term
        || product.name.toLowerCase().includes(term)
        || product.slug.toLowerCase().includes(term)
        || product.variants.some((variant) => variant.sku.toLowerCase().includes(term))
      return matchesSearch
        && (statusFilter === 'ALL' || product.status === statusFilter)
        && (categoryFilter === 'ALL' || product.categoryId === categoryFilter)
    })
  }, [categoryFilter, products.data, search, statusFilter])
  const stats = useMemo(() => {
    const list = products.data ?? []
    return {
      total: list.length,
      active: list.filter((product) => product.status === 'ACTIVE').length,
      featured: list.filter((product) => product.isFeatured).length,
      lowStock: list.filter((product) =>
        product.variants.reduce((sum, variant) => sum + variant.stock, 0) <= 5,
      ).length,
    }
  }, [products.data])

  useEffect(() => {
    const previous = document.body.className
    document.body.className = ''
    return () => { document.body.className = previous }
  }, [])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  const setField = (name: keyof typeof emptyForm, value: string | boolean) =>
    setForm((current) => ({ ...current, [name]: value }))
  const report = (error: unknown) => window.alert(getApiErrorMessage(error))

  function edit(product: AdminProduct) {
    setEditingId(product.id)
    setSelectedId(product.id)
    setForm({
      ...emptyForm,
      name: product.name, slug: product.slug, description: product.description,
      categoryId: product.categoryId, price: product.price,
      salePrice: product.salePrice ?? '', status: product.status,
      isFeatured: product.isFeatured,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault()
    if (Number(form.price) < 0 || (form.salePrice && Number(form.salePrice) > Number(form.price))) {
      window.alert('Sale price must be between 0 and the regular price.')
      return
    }
    if (!editingId && Number(form.stock) < 0) {
      window.alert('Stock cannot be negative.')
      return
    }
    setSaving(true)
    try {
      const core = {
        name: form.name, slug: form.slug, description: form.description,
        categoryId: form.categoryId, price: form.price,
        salePrice: form.salePrice || null, status: form.status,
        isFeatured: form.isFeatured,
      }
      if (editingId) {
        await adminCatalogService.updateProduct(editingId, core)
      } else {
        await adminCatalogService.createProduct({
          ...core,
          images: [{ imageUrl: form.imageUrl, alt: form.name, sortOrder: 0 }],
          variants: [{
            sku: form.sku, stock: Number(form.stock),
            colorId: form.colorId || null, sizeId: form.sizeId || null,
          }],
        })
      }
      await refresh()
      reset()
    } catch (error) { report(error) } finally { setSaving(false) }
  }

  async function removeProduct(id: string) {
    if (!window.confirm('Delete or hide this product?')) return
    try { await adminCatalogService.deleteProduct(id); await refresh(); if (selectedId === id) setSelectedId(null) }
    catch (error) { report(error) }
  }

  async function addImage() {
    if (!selected) return
    const imageUrl = window.prompt('Public image URL')
    if (!imageUrl) return
    try {
      await adminCatalogService.addImage(selected.id, { imageUrl, alt: selected.name, sortOrder: selected.images.length })
      await refresh()
    } catch (error) { report(error) }
  }

  async function addVariant() {
    if (!selected) return
    const sku = window.prompt('Unique SKU')
    const stock = window.prompt('Stock', '0')
    if (!sku || stock == null) return
    try {
      await adminCatalogService.addVariant(selected.id, { sku, stock: Number(stock) })
      await refresh()
    } catch (error) { report(error) }
  }

  async function createCategory() {
    const name = window.prompt('Category name')
    const slug = window.prompt('Category slug')
    if (!name || !slug) return
    try { await adminCatalogService.createCategory({ name, slug }); await queryClient.invalidateQueries({ queryKey: ['admin-categories'] }) }
    catch (error) { report(error) }
  }
  async function createColor() {
    const name = window.prompt('Color name')
    const code = window.prompt('Color code')
    const hex = window.prompt('Hex color', '#000000')
    if (!name || !code || !hex) return
    try { await adminCatalogService.createColor({ name, code, hex }); await queryClient.invalidateQueries({ queryKey: ['admin-colors'] }) }
    catch (error) { report(error) }
  }
  async function createSize() {
    const name = window.prompt('Size name')
    const code = window.prompt('Size code')
    if (!name || !code) return
    try { await adminCatalogService.createSize({ name, code }); await queryClient.invalidateQueries({ queryKey: ['admin-sizes'] }) }
    catch (error) { report(error) }
  }

  return (
    <main className="admin-catalog">
      <div className="admin-hero">
        <div>
          <small>Catalog workspace</small>
          <h1>Product Management</h1>
          <p>Manage catalog, pricing, inventory and variants</p>
        </div>
        <div className="admin-hero-actions">
          <button className="btn theme-btn mt-0" type="button" onClick={() => { reset(); document.getElementById('product-editor')?.scrollIntoView({ behavior: 'smooth' }) }}>+ Add Product</button>
          <button className="btn gray-btn mt-0" type="button" onClick={() => refresh()}>Refresh</button>
          <a className="btn gray-btn mt-0" href="/admin">Back to Admin Center</a>
        </div>
      </div>

      <section className="admin-stats" aria-label="Catalog summary">
        <article><span>Total Products</span><strong>{stats.total}</strong><small>All catalog items</small></article>
        <article><span>Active Products</span><strong>{stats.active}</strong><small>Visible for sale</small></article>
        <article><span>Featured Products</span><strong>{stats.featured}</strong><small>Promoted items</small></article>
        <article><span>Low Stock Products</span><strong>{stats.lowStock}</strong><small>5 units or fewer</small></article>
      </section>

      <div className="admin-workspace">
      <form id="product-editor" className="theme-form admin-panel admin-editor" onSubmit={saveProduct}>
        <div className="admin-panel-heading"><div><small>Product editor</small><h2>{editingId ? 'Edit Product' : 'Add Product'}</h2></div>{editingId && <span>Editing</span>}</div>
        <h3 className="admin-section-title"><span>A</span> Basic Information</h3>
        <div className="row g-3 mt-1">
          <div className="col-12 col-md-6"><input className="form-control" placeholder="Product name" value={form.name} onChange={(e) => setField('name', e.target.value)} required /></div>
          <div className="col-12 col-md-6"><input className="form-control" placeholder="Slug" value={form.slug} onChange={(e) => setField('slug', e.target.value)} required /></div>
          <div className="col-12"><textarea className="form-control" placeholder="Description" value={form.description} onChange={(e) => setField('description', e.target.value)} required /></div>
          <h3 className="admin-section-title col-12"><span>B</span> Commerce</h3>
          <div className="col-12 col-md-4"><select className="form-control" value={form.categoryId} onChange={(e) => setField('categoryId', e.target.value)} required><option value="">Category</option>{categories.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          <div className="col-6 col-md-2"><input type="number" min="0" step="0.01" className="form-control" placeholder="Price" value={form.price} onChange={(e) => setField('price', e.target.value)} required /></div>
          <div className="col-6 col-md-2"><input type="number" min="0" step="0.01" className="form-control" placeholder="Sale price" value={form.salePrice} onChange={(e) => setField('salePrice', e.target.value)} /></div>
          <div className="col-6 col-md-2"><select className="form-control" value={form.status} onChange={(e) => setField('status', e.target.value)}><option>ACTIVE</option><option>INACTIVE</option><option>OUT_OF_STOCK</option></select></div>
          <div className="col-6 col-md-2"><label className="form-check-label"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} /> Featured</label></div>
          {!editingId && <>
            <h3 className="admin-section-title col-12"><span>C</span> Media</h3>
            <div className="col-12"><input className="form-control" placeholder="Primary image URL" value={form.imageUrl} onChange={(e) => setField('imageUrl', e.target.value)} required /></div>
            {form.imageUrl && <div className="col-12 admin-image-preview"><img src={form.imageUrl} alt="Product preview" /><span>Image preview</span></div>}
            <h3 className="admin-section-title col-12"><span>D</span> Inventory / Variant</h3>
            <div className="col-6 col-md-3"><input className="form-control" placeholder="SKU" value={form.sku} onChange={(e) => setField('sku', e.target.value)} required /></div>
            <div className="col-6 col-md-2"><input type="number" min="0" className="form-control" placeholder="Stock" value={form.stock} onChange={(e) => setField('stock', e.target.value)} required /></div>
            <div className="col-6 col-md-3"><select className="form-control" value={form.colorId} onChange={(e) => setField('colorId', e.target.value)}><option value="">No color</option>{colors.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
            <div className="col-6 col-md-3"><select className="form-control" value={form.sizeId} onChange={(e) => setField('sizeId', e.target.value)}><option value="">No size</option>{sizes.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          </>}
        </div>
        <h3 className="admin-section-title"><span>E</span> Actions</h3>
        <div className="d-flex gap-2 mt-3 admin-form-actions">
          <button className="btn theme-btn mt-0" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
          <button className="btn gray-btn mt-0" type="button" onClick={reset}>{editingId ? 'Cancel Edit' : 'Reset'}</button>
        </div>
      </form>

      <section className="admin-panel admin-list-panel">
        <div className="admin-panel-heading"><div><small>Catalog</small><h2>Products <span>{filteredProducts.length}</span></h2></div></div>
        <div className="admin-filters">
          <input className="form-control" aria-label="Search products" placeholder="Search name, slug or SKU..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="form-control" aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="OUT_OF_STOCK">Out of stock</option></select>
          <select className="form-control" aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="ALL">All categories</option>{categories.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <button className="btn gray-btn mt-0" type="button" onClick={() => refresh()}>Refresh</button>
        </div>
        {products.isLoading && <div className="admin-empty">Loading products...</div>}
        {products.isError && <div className="admin-empty">{getApiErrorMessage(products.error)}</div>}
        {!products.isLoading && !filteredProducts.length && <div className="admin-empty">No products match these filters.</div>}
        <div className="admin-products">
        {filteredProducts.map((product) => (
          <div className="admin-product" key={product.id}>
            <img src={product.images[0]?.imageUrl || '/fuzzy/assets/images/product/1.png'} alt={product.images[0]?.alt || product.name} />
            <div className="d-flex justify-content-between gap-2">
              <div><h4>{product.name}</h4><p>{product.category.name} · ${product.salePrice ?? product.price} · {product.status}</p></div>
              <div className="admin-actions">
                <button className="btn gray-btn mt-0" onClick={() => setSelectedId(product.id)}>Manage</button>
                <button className="btn gray-btn mt-0" onClick={() => edit(product)}>Edit</button>
                <button className="btn gray-btn mt-0" onClick={() => removeProduct(product.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </section>
      </div>

      {selected && <section className="admin-panel admin-detail-panel">
        <h3>Images & Variants — {selected.name}</h3>
        <button className="btn gray-btn mt-2" onClick={addImage}>+ Image</button>
        {selected.images.map((image) => <div className="d-flex justify-content-between mt-2" key={image.id}><span>{image.alt}: {image.imageUrl}</span><button className="btn gray-btn mt-0" onClick={async () => { try { await adminCatalogService.deleteImage(selected.id, image.id); await refresh() } catch (error) { report(error) } }}>Delete</button></div>)}
        <button className="btn gray-btn mt-3" onClick={addVariant}>+ Variant</button>
        {selected.variants.map((variant) => <div className="d-flex justify-content-between mt-2" key={variant.id}><span>{variant.sku} · stock {variant.stock} · {variant.color?.name ?? '-'} / {variant.size?.name ?? '-'}</span><div className="d-flex gap-2"><button className="btn gray-btn mt-0" onClick={async () => { const stock = window.prompt('New stock', String(variant.stock)); if (stock == null) return; try { await adminCatalogService.updateVariant(selected.id, variant.id, { stock: Number(stock) }); await refresh() } catch (error) { report(error) } }}>Stock</button><button className="btn gray-btn mt-0" onClick={async () => { try { await adminCatalogService.deleteVariant(selected.id, variant.id); await refresh() } catch (error) { report(error) } }}>Delete</button></div></div>)}
      </section>}

      <section className="admin-panel admin-taxonomy-panel">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <h3>Categories</h3><button className="btn gray-btn mt-2" onClick={createCategory}>+ Category</button>
            {categories.data?.map((item) => <div className="d-flex justify-content-between mt-2" key={item.id}><span>{item.name} ({item.isActive ? 'active' : 'hidden'})</span><div><button className="btn gray-btn mt-0" onClick={async () => { const name = window.prompt('Category name', item.name); if (!name) return; try { await adminCatalogService.updateCategory(item.id, { name }); await queryClient.invalidateQueries({ queryKey: ['admin-categories'] }) } catch (error) { report(error) } }}>Edit</button><button className="btn gray-btn mt-0" onClick={async () => { if (!window.confirm('Delete or hide category?')) return; try { await adminCatalogService.deleteCategory(item.id); await queryClient.invalidateQueries({ queryKey: ['admin-categories'] }) } catch (error) { report(error) } }}>Delete</button></div></div>)}
          </div>
          <div className="col-12 col-md-4">
            <h3>Colors</h3><button className="btn gray-btn mt-2" onClick={createColor}>+ Color</button>
            {colors.data?.map((item) => <div className="d-flex justify-content-between mt-2" key={item.id}><span><span style={{ background: item.hex, display: 'inline-block', height: 14, marginRight: 6, width: 14 }} />{item.name} ({item.code})</span><div><button className="btn gray-btn mt-0" onClick={async () => { const name = window.prompt('Color name', item.name); if (!name) return; try { await adminCatalogService.updateColor(item.id, { name }); await queryClient.invalidateQueries({ queryKey: ['admin-colors'] }) } catch (error) { report(error) } }}>Edit</button><button className="btn gray-btn mt-0" onClick={async () => { if (!window.confirm('Delete color?')) return; try { await adminCatalogService.deleteColor(item.id); await queryClient.invalidateQueries({ queryKey: ['admin-colors'] }) } catch (error) { report(error) } }}>Delete</button></div></div>)}
          </div>
          <div className="col-12 col-md-4">
            <h3>Sizes</h3><button className="btn gray-btn mt-2" onClick={createSize}>+ Size</button>
            {sizes.data?.map((item) => <div className="d-flex justify-content-between mt-2" key={item.id}><span>{item.name} ({item.code})</span><div><button className="btn gray-btn mt-0" onClick={async () => { const name = window.prompt('Size name', item.name); if (!name) return; try { await adminCatalogService.updateSize(item.id, { name }); await queryClient.invalidateQueries({ queryKey: ['admin-sizes'] }) } catch (error) { report(error) } }}>Edit</button><button className="btn gray-btn mt-0" onClick={async () => { if (!window.confirm('Delete size?')) return; try { await adminCatalogService.deleteSize(item.id); await queryClient.invalidateQueries({ queryKey: ['admin-sizes'] }) } catch (error) { report(error) } }}>Delete</button></div></div>)}
          </div>
        </div>
      </section>
    </main>
  )
}
