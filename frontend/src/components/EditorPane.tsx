import { useState, useCallback, useEffect, useRef, memo } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { FileCode, X } from 'lucide-react'
import SplitPane from './SplitPane'
import { File } from '../types/workspace'

// Recursive pane tree structure
export interface PaneNode {
  id: string
  type: 'editor' | 'split'
  // Editor state (when type === 'editor')
  activeFile?: string | null
  openTabs?: string[]
  // Split state (when type === 'split')
  direction?: 'horizontal' | 'vertical'
  children?: [PaneNode, PaneNode]
}

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
  externalSelectFile?: string | null
}

// Generate unique IDs
let paneIdCounter = 0
const generatePaneId = () => `pane-${++paneIdCounter}`

// Create initial editor node
const createEditorNode = (activeFile: string | null, openTabs: string[]): PaneNode => ({
  id: generatePaneId(),
  type: 'editor',
  activeFile,
  openTabs,
})

// Find and update a node in the tree by ID
// Returns same reference if nothing changed (important for React reconciliation)
const updateNodeInTree = (
  tree: PaneNode,
  nodeId: string,
  updater: (node: PaneNode) => PaneNode | null // null means remove/collapse
): PaneNode | null => {
  if (tree.id === nodeId) {
    return updater(tree)
  }
  
  if (tree.type === 'split' && tree.children) {
    const child0 = updateNodeInTree(tree.children[0], nodeId, updater)
    const child1 = updateNodeInTree(tree.children[1], nodeId, updater)
    
    // If one child is null (removed), return the other child (collapse)
    if (child0 === null && child1 !== null) {
      return child1
    }
    if (child1 === null && child0 !== null) {
      return child0
    }
    if (child0 === null && child1 === null) {
      return null
    }
    
    // IMPORTANT: Only create new object if children actually changed
    if (child0 === tree.children[0] && child1 === tree.children[1]) {
      return tree // No change, return same reference
    }
    
    return {
      ...tree,
      children: [child0!, child1!], // We know they're not null at this point
    }
  }
  
  return tree
}

// Props type for PaneRenderer
interface PaneRendererProps {
  node: PaneNode
  files: File[]
  onFileChange: (fileName: string, content: string) => void
  theme: 'light' | 'dark'
  settings: EditorPaneProps['settings']
  onUpdateNode: (nodeId: string, updater: (node: PaneNode) => PaneNode | null) => void
}

// Custom comparison - only re-render if node structure changed
const panePropsAreEqual = (prev: PaneRendererProps, next: PaneRendererProps): boolean => {
  // Always re-render if node id/type changed
  if (prev.node.id !== next.node.id || prev.node.type !== next.node.type) return false
  
  // For editors, check tabs and active file
  if (prev.node.type === 'editor' && next.node.type === 'editor') {
    if (prev.node.activeFile !== next.node.activeFile) return false
    if (prev.node.openTabs?.length !== next.node.openTabs?.length) return false
    if (prev.node.openTabs?.join(',') !== next.node.openTabs?.join(',')) return false
  }
  
  // Theme/settings changes need re-render
  if (prev.theme !== next.theme) return false
  if (prev.settings !== next.settings) return false
  
  // Files content changes should NOT trigger re-render of structure
  // The Monaco editor handles its own content updates
  
  return true
}

// Inner component that renders a single pane (controlled by parent)
// Memoized with custom comparison to prevent unnecessary re-renders
const PaneRenderer = memo(function PaneRenderer({
  node,
  files,
  onFileChange,
  theme,
  settings,
  onUpdateNode,
}: PaneRendererProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  
  // Drag state (local to this pane)
  const [dropZone, setDropZone] = useState<'left' | 'right' | 'top' | 'bottom' | 'center' | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isTabBarDragOver, setIsTabBarDragOver] = useState(false)
  const [tabDropIndex, setTabDropIndex] = useState<number | null>(null)

  // Simple cleanup on unmount - no delays
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try { editorRef.current.dispose() } catch (e) { /* ignore */ }
        editorRef.current = null
      }
    }
  }, [])

  // Container ref for resize observer
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    
    // Configure Monaco
    try {
      monaco.languages.css?.cssDefaults?.setOptions({ validate: false })
      monaco.languages.css?.scssDefaults?.setOptions({ validate: false })
      monaco.languages.css?.lessDefaults?.setOptions({ validate: false })
    } catch (e) { /* ignore */ }
    
    // Force layout after mount
    requestAnimationFrame(() => {
      editor.layout()
    })
  }, [])
  
  // Watch for container resizes
  useEffect(() => {
    if (!containerRef.current || !editorRef.current) return
    
    const observer = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout()
      }
    })
    
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [node.activeFile]) // Re-attach when file changes

  // Handle tab selection
  const handleSelectFile = useCallback((fileName: string) => {
    onUpdateNode(node.id, (n) => ({
      ...n,
      activeFile: fileName,
      openTabs: n.openTabs?.includes(fileName) ? n.openTabs : [...(n.openTabs || []), fileName],
    }))
  }, [node.id, onUpdateNode])

  // Handle tab close
  const handleCloseTab = useCallback((fileName: string) => {
    onUpdateNode(node.id, (n) => {
      const newTabs = (n.openTabs || []).filter(t => t !== fileName)
      const newActive = n.activeFile === fileName ? (newTabs[0] || null) : n.activeFile
      
      // If no tabs left, remove this pane (return null to trigger collapse)
      if (newTabs.length === 0) {
        return null
      }
      
      return { ...n, openTabs: newTabs, activeFile: newActive }
    })
  }, [node.id, onUpdateNode])

  // Handle tab reorder
  const handleReorderTab = useCallback((draggedFile: string, dropIndex: number) => {
    onUpdateNode(node.id, (n) => {
      const tabs = n.openTabs || []
      const currentIndex = tabs.indexOf(draggedFile)
      
      if (currentIndex === -1) {
        // Insert new tab
        const newTabs = [...tabs]
        newTabs.splice(dropIndex, 0, draggedFile)
        return { ...n, openTabs: newTabs, activeFile: draggedFile }
      }
      
      if (currentIndex === dropIndex) return n
      
      const newTabs = tabs.filter(t => t !== draggedFile)
      const adjustedIndex = dropIndex > currentIndex ? dropIndex - 1 : dropIndex
      newTabs.splice(adjustedIndex, 0, draggedFile)
      return { ...n, openTabs: newTabs }
    })
  }, [node.id, onUpdateNode])

  // Handle drop to create split or add tab
  const handleDrop = useCallback((zone: 'left' | 'right' | 'top' | 'bottom' | 'center', draggedFile: string) => {
    if (!draggedFile || !files.some(f => f.name === draggedFile)) return
    
    if (zone === 'center') {
      // Add to tabs
      onUpdateNode(node.id, (n) => ({
        ...n,
        activeFile: draggedFile,
        openTabs: n.openTabs?.includes(draggedFile) ? n.openTabs : [...(n.openTabs || []), draggedFile],
      }))
      return
    }
    
    // Create split
    const direction = (zone === 'left' || zone === 'right') ? 'horizontal' : 'vertical'
    const isFirst = zone === 'left' || zone === 'top'
    
    // Clear editor ref (disposal will happen in cleanup effect)
    editorRef.current = null
    
    onUpdateNode(node.id, (n) => {
      // Preserve current tabs, default to at least one file if empty
      const currentTabs = (n.openTabs && n.openTabs.length > 0) ? n.openTabs : [files[0]?.name].filter(Boolean) as string[]
      const currentActive = n.activeFile || currentTabs[0] || null
      
      // IMPORTANT: Split keeps the original ID so parent doesn't see a change
      // Both children get new IDs
      const existingEditor = createEditorNode(currentActive, currentTabs)
      const newEditor = createEditorNode(draggedFile, [draggedFile])
      
      return {
        id: n.id, // KEEP SAME ID - this prevents parent remount
        type: 'split',
        direction,
        children: isFirst ? [newEditor, existingEditor] : [existingEditor, newEditor],
      }
    })
  }, [node.id, files, onUpdateNode])

  console.log('[PaneRenderer] Rendering node:', node.id, node.type, node.type === 'editor' ? `tabs: ${node.openTabs?.length}` : `children: ${node.children?.length}`)

  // Render split
  if (node.type === 'split' && node.children) {
    return (
      <SplitPane direction={node.direction || 'horizontal'} defaultSize={50}>
        <PaneRenderer
          key={node.children[0].id}
          node={node.children[0]}
          files={files}
          onFileChange={onFileChange}
          theme={theme}
          settings={settings}
          onUpdateNode={onUpdateNode}
        />
        <PaneRenderer
          key={node.children[1].id}
          node={node.children[1]}
          files={files}
          onFileChange={onFileChange}
          theme={theme}
          settings={settings}
          onUpdateNode={onUpdateNode}
        />
      </SplitPane>
    )
  }

  // Render editor
  const openTabs = node.openTabs || []
  const activeFile = node.activeFile
  const currentFile = files.find(f => f.name === activeFile)

  return (
    <div ref={containerRef} className="flex flex-col" style={{ height: '100%', width: '100%', minHeight: 0, minWidth: 0 }}>
      {/* Tab bar */}
      <div 
        className={`flex items-center bg-ide-surface border-b overflow-x-auto scrollbar-hide flex-shrink-0 transition-colors ${
          isTabBarDragOver ? 'border-green-500 bg-green-500/10' : 'border-ide-border'
        }`}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (e.dataTransfer.types.includes('text/plain')) setIsTabBarDragOver(true)
        }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
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
          setDropZone(null)
          setTabDropIndex(null)
        }}
      >
        {openTabs.filter(name => files.some(f => f.name === name)).map((fileName, index) => {
          const file = files.find(f => f.name === fileName)
          if (!file) return null
          return (
            <div key={file.name} className="flex items-center flex-shrink-0">
              {tabDropIndex === index && <div className="w-0.5 h-6 bg-green-500 rounded-full mx-0.5" />}
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
                  setTabDropIndex(e.clientX < rect.left + rect.width / 2 ? index : index + 1)
                }}
                onDragLeave={() => setTabDropIndex(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const draggedFile = e.dataTransfer.getData('text/plain')
                  if (draggedFile && tabDropIndex !== null) handleReorderTab(draggedFile, tabDropIndex)
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
        {tabDropIndex === openTabs.length && <div className="w-0.5 h-6 bg-green-500 rounded-full mx-0.5 flex-shrink-0" />}
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
        onDragEnter={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!e.dataTransfer.types.includes('text/plain')) return
          const rect = e.currentTarget.getBoundingClientRect()
          const xRatio = (e.clientX - rect.left) / rect.width
          const yRatio = (e.clientY - rect.top) / rect.height
          if (xRatio < 0.2) setDropZone('left')
          else if (xRatio > 0.8) setDropZone('right')
          else if (yRatio < 0.2) setDropZone('top')
          else if (yRatio > 0.8) setDropZone('bottom')
          else setDropZone('center')
        }}
        onDragLeave={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            setIsDraggingOver(false)
            setDropZone(null)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const draggedFile = e.dataTransfer.getData('text/plain')
          if (draggedFile && dropZone) handleDrop(dropZone, draggedFile)
          setIsDraggingOver(false)
          setDropZone(null)
        }}
      >
        {/* Drop zones */}
        {isDraggingOver && dropZone && (
          <>
            <div className={`absolute inset-y-0 left-0 w-1/5 border-2 border-dashed pointer-events-none z-50 ${dropZone === 'left' ? 'border-purple-500 bg-purple-500/20' : 'border-transparent'}`}>
              {dropZone === 'left' && <div className="absolute inset-0 flex items-center justify-center"><span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">Split Left</span></div>}
            </div>
            <div className={`absolute inset-y-0 right-0 w-1/5 border-2 border-dashed pointer-events-none z-50 ${dropZone === 'right' ? 'border-purple-500 bg-purple-500/20' : 'border-transparent'}`}>
              {dropZone === 'right' && <div className="absolute inset-0 flex items-center justify-center"><span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">Split Right</span></div>}
            </div>
            <div className={`absolute inset-x-0 top-0 h-1/5 border-2 border-dashed pointer-events-none z-50 ${dropZone === 'top' ? 'border-cyan-500 bg-cyan-500/20' : 'border-transparent'}`}>
              {dropZone === 'top' && <div className="absolute inset-0 flex items-center justify-center"><span className="bg-cyan-500 text-white px-2 py-1 rounded text-xs">Split Top</span></div>}
            </div>
            <div className={`absolute inset-x-0 bottom-0 h-1/5 border-2 border-dashed pointer-events-none z-50 ${dropZone === 'bottom' ? 'border-cyan-500 bg-cyan-500/20' : 'border-transparent'}`}>
              {dropZone === 'bottom' && <div className="absolute inset-0 flex items-center justify-center"><span className="bg-cyan-500 text-white px-2 py-1 rounded text-xs">Split Bottom</span></div>}
            </div>
            <div className={`absolute inset-0 m-[20%] border-2 border-dashed pointer-events-none z-40 ${dropZone === 'center' ? 'border-green-500 bg-green-500/20' : 'border-transparent'}`}>
              {dropZone === 'center' && <div className="absolute inset-0 flex items-center justify-center"><span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Add to Tabs</span></div>}
            </div>
          </>
        )}

        {currentFile ? (
          <Editor
            key={node.id}
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
              // Disable Monaco's native drop handling to prevent conflicts
              dropIntoEditor: { enabled: false },
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
}, panePropsAreEqual)

// Main EditorPane component - manages the entire pane tree
export default function EditorPane({ 
  files, 
  onFileChange, 
  theme, 
  settings, 
  initialActiveFile, 
  initialOpenTabs,
  externalSelectFile,
}: EditorPaneProps) {
  // Use ref for files to avoid recreating callbacks
  const filesRef = useRef(files)
  filesRef.current = files
  
  // Single source of truth: the pane tree
  const [paneTree, setPaneTree] = useState<PaneNode>(() => {
    const tree = createEditorNode(
      initialActiveFile || files[0]?.name || null,
      initialOpenTabs || files.slice(0, 3).map(f => f.name)
    )
    console.log('[EditorPane] Initial tree:', JSON.stringify(tree))
    return tree
  })

  // Handle external file selection
  useEffect(() => {
    if (externalSelectFile && files.some(f => f.name === externalSelectFile)) {
      // Find the first editor node and add the file there
      setPaneTree(prev => {
        const findFirstEditor = (node: PaneNode): string | null => {
          if (node.type === 'editor') return node.id
          if (node.children) {
            return findFirstEditor(node.children[0]) || findFirstEditor(node.children[1])
          }
          return null
        }
        
        const editorId = findFirstEditor(prev)
        if (!editorId) return prev
        
        return updateNodeInTree(prev, editorId, (n) => ({
          ...n,
          activeFile: externalSelectFile,
          openTabs: n.openTabs?.includes(externalSelectFile) ? n.openTabs : [...(n.openTabs || []), externalSelectFile],
        })) || prev
      })
    }
  }, [externalSelectFile, files])

  // Update a node in the tree - stable reference (no deps that change)
  const handleUpdateNode = useCallback((nodeId: string, updater: (node: PaneNode) => PaneNode | null) => {
    setPaneTree(prev => {
      console.log('[EditorPane] Updating node:', nodeId)
      const result = updateNodeInTree(prev, nodeId, updater)
      console.log('[EditorPane] Result:', result ? 'valid' : 'NULL')
      // If root becomes null (all panes closed), create a new empty editor
      if (result === null) {
        const currentFiles = filesRef.current
        return createEditorNode(currentFiles[0]?.name || null, currentFiles.slice(0, 1).map(f => f.name))
      }
      return result
    })
  }, []) // Empty deps - uses filesRef instead

  return (
    <PaneRenderer
      node={paneTree}
      files={files}
      onFileChange={onFileChange}
      theme={theme}
      settings={settings}
      onUpdateNode={handleUpdateNode}
    />
  )
}
