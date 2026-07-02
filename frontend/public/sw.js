const VERSION = 'fuzzy-v2'
const CACHE = {
  shell: `${VERSION}-shell`,
  static: `${VERSION}-static`,
  images: `${VERSION}-images`,
  publicApi: `${VERSION}-public-api`,
}
const APP_SHELL = [
  '/',
  '/home',
  '/manifest.webmanifest',
  '/offline.html',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
]
const PRIVATE_API_PREFIXES = [
  '/api/auth',
  '/api/users',
  '/api/cart',
  '/api/checkout',
  '/api/orders',
  '/api/admin',
]
const PUBLIC_API_PREFIXES = ['/api/products', '/api/categories']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE.shell)
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('fuzzy-') && !Object.values(CACHE).includes(key))
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  )
})

function isPrivateApi(pathname) {
  return PRIVATE_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isPublicApi(pathname) {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

async function put(cacheName, request, response, limit) {
  if (!response.ok || response.type === 'opaque') return
  const cache = await caches.open(cacheName)
  await cache.put(request, response.clone())
  if (limit) {
    const keys = await cache.keys()
    await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map((key) => cache.delete(key)))
  }
}

async function networkFirst(request, cacheName, fallbackUrl) {
  try {
    const response = await fetch(request)
    await put(cacheName, request, response)
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl)
      if (fallback) return fallback
    }
    throw new Error('Network unavailable and no cached response exists')
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE.static)
  const cached = await cache.match(request)
  const update = fetch(request)
    .then(async (response) => {
      await put(CACHE.static, request, response, 80)
      return response
    })
    .catch(() => null)
  if (cached) return cached
  const response = await update
  if (response) return response
  throw new Error('Static asset unavailable')
}

async function cacheFirstImage(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  await put(CACHE.images, request, response, 100)
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/api/')) {
    if (isPrivateApi(url.pathname)) return
    if (isPublicApi(url.pathname)) {
      event.respondWith(networkFirst(request, CACHE.publicApi))
    }
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE.shell, '/offline.html'))
    return
  }

  if (request.destination === 'script'
    || request.destination === 'style'
    || request.destination === 'font'
    || url.pathname.endsWith('.webmanifest')) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  if (request.destination === 'image') {
    event.respondWith(cacheFirstImage(request))
  }
})
