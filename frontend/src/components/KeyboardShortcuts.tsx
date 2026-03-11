import { X, Keyboard } from 'lucide-react'

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: ['Ctrl', 'Enter'], description: 'Run code' },
  { keys: ['Ctrl', 'S'], description: 'Save to URL (auto-saves)' },
  { keys: ['Ctrl', 'N'], description: 'New file' },
  { keys: ['Ctrl', '/'], description: 'Toggle comment' },
  { keys: ['Ctrl', 'F'], description: 'Find' },
  { keys: ['Ctrl', 'H'], description: 'Find and replace' },
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['Ctrl', 'D'], description: 'Select word / next occurrence' },
  { keys: ['Alt', '↑'], description: 'Move line up' },
  { keys: ['Alt', '↓'], description: 'Move line down' },
  { keys: ['Ctrl', 'Shift', 'K'], description: 'Delete line' },
  { keys: ['Ctrl', '['], description: 'Outdent line' },
  { keys: ['Ctrl', ']'], description: 'Indent line' },
  { keys: ['F1'], description: 'Command palette' },
]

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ide-border">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-ide-accent" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ide-border transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Shortcuts list */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {shortcuts.map(({ keys, description }) => (
              <div
                key={description}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-ide-border/30"
              >
                <span className="text-sm text-ide-muted">{description}</span>
                <div className="flex items-center gap-1">
                  {keys.map((key, i) => (
                    <span key={i}>
                      <kbd className="px-2 py-1 text-xs font-mono bg-ide-surface border border-ide-border rounded">
                        {key}
                      </kbd>
                      {i < keys.length - 1 && (
                        <span className="mx-1 text-ide-muted">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-ide-border bg-ide-surface/50">
          <p className="text-xs text-ide-muted text-center">
            Press <kbd className="px-1.5 py-0.5 mx-1 text-xs font-mono bg-ide-bg border border-ide-border rounded">?</kbd> to toggle this panel
          </p>
        </div>
      </div>
    </div>
  )
}
