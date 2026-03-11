import { X, Upload } from 'lucide-react'
import ImportFiles from './ImportFiles'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ide-border">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-ide-accent" />
            <h2 className="text-lg font-semibold">Import Files</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ide-border transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <ImportFiles onComplete={onClose} />
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-ide-border bg-ide-surface/50">
          <p className="text-xs text-ide-muted text-center">
            Files will be added to your workspace
          </p>
        </div>
      </div>
    </div>
  )
}
