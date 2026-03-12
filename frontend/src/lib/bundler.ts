/**
 * Browser-based bundler using esbuild-wasm
 * Compiles JSX/TSX and resolves npm deps via esm.sh
 */

import * as esbuild from 'esbuild-wasm'

let initialized = false
let initializing: Promise<void> | null = null

const ESM_SH = 'https://esm.sh'

// IndexedDB cache for dependencies
const DB_NAME = 'hashide-deps'
const STORE_NAME = 'modules'

async function openCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
  })
}

async function getCached(key: string): Promise<string | null> {
  try {
    const db = await openCache()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function setCache(key: string, value: string): Promise<void> {
  try {
    const db = await openCache()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(value, key)
  } catch {
    // Cache failures are non-fatal
  }
}

/**
 * Initialize esbuild WASM
 */
export async function initBundler(): Promise<void> {
  if (initialized) return
  if (initializing) return initializing
  
  initializing = (async () => {
    try {
      await esbuild.initialize({
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.24.0/esbuild.wasm',
        worker: true,
      })
    } catch (e: any) {
      // If worker fails, try without worker
      if (e.message?.includes('Worker')) {
        await esbuild.initialize({
          wasmURL: 'https://unpkg.com/esbuild-wasm@0.24.0/esbuild.wasm',
          worker: false,
        })
      } else {
        throw e
      }
    }
  })()
  
  await initializing
  initialized = true
}

/**
 * Fetch module from esm.sh with caching
 */
async function fetchModule(url: string): Promise<string> {
  // Check cache first
  const cached = await getCached(url)
  if (cached) return cached
  
  // Fetch from CDN
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  
  const content = await response.text()
  
  // Cache for future use
  await setCache(url, content)
  
  return content
}

/**
 * Plugin to resolve npm imports via esm.sh
 */
function esmPlugin(files: Map<string, string>): esbuild.Plugin {
  return {
    name: 'esm-sh',
    setup(build) {
      // Handle relative imports from local files
      build.onResolve({ filter: /^\./ }, (args) => {
        // Resolve relative path
        const dir = args.importer.replace(/\/[^/]+$/, '')
        let path = `${dir}/${args.path}`.replace(/\/\.\//g, '/')
        
        // Normalize path
        const parts = path.split('/').filter(Boolean)
        const normalized: string[] = []
        for (const part of parts) {
          if (part === '..') normalized.pop()
          else if (part !== '.') normalized.push(part)
        }
        path = '/' + normalized.join('/')
        
        // Try with extensions
        const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.json', '.css']
        for (const ext of extensions) {
          const fullPath = path + ext
          if (files.has(fullPath)) {
            return { path: fullPath, namespace: 'local' }
          }
        }
        
        // Try index files
        for (const ext of ['/index.tsx', '/index.ts', '/index.jsx', '/index.js']) {
          const fullPath = path + ext
          if (files.has(fullPath)) {
            return { path: fullPath, namespace: 'local' }
          }
        }
        
        return { path, namespace: 'local' }
      })
      
      // Handle npm package imports
      build.onResolve({ filter: /^[^./]/ }, (args) => {
        return {
          path: args.path,
          namespace: 'esm-sh',
        }
      })
      
      // Load local files
      build.onLoad({ filter: /.*/, namespace: 'local' }, (args) => {
        const content = files.get(args.path)
        if (!content) {
          return { contents: '', loader: 'empty' }
        }
        
        const ext = args.path.split('.').pop() || ''
        const loaderMap: Record<string, esbuild.Loader> = {
          'tsx': 'tsx',
          'ts': 'ts',
          'jsx': 'jsx',
          'js': 'js',
          'json': 'json',
          'css': 'css',
        }
        
        return {
          contents: content,
          loader: loaderMap[ext] || 'js',
        }
      })
      
      // Load npm packages from esm.sh
      build.onLoad({ filter: /.*/, namespace: 'esm-sh' }, async (args) => {
        const url = `${ESM_SH}/${args.path}`
        
        try {
          const content = await fetchModule(url)
          return { contents: content, loader: 'js' }
        } catch (e) {
          return { contents: `console.error("Failed to load ${args.path}")`, loader: 'js' }
        }
      })
    },
  }
}

export interface BundleResult {
  code: string
  error?: string
}

/**
 * Bundle a project's files into a single JS bundle
 */
export async function bundle(files: { name: string; content: string }[]): Promise<BundleResult> {
  await initBundler()
  
  // Create file map with leading slash
  const fileMap = new Map<string, string>()
  for (const file of files) {
    const path = file.name.startsWith('/') ? file.name : '/' + file.name
    fileMap.set(path, file.content)
  }
  
  // Find entry point
  const entryPoints = ['/index.tsx', '/index.ts', '/index.jsx', '/index.js', '/main.tsx', '/main.ts', '/main.jsx', '/main.js', '/App.tsx', '/App.jsx']
  let entry: string | null = null
  
  for (const ep of entryPoints) {
    if (fileMap.has(ep)) {
      entry = ep
      break
    }
  }
  
  if (!entry) {
    // If no standard entry, try to find any tsx/jsx file
    for (const [path] of fileMap) {
      if (path.endsWith('.tsx') || path.endsWith('.jsx')) {
        entry = path
        break
      }
    }
  }
  
  if (!entry) {
    return { code: '', error: 'No entry point found (index.tsx, main.tsx, App.tsx, etc.)' }
  }
  
  try {
    const result = await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      jsxImportSource: 'react',
      plugins: [esmPlugin(fileMap)],
      define: {
        'process.env.NODE_ENV': '"development"',
      },
    })
    
    const code = result.outputFiles?.[0]?.text || ''
    return { code }
  } catch (e: any) {
    return { code: '', error: e.message || 'Bundle failed' }
  }
}

/**
 * Check if a project needs bundling (has JSX/TSX files)
 */
export function needsBundling(files: { name: string }[]): boolean {
  return files.some(f => 
    f.name.endsWith('.tsx') || 
    f.name.endsWith('.jsx') ||
    f.name.endsWith('.ts')
  )
}
