import { useEffect, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Hash, Share2, Plus, FileCode, X, Trash2, Github, GitBranch, FolderGit2,
  ChevronLeft, Check, Play, Terminal as TerminalIcon, Settings, History, Keyboard, Download, Upload, Eye, Search as SearchIcon, Menu, FolderOpen, Cloud, CloudOff, Code, Lock
} from 'lucide-react'

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
import '../styles/cyberpunk.css'
import RemixButton from '../components/RemixButton'
import RemixAttribution from '../components/RemixAttribution'
import EmbedModal from '../components/EmbedModal'
import { saveToRecentProjects } from '../lib/recentProjects'
import { getShortHash, getProjectTitle, getWorkspaceSize } from '../lib/hash'
import { getCurrentUser, isAuthenticated } from '../lib/github'
import FileTree from '../components/FileTree'
import { useWorkspaceStore } from '../store/workspace'
import { getShareableURL } from '../lib/hash'
import { execute, ExecutionResult, ProjectFile, setLoadingCallback, isPyodideLoaded, preloadPyodide } from '../lib/sandbox'
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
import EditorPaneV2 from '../components/EditorPaneV2'
import UpgradeModal from '../components/UpgradeModal'
import { PaneManagerProvider, usePaneManager } from '../components/PaneManager'
import { GitHubRepo } from '../lib/github'
import { ApiError } from '../lib/api'
import { File } from '../types/workspace'

function EditorPaneRoot({ 
  files, 
  onFileChange, 
  theme, 
  settings,
  onReady,
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
  onReady?: (api: { openFile: (fileName: string) => void }) => void
}) {
  const { state, openFileExternal, syncWithFiles } = usePaneManager()
  
  useEffect(() => {
    if (onReady) {
      onReady({ openFile: openFileExternal })
    }
  }, [onReady, openFileExternal])
  
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

export default function IDE() {
  const {
    workspace,
    isLoading,
    error,
    loadFromHash,
    saveToHash,
    saveToCloud,
    updateCloud,
    cloudProjectId,
    isSaving,
    updateFile,
    deleteFile,
    renameFile,
  } = useWorkspaceStore()

  const [copied, setCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(true)
  const [showCloudSaved, setShowCloudSaved] = useState(false)
  
  useEffect(() => {
    setIsSaved(false)
    const timer = setTimeout(() => setIsSaved(true), 1000)
    return () => clearTimeout(timer)
  }, [workspace])
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
  const [showEmbed, setShowEmbed] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'cloud_limit' | 'private_project' | 'generic'>('generic')
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>()
  const [sourceRepo, setSourceRepo] = useState<GitHubRepo | null>(null)
  const [githubUser, setGithubUser] = useState<{ login: string; avatar_url: string } | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<ExecutionResult | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [isResizingTerminal, setIsResizingTerminal] = useState(false)
  const [previewWidth, setPreviewWidth] = useState(400)
  const [isResizingPreview, setIsResizingPreview] = useState(false)
  
  const [editorApi, setEditorApi] = useState<{ openFile: (fileName: string) => void } | null>(null)
  
  const handleSelectFile = useCallback((fileName: string) => {
    if (editorApi) {
      editorApi.openFile(fileName)
    }
  }, [editorApi])
  
  useEffect(() => {
    loadFromHash()
    getCurrentUser().then(setGithubUser).catch(() => setGithubUser(null))
    
    preloadPyodide()

    const handleHashChange = () => loadFromHash()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [loadFromHash])
  
  useEffect(() => {
    if (!isResizingTerminal) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY
      setTerminalHeight(Math.max(100, Math.min(window.innerHeight * 0.6, newHeight)))
    }
    
    const handleMouseUp = () => setIsResizingTerminal(false)
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingTerminal])
  
  useEffect(() => {
    if (!isResizingPreview) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX
      setPreviewWidth(Math.max(200, Math.min(window.innerWidth * 0.7, newWidth)))
    }
    
    const handleMouseUp = () => setIsResizingPreview(false)
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingPreview])
  
  useEffect(() => {
    if (isLoading) return
    const timer = setTimeout(() => saveToHash(), 500)
    return () => clearTimeout(timer)
  }, [workspace, isLoading, saveToHash])
  
  useEffect(() => {
    if (isLoading) return
    const timer = setTimeout(() => saveSnapshot(workspace), 30000)
    return () => clearTimeout(timer)
  }, [workspace, isLoading])
  
  // Save to recent projects when workspace changes
  useEffect(() => {
    if (isLoading || !window.location.hash) return
    
    const hash = window.location.hash.slice(1)
    if (!hash) return
    
    // Debounce to avoid too frequent saves
    const timer = setTimeout(() => {
      saveToRecentProjects({
        hash,
        shortHash: getShortHash(),
        title: getProjectTitle(workspace),
        files: workspace.files.map(f => f.name),
      })
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [workspace, isLoading])
  
  const activeFile = workspace.files.find(f => f.name === workspace.activeFile)
  
  const handleShare = async () => {
    const url = getShareableURL(workspace)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setShowMobileMenu(false)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleShareX = () => {
    const url = getShareableURL(workspace)
    const text = `Check out my code on HashIDEA!`
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(xUrl, '_blank')
  }
  
  const handleDownload = async () => {
    await downloadWorkspaceAsZip(workspace)
    setShowMobileMenu(false)
  }

  const handleSaveToCloud = async () => {
    // Gate: require GitHub login first
    if (!isAuthenticated()) {
      setShowGitHub(true)
      return
    }

    try {
      let id: string | null
      if (cloudProjectId) {
        await updateCloud()
        id = cloudProjectId
      } else {
        const title = getProjectTitle(workspace)
        id = await saveToCloud({ title })
      }
      if (id) {
        const url = `${window.location.origin}/p/${id}`
        await navigator.clipboard.writeText(url)
        setShowCloudSaved(true)
        setTimeout(() => setShowCloudSaved(false), 3000)
      }
    } catch (e: any) {
      if (e instanceof ApiError && e.code === 'plan_limit') {
        setUpgradeReason(e.feature === 'private_projects' ? 'private_project' : 'cloud_limit')
        setUpgradeMessage(e.message)
        setShowUpgrade(true)
      } else if (e instanceof ApiError && e.status === 401) {
        // Token expired or invalid — prompt re-login
        setShowGitHub(true)
      } else {
        useWorkspaceStore.setState({ error: e?.message || 'Failed to save project' })
      }
    }
  }
  
  const handleRun = useCallback(async () => {
    if (!activeFile || isRunning) return
    
    setShowTerminal(true)
    setIsRunning(true)
    setOutput(null)
    setShowMobileMenu(false)
    setLoadingStatus(null)
    
    if (activeFile.language === 'python' && !isPyodideLoaded()) {
      setLoadingCallback((status) => setLoadingStatus(status))
    }
    
    try {
      let result
      if (activeFile.language === 'python') {
        const pythonFiles: ProjectFile[] = workspace.files
          .filter(f => f.name.endsWith('.py'))
          .map(f => ({ name: f.name, content: f.content }))
        
        result = await execute(activeFile.content, 'python', activeFile.name, pythonFiles)
      } else {
        result = await execute(activeFile.content, activeFile.language || 'plaintext')
      }
      
      setLoadingCallback(null)
      setLoadingStatus(null)
      setIsRunning(false)
      setOutput(result)
    } catch (e) {
      setLoadingCallback(null)
      setLoadingStatus(null)
      setIsRunning(false)
      setOutput({
        success: false,
        output: '',
        error: e instanceof Error ? e.message : 'Execution failed',
        duration: 0,
      })
    }
  }, [activeFile, isRunning, workspace.files])
  
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
  
  const hasFrameworkFiles = workspace.files.some(f =>
    f.name.endsWith('.tsx') || f.name.endsWith('.jsx') || f.name.endsWith('.svelte')
  )
  const htmlFile = workspace.files.find(f => f.name.endsWith('.html'))
  const cssFile = workspace.files.find(f => f.name.endsWith('.css'))
  const jsFile = workspace.files.find(f => f.name.endsWith('.js') && !f.name.endsWith('.test.js'))
  
  const hasMarkdown = workspace.files.some(f => f.name.endsWith('.md') || f.name.endsWith('.mdx'))
  const canPreview = htmlFile || hasFrameworkFiles || hasMarkdown
  
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
            <button onClick={handleShareX} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ide-border/50">
              <XIcon className="w-4 h-4" /> Post on X
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
                  onClick={() => { handleSelectFile(file.name); setShowSidebar(false); }}
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
            <span className="font-semibold hidden sm:inline">HashIDEA</span>
          </Link>

          {githubUser && (
            <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-ide-border">
              <img src={githubUser.avatar_url} alt={githubUser.login} className="w-5 h-5 rounded-full" />
              <span className="text-xs text-ide-muted">{githubUser.login}</span>
            </div>
          )}
        </div>
        
        {/* Desktop toolbar */}
        <div className="hidden md:flex items-center gap-2">
          {/* Size indicator + hash overflow warning */}
          {(() => {
            if (error === 'hash_size_exceeded') {
              return (
                <button
                  onClick={() => {
                    setUpgradeReason('cloud_limit')
                    setUpgradeMessage('Your project is too large for URL storage. Save to the cloud to keep working.')
                    setShowUpgrade(true)
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium cursor-pointer hover:bg-red-500/20 transition-colors mr-2"
                  title="Project exceeds URL size limit"
                >
                  <CloudOff className="w-3.5 h-3.5" />
                  Too large for URL - save to cloud
                </button>
              )
            }
            const size = getWorkspaceSize(workspace)
            if (size.percent >= 80) {
              return (
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono mr-2 ${
                    size.percent >= 95
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                  title={`${Math.round(size.compressedBytes / 1024)}KB / ${Math.round(size.maxCompressed / 1024)}KB compressed`}
                >
                  {size.percent}% URL capacity
                </span>
              )
            }
            if (error && error !== 'hash_size_exceeded') {
              return <span className="text-red-400 text-sm mr-4">{error}</span>
            }
            return null
          })()}
          
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
          
          <RemixButton />
          
          <button onClick={() => setShowEmbed(true)} className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-ide-text transition" title="Embed Project">
            <Code className="w-4 h-4" />
          </button>
          
          <button onClick={handleSaveToCloud} disabled={isSaving} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer ${
            error === 'hash_size_exceeded'
              ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 animate-pulse-slow'
              : !githubUser
              ? 'bg-ide-border/50 text-ide-muted hover:text-emerald-400 hover:bg-emerald-500/10'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          }`} title={!githubUser ? 'Sign in to save to cloud' : cloudProjectId ? 'Update cloud project' : 'Save to cloud'}>
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            ) : showCloudSaved ? (
              <Check className="w-4 h-4" />
            ) : !githubUser ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : showCloudSaved ? 'Copied!' : !githubUser ? 'Sign in to Save' : cloudProjectId ? 'Update' : 'Save to Cloud'}
          </button>

          <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ide-accent/10 text-ide-accent hover:bg-ide-accent/20 transition">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>

          <button onClick={handleShareX} className="p-1.5 rounded-lg bg-ide-border/50 text-ide-muted hover:text-[#1DA1F2] transition" title="Share on X">
            <XIcon className="w-4 h-4" />
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
      
      {/* Remix attribution banner */}
      {workspace.remix?.from && (
        <div className="px-4 py-2 bg-ide-surface/50 border-b border-ide-border">
          <RemixAttribution />
        </div>
      )}
      
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
              onSelectFile={handleSelectFile}
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
                  <img src={githubUser.avatar_url} alt={githubUser.login} className="w-5 h-5 rounded-full" />
                  <span className="text-ide-text truncate">{githubUser.login}</span>
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
          {/* EditorPane with nested split support - centralized state management */}
          <div style={{ flex: showTerminal ? '1 1 0' : '1 1 100%', minHeight: 0, overflow: 'hidden' }}>
            <PaneManagerProvider
              initialTabs={workspace.files.slice(0, 3).map(f => f.name)}
              initialActiveFile={workspace.activeFile || null}
              workspaceKey={workspace.files.map(f => f.name).sort().join(',')}
            >
              <EditorPaneRoot
                files={workspace.files}
                onFileChange={updateFile}
                theme={(workspace.settings?.theme || 'dark') as 'light' | 'dark'}
                settings={{
                  fontSize: workspace.settings?.fontSize,
                  tabSize: workspace.settings?.tabSize,
                  wordWrap: workspace.settings?.wordWrap,
                  minimap: workspace.settings?.minimap,
                  lineNumbers: workspace.settings?.lineNumbers,
                }}
                onReady={setEditorApi}
              />
            </PaneManagerProvider>
          </div>
          {/* Terminal - resizable, at bottom of main */}
          {showTerminal && (
            <div className="flex flex-col border-t border-ide-border" style={{ height: terminalHeight }}>
              {/* Resize handle */}
              <div 
                className="h-1 bg-ide-border hover:bg-purple-500 cursor-row-resize transition-colors"
                onMouseDown={() => setIsResizingTerminal(true)}
              />
              <div className="flex-1 min-h-0">
                <Terminal output={output} isRunning={isRunning} loadingStatus={loadingStatus} onClose={() => setShowTerminal(false)} />
              </div>
            </div>
          )}
        </main>
        
        {/* HTML Preview Panel - side panel on desktop with resize handle */}
        {showPreview && canPreview && (
          <>
            {/* Mobile: fullscreen overlay */}
            <div className="md:hidden fixed inset-0 z-50 bg-ide-bg flex flex-col">
              <HTMLPreview html={htmlFile?.content} css={cssFile?.content} js={jsFile?.content} files={workspace.files} isOpen={showPreview} onClose={() => setShowPreview(false)} />
            </div>
            {/* Desktop: side panel with resize */}
            <div className="hidden md:flex relative">
              <div 
                className="w-1 bg-ide-border hover:bg-purple-500 cursor-col-resize transition-colors"
                onMouseDown={() => setIsResizingPreview(true)}
              />
              <div style={{ width: previewWidth }} className="relative">
                {/* Overlay to capture mouse during drag/resize */}
                {(isResizingPreview || isResizingTerminal) && (
                  <div className="absolute inset-0 z-50" />
                )}
                <HTMLPreview html={htmlFile?.content} css={cssFile?.content} js={jsFile?.content} files={workspace.files} isOpen={showPreview} onClose={() => setShowPreview(false)} />
              </div>
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
      <EmbedModal isOpen={showEmbed} onClose={() => setShowEmbed(false)} />
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} reason={upgradeReason} message={upgradeMessage} />
    </div>
  )
}
