import { useState, useEffect } from 'react'
import { X, Clock, RotateCcw, Trash2 } from 'lucide-react'
import { 
  getHistory, 
  clearHistory, 
  getTimeLabel,
  compareWorkspaces,
  VersionSnapshot 
} from '../lib/history'
import { useWorkspaceStore } from '../store/workspace'
import { encodeWorkspace } from '../lib/hash'

interface HistoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<VersionSnapshot[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { workspace } = useWorkspaceStore()
  
  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory())
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const currentHash = encodeWorkspace(workspace)
  
  const handleRestore = (hash: string) => {
    window.location.hash = hash
    window.location.reload()
  }
  
  const handleClear = () => {
    if (confirm('Clear all version history?')) {
      clearHistory()
      setHistory([])
    }
  }
  
  const selectedSnapshot = selectedIndex !== null ? history[selectedIndex] : null
  const diff = selectedSnapshot 
    ? compareWorkspaces(selectedSnapshot.hash, currentHash)
    : null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ide-border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-ide-accent" />
            <h2 className="text-lg font-semibold">Version History</h2>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="p-2 rounded-lg hover:bg-ide-border/50 text-ide-muted hover:text-red-400 transition"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-ide-border transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* History list */}
          <div className="w-1/2 border-r border-ide-border overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-6 text-center text-ide-muted">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No history yet</p>
                <p className="text-sm mt-1">Snapshots are saved automatically as you edit</p>
              </div>
            ) : (
              <div className="p-2">
                {history.map((snapshot, index) => (
                  <div
                    key={snapshot.timestamp}
                    onClick={() => setSelectedIndex(index)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedIndex === index
                        ? 'bg-ide-accent/10 border border-ide-accent/30'
                        : 'hover:bg-ide-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {snapshot.label || `Snapshot ${history.length - index}`}
                      </span>
                      <span className="text-xs text-ide-muted">
                        {getTimeLabel(snapshot.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-ide-muted mt-1 font-mono truncate">
                      #{snapshot.hash.slice(0, 20)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Diff view */}
          <div className="w-1/2 overflow-y-auto p-4">
            {selectedSnapshot && diff ? (
              <div>
                <h3 className="font-semibold mb-3">Changes from selected</h3>
                
                {diff.filesAdded.length === 0 && 
                 diff.filesRemoved.length === 0 && 
                 diff.filesModified.length === 0 ? (
                  <p className="text-ide-muted text-sm">No changes</p>
                ) : (
                  <div className="space-y-3">
                    {diff.filesAdded.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-green-400 mb-1">Added</p>
                        {diff.filesAdded.map(f => (
                          <div key={f} className="text-sm text-green-400">+ {f}</div>
                        ))}
                      </div>
                    )}
                    {diff.filesRemoved.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-red-400 mb-1">Removed</p>
                        {diff.filesRemoved.map(f => (
                          <div key={f} className="text-sm text-red-400">- {f}</div>
                        ))}
                      </div>
                    )}
                    {diff.filesModified.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-yellow-400 mb-1">Modified</p>
                        {diff.filesModified.map(f => (
                          <div key={f} className="text-sm text-yellow-400">~ {f}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => handleRestore(selectedSnapshot.hash)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-ide-accent text-white hover:bg-ide-accent-glow transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore this version
                </button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-ide-muted">
                <p>Select a version to compare</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-ide-border bg-ide-surface/50">
          <p className="text-xs text-ide-muted">
            History is stored locally in your browser. Max {history.length}/50 snapshots.
          </p>
        </div>
      </div>
    </div>
  )
}
