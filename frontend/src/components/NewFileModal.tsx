import { useState } from 'react'
import { X, FileCode, FileJson, FileText, File, Folder, Globe, Palette } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'

interface NewFileModalProps {
  isOpen: boolean
  onClose: () => void
}

const fileTypes = [
  { ext: 'py', name: 'Python', icon: FileCode },
  { ext: 'js', name: 'JavaScript', icon: FileCode },
  { ext: 'ts', name: 'TypeScript', icon: FileCode },
  { ext: 'html', name: 'HTML', icon: Globe },
  { ext: 'css', name: 'CSS', icon: Palette },
  { ext: 'json', name: 'JSON', icon: FileJson },
  { ext: 'md', name: 'Markdown', icon: FileText },
  { ext: 'txt', name: 'Text', icon: File },
]

export default function NewFileModal({ isOpen, onClose }: NewFileModalProps) {
  const [filePath, setFilePath] = useState('')
  const [selectedExt, setSelectedExt] = useState('py')
  const { createFile, workspace } = useWorkspaceStore()
  
  if (!isOpen) return null
  
  // Support folder paths like "utils/helpers.py" or "src/components/Button.tsx"
  const normalizedPath = filePath.trim().replace(/\\/g, '/')
  const hasExtension = /\.\w+$/.test(normalizedPath)
  const fullPath = hasExtension ? normalizedPath : `${normalizedPath || 'untitled'}.${selectedExt}`
  const exists = workspace.files.some(f => f.name === fullPath)
  const isFolder = normalizedPath.endsWith('/')
  
  // Extract folder hint from path
  const pathParts = fullPath.split('/')
  const hasFolder = pathParts.length > 1
  
  const handleCreate = () => {
    if (fullPath && !exists && !isFolder) {
      createFile(fullPath)
      setFilePath('')
      onClose()
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-ide-surface border border-ide-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ide-border">
          <h2 className="font-semibold">New File</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ide-border/50 transition text-ide-muted hover:text-ide-text">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-5">
          {/* File path input */}
          <div>
            <label className="block text-sm text-ide-muted mb-2">Path</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="filename or folder/filename"
                className="flex-1 px-3 py-2.5 bg-ide-bg border border-ide-border rounded-lg focus:border-ide-accent focus:outline-none text-sm font-mono"
                autoFocus
              />
              {!hasExtension && (
                <select
                  value={selectedExt}
                  onChange={(e) => setSelectedExt(e.target.value)}
                  className="px-3 py-2.5 bg-ide-bg border border-ide-border rounded-lg focus:border-ide-accent focus:outline-none text-sm"
                >
                  {fileTypes.map(({ ext }) => (
                    <option key={ext} value={ext}>.{ext}</option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Preview */}
            <div className="mt-2 flex items-center gap-2 text-xs text-ide-muted">
              {hasFolder ? <Folder className="w-3 h-3" /> : <FileCode className="w-3 h-3" />}
              <span className="font-mono">{fullPath}</span>
            </div>
            
            {exists && (
              <p className="text-red-400 text-xs mt-2">File already exists</p>
            )}
            {isFolder && (
              <p className="text-yellow-400 text-xs mt-2">Enter a filename, not just a folder</p>
            )}
          </div>
          
          {/* File type grid */}
          <div>
            <label className="block text-sm text-ide-muted mb-2">Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {fileTypes.map(({ ext, icon: Icon }) => (
                <button
                  key={ext}
                  onClick={() => setSelectedExt(ext)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition ${
                    selectedExt === ext
                      ? 'border-ide-accent bg-ide-accent/10 text-ide-accent'
                      : 'border-ide-border/50 hover:border-ide-border text-ide-muted hover:text-ide-text'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-mono">.{ext}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Folder hint */}
          <div className="text-xs text-ide-muted bg-ide-bg/50 rounded-lg p-3 border border-ide-border/50">
            <p className="font-medium text-ide-text mb-1">Folder support</p>
            <p>Use forward slashes to create folders:</p>
            <code className="block mt-1 text-ide-accent">utils/helpers.py</code>
            <code className="block">src/components/Button.tsx</code>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-5 py-4 border-t border-ide-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-ide-muted hover:text-ide-text hover:bg-ide-border/50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!fullPath || exists || isFolder}
            className="px-4 py-2 rounded-lg text-sm bg-ide-accent text-white hover:bg-ide-accent-glow disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Create File
          </button>
        </div>
      </div>
    </div>
  )
}
