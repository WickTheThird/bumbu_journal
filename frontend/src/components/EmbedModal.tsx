import { useState } from 'react'
import { X, Copy, Check, Code, Eye, Columns, Moon, Sun } from 'lucide-react'

interface EmbedModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EmbedModal({ isOpen, onClose }: EmbedModalProps) {
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState<'editor' | 'preview' | 'split'>('split')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [hideHeader, setHideHeader] = useState(false)
  const [hideExplorer, setHideExplorer] = useState(false)
  const [height, setHeight] = useState(400)

  if (!isOpen) return null

  // Get current hash
  const currentHash = window.location.hash.slice(1)
  
  // Build embed URL with options
  const params = new URLSearchParams()
  if (view !== 'split') params.set('view', view)
  if (theme !== 'dark') params.set('theme', theme)
  if (hideHeader) params.set('hideHeader', 'true')
  if (hideExplorer) params.set('hideExplorer', 'true')
  
  const queryString = params.toString()
  const embedUrl = `${window.location.origin}/embed${queryString ? '?' + queryString : ''}#${currentHash}`
  
  const iframeCode = `<iframe
  src="${embedUrl}"
  width="100%"
  height="${height}"
  frameborder="0"
  allow="clipboard-write"
  loading="lazy"
></iframe>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-ide-surface border border-ide-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ide-border">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-ide-accent" />
            <h2 className="font-semibold">Embed Project</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-ide-border/50 transition text-ide-muted hover:text-ide-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* View mode */}
          <div>
            <label className="block text-sm text-ide-muted mb-2">View</label>
            <div className="flex gap-2">
              <button
                onClick={() => setView('editor')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  view === 'editor' 
                    ? 'border-ide-accent bg-ide-accent/10 text-ide-accent' 
                    : 'border-ide-border hover:border-ide-accent/50'
                }`}
              >
                <Code className="w-4 h-4" />
                Editor
              </button>
              <button
                onClick={() => setView('preview')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  view === 'preview' 
                    ? 'border-ide-accent bg-ide-accent/10 text-ide-accent' 
                    : 'border-ide-border hover:border-ide-accent/50'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setView('split')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  view === 'split' 
                    ? 'border-ide-accent bg-ide-accent/10 text-ide-accent' 
                    : 'border-ide-border hover:border-ide-accent/50'
                }`}
              >
                <Columns className="w-4 h-4" />
                Split
              </button>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm text-ide-muted mb-2">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  theme === 'dark' 
                    ? 'border-ide-accent bg-ide-accent/10 text-ide-accent' 
                    : 'border-ide-border hover:border-ide-accent/50'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  theme === 'light' 
                    ? 'border-ide-accent bg-ide-accent/10 text-ide-accent' 
                    : 'border-ide-border hover:border-ide-accent/50'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm text-ide-muted mb-2">Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value) || 400)}
              min={200}
              max={800}
              className="w-24 px-3 py-2 bg-ide-bg border border-ide-border rounded-lg focus:border-ide-accent focus:outline-none"
            />
          </div>

          {/* Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideHeader}
                onChange={(e) => setHideHeader(e.target.checked)}
                className="rounded border-ide-border bg-ide-bg"
              />
              <span className="text-sm text-ide-muted">Hide header</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideExplorer}
                onChange={(e) => setHideExplorer(e.target.checked)}
                className="rounded border-ide-border bg-ide-bg"
              />
              <span className="text-sm text-ide-muted">Hide explorer</span>
            </label>
          </div>

          {/* Code output */}
          <div>
            <label className="block text-sm text-ide-muted mb-2">Embed code</label>
            <div className="relative">
              <pre className="p-3 bg-ide-bg border border-ide-border rounded-lg text-xs font-mono overflow-x-auto text-ide-muted">
                {iframeCode}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-ide-surface hover:bg-ide-border rounded-lg transition"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-ide-muted" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-ide-border flex justify-between items-center">
          <p className="text-xs text-ide-muted">
            Embeds work on any website that allows iframes
          </p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ide-accent text-white hover:bg-ide-accent-glow transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy code'}
          </button>
        </div>
      </div>
    </div>
  )
}
