const DB_NAME = 'hashidea-cache'
const STORE = 'modules'
const VERSION = 1

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'url' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

async function readModule(url: string): Promise<string | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const request = store.get(url)
    request.onsuccess = () => resolve(request.result?.code || null)
    request.onerror = () => reject(request.error)
  })
}

async function writeModule(url: string, code: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const request = store.put({ url, code, updatedAt: Date.now() })
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function fetchModule(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`)
  }
  return res.text()
}

async function getModuleCode(url: string): Promise<string> {
  const cached = await readModule(url)
  if (cached) return cached
  const code = await fetchModule(url)
  await writeModule(url, code)
  return code
}

function toBlobUrl(code: string): string {
  const blob = new Blob([code], { type: 'application/javascript' })
  return URL.createObjectURL(blob)
}

export async function buildCachedImportMap(imports: string[]): Promise<string> {
  const map: Record<string, string> = {}
  const entries = new Set(imports)
  entries.add('react')
  entries.add('react-dom')

  const bundles = await Promise.all(
    Array.from(entries).map(async (pkg) => {
      const url = `https://esm.sh/${pkg}?bundle`
      const code = await getModuleCode(url)
      return { pkg, url, code }
    })
  )

  for (const { pkg, code } of bundles) {
    map[pkg] = toBlobUrl(code)
    map[`${pkg}/`] = `https://esm.sh/${pkg}/`
  }

  const jsxRuntime = await getModuleCode('https://esm.sh/react/jsx-runtime?bundle')
  const jsxDevRuntime = await getModuleCode('https://esm.sh/react/jsx-dev-runtime?bundle')
  map['react/jsx-runtime'] = toBlobUrl(jsxRuntime)
  map['react/jsx-dev-runtime'] = toBlobUrl(jsxDevRuntime)

  return JSON.stringify({ imports: map }, null, 2)
}
