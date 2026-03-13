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
  externalSelectFile?: string | null // File selected from outside (e.g., file explorer)
  onRequestClose?: () => void // Called when this pane wants to close (all tabs closed)
  onStateChange?: (state: PaneState) => void // Called when state changes (for parent tracking)
}

interface PaneState {
  type: 'editor' | 'split'
  activeFile: string | null
  openTabs: string[]
  splitDirection?: 'horizontal' | 'vertical'
  childStates?: [PaneState, PaneState]
}

export default function EditorPane({ files, onFileChange, theme, settings, initialActiveFile, initialOpenTabs, depth = 0, externalSelectFile, onRequestClose, onStateChange }: EditorPaneProps) {
  const paneId = useId() // Unique ID for this pane instance
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null)
  
  const [paneState, setPaneState] = useState<PaneState>(() => {
    const initial = {
      type: 'editor' as const,
      activeFile: initialActiveFile || files[0]?.name || null,
      openTabs: initialOpenTabs || files.slice(0, 3).map(f => f.name),
    }
    console.log(`[EditorPane ${depth}] Initial state:`, initial)
    return initial
  })
  
  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editorInstance) {
        editorInstance.dispose()
      }
    }
  }, [editorInstance])
  
  // Report state changes to parent (for tracking child states)
  // Use ref to avoid infinite loops from callback reference changes
  const onStateChangeRef = useRef(onStateChange)
  onStateChangeRef.current = onStateChange
  
  const prevStateRef = useRef<string>('')
  useEffect(() => {
    if (depth > 0 && onStateChangeRef.current) {
      // Only report if state actually changed (compare serialized)
      const stateKey = JSON.stringify({ tabs: paneState.openTabs, active: paneState.activeFile })
      if (stateKey !== prevStateRef.current) {
        prevStateRef.current = stateKey
        onStateChangeRef.current(paneState)
      }
    }
  }, [paneState, depth])
  
  // Handle external file selection (from file explorer) - only at root level
  useEffect(() => {
    if (depth === 0 && externalSelectFile && files.some(f => f.name === externalSelectFile)) {
      setPaneState(prev => {
        if (prev.type === 'split') {
          // If split, update first child (or we could add to focused pane)
          return prev // For now, don't change split state from external
        }
        return {
          ...prev,
          activeFile: externalSelectFile,
          openTabs: prev.openTabs.includes(externalSelectFile) 
            ? prev.openTabs 
            : [...prev.openTabs, externalSelectFile],
        }
      })
    }
  }, [externalSelectFile, depth, files])
  
  const [dropZone, setDropZone] = useState<'left' | 'right' | 'top' | 'bottom' | 'center' | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isTabBarDragOver, setIsTabBarDragOver] = useState(false)
  const [tabDropIndex, setTabDropIndex] = useState<number | null>(null) // For reordering tabs

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
      
      // If closing last tab and we're in a split (depth > 0), request close
      if (newTabs.length === 0 && depth > 0 && onRequestClose) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => onRequestClose(), 0)
      }
      
      return {
        ...prev,
        openTabs: newTabs,
        activeFile: prev.activeFile === fileName ? (newTabs[0] || null) : prev.activeFile,
      }
    })
  }, [depth, onRequestClose])

  // Reorder tabs within this pane
  const handleReorderTab = useCallback((draggedFile: string, dropIndex: number) => {
    setPaneState(prev => {
      const currentIndex = prev.openTabs.indexOf(draggedFile)
      if (currentIndex === -1) {
        // File not in tabs yet, insert it
        const newTabs = [...prev.openTabs]
        newTabs.splice(dropIndex, 0, draggedFile)
        return { ...prev, openTabs: newTabs, activeFile: draggedFile }
      }
      if (currentIndex === dropIndex) return prev
      
      // Remove from current position and insert at new position
      const newTabs = prev.openTabs.filter(t => t !== draggedFile)
      const adjustedIndex = dropIndex > currentIndex ? dropIndex - 1 : dropIndex
      newTabs.splice(adjustedIndex, 0, draggedFile)
      return { ...prev, openTabs: newTabs }
    })
  }, [])

  // Handle drop - create split or add to tabs
  const handleDrop = useCallback((zone: 'left' | 'right' | 'top' | 'bottom' | 'center', draggedFile: string) => {
    if (!draggedFile) return
    
    // Center drop = just add to this pane's tabs
    if (zone === 'center') {
      setPaneState(prev => ({
        ...prev,
        activeFile: draggedFile,
        openTabs: prev.openTabs.includes(draggedFile) ? prev.openTabs : [...prev.openTabs, draggedFile],
      }))
      return
    }
    
    // Edge drop = create split
    const direction = (zone === 'left' || zone === 'right') ? 'horizontal' : 'vertical'
    const isFirst = zone === 'left' || zone === 'top'
    
    setPaneState(prev => ({
      type: 'split',
      activeFile: null,
      openTabs: [],
      splitDirection: direction,
      childStates: isFirst ? [
        { type: 'editor', activeFile: draggedFile, openTabs: [draggedFile] },
        { type: 'editor', activeFile: prev.activeFile, openTabs: prev.openTabs },
      ] : [
        { type: 'editor', activeFile: prev.activeFile, openTabs: prev.openTabs },
        { type: 'editor', activeFile: draggedFile, openTabs: [draggedFile] },
      ],
    }))
  }, [])

  // Track child state changes so we can restore properly on collapse
  const handleChildStateChange = useCallback((index: 0 | 1, state: PaneState) => {
    console.log(`[EditorPane ${depth}] Child ${index} state changed:`, state.openTabs, state.activeFile)
    setPaneState(prev => {
      if (prev.type !== 'split' || !prev.childStates) return prev
      const newChildStates: [PaneState, PaneState] = [...prev.childStates]
      newChildStates[index] = state
      return { ...prev, childStates: newChildStates }
    })
  }, [depth])

  // Handle child requesting to close - collapse split and restore other child
  const handleChildClose = useCallback((closedIndex: 0 | 1) => {
    console.log(`[EditorPane ${depth}] handleChildClose called, closedIndex:`, closedIndex)
    setPaneState(prev => {
      console.log(`[EditorPane ${depth}] prev state:`, prev)
      if (prev.type !== 'split' || !prev.childStates) {
        console.log(`[EditorPane ${depth}] Not a split, ignoring`)
        return prev
      }
      
      // Get the OTHER child's state (the one that's staying)
      const survivingIndex = closedIndex === 0 ? 1 : 0
      const survivingState = prev.childStates[survivingIndex]
      
      console.log(`[EditorPane ${depth}] Surviving state [${survivingIndex}]:`, survivingState)
      
      // Collapse to the surviving child's state
      const newTabs = survivingState.openTabs.length > 0 
        ? survivingState.openTabs 
        : (survivingState.activeFile ? [survivingState.activeFile] : [])
      
      const newState = {
        type: survivingState.type,
        activeFile: survivingState.activeFile || newTabs[0] || null,
        openTabs: newTabs,
        splitDirection: survivingState.splitDirection,
        childStates: survivingState.childStates,
      }
      console.log(`[EditorPane ${depth}] New collapsed state:`, newState)
      return newState
    })
    
    // Force resize after collapse
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
    setTimeout(() => window.dispatchEvent(new Event('resize')), 150)
  }, [depth])

  const activeFile = files.find(f => f.name === paneState.activeFile)
  
  // Configure Monaco on mount - disable strict CSS validation
  const handleEditorMount = useCallback((editorRef: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    setEditorInstance(editorRef)
    
    // Disable CSS validation (it doesn't understand modern CSS well)
    monaco.languages.css?.cssDefaults?.setOptions({
      validate: false,
    })
    monaco.languages.css?.scssDefaults?.setOptions({
      validate: false,
    })
    monaco.languages.css?.lessDefaults?.setOptions({
      validate: false,
    })
  }, [])

  // Render split view - pass child states down
  if (paneState.type === 'split' && paneState.childStates) {
    // Dispose current editor before rendering split
    if (editorInstance) {
      editorInstance.dispose()
      setEditorInstance(null)
    }
    
    return (
      <SplitPane direction={paneState.splitDirection || 'horizontal'} defaultSize={50}>
        <EditorPane 
          key={`${paneId}-split-0`}
          files={files} 
          onFileChange={onFileChange} 
          theme={theme} 
          settings={settings}
          initialActiveFile={paneState.childStates[0].activeFile || undefined}
          initialOpenTabs={paneState.childStates[0].openTabs}
          depth={depth + 1}
          onRequestClose={() => handleChildClose(0)}
          onStateChange={(state) => handleChildStateChange(0, state)}
        />
        <EditorPane 
          key={`${paneId}-split-1`}
          files={files} 
          onFileChange={onFileChange} 
          theme={theme} 
          settings={settings}
          initialActiveFile={paneState.childStates[1].activeFile || undefined}
          initialOpenTabs={paneState.childStates[1].openTabs}
          depth={depth + 1}
          onRequestClose={() => handleChildClose(1)}
          onStateChange={(state) => handleChildStateChange(1, state)}
        />
      </SplitPane>
    )
  }

  // Render editor
  return (
    <div className="flex flex-col" style={{ height: '100%', width: '100%', minHeight: 0, minWidth: 0 }}>
      {/* Tab bar - drop here to add to tabs */}
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
              // Reorder/insert at specific position
              handleReorderTab(draggedFile, tabDropIndex)
            } else {
              // Add to end of tabs
              handleDrop('center', draggedFile)
            }
          }
          setIsTabBarDragOver(false)
          setIsDraggingOver(false)
          setDropZone(null)
          setTabDropIndex(null)
        }}
      >
        {paneState.openTabs.filter(name => files.some(f => f.name === name)).map((fileName, index) => {
          const file = files.find(f => f.name === fileName)
          if (!file) return null
          return (
            <div key={file.name} className="flex items-center flex-shrink-0">
              {/* Drop indicator before tab */}
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
                  // Set drop index based on which half of tab we're over
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
                  file.name === paneState.activeFile 
                    ? 'bg-ide-bg text-ide-text' 
                    : 'bg-ide-surface text-ide-muted hover:text-ide-text hover:bg-ide-bg/50'
                }`}
              >
                <FileCode className={`w-3 h-3 flex-shrink-0 ${file.name === paneState.activeFile ? 'text-ide-accent' : ''}`} />
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
        {/* Drop indicator at end of tabs */}
        {tabDropIndex === paneState.openTabs.length && (
          <div className="w-0.5 h-6 bg-green-500 rounded-full mx-0.5 flex-shrink-0" />
        )}
        {/* Drop indicator for tab bar */}
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
          const draggedFile = e.dataTransfer.types.includes('text/plain')
          if (!draggedFile) return
          
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const xRatio = x / rect.width
          const yRatio = y / rect.height
          
          // Edge zones for splitting, center for adding to tabs
          if (xRatio < 0.2) setDropZone('left')
          else if (xRatio > 0.8) setDropZone('right')
          else if (yRatio < 0.2) setDropZone('top')
          else if (yRatio > 0.8) setDropZone('bottom')
          else setDropZone('center')
        }}
        onDragLeave={(e) => {
          // Only hide if leaving the container entirely
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
          if (draggedFile && dropZone && files.some(f => f.name === draggedFile)) {
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
            {/* Center zone */}
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

        {activeFile ? (
          <Editor
            key={`${paneId}-editor`}
            height="100%"
            path={activeFile.name}
            language={activeFile.language}
            value={activeFile.content}
            onChange={(value) => value !== undefined && onFileChange(activeFile.name, value)}
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
            No file selected
          </div>
        )}
      </div>
    </div>
  )
}
