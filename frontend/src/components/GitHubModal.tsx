import { useState, useEffect } from 'react'
import { X, Github, Download, Loader2, ExternalLink, LogOut, GitFork, GitPullRequest } from 'lucide-react'
import { 
  parseGitHubUrl, 
  importRepo, 
  isAuthenticated, 
  getCurrentUser, 
  startDeviceFlow, 
  pollForToken,
  logout,
  forkRepo,
  createBranch,
  createOrUpdateFile,
  createPullRequest,
  GitHubRepo
} from '../lib/github'
import { useWorkspaceStore } from '../store/workspace'

interface GitHubModalProps {
  isOpen: boolean
  onClose: () => void
}

type Mode = 'import' | 'auth' | 'contribute'

export default function GitHubModal({ isOpen, onClose }: GitHubModalProps) {
  const [mode, setMode] = useState<Mode>('import')
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<{ login: string; avatar_url: string } | null>(null)
  const [deviceCode, setDeviceCode] = useState<{ user_code: string; verification_uri: string } | null>(null)
  
  // PR form
  const [prTitle, setPrTitle] = useState('')
  const [prBody, setPrBody] = useState('')
  const [prBranch, setPrBranch] = useState('')
  const [prUrl, setPrUrl] = useState('')
  const [sourceRepo, setSourceRepo] = useState<GitHubRepo | null>(null)
  
  const { workspace, setWorkspace } = useWorkspaceStore()
  
  useEffect(() => {
    if (isOpen) {
      checkAuth()
    }
  }, [isOpen])
  
  const checkAuth = async () => {
    if (isAuthenticated()) {
      const userData = await getCurrentUser()
      setUser(userData)
    } else {
      setUser(null)
    }
  }
  
  if (!isOpen) return null
  
  const handleImport = async () => {
    setError('')
    const parsed = parseGitHubUrl(repoUrl)
    
    if (!parsed) {
      setError('Invalid GitHub URL. Use format: github.com/owner/repo')
      return
    }
    
    setLoading(true)
    
    try {
      const files = await importRepo(parsed)
      
      if (files.length === 0) {
        setError('No supported files found in repository')
        return
      }
      
      // Load into workspace
      setWorkspace({
        version: 1,
        files: files.map(f => ({
          name: f.name,
          content: f.content,
          language: getLanguage(f.name),
        })),
        activeFile: files[0].name,
        settings: workspace.settings,
      })
      
      setSourceRepo(parsed)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import')
    } finally {
      setLoading(false)
    }
  }
  
  const handleStartAuth = async () => {
    setError('')
    setLoading(true)
    
    try {
      const device = await startDeviceFlow()
      setDeviceCode({
        user_code: device.user_code,
        verification_uri: device.verification_uri,
      })
      setMode('auth')
      
      // Start polling
      await pollForToken(device.device_code, device.interval)
      await checkAuth()
      setDeviceCode(null)
      setMode('import')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed')
      setDeviceCode(null)
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogout = () => {
    logout()
    setUser(null)
  }
  
  const handleContribute = async () => {
    if (!sourceRepo || !user) return
    
    setError('')
    setLoading(true)
    
    try {
      // 1. Fork the repo
      const fork = await forkRepo(sourceRepo)
      
      // 2. Create a new branch
      const branchName = prBranch || `hashide-${Date.now()}`
      await createBranch(
        { owner: fork.owner, repo: fork.repo, branch: sourceRepo.branch },
        branchName,
        sourceRepo.branch
      )
      
      // 3. Push all files
      for (const file of workspace.files) {
        await createOrUpdateFile(
          { owner: fork.owner, repo: fork.repo, branch: branchName },
          file.name,
          file.content,
          `Update ${file.name} via HashIDE`,
          branchName
        )
      }
      
      // 4. Create PR
      const url = await createPullRequest(
        sourceRepo,
        fork.owner,
        branchName,
        prTitle || 'Changes from HashIDE',
        prBody || 'This PR was created using HashIDE.'
      )
      
      setPrUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create PR')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-ide-surface border border-ide-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ide-border">
          <div className="flex items-center gap-3">
            <Github className="w-5 h-5" />
            <h2 className="font-semibold">GitHub</h2>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 text-sm text-ide-muted">
                <img src={user.avatar_url} className="w-5 h-5 rounded-full" alt="" />
                <span>{user.login}</span>
                <button onClick={handleLogout} className="p-1 hover:text-red-400" title="Logout">
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ide-border/50 transition text-ide-muted hover:text-ide-text">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-ide-border">
          <button
            onClick={() => setMode('import')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition ${
              mode === 'import' ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-muted hover:text-ide-text'
            }`}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Import
          </button>
          <button
            onClick={() => setMode('contribute')}
            disabled={!sourceRepo}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition ${
              mode === 'contribute' ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-muted hover:text-ide-text'
            } disabled:opacity-50`}
          >
            <GitPullRequest className="w-4 h-4 inline mr-2" />
            Contribute
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {mode === 'import' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-ide-muted mb-2">Repository URL</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="github.com/owner/repo or owner/repo"
                  className="w-full px-3 py-2.5 bg-ide-bg border border-ide-border rounded-lg focus:border-ide-accent focus:outline-none text-sm font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                />
              </div>
              
              <p className="text-xs text-ide-muted">
                Import files from any public GitHub repository. Limited to 50 files.
              </p>
              
              {!user && (
                <button
                  onClick={handleStartAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-ide-border hover:bg-ide-border/50 text-sm transition"
                >
                  <Github className="w-4 h-4" />
                  Login with GitHub for higher rate limits
                </button>
              )}
            </div>
          )}
          
          {mode === 'auth' && deviceCode && (
            <div className="text-center space-y-4">
              <p className="text-sm text-ide-muted">Enter this code on GitHub:</p>
              <div className="text-3xl font-mono font-bold tracking-wider text-ide-accent">
                {deviceCode.user_code}
              </div>
              <a
                href={deviceCode.verification_uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ide-accent text-white text-sm"
              >
                Open GitHub <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-xs text-ide-muted">Waiting for authorization...</p>
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-ide-muted" />
            </div>
          )}
          
          {mode === 'contribute' && (
            <div className="space-y-4">
              {!user ? (
                <div className="text-center py-4">
                  <p className="text-sm text-ide-muted mb-4">Login to contribute back to the repository</p>
                  <button
                    onClick={handleStartAuth}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ide-accent text-white text-sm"
                  >
                    <Github className="w-4 h-4" />
                    Login with GitHub
                  </button>
                </div>
              ) : prUrl ? (
                <div className="text-center py-4">
                  <GitPullRequest className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-sm text-ide-muted mb-4">Pull request created!</p>
                  <a
                    href={prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ide-accent text-white text-sm"
                  >
                    View PR <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-ide-muted mb-2">PR Title</label>
                    <input
                      type="text"
                      value={prTitle}
                      onChange={(e) => setPrTitle(e.target.value)}
                      placeholder="Changes from HashIDE"
                      className="w-full px-3 py-2.5 bg-ide-bg border border-ide-border rounded-lg focus:border-ide-accent focus:outline-none text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-ide-muted mb-2">Description</label>
                    <textarea
                      value={prBody}
                      onChange={(e) => setPrBody(e.target.value)}
                      placeholder="Describe your changes..."
                      rows={3}
                      className="w-full px-3 py-2.5 bg-ide-bg border border-ide-border rounded-lg focus:border-ide-accent focus:outline-none text-sm resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-ide-muted mb-2">Branch name (optional)</label>
                    <input
                      type="text"
                      value={prBranch}
                      onChange={(e) => setPrBranch(e.target.value)}
                      placeholder="hashide-changes"
                      className="w-full px-3 py-2.5 bg-ide-bg border border-ide-border rounded-lg focus:border-ide-accent focus:outline-none text-sm font-mono"
                    />
                  </div>
                  
                  <p className="text-xs text-ide-muted">
                    This will fork the repo, create a branch, push your changes, and open a PR.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-5 py-4 border-t border-ide-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-ide-muted hover:text-ide-text hover:bg-ide-border/50 transition"
          >
            Cancel
          </button>
          
          {mode === 'import' && (
            <button
              onClick={handleImport}
              disabled={loading || !repoUrl}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-ide-accent text-white hover:bg-ide-accent-glow disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Import
            </button>
          )}
          
          {mode === 'contribute' && user && !prUrl && (
            <button
              onClick={handleContribute}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-ide-accent text-white hover:bg-ide-accent-glow disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitFork className="w-4 h-4" />}
              Fork & Create PR
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    py: 'python',
    js: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    jsx: 'javascript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
  }
  return map[ext || ''] || 'plaintext'
}
