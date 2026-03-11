import { useMemo, useState } from 'react'
import { X, Eye, RefreshCw } from 'lucide-react'

interface HTMLPreviewProps {
  html: string
  css?: string
  js?: string
  isOpen: boolean
  onClose: () => void
}

export default function HTMLPreview({ html, css, js, isOpen, onClose }: HTMLPreviewProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  
  const srcdoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; }
    ${css || ''}
  </style>
</head>
<body>
  ${html}
  ${js ? `<script>${js}<\/script>` : ''}
</body>
</html>`
  }, [html, css, js, refreshKey])
  
  if (!isOpen) return null
  
  return (
    <div className="flex flex-col h-full border-l border-ide-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-ide-surface border-b border-ide-border">
        <div className="flex items-center gap-2 text-ide-text">
          <Eye className="w-4 h-4 text-ide-accent" />
          <span className="text-sm font-medium">Preview</span>
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
      
      {/* Preview iframe */}
      <iframe
        key={refreshKey}
        srcDoc={srcdoc}
        className="flex-1 w-full bg-white"
        sandbox="allow-scripts"
        title="HTML Preview"
      />
    </div>
  )
}
