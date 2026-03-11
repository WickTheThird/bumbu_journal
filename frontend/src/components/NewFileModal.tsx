import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'

interface NewFileModalProps {
  isOpen: boolean
  onClose: () => void
}

const fileTypes = [
  { ext: 'py', name: 'Python', icon: '🐍' },
  { ext: 'js', name: 'JavaScript', icon: '⚡' },
  { ext: 'ts', name: 'TypeScript', icon: '📘' },
  { ext: 'html', name: 'HTML', icon: '🌐' },
  { ext: 'css', name: 'CSS', icon: '🎨' },
  { ext: 'json', name: 'JSON', icon: '📋' },
  { ext: 'md', name: 'Markdown', icon: '📝' },
  { ext: 'txt', name: 'Text', icon: '📄' },
]

export default function NewFileModal({ isOpen, onClose }: NewFileModalProps) {
  const [fileName, setFileName] = useState('')
  const [selectedExt, setSelectedExt] = useState('py')
  const { createFile, workspace } = useWorkspaceStore()
  
  if (!isOpen) return null
  
  const fullName = fileName.includes('.') ? fileName : `${fileName || 'untitled'}.${selectedExt}`
  const exists = workspace.files.some(f => f.name === fullName)
  
  const handleCreate = () => {
    if (fullName && !exists) {
      createFile(fullName)
      setFileName('')
      onClose()
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ide-border">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-ide-accent" />
            <h2 className="text-lg font-semibold">New File</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ide-border transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File name input */}
          <div>
            <label className="block text-sm font-medium mb-2">File Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="untitled"
                className="flex-1 px-3 py-2 bg-ide-bg border border-ide-border rounded-lg focus:border-ide-accent focus:outline-none"
                autoFocus
              />
              <select
                value={selectedExt}
                onChange={(e) => setSelectedExt(e.target.value)}
                className="px-3 py-2 bg-ide-bg border border-ide-border rounded-lg focus:border-ide-accent focus:outline-none"
              >
                {fileTypes.map(({ ext }) => (
                  <option key={ext} value={ext}>.{ext}</option>
                ))}
              </select>
            </div>
            {exists && (
              <p className="text-red-400 text-sm mt-1">File already exists</p>
            )}
          </div>
          
          {/* Quick type selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Quick Select</label>
            <div className="grid grid-cols-4 gap-2">
              {fileTypes.map(({ ext, icon }) => (
                <button
                  key={ext}
                  onClick={() => setSelectedExt(ext)}
                  className={`p-2 rounded-lg border text-center transition ${
                    selectedExt === ext
                      ? 'border-ide-accent bg-ide-accent/10'
                      : 'border-ide-border hover:border-ide-accent/50'
                  }`}
                >
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs">.{ext}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-ide-border bg-ide-surface/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-ide-border hover:bg-ide-border/50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!fullName || exists}
            className="px-4 py-2 rounded-lg bg-ide-accent text-white hover:bg-ide-accent-glow disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
