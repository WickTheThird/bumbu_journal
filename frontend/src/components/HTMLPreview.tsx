import { useMemo, useState, useEffect, useRef } from 'react'
import { X, Eye, RefreshCw, Loader2 } from 'lucide-react'
import { bundle, needsBundling, initBundler, generateImportMap } from '../lib/bundler'
import { marked } from 'marked'

interface HTMLPreviewProps {
  html?: string
  css?: string
  js?: string
  files?: { name: string; content: string }[]
  isOpen: boolean
  onClose: () => void
}

export default function HTMLPreview({ html, css, js, files, isOpen, onClose }: HTMLPreviewProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [bundledCode, setBundledCode] = useState<string | null>(null)
  const [bundleError, setBundleError] = useState<string | null>(null)
  const [bundleImports, setBundleImports] = useState<string[]>([])
  const [isBundling, setIsBundling] = useState(false)
  
  const isFrameworkProject = files && needsBundling(files)
  
  const markdownFile = files?.find(f => f.name.endsWith('.md') || f.name.endsWith('.mdx'))
  const isMarkdownProject = !isFrameworkProject && markdownFile && !files?.some(f => f.name.endsWith('.html'))
  
  useEffect(() => {
    if (!isOpen || !isFrameworkProject || !files) return
    
    let cancelled = false
    
    async function doBundle() {
      setIsBundling(true)
      setBundleError(null)
      
      try {
        await initBundler()
        const result = await bundle(files!)
        
        if (cancelled) return
        
        if (result.error) {
          setBundleError(result.error)
          setBundledCode(null)
          setBundleImports([])
        } else {
          setBundledCode(result.code)
          setBundleImports(result.imports)
          setBundleError(null)
        }
      } catch (e: any) {
        if (!cancelled) {
          setBundleError(e.message || 'Bundle failed')
          setBundledCode(null)
          setBundleImports([])
        }
      } finally {
        if (!cancelled) {
          setIsBundling(false)
        }
      }
    }
    
    doBundle()
    
    return () => { cancelled = true }
  }, [isOpen, files, refreshKey, isFrameworkProject])
  
  const htmlSrcdoc = useMemo(() => {
    if (isFrameworkProject) return null
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; }
    ${css || ''}
  </style>
</head>
<body>
  ${html || ''}
  ${js ? `<script>${js}<\/script>` : ''}
  <script>
    // Handle anchor links within srcdoc iframe
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        } else if (href && !href.startsWith('javascript:')) {
          e.preventDefault();
          // External links open in new tab
          window.open(href, '_blank', 'noopener');
        }
      }
    });
  <\/script>
</body>
</html>`
  }, [html, css, js, refreshKey, isFrameworkProject])
  
  const frameworkSrcdoc = useMemo(() => {
    if (!isFrameworkProject || !bundledCode) return null
    
    const htmlFile = files?.find(f => f.name.endsWith('.html'))
    const cssFile = files?.find(f => f.name.endsWith('.css'))
    
    const htmlContent = htmlFile?.content || '<div id="root"></div>'
    const cssContent = cssFile?.content || ''
    
    let bodyContent = htmlContent
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    if (bodyMatch) {
      bodyContent = bodyMatch[1]
    }
    
    const importMap = generateImportMap(bundleImports)
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="importmap">
${importMap}
  <\/script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: system-ui, sans-serif; margin: 0; }
    #root { min-height: 100vh; }
    ${cssContent}
  </style>
</head>
<body>
  ${bodyContent.includes('id="root"') ? bodyContent : '<div id="root"></div>'}
  <script>
    // Handle anchor links within srcdoc iframe
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        } else if (href && !href.startsWith('javascript:')) {
          e.preventDefault();
          window.open(href, '_blank', 'noopener');
        }
      }
    });
  <\/script>
  <script type="module">
    ${bundledCode}
  <\/script>
</body>
</html>`
  }, [bundledCode, bundleImports, files, isFrameworkProject])
  
  const markdownSrcdoc = useMemo(() => {
    if (!isMarkdownProject || !markdownFile) return null
    
    const cssFile = files?.find(f => f.name.endsWith('.css'))
    const htmlContent = marked(markdownFile.content) as string
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html { scroll-behavior: smooth; }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      margin: 0; 
      padding: 24px;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f6f8fa; }
    ${cssFile?.content || ''}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`
  }, [markdownFile, files, isMarkdownProject, refreshKey])
  
  const srcdoc = isFrameworkProject ? frameworkSrcdoc : (isMarkdownProject ? markdownSrcdoc : htmlSrcdoc)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  useEffect(() => {
    const handleResize = () => {
      if (iframeRef.current) {
        const iframe = iframeRef.current
        iframe.style.height = '0'
        requestAnimationFrame(() => {
          iframe.style.height = '100%'
        })
      }
    }
    
    window.addEventListener('resize', handleResize)
    const observer = new ResizeObserver(handleResize)
    if (iframeRef.current?.parentElement) {
      observer.observe(iframeRef.current.parentElement)
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <div className="flex flex-col h-full border-l border-ide-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-ide-surface border-b border-ide-border">
        <div className="flex items-center gap-2 text-ide-text">
          <Eye className="w-4 h-4 text-ide-accent" />
          <span className="text-sm font-medium">Preview</span>
          {isFrameworkProject && (
            <span className="text-xs bg-ide-accent/20 text-ide-accent px-1.5 py-0.5 rounded">React</span>
          )}
          {isBundling && (
            <Loader2 className="w-3 h-3 animate-spin text-ide-muted" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-1.5 rounded hover:bg-ide-border transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-ide-muted" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-ide-border transition"
          >
            <X className="w-4 h-4 text-ide-muted" />
          </button>
        </div>
      </div>
      
      {/* Error display */}
      {bundleError && (
        <div className="p-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm font-mono whitespace-pre-wrap">
          {bundleError}
        </div>
      )}
      
      {/* Loading state */}
      {isBundling && !bundledCode && (
        <div className="flex-1 flex items-center justify-center bg-ide-bg text-ide-muted">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Bundling...</span>
          </div>
        </div>
      )}
      
      {/* Preview iframe */}
      {srcdoc && (
        <iframe
          ref={iframeRef}
          key={refreshKey}
          srcDoc={srcdoc}
          className="flex-1 bg-white"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          sandbox="allow-scripts allow-same-origin"
          title="Preview"
        />
      )}
    </div>
  )
}
