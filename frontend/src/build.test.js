import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const docsDir = resolve(__dirname, '../../docs')

describe('Build Output', () => {
  it('docs directory exists', () => {
    expect(existsSync(docsDir)).toBe(true)
  })

  it('index.html exists in docs', () => {
    const indexPath = resolve(docsDir, 'index.html')
    expect(existsSync(indexPath)).toBe(true)
  })

  it('index.html contains required elements', () => {
    const indexPath = resolve(docsDir, 'index.html')
    const content = readFileSync(indexPath, 'utf-8')
    
    expect(content).toContain('<!doctype html>')
    expect(content).toContain('<div id="app">')
    expect(content).toContain('/docs/')
  })

  it('assets directory exists with JS and CSS', () => {
    const assetsDir = resolve(docsDir, 'assets')
    expect(existsSync(assetsDir)).toBe(true)
    
    const files = readdirSync(assetsDir)
    const hasJS = files.some(f => f.endsWith('.js'))
    const hasCSS = files.some(f => f.endsWith('.css'))
    
    expect(hasJS).toBe(true)
    expect(hasCSS).toBe(true)
  })

  it('base path is correctly set for GitHub Pages', () => {
    const indexPath = resolve(docsDir, 'index.html')
    const content = readFileSync(indexPath, 'utf-8')
    
    // All asset references should use /docs/ base
    expect(content).toContain('href="/docs/')
    expect(content).toContain('src="/docs/')
  })
})
