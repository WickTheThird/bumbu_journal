import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Hash, ExternalLink } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'
import HTMLPreview from '../components/HTMLPreview'
import EditorPaneV2 from '../components/EditorPaneV2'
import { PaneManagerProvider, usePaneManager } from '../components/PaneManager'
import { File } from '../types/workspace'
import '../styles/cyberpunk.css'

function EditorPaneRoot({ 
  files, 
  onFileChange, 
  theme, 
  settings,
}: { 
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
}) {
  const { state, syncWithFiles } = usePaneManager()
  
  useEffect(() => {
    syncWithFiles(files.map(f => f.name))
  }, [files, syncWithFiles])
  
  return (
    <EditorPaneV2
      paneId={state.rootId}
      files={files}
      onFileChange={onFileChange}
      theme={theme}
      settings={settings}
    />
  )
}

export default function Embed() {
  const [searchParams] = useSearchParams()
  const { workspace, isLoading, loadFromHash, updateFile } = useWorkspaceStore()
  
  // Get options from query params
  const view = (searchParams.get('view') || 'split') as 'editor' | 'preview' | 'split'
  const theme = (searchParams.get('theme') || 'dark') as 'dark' | 'light'
  const hideHeader = searchParams.get('hideHeader') === 'true'
  const initialFile = searchParams.get('file')
  // hideExplorer available for future use: searchParams.get('hideExplorer') === 'true'
  
  const [showOpenButton, setShowOpenButton] = useState(true)
  
  useEffect(() => {
    loadFromHash()
  }, [loadFromHash])
  
  // Find preview files
  const htmlFile = workspace.files.find(f => f.name.endsWith('.html'))
  const cssFile = workspace.files.find(f => f.name.endsWith('.css'))
  const jsFile = workspace.files.find(f => f.name.endsWith('.js') && !f.name.endsWith('.test.js'))
  
  const canPreview = htmlFile || workspace.files.some(f => 
    f.name.endsWith('.tsx') || f.name.endsWith('.jsx') || f.name.endsWith('.md')
  )
  
  if (isLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-ide-bg' : 'bg-white'}`}>
        <div className="text-center">
          <Hash className="w-8 h-8 text-ide-accent mx-auto mb-2 animate-pulse" />
          <p className={`text-sm ${theme === 'dark' ? 'text-ide-muted' : 'text-gray-500'}`}>Loading...</p>
        </div>
      </div>
    )
  }
  
  const handleOpenInHashIDEA = () => {
    const url = `${window.location.origin}/ide${window.location.hash}`
    window.open(url, '_blank')
  }
  
  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-ide-bg' : 'bg-white'}`}>
      {/* Minimal header */}
      {!hideHeader && (
        <header className={`flex items-center justify-between px-3 py-1.5 border-b ${
          theme === 'dark' ? 'bg-ide-surface border-ide-border' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-ide-accent" />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-ide-muted' : 'text-gray-600'}`}>
              HashIDEA
            </span>
          </div>
          {showOpenButton && (
            <button
              onClick={handleOpenInHashIDEA}
              onMouseEnter={() => setShowOpenButton(true)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition ${
                theme === 'dark' 
                  ? 'bg-ide-accent/10 text-ide-accent hover:bg-ide-accent/20' 
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
              Open in HashIDEA
            </button>
          )}
        </header>
      )}
      
      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {(view === 'editor' || view === 'split') && (
          <div className={`${view === 'split' ? 'flex-1' : 'w-full'} min-w-0`}>
            <PaneManagerProvider
              initialTabs={initialFile ? [initialFile] : workspace.files.slice(0, 2).map(f => f.name)}
              initialActiveFile={initialFile || workspace.activeFile || null}
              workspaceKey={workspace.files.map(f => f.name).sort().join(',')}
            >
              <EditorPaneRoot
                files={workspace.files}
                onFileChange={updateFile}
                theme={theme}
                settings={{
                  fontSize: 13,
                  tabSize: 2,
                  wordWrap: true,
                  minimap: false,
                  lineNumbers: true,
                }}
              />
            </PaneManagerProvider>
          </div>
        )}
        
        {/* Divider */}
        {view === 'split' && (
          <div className={`w-px ${theme === 'dark' ? 'bg-ide-border' : 'bg-gray-200'}`} />
        )}
        
        {/* Preview */}
        {(view === 'preview' || view === 'split') && canPreview && (
          <div className={`${view === 'split' ? 'flex-1' : 'w-full'} min-w-0`}>
            <HTMLPreview 
              html={htmlFile?.content} 
              css={cssFile?.content} 
              js={jsFile?.content}
              files={workspace.files}
              isOpen={true}
              onClose={() => {}}
              hideControls
            />
          </div>
        )}
      </div>
    </div>
  )
}
