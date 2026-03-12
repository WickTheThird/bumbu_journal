import { useState, useCallback, useEffect, useId, useRef } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
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
  externalSelectFile?: string | null
  onPaneEmpty?: () => void // Called when pane has no tabs (for split collapse)
}

interface SplitState {
  direction: 'horizontal' | 'vertical'
  // We don't store child states - children manage their own
}

export default function EditorPane({ 
  files, 
  onFileChange, 
  theme, 
  settings, 
  initialActiveFile, 
  initialOpenTabs, 
  depth = 0, 
  externalSelectFile,
  onPaneEmpty 
}: EditorPaneProps) {
  const paneId = useId()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  
  // Editor state
  const [activeFile, setActiveFile] = useState<string | null>(
    initialActiveFile || files[0]?.name || null
  )
  const [openTabs, setOpenTabs] = useState<string[]>(
    initialOpenTabs || files.slice(0, 3).map(f => f.name)
  )
  
  // Split state - null means no split
  const [splitState, setSplitState] = useState<SplitState | null>(null)
  const [splitChildFiles, setSplitChildFiles] = useState<[string[], string[]]>([[], []])
  
  // Drag state
  const [dropZone, setDropZone] = useState<'left' | 'right' | 'top' | 'bottom' | 'center' | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isTabBarDragOver, setIsTabBarDragOver] = useState(false)
  const [tabDropIndex, setTabDropIndex] = useState<number | null>(null)

  // Handle external file selection (from file explorer)
  useEffect(() => {
    if (depth === 0 && externalSelectFile && files.some(f => f.name === externalSelectFile)) {
      if (!splitState) {
        setActiveFile(externalSelectFile)
        if (!openTabs.includes(externalSelectFile)) {
          setOpenTabs(prev => [...prev, externalSelectFile])
        }
      }
    }
  }, [externalSelectFile, depth, files, splitState, openTabs])

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose()
        } catch (e) {
          // Ignore disposal errors
        }
        editorRef.current = null
      }
    }
  }, [])

  const handleSelectFile = useCallback((fileName: string) => {
    setActiveFile(fileName)
    if (!openTabs.includes(fileName)) {
      setOpenTabs(prev => [...prev, fileName])
    }
  }, [openTabs])

  const handleCloseTab = useCallback((fileName: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t !== fileName)
      
      // Update active file if we closed the active one
      if (activeFile === fileName) {
        setActiveFile(newTabs[0] || null)
      }
      
      // If no tabs left and we're in a split (depth > 0), signal parent
      if (newTabs.length === 0 && onPaneEmpty) {
        setTimeout(() => onPaneEmpty(), 0)
      }
      
      return newTabs
    })
  }, [activeFile, onPaneEmpty])

  const handleReorderTab = useCallback((draggedFile: string, dropIndex: number) => {
    setOpenTabs(prev => {
      const currentIndex = prev.indexOf(draggedFile)
      if (currentIndex === -1) {
        // File not in tabs yet, insert it
        const newTabs = [...prev]
        newTabs.splice(dropIndex, 0, draggedFile)
        setActiveFile(draggedFile)
        return newTabs
      }
      if (currentIndex === dropIndex) return prev
      
      const newTabs = prev.filter(t => t !== draggedFile)
      const adjustedIndex = dropIndex > currentIndex ? dropIndex - 1 : dropIndex
      newTabs.splice(adjustedIndex, 0, draggedFile)
      return newTabs
    })
  }, [])

  const handleDrop = useCallback((zone: 'left' | 'right' | 'top' | 'bottom' | 'center', draggedFile: string) => {
    if (!draggedFile || !files.some(f => f.name === draggedFile)) return
    
    // Center drop = just add to tabs
    if (zone === 'center') {
      setActiveFile(draggedFile)
      if (!openTabs.includes(draggedFile)) {
        setOpenTabs(prev => [...prev, draggedFile])
      }
      return
    }
    
    // Edge drop = create split
    const direction = (zone === 'left' || zone === 'right') ? 'horizontal' : 'vertical'
    const isFirst = zone === 'left' || zone === 'top'
    
    // Dispose current editor before splitting
    if (editorRef.current) {
      try {
        editorRef.current.dispose()
      } catch (e) {
        // Ignore
      }
      editorRef.current = null
    }
    
    setSplitState({ direction })
    setSplitChildFiles(isFirst 
      ? [[draggedFile], openTabs]
      : [openTabs, [draggedFile]]
    )
  }, [files, openTabs])

  const handleChildEmpty = useCallback((childIndex: 0 | 1) => {
    // Child pane is empty, collapse split and restore this pane with the other child's tabs
    // Since we can't easily get the other child's current state, we just close the split
    // and the remaining child becomes a standalone pane
    setSplitState(null)
    
    // We'll restore with the other child's initial files (not perfect but prevents blank screen)
    const otherIndex = childIndex === 0 ? 1 : 0
    const otherFiles = splitChildFiles[otherIndex]
    if (otherFiles.length > 0) {
      setOpenTabs(otherFiles)
      setActiveFile(otherFiles[0])
    }
  }, [splitChildFiles])

  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    
    // Disable CSS validation
    monaco.languages.css?.cssDefaults?.setOptions({ validate: false })
    monaco.languages.css?.scssDefaults?.setOptions({ validate: false })
    monaco.languages.css?.lessDefaults?.setOptions({ validate: false })
  }, [])

  const currentFile = files.find(f => f.name === activeFile)

  // Render split view
  if (splitState) {
    return (
      <SplitPane direction={splitState.direction} defaultSize={50}>
        <EditorPane 
          key={`${paneId}-child-0`}
          files={files} 
          onFileChange={onFileChange} 
          theme={theme} 
          settings={settings}
          initialActiveFile={splitChildFiles[0][0]}
          initialOpenTabs={splitChildFiles[0]}
          depth={depth + 1}
          onPaneEmpty={() => handleChildEmpty(0)}
        />
        <EditorPane 
          key={`${paneId}-child-1`}
          files={files} 
          onFileChange={onFileChange} 
          theme={theme} 
          settings={settings}
          initialActiveFile={splitChildFiles[1][0]}
          initialOpenTabs={splitChildFiles[1]}
          depth={depth + 1}
          onPaneEmpty={() => handleChildEmpty(1)}
        />
      </SplitPane>
    )
  }

  // Render editor
  return (
    <div className="flex flex-col" style={{ height: '100%', width: '100%', minHeight: 0, minWidth: 0 }}>
      {/* Tab bar */}
      <div 
        className={`flex items-center bg-ide-surface border-b overflow-x-auto scrollbar-hide flex-shrink-0 transition-colors ${
          isTabBarDragOver ? 'border-green-500 bg-green-500/10' : 'border-ide-border'
        }`}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (e.dataTransfer.types.includes('text/plain')) {
            setIsTabBarDragOver(true)
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsTabBarDragOver(false)
          setTabDropIndex(null)
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const draggedFile = e.dataTransfer.getData('text/plain')
          if (draggedFile && files.some(f => f.name === draggedFile)) {
            if (tabDropIndex !== null) {
              handleReorderTab(draggedFile, tabDropIndex)
            } else {
              handleDrop('center', draggedFile)
            }
          }
          setIsTabBarDragOver(false)
          setIsDraggingOver(false)
          setDropZone(null)
          setTabDropIndex(null)
        }}
      >
        {openTabs.filter(name => files.some(f => f.name === name)).map((fileName, index) => {
          const file = files.find(f => f.name === fileName)
          if (!file) return null
          return (
            <div key={file.name} className="flex items-center flex-shrink-0">
              {tabDropIndex === index && (
                <div className="w-0.5 h-6 bg-green-500 rounded-full mx-0.5" />
              )}
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', file.name)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const rect = e.currentTarget.getBoundingClientRect()
                  const midpoint = rect.left + rect.width / 2
                  setTabDropIndex(e.clientX < midpoint ? index : index + 1)
                }}
                onDragLeave={() => setTabDropIndex(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const draggedFile = e.dataTransfer.getData('text/plain')
                  if (draggedFile && tabDropIndex !== null) {
                    handleReorderTab(draggedFile, tabDropIndex)
                  }
                  setTabDropIndex(null)
                  setIsTabBarDragOver(false)
                }}
                onClick={() => handleSelectFile(file.name)}
                className={`group flex items-center gap-2 px-3 py-1.5 border-r border-ide-border text-xs whitespace-nowrap cursor-default ${
                  file.name === activeFile 
                    ? 'bg-ide-bg text-ide-text' 
                    : 'bg-ide-surface text-ide-muted hover:text-ide-text hover:bg-ide-bg/50'
                }`}
              >
                <FileCode className={`w-3 h-3 flex-shrink-0 ${file.name === activeFile ? 'text-ide-accent' : ''}`} />
                <span className="select-none">{file.name.split('/').pop()}</span>
                <button
                  className="w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-400 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); handleCloseTab(file.name) }}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )
        })}
        {tabDropIndex === openTabs.length && (
          <div className="w-0.5 h-6 bg-green-500 rounded-full mx-0.5 flex-shrink-0" />
        )}
        {isTabBarDragOver && (
          <div className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-400 border-l border-green-500/50">
            <span>+ Drop to add tab</span>
          </div>
        )}
      </div>

      {/* Editor area with drop zones */}
      <div 
        className="relative"
        style={{ flex: '1 1 0', minHeight: 0, minWidth: 0, overflow: 'hidden' }}
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDraggingOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!e.dataTransfer.types.includes('text/plain')) return
          
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const xRatio = x / rect.width
          const yRatio = y / rect.height
          
          if (xRatio < 0.2) setDropZone('left')
          else if (xRatio > 0.8) setDropZone('right')
          else if (yRatio < 0.2) setDropZone('top')
          else if (yRatio > 0.8) setDropZone('bottom')
          else setDropZone('center')
        }}
        onDragLeave={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          if (e.clientX < rect.left || e.clientX > rect.right || 
              e.clientY < rect.top || e.clientY > rect.bottom) {
            setIsDraggingOver(false)
            setDropZone(null)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const draggedFile = e.dataTransfer.getData('text/plain')
          if (draggedFile && dropZone) {
            handleDrop(dropZone, draggedFile)
          }
          setIsDraggingOver(false)
          setDropZone(null)
        }}
      >
        {/* Drop zone indicators */}
        {isDraggingOver && dropZone && (
          <>
            <div className={`absolute inset-y-0 left-0 w-1/5 border-2 border-dashed pointer-events-none z-50 transition-all ${
              dropZone === 'left' ? 'border-purple-500 bg-purple-500/20' : 'border-transparent'
            }`}>
              {dropZone === 'left' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">Split Left</span>
                </div>
              )}
            </div>
            <div className={`absolute inset-y-0 right-0 w-1/5 border-2 border-dashed pointer-events-none z-50 transition-all ${
              dropZone === 'right' ? 'border-purple-500 bg-purple-500/20' : 'border-transparent'
            }`}>
              {dropZone === 'right' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">Split Right</span>
                </div>
              )}
            </div>
            <div className={`absolute inset-x-0 top-0 h-1/5 border-2 border-dashed pointer-events-none z-50 transition-all ${
              dropZone === 'top' ? 'border-cyan-500 bg-cyan-500/20' : 'border-transparent'
            }`}>
              {dropZone === 'top' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-cyan-500 text-white px-2 py-1 rounded text-xs font-medium">Split Top</span>
                </div>
              )}
            </div>
            <div className={`absolute inset-x-0 bottom-0 h-1/5 border-2 border-dashed pointer-events-none z-50 transition-all ${
              dropZone === 'bottom' ? 'border-cyan-500 bg-cyan-500/20' : 'border-transparent'
            }`}>
              {dropZone === 'bottom' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-cyan-500 text-white px-2 py-1 rounded text-xs font-medium">Split Bottom</span>
                </div>
              )}
            </div>
            <div className={`absolute inset-0 m-[20%] border-2 border-dashed pointer-events-none z-40 transition-all ${
              dropZone === 'center' ? 'border-green-500 bg-green-500/20' : 'border-transparent'
            }`}>
              {dropZone === 'center' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">Add to Tabs</span>
                </div>
              )}
            </div>
          </>
        )}

        {currentFile ? (
          <Editor
            key={`${paneId}-editor`}
            height="100%"
            path={currentFile.name}
            language={currentFile.language}
            value={currentFile.content}
            onChange={(value) => value !== undefined && onFileChange(currentFile.name, value)}
            onMount={handleEditorMount}
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
            {openTabs.length === 0 ? 'No files open' : 'Select a file'}
          </div>
        )}
      </div>
    </div>
  )
}
