const endpoint = process.env.CDP_ENDPOINT ?? 'http://127.0.0.1:9223'
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function findPage() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const targets = await fetch(`${endpoint}/json/list`).then((response) => response.json())
      const page = targets.find((target) => target.type === 'page' && target.url.includes('127.0.0.1:4173'))
      if (page) return page
    } catch {
      // Browser may still be starting.
    }
    await delay(250)
  }
  throw new Error('Could not find the preview page through Chrome DevTools Protocol')
}

const page = await findPage()
const socket = new WebSocket(page.webSocketDebuggerUrl)
const pending = new Map()
let nextId = 0

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (!message.id) return
  const request = pending.get(message.id)
  if (!request) return
  pending.delete(message.id)
  if (message.error) request.reject(new Error(message.error.message))
  else request.resolve(message.result)
})

function send(method, params = {}) {
  const id = ++nextId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}

await send('Page.enable')
await send('Runtime.enable')
await send('Network.enable')

for (let attempt = 0; attempt < 40; attempt += 1) {
  const ready = await evaluate(`document.readyState === 'complete' && 'serviceWorker' in navigator`)
  if (ready) break
  if (attempt === 39) throw new Error('Page did not expose the Service Worker API')
  await delay(250)
}

const registration = await evaluate(`(async () => {
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker timeout')), 10000))
  ])
  return {
    scope: registration.scope,
    active: registration.active?.scriptURL ?? null,
    manifest: await fetch('/manifest.webmanifest').then((response) => response.json()),
    cacheNames: await caches.keys()
  }
})()`)

await send('Page.reload', { ignoreCache: true })
await delay(2500)

const onlineState = await evaluate(`(async () => {
  const cacheNames = await caches.keys()
  const cachedUrls = (await Promise.all(cacheNames.map(async (name) => {
    const cache = await caches.open(name)
    return (await cache.keys()).map((request) => request.url)
  }))).flat()
  return {
    controlled: Boolean(navigator.serviceWorker.controller),
    title: document.title,
    bodyLength: document.body.innerText.length,
    privateCached: cachedUrls.filter((url) => /\\/api\\/(auth|users|cart|checkout|orders|admin)(\\/|\\?|$)/.test(url))
  }
})()`)

await send('Network.emulateNetworkConditions', {
  offline: true,
  latency: 0,
  downloadThroughput: 0,
  uploadThroughput: 0,
  connectionType: 'none',
})
await send('Page.reload', { ignoreCache: false })
await delay(2500)

const offlineState = await evaluate(`({
  title: document.title,
  bodyLength: document.body.innerText.length,
  controlled: Boolean(navigator.serviceWorker.controller),
  url: location.pathname
})`)

await send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 0,
  downloadThroughput: -1,
  uploadThroughput: -1,
  connectionType: 'wifi',
})

const checks = {
  manifestName: registration.manifest.name === 'Fuzzy Furniture Store',
  standalone: registration.manifest.display === 'standalone',
  icons: registration.manifest.icons.some((icon) => icon.sizes === '192x192')
    && registration.manifest.icons.some((icon) => icon.sizes === '512x512')
    && registration.manifest.icons.some((icon) => icon.purpose === 'maskable'),
  serviceWorkerActive: registration.active?.endsWith('/sw.js') === true,
  versionedCaches: registration.cacheNames.some((name) => name.startsWith('fuzzy-v2-')),
  serviceWorkerControlledOfflineReload: offlineState.controlled,
  noPrivateApiCached: onlineState.privateCached.length === 0,
  offlineReloadRendered: offlineState.controlled && offlineState.bodyLength > 0,
}

console.log(JSON.stringify({ checks, registration, onlineState, offlineState }, null, 2))
socket.close()
if (Object.values(checks).some((passed) => !passed)) process.exitCode = 1
