import { useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import type { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { 
  Hash, Share2, Plus, FileCode, X, Trash2, Github, GitBranch, FolderGit2,
  ChevronLeft, Check, Play, Terminal as TerminalIcon, Settings, History, Keyboard, Download, Upload, Eye, Twitter, Search as SearchIcon, Menu, FolderOpen, Cloud, CloudOff
} from 'lucide-react'
import '../styles/cyberpunk.css'
import { getCurrentUser } from '../lib/github'
import FileTree from '../components/FileTree'
import { useWorkspaceStore } from '../store/workspace'
import { getShareableURL } from '../lib/hash'
import { execute, ExecutionResult, ProjectFile } from '../lib/sandbox'
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
import SearchPanel from '../components/SearchPanel'
import GitHubModal from '../components/GitHubModal'
import SourceControlPanel from '../components/SourceControlPanel'
import { GitHubRepo } from '../lib/github'

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
  const [isSaved, setIsSaved] = useState(true)
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)
  const [showSourceControl, setShowSourceControl] = useState(false)
  const [sourceRepo, setSourceRepo] = useState<GitHubRepo | null>(null)
  const [githubUser, setGithubUser] = useState<{ login: string } | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<ExecutionResult | null>(null)
  const [, setEditorRef] = useState<editor.IStandaloneCodeEditor | null>(null)
  
  // Load workspace from hash on mount
  useEffect(() => {
    loadFromHash()
    getCurrentUser().then(setGithubUser).catch(() => setGithubUser(null))
    
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
      setIsSaved(false)
      updateFile(workspace.activeFile, value)
      // Mark as saved after debounce (URL updates automatically)
      const timer = setTimeout(() => setIsSaved(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [workspace.activeFile, updateFile])
  
  const handleShare = async () => {
    const url = getShareableURL(workspace)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setShowMobileMenu(false)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleShareTwitter = () => {
    const url = getShareableURL(workspace)
    const text = `Check out my code on HashIDE!`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank')
  }
  
  const handleDownload = async () => {
    await downloadWorkspaceAsZip(workspace)
    setShowMobileMenu(false)
  }
  
  const handleRun = useCallback(async () => {
    if (!activeFile || isRunning) return
    
    setShowTerminal(true)
    setIsRunning(true)
    setOutput(null)
    setShowMobileMenu(false)
    
    try {
      console.log('[IDE] Executing:', activeFile.language, activeFile.content.substring(0, 50))
      
      // For Python, pass all .py files to enable imports
      let result
      if (activeFile.language === 'python') {
        const pythonFiles: ProjectFile[] = workspace.files
          .filter(f => f.name.endsWith('.py'))
          .map(f => ({ name: f.name, content: f.content }))
        
        console.log('[IDE] Python project files:', pythonFiles.map(f => f.name))
        result = await execute(activeFile.content, 'python', activeFile.name, pythonFiles)
      } else {
        result = await execute(activeFile.content, activeFile.language || 'plaintext')
      }
      
      console.log('[IDE] Execution result:', result)
      setIsRunning(false)
      setOutput(result)
    } catch (e) {
      console.error('[IDE] Execution error:', e)
      setIsRunning(false)
      setOutput({
        success: false,
        output: '',
        error: e instanceof Error ? e.message : 'Execution failed',
        duration: 0,
      })
    }
  }, [activeFile, isRunning, workspace.files])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement?.tagName !== 'INPUT') {
          setShowShortcuts(prev => !prev)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveToHash()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleRun, saveToHash])
  
  const handleEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    setEditorRef(editor)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun()
    })
    
    // TypeScript compiler options for JSX
    const compilerOptions = {
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      allowNonTsExtensions: true,
      allowJs: true,
      strict: false,
      skipLibCheck: true,
      noEmit: true,
    }
    
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions)
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions)
    
    // Comprehensive React types with proper JSX support
    const reactDts = `
declare namespace React {
  type CSSProperties = Record<string, string | number>;
  type ReactNode = ReactElement | string | number | boolean | null | undefined;
  interface ReactElement<P = any> { type: any; props: P; key: string | null; }
  type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactElement | null;
  
  function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  function useRef<T>(initial: T): { current: T };
  function useContext<T>(context: Context<T>): T;
  function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  
  const Fragment: symbol;
  
  interface Context<T> {
    Provider: FC<{ value: T; children?: ReactNode }>;
  }
  
  interface HTMLProps {
    children?: ReactNode;
    className?: string;
    id?: string;
    style?: CSSProperties;
    onClick?: (e: any) => void;
    onChange?: (e: any) => void;
    onSubmit?: (e: any) => void;
    onKeyDown?: (e: any) => void;
    [key: string]: any;
  }
}

declare module 'react' {
  export = React;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | null): { render(element: any): void };
}

declare namespace JSX {
  interface Element extends React.ReactElement {}
  interface IntrinsicElements {
    [elemName: string]: React.HTMLProps;
  }
}
`;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(reactDts, 'file:///node_modules/@types/react/index.d.ts')
    monaco.languages.typescript.javascriptDefaults.addExtraLib(reactDts, 'file:///node_modules/@types/react/index.d.ts')
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
  
  // Check if project has framework files (React/Vue)
  const hasFrameworkFiles = workspace.files.some(f => 
    f.name.endsWith('.tsx') || f.name.endsWith('.jsx')
  )
  const htmlFile = workspace.files.find(f => f.name.endsWith('.html'))
  const cssFile = workspace.files.find(f => f.name.endsWith('.css'))
  const jsFile = workspace.files.find(f => f.name.endsWith('.js') && !f.name.endsWith('.test.js'))
  
  // Can preview if has HTML file OR has framework files
  const canPreview = htmlFile || hasFrameworkFiles
  
  return (
    <div className="h-screen flex flex-col bg-ide-bg">
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-ide-surface border-l border-ide-border p-4 space-y-2">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setShowMobileMenu(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* View options */}
            <p className="text-xs text-ide-muted uppercase tracking-wide px-1 pt-2">View</p>
            <button onClick={() => { setShowTerminal(!showTerminal); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <TerminalIcon className="w-4 h-4" /> {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
            </button>
            {canPreview && (
              <button onClick={() => { setShowPreview(!showPreview); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
                <Eye className="w-4 h-4" /> {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            )}
            
            {/* File actions */}
            <p className="text-xs text-ide-muted uppercase tracking-wide px-1 pt-4">Files</p>
            <button onClick={() => { setShowNewFileModal(true); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <Plus className="w-4 h-4" /> New File
            </button>
            <button onClick={() => { setShowGitHub(true); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <Github className="w-4 h-4" /> GitHub
            </button>
            <button onClick={() => { setShowSourceControl(true); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <GitBranch className="w-4 h-4" /> Source Control
            </button>
            <button onClick={() => { setShowImport(true); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <Upload className="w-4 h-4" /> Import
            </button>
            <button onClick={handleDownload} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <Download className="w-4 h-4" /> Download ZIP
            </button>
            
            {/* Tools */}
            <p className="text-xs text-ide-muted uppercase tracking-wide px-1 pt-4">Tools</p>
            <button onClick={() => { setShowSearch(true); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <SearchIcon className="w-4 h-4" /> Search in Files
            </button>
            <button onClick={() => { setShowHistory(true); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <History className="w-4 h-4" /> Version History
            </button>
            <button onClick={() => { setShowSettings(true); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <Settings className="w-4 h-4" /> Settings
            </button>
            
            {/* Share */}
            <p className="text-xs text-ide-muted uppercase tracking-wide px-1 pt-4">Share</p>
            <button onClick={handleShareTwitter} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <Twitter className="w-4 h-4" /> Post on Twitter
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-ide-surface border-r border-ide-border flex flex-col">
            <div className="p-3 border-b border-ide-border flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-ide-muted font-semibold">Files</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowNewFileModal(true)} className="p-1 rounded hover:bg-ide-border transition" title="New file">
                  <Plus className="w-4 h-4" />
                </button>
                <button onClick={() => setShowSidebar(false)} className="p-1 rounded hover:bg-ide-border transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {workspace.files.map((file) => (
                <div
                  key={file.name}
                  className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition ${
                    file.name === workspace.activeFile ? 'bg-ide-accent/10 text-ide-accent' : 'hover:bg-ide-border/50'
                  }`}
                  onClick={() => { setActiveFile(file.name); setShowSidebar(false); }}
                >
                  <FileCode className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  {workspace.files.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteFile(file.name); }}
                      className="p-1 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-ide-surface border-b border-ide-border">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile file drawer toggle */}
          <button onClick={() => setShowSidebar(true)} className="md:hidden p-1.5 rounded-lg hover:bg-ide-border/50 transition">
            <FolderOpen className="w-5 h-5" />
          </button>
          
          <Link to="/" className="flex items-center gap-1 sm:gap-2 text-ide-muted hover:text-ide-text transition">
            <ChevronLeft className="w-4 h-4 hidden sm:block" />
            <Hash className="w-5 h-5 text-ide-accent" />
            <span className="font-semibold hidden sm:inline">HashIDE</span>
          </Link>
        </div>
        
        {/* Desktop toolbar */}
        <div className="hidden md:flex items-center gap-2">
          {error && <span className="text-red-400 text-sm mr-4">{error}</span>}
          
          {canRun && (
            <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 disabled:opacity-50 transition" title="Run (Ctrl+Enter)">
              <Play className="w-4 h-4" /> Run
            </button>
          )}
          
          {canPreview && (
            <button onClick={() => setShowPreview(!showPreview)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${showPreview ? 'bg-blue-600/20 text-blue-400' : 'bg-ide-border/50 text-ide-muted hover:text-ide-text'}`} title="Live Preview">
              <Eye className="w-4 h-4" /> Preview
            </button>
          )}
          
          <button onClick={() => setShowTerminal(!showTerminal)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${showTerminal ? 'bg-ide-accent/20 text-ide-accent' : 'bg-ide-border/50 text-ide-muted hover:text-ide-text'}`} title="Toggle Terminal">
            <TerminalIcon className="w-4 h-4" />
          </button>
          
          <button onClick={() => setShowSearch(true)} className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition" title="Search Files (Ctrl+Shift+F)">
            <SearchIcon className="w-4 h-4" />
          </button>
          
          <button onClick={() => setShowShortcuts(true)} className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition" title="Keyboard Shortcuts (?)">
            <Keyboard className="w-4 h-4" />
          </button>
          
          <button onClick={() => setShowHistory(true)} className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition" title="Version History">
            <History className="w-4 h-4" />
          </button>
          
          <button onClick={() => setShowImport(true)} className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition" title="Import Files">
            <Upload className="w-4 h-4" />
          </button>
          
          <button onClick={handleDownload} className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition" title="Download as ZIP">
            <Download className="w-4 h-4" />
          </button>
          
          <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ide-accent/10 text-ide-accent hover:bg-ide-accent/20 transition">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
          
          <button onClick={handleShareTwitter} className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-[#1DA1F2] transition" title="Share on Twitter/X">
            <Twitter className="w-4 h-4" />
          </button>
        </div>
        
        {/* Mobile toolbar */}
        <div className="flex md:hidden items-center gap-2">
          {canRun && (
            <button onClick={handleRun} disabled={isRunning} className="p-2 rounded-lg bg-green-600/20 text-green-400">
              <Play className="w-4 h-4" />
            </button>
          )}
          <button onClick={handleShare} className="p-2 rounded-lg bg-ide-accent/10 text-ide-accent">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowMobileMenu(true)} className="p-2 rounded-lg hover:bg-ide-border/50 transition">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar - lower z-index so Monaco hovers appear above */}
        <aside className="hidden md:flex w-56 bg-ide-surface border-r border-ide-border flex-col z-0 relative">
          {/* File tree header with actions */}
          <div className="p-3 border-b border-ide-border flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-ide-muted font-semibold">Explorer</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowNewFileModal(true)} className="p-1 rounded hover:bg-ide-border transition" title="New File">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setShowGitHub(true)} className="p-1 rounded hover:bg-ide-border transition" title="Clone from GitHub">
                <FolderGit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* File tree */}
          <div className="flex-1 overflow-y-auto">
            <FileTree
              files={workspace.files}
              activeFile={workspace.activeFile}
              onSelectFile={setActiveFile}
              onDeleteFile={deleteFile}
              onRenameFile={renameFile}
            />
          </div>
          
          {/* Bottom bar - Settings & GitHub */}
          <div className="border-t border-ide-border p-2 space-y-1">
            <button 
              onClick={() => setShowSourceControl(true)} 
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-ide-border/50 text-sm text-ide-muted hover:text-ide-text transition"
            >
              <GitBranch className="w-4 h-4" />
              <span>Source Control</span>
            </button>
            <button 
              onClick={() => setShowSettings(true)} 
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-ide-border/50 text-sm text-ide-muted hover:text-ide-text transition"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button 
              onClick={() => setShowGitHub(true)} 
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-ide-border/50 text-sm transition"
            >
              {githubUser ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-ide-accent/20 flex items-center justify-center text-xs text-ide-accent">
                    {githubUser.login[0].toUpperCase()}
                  </div>
                  <span className="text-ide-text">{githubUser.login}</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 text-ide-muted" />
                  <span className="text-ide-muted">Connect GitHub</span>
                </>
              )}
            </button>
          </div>
        </aside>
        
        {/* Editor + Terminal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar - scrollable on mobile */}
          <div className="flex items-center bg-ide-surface border-b border-ide-border overflow-x-auto scrollbar-hide">
            {workspace.files.map((file) => (
              <button
                key={file.name}
                onClick={() => setActiveFile(file.name)}
                className={`group flex items-center gap-2 px-3 py-2 border-r border-ide-border text-sm whitespace-nowrap transition flex-shrink-0 ${
                  file.name === workspace.activeFile ? 'bg-ide-bg text-ide-text' : 'bg-ide-surface text-ide-muted hover:text-ide-text hover:bg-ide-bg/50'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${file.name === workspace.activeFile ? 'text-ide-accent' : ''}`} />
                <span>{file.name}</span>
                {workspace.files.length > 1 && (
                  <X className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-red-400 transition hidden sm:block" onClick={(e) => { e.stopPropagation(); deleteFile(file.name); }} />
                )}
              </button>
            ))}
          </div>
          
          {/* Monaco Editor */}
          <div style={{ flex: showTerminal ? '1 1 0' : '1 1 100%', minHeight: 0, overflow: 'hidden' }}>
            {activeFile ? (
              <Editor
                height="100%"
                path={activeFile.name}
                language={activeFile.language}
                value={activeFile.content}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                theme={workspace.settings?.theme === 'light' ? 'vs' : 'vs-dark'}
                options={{
                  fontSize: workspace.settings?.fontSize || 14,
                  tabSize: workspace.settings?.tabSize || 2,
                  wordWrap: workspace.settings?.wordWrap ? 'on' : 'off',
                  minimap: { enabled: workspace.settings?.minimap ?? false },
                  lineNumbers: workspace.settings?.lineNumbers ?? true ? 'on' : 'off',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  padding: { top: 16 },
                  // Mobile optimizations
                  folding: false,
                  glyphMargin: false,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 3,
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
            <Terminal output={output} isRunning={isRunning} onClose={() => setShowTerminal(false)} onRun={handleRun} />
          )}
        </main>
        
        {/* HTML Preview Panel - side panel on desktop, fullscreen on mobile */}
        {showPreview && canPreview && (
          <>
            {/* Mobile: fullscreen overlay */}
            <div className="md:hidden fixed inset-0 z-50 bg-ide-bg flex flex-col">
              <HTMLPreview html={htmlFile?.content} css={cssFile?.content} js={jsFile?.content} files={workspace.files} isOpen={showPreview} onClose={() => setShowPreview(false)} />
            </div>
            {/* Desktop: side panel */}
            <div className="hidden md:block w-1/2">
              <HTMLPreview html={htmlFile?.content} css={cssFile?.content} js={jsFile?.content} files={workspace.files} isOpen={showPreview} onClose={() => setShowPreview(false)} />
            </div>
          </>
        )}
      </div>
      
      {/* Status bar - simplified on mobile */}
      <footer className="flex items-center justify-between px-2 sm:px-4 py-1 bg-ide-surface border-t border-ide-border text-xs text-ide-muted">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1">
            {isSaved ? <Cloud className="w-3 h-3 text-green-400" /> : <CloudOff className="w-3 h-3 text-yellow-400 animate-pulse" />}
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Saving...'}</span>
          </span>
          <span>{activeFile?.language || 'plaintext'}</span>
          <span className="hidden sm:inline">{workspace.files.length} file{workspace.files.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-ide-muted/50">Ctrl+Enter to run</span>
          <span>UTF-8</span>
          <a href="https://www.linkedin.com/in/filip-bumbu-410741262" target="_blank" rel="noopener noreferrer" className="hover:text-ide-accent transition">
            Filip Bumbu
          </a>
        </div>
      </footer>
      
      {/* Modals */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} onRun={handleRun} onSettings={() => setShowSettings(true)} onHistory={() => setShowHistory(true)} onImport={() => setShowImport(true)} onDownload={handleDownload} onShare={handleShare} onShortcuts={() => setShowShortcuts(true)} onNewFile={() => setShowNewFileModal(true)} />
      <NewFileModal isOpen={showNewFileModal} onClose={() => setShowNewFileModal(false)} />
      <SearchPanel isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <GitHubModal isOpen={showGitHub} onClose={() => setShowGitHub(false)} onImport={setSourceRepo} />
      <SourceControlPanel isOpen={showSourceControl} onClose={() => setShowSourceControl(false)} sourceRepo={sourceRepo} />
    </div>
  )
}
