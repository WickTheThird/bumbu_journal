import { useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import type { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { 
  Hash, Share2, Plus, Trash2, FileCode, 
  ChevronLeft, Check, Play, Terminal as TerminalIcon, Settings, History, Keyboard, Download, Upload, Pencil, Eye
} from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'
import { getShareableURL } from '../lib/hash'
import { execute, ExecutionResult } from '../lib/sandbox'
import { saveSnapshot } from '../lib/history'
import { downloadWorkspaceAsZip } from '../lib/download'
import Terminal from '../components/Terminal'
import SettingsPanel from '../components/SettingsPanel'
import HistoryPanel from '../components/HistoryPanel'
import KeyboardShortcuts from '../components/KeyboardShortcuts'
import ImportModal from '../components/ImportModal'
import CommandPalette from '../components/CommandPalette'
import NewFileModal from '../components/NewFileModal'
import HTMLPreview from '../components/HTMLPreview'

export default function IDE() {
  const { 
    workspace, 
    isLoading,
    error,
    loadFromHash, 
    saveToHash,
    updateFile, 
    deleteFile,
    renameFile,
    setActiveFile,
  } = useWorkspaceStore()
  
  const [copied, setCopied] = useState(false)
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showTerminal, setShowTerminal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<ExecutionResult | null>(null)
  const [, setEditorRef] = useState<editor.IStandaloneCodeEditor | null>(null)
  
  // Load workspace from hash on mount
  useEffect(() => {
    loadFromHash()
    
    // Listen for hash changes (back/forward navigation)
    const handleHashChange = () => loadFromHash()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [loadFromHash])
  
  // Auto-save to hash with debounce
  useEffect(() => {
    if (isLoading) return
    const timer = setTimeout(() => saveToHash(), 500)
    return () => clearTimeout(timer)
  }, [workspace, isLoading, saveToHash])
  
  // Save snapshot to history periodically (every 30 seconds of activity)
  useEffect(() => {
    if (isLoading) return
    const timer = setTimeout(() => saveSnapshot(workspace), 30000)
    return () => clearTimeout(timer)
  }, [workspace, isLoading])
  
  const activeFile = workspace.files.find(f => f.name === workspace.activeFile)
  
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined && workspace.activeFile) {
      updateFile(workspace.activeFile, value)
    }
  }, [workspace.activeFile, updateFile])
  
  const handleShare = async () => {
    const url = getShareableURL(workspace)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleDownload = async () => {
    await downloadWorkspaceAsZip(workspace)
  }
  
  const handleRename = (oldName: string) => {
    if (renameValue.trim() && renameValue !== oldName) {
      renameFile(oldName, renameValue.trim())
    }
    setRenamingFile(null)
    setRenameValue('')
  }
  
  const startRename = (fileName: string) => {
    setRenamingFile(fileName)
    setRenameValue(fileName)
  }
  
  const handleRun = useCallback(async () => {
    if (!activeFile || isRunning) return
    
    setShowTerminal(true)
    setIsRunning(true)
    setOutput(null)
    
    try {
      const result = await execute(activeFile.content, activeFile.language || 'plaintext')
      setOutput(result)
    } catch (e) {
      setOutput({
        success: false,
        output: '',
        error: e instanceof Error ? e.message : 'Execution failed',
        duration: 0,
      })
    } finally {
      setIsRunning(false)
    }
  }, [activeFile, isRunning])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ? to show keyboard shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        // Don't trigger if typing in an input
        if (document.activeElement?.tagName !== 'INPUT') {
          setShowShortcuts(prev => !prev)
        }
      }
      // Ctrl/Cmd + P to open command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      // Ctrl/Cmd + Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
      // Ctrl/Cmd + S to save (hash is already auto-saved, just prevent default)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveToHash()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleRun, saveToHash])
  
  const handleEditorMount = (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
    setEditorRef(editor)
    
    // Add run command to editor
    editor.addCommand(_monaco.KeyMod.CtrlCmd | _monaco.KeyCode.Enter, () => {
      handleRun()
    })
  }
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-ide-bg">
        <div className="text-center">
          <Hash className="w-12 h-12 text-ide-accent mx-auto mb-4 animate-pulse" />
          <p className="text-ide-muted">Loading workspace...</p>
        </div>
      </div>
    )
  }
  
  const canRun = activeFile && ['javascript', 'typescript', 'python'].includes(activeFile.language || '')
  const canPreview = activeFile && ['html', 'css', 'javascript'].includes(activeFile.language || '')
  
  // Get HTML/CSS/JS content for preview
  const htmlFile = workspace.files.find(f => f.name.endsWith('.html'))
  const cssFile = workspace.files.find(f => f.name.endsWith('.css'))
  const jsFile = workspace.files.find(f => f.name.endsWith('.js') && !f.name.endsWith('.test.js'))
  
  return (
    <div className="h-screen flex flex-col bg-ide-bg">
      {/* Toolbar */}
      <header className="flex items-center justify-between px-4 py-2 bg-ide-surface border-b border-ide-border">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-ide-muted hover:text-ide-text transition">
            <ChevronLeft className="w-4 h-4" />
            <Hash className="w-5 h-5 text-ide-accent" />
            <span className="font-semibold">HashIDE</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-red-400 text-sm mr-4">{error}</span>
          )}
          
          {canRun && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 disabled:opacity-50 transition"
              title="Run (Ctrl+Enter)"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
          )}
          
          {canPreview && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                showPreview 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'bg-ide-border/50 text-ide-muted hover:text-ide-text'
              }`}
              title="Live Preview"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}
          
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
              showTerminal 
                ? 'bg-ide-accent/20 text-ide-accent' 
                : 'bg-ide-border/50 text-ide-muted hover:text-ide-text'
            }`}
            title="Toggle Terminal"
          >
            <TerminalIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowHistory(true)}
            className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowImport(true)}
            className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition"
            title="Import Files"
          >
            <Upload className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition"
            title="Download as ZIP"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ide-accent/10 text-ide-accent hover:bg-ide-accent/20 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <aside className="w-56 bg-ide-surface border-r border-ide-border flex flex-col">
          <div className="p-3 border-b border-ide-border flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-ide-muted font-semibold">Files</span>
            <button 
              onClick={() => setShowNewFileModal(true)}
              className="p-1 rounded hover:bg-ide-border transition"
              title="New file"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            {workspace.files.map((file) => (
              <div
                key={file.name}
                className={`group flex items-center gap-2 px-3 py-1.5 cursor-pointer transition ${
                  file.name === workspace.activeFile 
                    ? 'bg-ide-accent/10 text-ide-accent' 
                    : 'hover:bg-ide-border/50'
                }`}
                onClick={() => renamingFile !== file.name && setActiveFile(file.name)}
              >
                <FileCode className="w-4 h-4 flex-shrink-0" />
                {renamingFile === file.name ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(file.name)
                      if (e.key === 'Escape') {
                        setRenamingFile(null)
                        setRenameValue('')
                      }
                    }}
                    onBlur={() => handleRename(file.name)}
                    className="flex-1 text-sm bg-ide-bg border border-ide-accent rounded px-1 outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm truncate flex-1">{file.name}</span>
                )}
                {renamingFile !== file.name && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startRename(file.name)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-ide-accent transition"
                    title="Rename"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
                {workspace.files.length > 1 && renamingFile !== file.name && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFile(file.name)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>
        
        {/* Editor + Terminal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center bg-ide-surface border-b border-ide-border">
            {activeFile && (
              <div className="flex items-center gap-2 px-4 py-2 bg-ide-bg border-r border-ide-border">
                <FileCode className="w-4 h-4 text-ide-accent" />
                <span className="text-sm">{activeFile.name}</span>
              </div>
            )}
          </div>
          
          {/* Monaco Editor */}
          <div className={`${showTerminal ? 'flex-1' : 'flex-1'}`}>
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.language}
                value={activeFile.content}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                theme={workspace.settings?.theme === 'light' ? 'vs' : 'vs-dark'}
                options={{
                  fontSize: workspace.settings?.fontSize || 14,
                  tabSize: workspace.settings?.tabSize || 2,
                  wordWrap: workspace.settings?.wordWrap ? 'on' : 'off',
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  padding: { top: 16 },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-ide-muted">
                <p>No file selected</p>
              </div>
            )}
          </div>
          
          {/* Terminal */}
          {showTerminal && (
            <Terminal
              output={output}
              isRunning={isRunning}
              onClose={() => setShowTerminal(false)}
              onRun={handleRun}
            />
          )}
        </main>
        
        {/* HTML Preview Panel */}
        {showPreview && htmlFile && (
          <div className="w-1/2">
            <HTMLPreview
              html={htmlFile.content}
              css={cssFile?.content}
              js={jsFile?.content}
              isOpen={showPreview}
              onClose={() => setShowPreview(false)}
            />
          </div>
        )}
      </div>
      
      {/* Status bar */}
      <footer className="flex items-center justify-between px-4 py-1 bg-ide-surface border-t border-ide-border text-xs text-ide-muted">
        <div className="flex items-center gap-4">
          <span>{activeFile?.language || 'plaintext'}</span>
          <span>{workspace.files.length} file{workspace.files.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-ide-muted/50">Ctrl+Enter to run</span>
          <span>UTF-8</span>
          <span>Tab Size: {workspace.settings?.tabSize || 2}</span>
        </div>
      </footer>
      
      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {/* History Panel */}
      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />
      
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      
      {/* Import Modal */}
      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
      
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onRun={handleRun}
        onSettings={() => setShowSettings(true)}
        onHistory={() => setShowHistory(true)}
        onImport={() => setShowImport(true)}
        onDownload={handleDownload}
        onShare={handleShare}
        onShortcuts={() => setShowShortcuts(true)}
        onNewFile={() => setShowNewFileModal(true)}
      />
      
      {/* New File Modal */}
      <NewFileModal isOpen={showNewFileModal} onClose={() => setShowNewFileModal(false)} />
    </div>
  )
}
