import { useState, useCallback, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { FileCode, X } from 'lucide-react'
import SplitPane from './SplitPane'
import { File } from '../types/workspace'

// ============ Types ============

interface PaneNode {
  id: string
  type: 'editor' | 'split'
  // Editor
  activeFile?: string | null
  openTabs?: string[]
  // Split
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

// ============ Utilities ============

let idCounter = 0
const newId = () => `pane-${++idCounter}`

const createEditor = (file: string | null, tabs: string[]): PaneNode => ({
  id: newId(),
  type: 'editor',
  activeFile: file,
  openTabs: tabs,
})

// ============ Single Editor Component ============

function SingleEditor({
  pane,
  files,
  onFileChange,
  theme,
  settings,
  onSplit,
  onClose,
  onUpdate,
}: {
  pane: PaneNode
  files: File[]
  onFileChange: (fileName: string, content: string) => void
  theme: 'light' | 'dark'
  settings: EditorPaneProps['settings']
  onSplit: (direction: 'horizontal' | 'vertical', newFile: string) => void
  onClose: () => void
  onUpdate: (updates: Partial<PaneNode>) => void
}) {
  console.log('[SingleEditor] rendering pane:', pane.id)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dropZone, setDropZone] = useState<string | null>(null)

  const tabs = pane.openTabs || []
  const activeFile = pane.activeFile
  const currentFile = files.find(f => f.name === activeFile)

  // Resize observer for Monaco
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(() => {
      editorRef.current?.layout()
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleEditorMount = useCallback((ed: editor.IStandaloneCodeEditor) => {
    editorRef.current = ed
  }, [])

  const handleSelectTab = useCallback((name: string) => {
    onUpdate({ activeFile: name })
  }, [onUpdate])

  const handleCloseTab = useCallback((name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = tabs.filter(t => t !== name)
    if (newTabs.length === 0) {
      onClose()
    } else {
      onUpdate({
        openTabs: newTabs,
        activeFile: name === activeFile ? newTabs[0] : activeFile,
      })
    }
  }, [tabs, activeFile, onClose, onUpdate])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.getData('text/plain')
    console.log('[handleDrop] file:', file, 'dropZone:', dropZone)
    if (!file || !files.some(f => f.name === file)) {
      console.log('[handleDrop] invalid file')
      return
    }

    if (dropZone === 'center' || dropZone === 'tabs') {
      console.log('[handleDrop] adding to tabs')
      if (!tabs.includes(file)) {
        onUpdate({ openTabs: [...tabs, file], activeFile: file })
      } else {
        onUpdate({ activeFile: file })
      }
    } else if (dropZone === 'left' || dropZone === 'right') {
      console.log('[handleDrop] splitting horizontal')
      onSplit('horizontal', file)
    } else if (dropZone === 'top' || dropZone === 'bottom') {
      console.log('[handleDrop] splitting vertical')
      onSplit('vertical', file)
    }
    setDropZone(null)
  }, [dropZone, files, tabs, onUpdate, onSplit])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    if (x < 0.2) setDropZone('left')
    else if (x > 0.8) setDropZone('right')
    else if (y < 0.2) setDropZone('top')
    else if (y > 0.8) setDropZone('bottom')
    else setDropZone('center')
  }, [])

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Tab bar */}
      <div 
        style={{ display: 'flex', background: '#1e1e1e', borderBottom: '1px solid #333', flexShrink: 0, overflow: 'auto' }}
        onDragOver={(e) => { e.preventDefault(); setDropZone('tabs') }}
        onDragLeave={() => setDropZone(null)}
        onDrop={handleDrop}
      >
        {tabs.map(name => (
          <div
            key={name}
            onClick={() => handleSelectTab(name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              background: name === activeFile ? '#2d2d2d' : 'transparent',
              borderRight: '1px solid #333',
              color: name === activeFile ? '#fff' : '#888',
              fontSize: '13px',
            }}
          >
            <FileCode size={14} />
            <span>{name}</span>
            <button
              onClick={(e) => handleCloseTab(name, e)}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
        onDragOver={handleDragOver}
        onDragLeave={() => setDropZone(null)}
        onDrop={handleDrop}
      >
        {/* Drop zone indicators */}
        {dropZone && dropZone !== 'tabs' && (
          <>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20%', background: dropZone === 'left' ? 'rgba(168,85,247,0.3)' : 'transparent', pointerEvents: 'none', zIndex: 10 }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20%', background: dropZone === 'right' ? 'rgba(168,85,247,0.3)' : 'transparent', pointerEvents: 'none', zIndex: 10 }} />
            <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: '20%', background: dropZone === 'top' ? 'rgba(6,182,212,0.3)' : 'transparent', pointerEvents: 'none', zIndex: 10 }} />
            <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, height: '20%', background: dropZone === 'bottom' ? 'rgba(6,182,212,0.3)' : 'transparent', pointerEvents: 'none', zIndex: 10 }} />
            <div style={{ position: 'absolute', left: '20%', top: '20%', right: '20%', bottom: '20%', background: dropZone === 'center' ? 'rgba(34,197,94,0.3)' : 'transparent', pointerEvents: 'none', zIndex: 10 }} />
          </>
        )}

        {currentFile ? (
          <Editor
            height="100%"
            path={currentFile.name}
            language={currentFile.language}
            value={currentFile.content}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onChange={(value) => onFileChange(currentFile.name, value || '')}
            onMount={handleEditorMount}
            options={{
              fontSize: settings.fontSize || 14,
              tabSize: settings.tabSize || 2,
              wordWrap: settings.wordWrap ? 'on' : 'off',
              minimap: { enabled: settings.minimap ?? false },
              lineNumbers: settings.lineNumbers ?? true ? 'on' : 'off',
              automaticLayout: false, // We handle layout manually
              scrollBeyondLastLine: false,
            }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            No file selected
          </div>
        )}
      </div>
    </div>
  )
}

// ============ Recursive Pane Renderer ============

function PaneRenderer({
  pane,
  files,
  onFileChange,
  theme,
  settings,
  onReplace,
}: {
  pane: PaneNode
  files: File[]
  onFileChange: (fileName: string, content: string) => void
  theme: 'light' | 'dark'
  settings: EditorPaneProps['settings']
  onReplace: (newPane: PaneNode | null) => void
}) {
  const handleSplit = useCallback((direction: 'horizontal' | 'vertical', newFile: string) => {
    console.log('[handleSplit] direction:', direction, 'newFile:', newFile, 'pane:', pane.id)
    const existingEditor = createEditor(pane.activeFile || null, pane.openTabs || [])
    const newEditor = createEditor(newFile, [newFile])
    
    const newSplit = {
      id: newId(),
      type: 'split' as const,
      direction,
      children: [existingEditor, newEditor] as [PaneNode, PaneNode],
    }
    console.log('[handleSplit] creating split:', newSplit)
    onReplace(newSplit)
  }, [pane, onReplace])

  const handleClose = useCallback(() => {
    onReplace(null)
  }, [onReplace])

  const handleUpdate = useCallback((updates: Partial<PaneNode>) => {
    onReplace({ ...pane, ...updates })
  }, [pane, onReplace])

  console.log('[PaneRenderer] rendering:', pane.id, pane.type)
  
  if (pane.type === 'split' && pane.children) {
    const [child0, child1] = pane.children

    const handleReplaceChild = (index: 0 | 1) => (newChild: PaneNode | null) => {
      console.log('[handleReplaceChild] index:', index, 'newChild:', newChild?.id, 'type:', newChild?.type)
      if (newChild === null) {
        // Child was closed, replace this split with the other child
        console.log('[handleReplaceChild] collapsing split')
        onReplace(pane.children![index === 0 ? 1 : 0])
      } else {
        // Update child
        const newChildren: [PaneNode, PaneNode] = index === 0 
          ? [newChild, child1]
          : [child0, newChild]
        console.log('[handleReplaceChild] updating children')
        onReplace({ ...pane, children: newChildren })
      }
    }

    return (
      <SplitPane direction={pane.direction || 'horizontal'}>
        <PaneRenderer
          pane={child0}
          files={files}
          onFileChange={onFileChange}
          theme={theme}
          settings={settings}
          onReplace={handleReplaceChild(0)}
        />
        <PaneRenderer
          pane={child1}
          files={files}
          onFileChange={onFileChange}
          theme={theme}
          settings={settings}
          onReplace={handleReplaceChild(1)}
        />
      </SplitPane>
    )
  }

  return (
    <SingleEditor
      pane={pane}
      files={files}
      onFileChange={onFileChange}
      theme={theme}
      settings={settings}
      onSplit={handleSplit}
      onClose={handleClose}
      onUpdate={handleUpdate}
    />
  )
}

// ============ Main Component ============

export default function EditorPane({
  files,
  onFileChange,
  theme,
  settings,
  initialActiveFile,
  initialOpenTabs,
  externalSelectFile,
}: EditorPaneProps) {
  const [root, setRoot] = useState<PaneNode>(() =>
    createEditor(
      initialActiveFile || files[0]?.name || null,
      initialOpenTabs || files.slice(0, 2).map(f => f.name)
    )
  )

  // Handle external file selection (from file tree)
  useEffect(() => {
    if (!externalSelectFile) return
    
    // Find first editor pane and add file
    const addToFirstEditor = (node: PaneNode): PaneNode => {
      if (node.type === 'editor') {
        const tabs = node.openTabs || []
        return {
          ...node,
          activeFile: externalSelectFile,
          openTabs: tabs.includes(externalSelectFile) ? tabs : [...tabs, externalSelectFile],
        }
      }
      if (node.type === 'split' && node.children) {
        return {
          ...node,
          children: [addToFirstEditor(node.children[0]), node.children[1]],
        }
      }
      return node
    }
    
    setRoot(addToFirstEditor)
  }, [externalSelectFile])

  const handleReplace = useCallback((newRoot: PaneNode | null) => {
    if (newRoot === null) {
      // All closed, create new empty editor
      setRoot(createEditor(files[0]?.name || null, files.slice(0, 1).map(f => f.name)))
    } else {
      setRoot(newRoot)
    }
  }, [files])

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <PaneRenderer
        pane={root}
        files={files}
        onFileChange={onFileChange}
        theme={theme}
        settings={settings}
        onReplace={handleReplace}
      />
    </div>
  )
}

export type { PaneNode }
