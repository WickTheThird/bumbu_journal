/**
 * Browser-based bundler using esbuild-wasm
 * Compiles JSX/TSX, npm packages loaded via esm.sh at runtime
 */

import * as esbuild from 'esbuild-wasm'

let initialized = false
let initializing: Promise<void> | null = null

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
        
        const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.json', '.css']
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
        }
        
        return {
          contents: content,
          loader: loaderMap[ext] || 'js',
        }
      })
    },
  }
}

export interface BundleResult {
  code: string
  error?: string
  imports: string[] // npm packages that need to be loaded
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
    return { code: '', imports: [], error: 'No entry point found (index.tsx, main.tsx, App.tsx, etc.)' }
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
    const result = await esbuild.build({
      stdin: {
        contents: fileMap.get(entry)!,
        loader: entry.endsWith('.tsx') ? 'tsx' : entry.endsWith('.ts') ? 'ts' : entry.endsWith('.jsx') ? 'jsx' : 'js',
        resolveDir: '/',
        sourcefile: entry,
      },
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      jsxImportSource: 'react',
      plugins: [localPlugin(fileMap)],
      define: {
        'process.env.NODE_ENV': '"development"',
      },
    })
    
    const code = result.outputFiles?.[0]?.text || ''
    return { code, imports: Array.from(npmImports) }
  } catch (e: any) {
    return { code: '', imports: [], error: e.message || 'Bundle failed' }
  }
}

/**
 * Generate importmap for esm.sh
 */
export function generateImportMap(imports: string[]): string {
  const map: Record<string, string> = {}
  
  for (const pkg of imports) {
    // Map package to esm.sh URL
    map[pkg] = `https://esm.sh/${pkg}`
    // Also map subpaths
    map[`${pkg}/`] = `https://esm.sh/${pkg}/`
  }
  
  // Add react/jsx-runtime for JSX automatic runtime
  map['react/jsx-runtime'] = 'https://esm.sh/react/jsx-runtime'
  map['react/jsx-dev-runtime'] = 'https://esm.sh/react/jsx-dev-runtime'
  
  return JSON.stringify({ imports: map }, null, 2)
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
