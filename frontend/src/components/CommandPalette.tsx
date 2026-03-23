import { useState, useEffect, useRef } from 'react'
import { 
  Search, FileCode, Play, Settings, History, 
  Share2, Download, Upload, Plus, Keyboard
} from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'

interface Command {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onRun: () => void
  onSettings: () => void
  onHistory: () => void
  onImport: () => void
  onDownload: () => void
  onShare: () => void
  onShortcuts: () => void
  onNewFile?: () => void
}

export default function CommandPalette({
  isOpen,
  onClose,
  onRun,
  onSettings,
  onHistory,
  onImport,
  onDownload,
  onShare,
  onShortcuts,
  onNewFile,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { workspace, setActiveFile, createFile } = useWorkspaceStore()
  
  const commands: Command[] = [
    ...workspace.files.map((file) => ({
      id: `file:${file.name}`,
      label: file.name,
      icon: <FileCode className="w-4 h-4" />,
      action: () => {
        setActiveFile(file.name)
        onClose()
      },
    })),
    { id: 'run', label: 'Run Code', icon: <Play className="w-4 h-4" />, shortcut: '⌘↵', action: () => { onRun(); onClose() } },
    { id: 'share', label: 'Share Workspace', icon: <Share2 className="w-4 h-4" />, action: () => { onShare(); onClose() } },
    { id: 'download', label: 'Download as ZIP', icon: <Download className="w-4 h-4" />, action: () => { onDownload(); onClose() } },
    { id: 'import', label: 'Import Files', icon: <Upload className="w-4 h-4" />, action: () => { onImport(); onClose() } },
    { id: 'new', label: 'New File', icon: <Plus className="w-4 h-4" />, action: () => { onNewFile ? onNewFile() : createFile('untitled.py'); onClose() } },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, action: () => { onSettings(); onClose() } },
    { id: 'history', label: 'Version History', icon: <History className="w-4 h-4" />, action: () => { onHistory(); onClose() } },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard className="w-4 h-4" />, shortcut: '?', action: () => { onShortcuts(); onClose() } },
  ]
  
  const filtered = query
    ? commands.filter((cmd) => 
        cmd.label.toLowerCase().includes(query.toLowerCase())
      )
    : commands
  
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      inputRef.current?.focus()
    }
  }, [isOpen])
  
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[selectedIndex]?.action()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="glass rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ide-border">
          <Search className="w-5 h-5 text-ide-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files and commands..."
            className="flex-1 bg-transparent outline-none text-ide-text placeholder-ide-muted"
            autoFocus
          />
        </div>
        
        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-ide-muted">
              No results found
            </div>
          ) : (
            filtered.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition ${
                  index === selectedIndex
                    ? 'bg-ide-accent/10 text-ide-accent'
                    : 'hover:bg-ide-border/50'
                }`}
              >
                <span className="text-ide-muted">{cmd.icon}</span>
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="px-2 py-0.5 text-xs font-mono bg-ide-surface border border-ide-border rounded">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
