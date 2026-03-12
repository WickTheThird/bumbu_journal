import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { FileCode, X } from 'lucide-react'
import SplitPane from './SplitPane'
import { File } from '../types/workspace'

interface EditorPaneProps {
  files: File[]
  onFileChange: (fileName: string, content: string) => void
  theme: 'light' | 'dark'
  settings: {
    fontSize?: number
    tabSize?: number
    wordWrap?: boolean
    minimap?: boolean
    lineNumbers?: boolean
  }
  initialActiveFile?: string
  initialOpenTabs?: string[]
  depth?: number
}

interface PaneState {
  type: 'editor' | 'split'
  activeFile: string | null
  openTabs: string[]
  splitDirection?: 'horizontal' | 'vertical'
  children?: [PaneState, PaneState]
}

export default function EditorPane({ files, onFileChange, theme, settings, initialActiveFile, initialOpenTabs, depth = 0 }: EditorPaneProps) {
  const [paneState, setPaneState] = useState<PaneState>({
    type: 'editor',
    activeFile: initialActiveFile || files[0]?.name || null,
    openTabs: initialOpenTabs || files.slice(0, 3).map(f => f.name), // Start with first 3 files
  })
  
  const [draggedFile, setDraggedFile] = useState<string | null>(null)
  const [dropZone, setDropZone] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null)

  const handleSelectFile = useCallback((fileName: string) => {
    setPaneState(prev => ({
      ...prev,
      activeFile: fileName,
      openTabs: prev.openTabs.includes(fileName) ? prev.openTabs : [...prev.openTabs, fileName],
    }))
  }, [])

  const handleCloseTab = useCallback((fileName: string) => {
    setPaneState(prev => {
      const newTabs = prev.openTabs.filter(t => t !== fileName)
      return {
        ...prev,
        openTabs: newTabs,
        activeFile: prev.activeFile === fileName ? (newTabs[0] || null) : prev.activeFile,
      }
    })
  }, [])

  const handleDrop = useCallback((zone: 'left' | 'right' | 'top' | 'bottom') => {
    if (!draggedFile) return
    
    const direction = (zone === 'left' || zone === 'right') ? 'horizontal' : 'vertical'
    const isFirst = zone === 'left' || zone === 'top'
    
    setPaneState(prev => ({
      type: 'split',
      activeFile: null,
      openTabs: [],
      splitDirection: direction,
      children: isFirst ? [
        { type: 'editor', activeFile: draggedFile, openTabs: [draggedFile] },
        { type: 'editor', activeFile: prev.activeFile, openTabs: prev.openTabs },
      ] : [
        { type: 'editor', activeFile: prev.activeFile, openTabs: prev.openTabs },
        { type: 'editor', activeFile: draggedFile, openTabs: [draggedFile] },
      ],
    }))
    
    setDraggedFile(null)
    setDropZone(null)
  }, [draggedFile])

  // Close split and keep one side
  const closeSplit = useCallback((keepIndex: 0 | 1) => {
    setPaneState(prev => {
      if (prev.type !== 'split' || !prev.children) return prev
      return prev.children[keepIndex]
    })
  }, [])
  
  // Expose closeSplit for parent to use
  void closeSplit // Mark as intentionally unused for now

  const activeFile = files.find(f => f.name === paneState.activeFile)

  // Render split view
  if (paneState.type === 'split' && paneState.children) {
    return (
      <SplitPane direction={paneState.splitDirection || 'horizontal'} defaultSize={50}>
        <EditorPane 
          files={files} 
          onFileChange={onFileChange} 
          theme={theme} 
          settings={settings}
          depth={depth + 1}
        />
        <EditorPane 
          files={files} 
          onFileChange={onFileChange} 
          theme={theme} 
          settings={settings}
          depth={depth + 1}
        />
      </SplitPane>
    )
  }

  // Render editor
  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center bg-ide-surface border-b border-ide-border overflow-x-auto scrollbar-hide">
        {paneState.openTabs.filter(name => files.some(f => f.name === name)).map(fileName => {
          const file = files.find(f => f.name === fileName)
          if (!file) return null
          return (
            <div
              key={file.name}
              draggable
              onDragStart={() => setDraggedFile(file.name)}
              onDragEnd={() => { setDraggedFile(null); setDropZone(null) }}
              onClick={() => handleSelectFile(file.name)}
              className={`group flex items-center gap-2 px-3 py-1.5 border-r border-ide-border text-xs whitespace-nowrap cursor-default ${
                file.name === paneState.activeFile 
                  ? 'bg-ide-bg text-ide-text' 
                  : 'bg-ide-surface text-ide-muted hover:text-ide-text hover:bg-ide-bg/50'
              }`}
            >
              <FileCode className={`w-3 h-3 ${file.name === paneState.activeFile ? 'text-ide-accent' : ''}`} />
              <span className="select-none">{file.name.split('/').pop()}</span>
              <button
                className="w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-400"
                onClick={(e) => { e.stopPropagation(); handleCloseTab(file.name) }}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Editor area with drop zones */}
      <div 
        className="flex-1 relative"
        onDragOver={(e) => {
          e.preventDefault()
          if (!draggedFile) return
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const xRatio = x / rect.width
          const yRatio = y / rect.height
          
          if (xRatio < 0.25) setDropZone('left')
          else if (xRatio > 0.75) setDropZone('right')
          else if (yRatio < 0.25) setDropZone('top')
          else if (yRatio > 0.75) setDropZone('bottom')
          else setDropZone(xRatio < 0.5 ? 'left' : 'right')
        }}
        onDragLeave={() => setDropZone(null)}
        onDrop={() => dropZone && handleDrop(dropZone)}
      >
        {/* Drop zones */}
        {draggedFile && dropZone && (
          <>
            <div className={`absolute inset-y-0 left-0 w-1/4 border-2 border-dashed pointer-events-none z-50 ${
              dropZone === 'left' ? 'border-purple-500 bg-purple-500/20' : 'border-transparent'
            }`} />
            <div className={`absolute inset-y-0 right-0 w-1/4 border-2 border-dashed pointer-events-none z-50 ${
              dropZone === 'right' ? 'border-purple-500 bg-purple-500/20' : 'border-transparent'
            }`} />
            <div className={`absolute inset-x-0 top-0 h-1/4 border-2 border-dashed pointer-events-none z-50 ${
              dropZone === 'top' ? 'border-cyan-500 bg-cyan-500/20' : 'border-transparent'
            }`} />
            <div className={`absolute inset-x-0 bottom-0 h-1/4 border-2 border-dashed pointer-events-none z-50 ${
              dropZone === 'bottom' ? 'border-cyan-500 bg-cyan-500/20' : 'border-transparent'
            }`} />
          </>
        )}

        {activeFile ? (
          <Editor
            height="100%"
            path={activeFile.name}
            language={activeFile.language}
            value={activeFile.content}
            onChange={(value) => value !== undefined && onFileChange(activeFile.name, value)}
            theme={theme === 'light' ? 'vs' : 'vs-dark'}
            options={{
              fontSize: settings.fontSize || 14,
              tabSize: settings.tabSize || 2,
              wordWrap: settings.wordWrap ? 'on' : 'off',
              minimap: { enabled: settings.minimap ?? false },
              lineNumbers: settings.lineNumbers ?? true ? 'on' : 'off',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              padding: { top: 8 },
              folding: true,
              fixedOverflowWidgets: true,
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-ide-muted text-sm">
            No file selected
          </div>
        )}
      </div>
    </div>
  )
}
