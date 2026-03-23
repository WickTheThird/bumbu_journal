import { useState, useCallback, useEffect } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { FileCode, X } from 'lucide-react'
import SplitPane from './SplitPane'
import { usePaneManager } from './PaneManager'
import { File } from '../types/workspace'

interface EditorPaneV2Props {
  paneId: string
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
}

export default function EditorPaneV2({ paneId, files, onFileChange, theme, settings }: EditorPaneV2Props) {
  const { state, closeTab, selectFile, splitPane, reorderTabs } = usePaneManager()
  const pane = state.panes[paneId]
  
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null)
  const [dropZone, setDropZone] = useState<'left' | 'right' | 'top' | 'bottom' | 'center' | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isTabBarDragOver, setIsTabBarDragOver] = useState(false)
  const [tabDropIndex, setTabDropIndex] = useState<number | null>(null)

  useEffect(() => {
    return () => {
      if (editorInstance) {
        editorInstance.dispose()
      }
    }
  }, [editorInstance])

  const handleEditorMount = useCallback((editorRef: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    setEditorInstance(editorRef)
    
    monaco.languages.css?.cssDefaults?.setOptions({ validate: false })
    monaco.languages.css?.scssDefaults?.setOptions({ validate: false })
    monaco.languages.css?.lessDefaults?.setOptions({ validate: false })
    
    const tsCompilerOptions = {
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      jsxFragmentFactory: 'React.Fragment',
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: false,
      esModuleInterop: true,
      noEmit: true,
      skipLibCheck: true,
      noImplicitAny: false,
      strictNullChecks: false,
    }
    
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(tsCompilerOptions)
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(tsCompilerOptions)
    
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    })
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })
  }, [])

  const handleDrop = useCallback((zone: 'left' | 'right' | 'top' | 'bottom' | 'center', draggedFile: string) => {
    if (!draggedFile) return
    
    if (zone === 'center') {
      selectFile(paneId, draggedFile)
      return
    }

    const direction = (zone === 'left' || zone === 'right') ? 'horizontal' : 'vertical'
    const position = (zone === 'left' || zone === 'top') ? 'first' : 'second'
    splitPane(paneId, direction, draggedFile, position)
  }, [paneId, selectFile, splitPane])

  if (!pane) {
    return <div className="flex items-center justify-center h-full text-ide-text-secondary">Pane not found</div>
  }

  if (pane.type === 'split' && pane.children) {
    if (editorInstance) {
      try { editorInstance.dispose() } catch (e) { /* ignore */ }
      setEditorInstance(null)
    }

    return (
      <SplitPane direction={pane.direction || 'horizontal'} defaultSize={50}>
        <EditorPaneV2 
          key={pane.children[0]}
          paneId={pane.children[0]}
          files={files}
          onFileChange={onFileChange}
          theme={theme}
          settings={settings}
        />
        <EditorPaneV2 
          key={pane.children[1]}
          paneId={pane.children[1]}
          files={files}
          onFileChange={onFileChange}
          theme={theme}
          settings={settings}
        />
      </SplitPane>
    )
  }

  const openTabs = pane.openTabs || []
  const activeFileName = pane.activeFile
  const activeFile = files.find(f => f.name === activeFileName)

  const getDropZone = (e: React.DragEvent, rect: DOMRect): 'left' | 'right' | 'top' | 'bottom' | 'center' => {
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const edgeThreshold = 0.25

    if (x < edgeThreshold) return 'left'
    if (x > 1 - edgeThreshold) return 'right'
    if (y < edgeThreshold) return 'top'
    if (y > 1 - edgeThreshold) return 'bottom'
    return 'center'
  }

  const getTabDropIndex = (e: React.DragEvent, container: HTMLElement): number => {
    const tabs = Array.from(container.querySelectorAll('[data-tab]'))
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i] as HTMLElement
      const rect = tab.getBoundingClientRect()
      if (e.clientX < rect.left + rect.width / 2) {
        return i
      }
    }
    return tabs.length
  }

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
          if (e.dataTransfer.types.includes('text/plain')) {
            setTabDropIndex(getTabDropIndex(e, e.currentTarget))
          }
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsTabBarDragOver(false)
            setTabDropIndex(null)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const draggedFile = e.dataTransfer.getData('text/plain')
          if (draggedFile && tabDropIndex !== null) {
            reorderTabs(paneId, draggedFile, tabDropIndex)
          } else if (draggedFile) {
            selectFile(paneId, draggedFile)
          }
          setIsTabBarDragOver(false)
          setTabDropIndex(null)
        }}
      >
        {openTabs.map((tab, index) => (
          <div key={tab} className="flex items-center">
            {tabDropIndex === index && (
              <div className="w-0.5 h-6 bg-green-500 mx-0.5" />
            )}
            <div
              data-tab
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', tab)
                e.dataTransfer.effectAllowed = 'move'
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer border-r border-ide-border group transition-colors ${
                tab === activeFileName 
                  ? 'bg-ide-bg text-ide-text border-b-2 border-b-ide-accent -mb-[1px]' 
                  : 'text-ide-text-secondary hover:text-ide-text hover:bg-ide-bg/50'
              }`}
              onClick={() => selectFile(paneId, tab)}
            >
              <FileCode className="w-3.5 h-3.5 text-ide-accent" />
              <span className="max-w-[120px] truncate">{tab}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(paneId, tab)
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-ide-border rounded p-0.5 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {tabDropIndex === openTabs.length && (
          <div className="w-0.5 h-6 bg-green-500 mx-0.5" />
        )}
        {openTabs.length === 0 && (
          <div className="px-3 py-1.5 text-sm text-ide-text-secondary italic">
            Drag a file here
          </div>
        )}
      </div>

      {/* Editor area with drop zones */}
      <div 
        className="relative"
        style={{ flex: '1 1 0', minHeight: 0, minWidth: 0 }}
        onDragEnter={(e) => {
          e.preventDefault()
          if (e.dataTransfer.types.includes('text/plain')) {
            setIsDraggingOver(true)
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (isDraggingOver) {
            const rect = e.currentTarget.getBoundingClientRect()
            setDropZone(getDropZone(e, rect))
          }
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDraggingOver(false)
            setDropZone(null)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          const draggedFile = e.dataTransfer.getData('text/plain')
          if (draggedFile && dropZone) {
            handleDrop(dropZone, draggedFile)
          }
          setIsDraggingOver(false)
          setDropZone(null)
        }}
      >
        {/* Monaco Editor */}
        {activeFile ? (
          <Editor
            height="100%"
            language={activeFile.language}
            value={activeFile.content}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onChange={(value) => {
              if (value !== undefined && activeFile) {
                onFileChange(activeFile.name, value)
              }
            }}
            onMount={handleEditorMount}
            options={{
              fontSize: settings.fontSize ?? 14,
              tabSize: settings.tabSize ?? 2,
              wordWrap: settings.wordWrap ? 'on' : 'off',
              minimap: { enabled: settings.minimap ?? false },
              lineNumbers: settings.lineNumbers ? 'on' : 'off',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 8 },
              autoClosingBrackets: 'languageDefined',
              autoClosingQuotes: 'languageDefined',
              autoSurround: 'languageDefined',
              acceptSuggestionOnCommitCharacter: false,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-ide-text-secondary">
            <div className="text-center">
              <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Drag a file here to open</p>
            </div>
          </div>
        )}

        {/* Drop zone overlays */}
        {isDraggingOver && (
          <>
            <div className={`absolute inset-y-0 left-0 w-1/4 transition-colors ${dropZone === 'left' ? 'bg-green-500/30' : 'bg-transparent'}`} />
            <div className={`absolute inset-y-0 right-0 w-1/4 transition-colors ${dropZone === 'right' ? 'bg-green-500/30' : 'bg-transparent'}`} />
            <div className={`absolute inset-x-0 top-0 h-1/4 transition-colors ${dropZone === 'top' ? 'bg-green-500/30' : 'bg-transparent'}`} />
            <div className={`absolute inset-x-0 bottom-0 h-1/4 transition-colors ${dropZone === 'bottom' ? 'bg-green-500/30' : 'bg-transparent'}`} />
            <div className={`absolute inset-0 m-[25%] transition-colors ${dropZone === 'center' ? 'bg-blue-500/30 border-2 border-blue-500 border-dashed' : 'bg-transparent'}`} />
          </>
        )}
      </div>
    </div>
  )
}
