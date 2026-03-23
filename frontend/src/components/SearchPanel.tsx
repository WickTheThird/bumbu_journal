import { useState, useEffect } from 'react'
import { X, Search, FileCode } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'

interface SearchResult {
  fileName: string
  lineNumber: number
  line: string
  matchStart: number
  matchEnd: number
}

interface SearchPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const { workspace, setActiveFile } = useWorkspaceStore()
  
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    
    const searchResults: SearchResult[] = []
    const searchLower = query.toLowerCase()
    
    for (const file of workspace.files) {
      const lines = file.content.split('\n')
      lines.forEach((line, index) => {
        const lineLower = line.toLowerCase()
        const matchIndex = lineLower.indexOf(searchLower)
        if (matchIndex !== -1) {
          searchResults.push({
            fileName: file.name,
            lineNumber: index + 1,
            line: line,
            matchStart: matchIndex,
            matchEnd: matchIndex + query.length,
          })
        }
      })
    }
    
    setResults(searchResults.slice(0, 100)) // Limit results
  }, [query, workspace.files])
  
  const handleResultClick = (result: SearchResult) => {
    setActiveFile(result.fileName)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-xl w-full max-w-2xl mx-4 max-h-[70vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ide-border">
          <Search className="w-5 h-5 text-ide-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in all files..."
            className="flex-1 bg-transparent outline-none text-ide-text placeholder-ide-muted"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-ide-border transition"
          >
            <X className="w-4 h-4 text-ide-muted" />
          </button>
        </div>
        
        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {query && results.length === 0 && (
            <div className="p-8 text-center text-ide-muted">
              No results found
            </div>
          )}
          {results.map((result, index) => (
            <button
              key={`${result.fileName}-${result.lineNumber}-${index}`}
              onClick={() => handleResultClick(result)}
              className="w-full flex items-start gap-3 px-4 py-2 hover:bg-ide-border/50 text-left border-b border-ide-border/50"
            >
              <FileCode className="w-4 h-4 text-ide-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{result.fileName}</span>
                  <span className="text-ide-muted">:{result.lineNumber}</span>
                </div>
                <div className="text-sm text-ide-muted font-mono truncate">
                  {result.line.slice(0, result.matchStart)}
                  <span className="bg-yellow-500/30 text-yellow-300">
                    {result.line.slice(result.matchStart, result.matchEnd)}
                  </span>
                  {result.line.slice(result.matchEnd)}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-ide-border bg-ide-surface/50">
            <p className="text-xs text-ide-muted">
              {results.length} result{results.length !== 1 ? 's' : ''} found
              {results.length === 100 && ' (showing first 100)'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
