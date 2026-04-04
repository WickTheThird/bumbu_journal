/**
 * Browser-based bundler using esbuild-wasm
 * Compiles JSX/TSX, npm packages loaded via esm.sh at runtime
 * Supports: React, Preact, Vue 3 (JSX), Solid, Svelte
 */

import * as esbuild from 'esbuild-wasm'

let initialized = false
let initializing: Promise<void> | null = null

// ── Framework detection ─────────────────────────────

export type Framework = 'react' | 'preact' | 'vue' | 'svelte' | 'solid' | 'unknown'

/**
 * Detect which framework a project uses from package.json dependencies
 * Priority: preact > solid-js > vue > svelte > react
 * (preact before react because preact projects may include react as compat)
 */
export function detectFramework(fileMap: Map<string, string>): Framework {
  const pkgContent = fileMap.get('/package.json')
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent)
      const deps = { ...pkg.dependencies, ...pkg.peerDependencies }
      if (deps['preact']) return 'preact'
      if (deps['solid-js']) return 'solid'
      if (deps['vue']) return 'vue'
      if (deps['svelte']) return 'svelte'
      if (deps['react']) return 'react'
    } catch {}
  }

  // Fallback: detect from file extensions
  for (const [path] of fileMap) {
    if (path.endsWith('.svelte')) return 'svelte'
  }

  return 'react' // safe default
}

const JSX_IMPORT_SOURCE: Record<Framework, string> = {
  react: 'react',
  preact: 'preact',
  vue: 'vue',
  solid: 'solid-js',
  svelte: 'svelte',
  unknown: 'react',
}

// ── Svelte compilation ──────────────────────────────

let svelteCompiler: any = null

async function loadSvelteCompiler(): Promise<any> {
  if (svelteCompiler) return svelteCompiler
  // Dynamic import from esm.sh CDN
  const url = 'https://esm.sh/svelte@4.2.18/compiler'
  try {
    svelteCompiler = await (Function('url', 'return import(url)')(url))
  } catch {
    // Fallback: fetch + blob URL
    const res = await fetch(url)
    const text = await res.text()
    const blob = new Blob([text], { type: 'application/javascript' })
    svelteCompiler = await (Function('url', 'return import(url)')(URL.createObjectURL(blob)))
  }
  return svelteCompiler
}

async function compileSvelteFiles(fileMap: Map<string, string>): Promise<void> {
  const svelteFiles = Array.from(fileMap.entries()).filter(([p]) => p.endsWith('.svelte'))
  if (svelteFiles.length === 0) return

  const compiler = await loadSvelteCompiler()

  for (const [path, content] of svelteFiles) {
    try {
      const result = compiler.compile(content, {
        filename: path.split('/').pop(),
        generate: 'dom',
        css: 'injected',
        dev: false,
        sveltePath: 'svelte',
      })

      // Replace .svelte content with compiled JS
      fileMap.set(path, result.js.code)
    } catch (e: any) {
      console.error(`Svelte compile error for ${path}:`, e)
      fileMap.set(path, `console.error("Svelte compile error: ${e.message?.replace(/"/g, '\\"') || 'unknown'}")`)
    }
  }
}

// ── esbuild init ────────────────────────────────────

/**
 * Initialize esbuild WASM
 */
export async function initBundler(): Promise<void> {
  if (initialized) return
  if (initializing) return initializing

  initializing = (async () => {
    try {
      await esbuild.initialize({
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.27.4/esbuild.wasm',
        worker: true,
      })
    } catch (e: any) {
      if (e.message?.includes('Worker') || e.message?.includes('go')) {
        await esbuild.initialize({
          wasmURL: 'https://unpkg.com/esbuild-wasm@0.27.4/esbuild.wasm',
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

// ── esbuild plugin ──────────────────────────────────

/**
 * Plugin to handle local files and external npm packages
 */
function localPlugin(files: Map<string, string>): esbuild.Plugin {
  return {
    name: 'local-files',
    setup(build) {
      build.onResolve({ filter: /^[^./]/ }, (args) => {
        return {
          path: args.path,
          external: true,
        }
      })

      build.onResolve({ filter: /^\./ }, (args) => {
        const dir = args.importer ? args.importer.replace(/\/[^/]+$/, '') : ''
        let path = `${dir}/${args.path}`.replace(/\/\.\//g, '/')

        const parts = path.split('/').filter(Boolean)
        const normalized: string[] = []
        for (const part of parts) {
          if (part === '..') normalized.pop()
          else if (part !== '.') normalized.push(part)
        }
        path = '/' + normalized.join('/')

        const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.json', '.css', '.svelte']
        for (const ext of extensions) {
          const fullPath = path + ext
          if (files.has(fullPath)) {
            return { path: fullPath, namespace: 'local' }
          }
        }

        for (const ext of ['/index.tsx', '/index.ts', '/index.jsx', '/index.js']) {
          const fullPath = path + ext
          if (files.has(fullPath)) {
            return { path: fullPath, namespace: 'local' }
          }
        }

        return { path, namespace: 'local' }
      })

      build.onResolve({ filter: /^\// }, (args) => {
        if (files.has(args.path)) {
          return { path: args.path, namespace: 'local' }
        }
        return { path: args.path, namespace: 'local' }
      })

      build.onLoad({ filter: /.*/, namespace: 'local' }, (args) => {
        const content = files.get(args.path)
        if (!content) {
          return { contents: `console.error("File not found: ${args.path}")`, loader: 'js' }
        }

        const ext = args.path.split('.').pop() || ''
        const loaderMap: Record<string, esbuild.Loader> = {
          'tsx': 'tsx',
          'ts': 'ts',
          'jsx': 'jsx',
          'js': 'js',
          'json': 'json',
          'css': 'css',
          'svelte': 'js', // compiled svelte is JS
        }

        return {
          contents: content,
          loader: loaderMap[ext] || 'js',
        }
      })
    },
  }
}

// ── Bundle ───────────────────────────────────────────

export interface BundleResult {
  code: string
  error?: string
  imports: string[]
  framework: Framework
}

/**
 * Bundle a project's files into a single JS bundle
 */
export async function bundle(files: { name: string; content: string }[]): Promise<BundleResult> {
  await initBundler()

  const fileMap = new Map<string, string>()
  for (const file of files) {
    const path = file.name.startsWith('/') ? file.name : '/' + file.name
    fileMap.set(path, file.content)
  }

  // Detect framework before any compilation
  const framework = detectFramework(fileMap)

  // Pre-compile Svelte files
  if (framework === 'svelte') {
    await compileSvelteFiles(fileMap)
  }

  const entryPoints = [
    '/src/main.tsx', '/src/main.ts', '/src/main.jsx', '/src/main.js',
    '/src/index.tsx', '/src/index.ts', '/src/index.jsx', '/src/index.js',
    '/index.tsx', '/index.ts', '/index.jsx', '/index.js',
    '/main.tsx', '/main.ts', '/main.jsx', '/main.js',
    '/src/App.tsx', '/src/App.jsx', '/App.tsx', '/App.jsx'
  ]
  let entry: string | null = null

  for (const ep of entryPoints) {
    if (fileMap.has(ep)) {
      entry = ep
      break
    }
  }

  if (!entry) {
    for (const [path] of fileMap) {
      if (path.endsWith('.tsx') || path.endsWith('.jsx')) {
        entry = path
        break
      }
    }
  }

  if (!entry) {
    return { code: '', imports: [], error: 'No entry point found (index.tsx, main.tsx, App.tsx, etc.)', framework }
  }

  const npmImports = new Set<string>()

  const pkgJsonContent = fileMap.get('/package.json')
  if (pkgJsonContent) {
    try {
      const pkgJson = JSON.parse(pkgJsonContent)
      const deps = { ...pkgJson.dependencies }
      for (const pkg of Object.keys(deps)) {
        npmImports.add(pkg)
      }
    } catch (e) {
    }
  }

  for (const [path, content] of fileMap) {
    if (!/\.(tsx?|jsx?|mjs)$/.test(path)) continue
    const importMatches = content.matchAll(/import\s+(?:.*?\s+from\s+)?['"]([^.\/][^'"]*)['"]/g)
    for (const match of importMatches) {
      const specifier = match[1]
      const pkg = specifier.startsWith('@')
        ? specifier.split('/').slice(0, 2).join('/')
        : specifier.split('/')[0]
      npmImports.add(pkg)
    }
  }

  try {
    const entryContent = fileMap.get(entry)!
    const entryExt = entry.split('.').pop() || 'js'
    const loaderForEntry: esbuild.Loader =
      entryExt === 'tsx' ? 'tsx' :
      entryExt === 'ts' ? 'ts' :
      entryExt === 'jsx' ? 'jsx' : 'js'

    const result = await esbuild.build({
      stdin: {
        contents: entryContent,
        loader: loaderForEntry,
        resolveDir: '/',
        sourcefile: entry,
      },
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      jsxImportSource: JSX_IMPORT_SOURCE[framework],
      plugins: [localPlugin(fileMap)],
      define: {
        'process.env.NODE_ENV': '"development"',
      },
    })

    const code = result.outputFiles?.[0]?.text || ''
    return { code, imports: Array.from(npmImports), framework }
  } catch (e: any) {
    return { code: '', imports: [], error: e.message || 'Bundle failed', framework }
  }
}

// ── Import map ──────────────────────────────────────

const JSX_RUNTIME_MAPPINGS: Record<Framework, [string, string][]> = {
  react: [
    ['react/jsx-runtime', 'https://esm.sh/react/jsx-runtime'],
    ['react/jsx-dev-runtime', 'https://esm.sh/react/jsx-dev-runtime'],
  ],
  preact: [
    ['preact/jsx-runtime', 'https://esm.sh/preact/jsx-runtime'],
    ['preact/jsx-dev-runtime', 'https://esm.sh/preact/jsx-dev-runtime'],
  ],
  vue: [
    ['vue/jsx-runtime', 'https://esm.sh/vue/jsx-runtime'],
  ],
  solid: [
    ['solid-js/jsx-runtime', 'https://esm.sh/solid-js/jsx-runtime'],
  ],
  svelte: [
    ['svelte/internal', 'https://esm.sh/svelte@4.2.18/internal'],
    ['svelte', 'https://esm.sh/svelte@4.2.18'],
  ],
  unknown: [
    ['react/jsx-runtime', 'https://esm.sh/react/jsx-runtime'],
    ['react/jsx-dev-runtime', 'https://esm.sh/react/jsx-dev-runtime'],
  ],
}

/**
 * Generate importmap for esm.sh
 */
export function generateImportMap(imports: string[], framework: Framework = 'react'): string {
  const map: Record<string, string> = {}

  for (const pkg of imports) {
    map[pkg] = `https://esm.sh/${pkg}`
    map[`${pkg}/`] = `https://esm.sh/${pkg}/`
  }

  // Add framework-specific JSX runtime mappings
  for (const [key, url] of JSX_RUNTIME_MAPPINGS[framework] || JSX_RUNTIME_MAPPINGS.unknown) {
    map[key] = url
  }

  return JSON.stringify({ imports: map }, null, 2)
}

/**
 * Check if a project needs bundling (has JSX/TSX/Svelte files)
 */
export function needsBundling(files: { name: string }[]): boolean {
  return files.some(f =>
    f.name.endsWith('.tsx') ||
    f.name.endsWith('.jsx') ||
    f.name.endsWith('.ts') ||
    f.name.endsWith('.svelte')
  )
}
