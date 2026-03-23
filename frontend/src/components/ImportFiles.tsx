import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'

interface ImportFilesProps {
  onComplete?: () => void
}

export default function ImportFiles({ onComplete }: ImportFilesProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { createFile, updateFile, workspace } = useWorkspaceStore()
  
  const handleFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.size > 1_000_000) {
        alert(`File "${file.name}" is too large (max 1MB)`)
        continue
      }
      
      try {
        const content = await file.text()
        
        const exists = workspace.files.some(f => f.name === file.name)
        if (exists) {
          if (confirm(`File "${file.name}" already exists. Overwrite?`)) {
            updateFile(file.name, content)
          }
        } else {
          createFile(file.name)
          setTimeout(() => updateFile(file.name, content), 10)
        }
      } catch (e) {
        alert(`Failed to read file "${file.name}"`)
      }
    }
    
    onComplete?.()
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-ide-border rounded-lg p-6 text-center cursor-pointer hover:border-ide-accent/50 transition"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
      <Upload className="w-8 h-8 mx-auto mb-2 text-ide-muted" />
      <p className="text-sm text-ide-muted">
        Drop files here or click to upload
      </p>
      <p className="text-xs text-ide-muted/50 mt-1">
        Max 1MB per file
      </p>
    </div>
  )
}
