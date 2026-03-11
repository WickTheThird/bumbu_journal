import { X } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { workspace, updateSettings } = useWorkspaceStore()
  const settings = workspace.settings ?? {
    theme: 'dark' as const,
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ide-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-ide-border transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Settings */}
        <div className="p-6 space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={settings.fontSize}
              onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
              className="w-full accent-ide-accent"
            />
            <div className="flex justify-between text-xs text-ide-muted mt-1">
              <span>10px</span>
              <span>24px</span>
            </div>
          </div>
          
          {/* Tab Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Tab Size</label>
            <div className="flex gap-2">
              {[2, 4, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => updateSettings({ tabSize: size })}
                  className={`flex-1 py-2 rounded-lg border transition ${
                    settings.tabSize === size
                      ? 'border-ide-accent bg-ide-accent/10 text-ide-accent'
                      : 'border-ide-border hover:border-ide-accent/50'
                  }`}
                >
                  {size} spaces
                </button>
              ))}
            </div>
          </div>
          
          {/* Word Wrap */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium">Word Wrap</label>
              <p className="text-xs text-ide-muted">Wrap long lines to fit the editor width</p>
            </div>
            <button
              onClick={() => updateSettings({ wordWrap: !settings.wordWrap })}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.wordWrap ? 'bg-ide-accent' : 'bg-ide-border'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.wordWrap ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSettings({ theme })}
                  className={`flex-1 py-2 rounded-lg border transition capitalize ${
                    settings.theme === theme
                      ? 'border-ide-accent bg-ide-accent/10 text-ide-accent'
                      : 'border-ide-border hover:border-ide-accent/50'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
            <p className="text-xs text-ide-muted mt-2">
              Note: Light theme coming soon
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-ide-border bg-ide-surface/50">
          <p className="text-xs text-ide-muted text-center">
            Settings are saved in the URL hash automatically
          </p>
        </div>
      </div>
    </div>
  )
}
