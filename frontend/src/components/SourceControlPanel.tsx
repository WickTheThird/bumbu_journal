import { useState, useEffect, useMemo } from 'react'
import { 
  X, GitCommit, FileDiff, Plus, Minus, Check,
  RotateCcw, Upload, GitFork, GitPullRequest
} from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'
import { 
  VCSState, FileDiff as VCSDiff,
  loadVCS, saveVCS, stageFile, unstageFile, stageAll, unstageAll,
  commit, getCommitHistory, diffWithHead, diffWithCommit, checkout
} from '../lib/vcs'
import { GitHubRepo, getCurrentUser, forkRepo, createBranch, pushFiles, createPullRequest } from '../lib/github'

interface SourceControlPanelProps {
  isOpen: boolean
  onClose: () => void
  sourceRepo: GitHubRepo | null
}

export default function SourceControlPanel({ isOpen, onClose, sourceRepo }: SourceControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'changes' | 'history' | 'github'>('changes')
  const [vcs, setVcs] = useState<VCSState>(loadVCS)
  const [commitMessage, setCommitMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ login: string } | null>(null)
  const [pushStatus, setPushStatus] = useState<string>('')
  
  const { workspace, setWorkspace } = useWorkspaceStore()
  
  // Load VCS and check GitHub auth
  useEffect(() => {
    if (!isOpen) return
    setVcs(loadVCS())
    getCurrentUser().then(setUser).catch(() => setUser(null))
  }, [isOpen])
  
  // Calculate changes vs last commit
  const changes = useMemo(() => {
    const files = workspace.files.map(f => ({ name: f.name, content: f.content }))
    return selectedCommit 
      ? diffWithCommit(vcs, selectedCommit, files)
      : diffWithHead(vcs, files)
  }, [workspace.files, vcs, selectedCommit])
  
  const stagedChanges = changes.filter(c => vcs.staged.includes(c.name))
  const unstagedChanges = changes.filter(c => !vcs.staged.includes(c.name))
  const hasChanges = changes.length > 0
  
  const history = useMemo(() => getCommitHistory(vcs), [vcs])
  
  const handleStage = (filename: string) => {
    const newState = stageFile(vcs, filename)
    setVcs(newState)
    saveVCS(newState)
  }
  
  const handleUnstage = (filename: string) => {
    const newState = unstageFile(vcs, filename)
    setVcs(newState)
    saveVCS(newState)
  }
  
  const handleStageAll = () => {
    const files = workspace.files.map(f => ({ name: f.name, content: f.content }))
    const newState = stageAll(vcs, files)
    setVcs(newState)
    saveVCS(newState)
  }
  
  const handleUnstageAll = () => {
    const newState = unstageAll(vcs)
    setVcs(newState)
    saveVCS(newState)
  }
  
  const handleCommit = () => {
    if (!commitMessage.trim()) return
    const files = workspace.files.map(f => ({ name: f.name, content: f.content }))
    const newState = commit(vcs, commitMessage.trim(), files)
    setVcs(newState)
    saveVCS(newState)
    setCommitMessage('')
  }
  
  const handleCheckout = (hash: string) => {
    const result = checkout(vcs, hash)
    if (result) {
      setVcs(result.state)
      saveVCS(result.state)
      setWorkspace({
        version: 1,
        files: result.files.map(f => ({ name: f.name, content: f.content })),
        activeFile: result.files[0]?.name,
        settings: workspace.settings,
      })
    }
  }
  
  const handlePushToGitHub = async () => {
    if (!user || !sourceRepo) return
    setLoading(true)
    setPushStatus('Forking repository...')
    
    try {
      // Fork the repo
      const fork = await forkRepo(sourceRepo.owner, sourceRepo.repo)
      setPushStatus('Creating branch...')
      
      // Create a branch
      const branchName = `hashide-${Date.now()}`
      await createBranch(fork.owner, fork.repo, branchName)
      setPushStatus('Pushing files...')
      
      // Push files
      const files = workspace.files.map(f => ({ path: f.name, content: f.content }))
      await pushFiles(fork.owner, fork.repo, branchName, files, commitMessage || 'Update from HashIDE')
      setPushStatus('Creating pull request...')
      
      // Create PR
      const pr = await createPullRequest(
        sourceRepo.owner,
        sourceRepo.repo,
        `${fork.owner}:${branchName}`,
        'main',
        commitMessage || 'Update from HashIDE',
        'Changes made in HashIDE'
      )
      
      setPushStatus('')
      window.open(pr.html_url, '_blank')
    } catch (e: any) {
      setPushStatus(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  const selectedDiff = changes.find(c => c.name === selectedFile)
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-ide-surface border border-ide-border rounded-xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ide-border">
          <div className="flex items-center gap-3">
            <GitCommit className="w-5 h-5" />
            <h2 className="font-semibold">Source Control</h2>
            {vcs.commits.length > 0 && (
              <span className="text-xs text-ide-muted bg-ide-border/50 px-2 py-0.5 rounded">
                {vcs.commits.length} commits
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ide-border/50 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-ide-border">
          <button
            onClick={() => { setActiveTab('changes'); setSelectedCommit(null); }}
            className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'changes' ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-muted hover:text-ide-text'
            }`}
          >
            <FileDiff className="w-4 h-4" />
            Changes
            {hasChanges && <span className="bg-ide-accent text-xs px-1.5 rounded-full">{changes.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'history' ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-muted hover:text-ide-text'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            History
          </button>
          {sourceRepo && (
            <button
              onClick={() => setActiveTab('github')}
              className={`px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'github' ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-muted hover:text-ide-text'
              }`}
            >
              <Upload className="w-4 h-4" />
              Push to GitHub
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'changes' && (
            <>
              {/* Staging area */}
              <div className="w-72 border-r border-ide-border flex flex-col">
                {/* Commit input */}
                <div className="p-3 border-b border-ide-border">
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Commit message"
                    className="w-full px-3 py-2 bg-ide-bg border border-ide-border rounded-lg text-sm focus:border-ide-accent focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
                  />
                  <button
                    onClick={handleCommit}
                    disabled={!commitMessage.trim() || changes.length === 0}
                    className="w-full mt-2 px-3 py-2 bg-ide-accent hover:bg-ide-accent/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Commit {stagedChanges.length > 0 ? `(${stagedChanges.length} staged)` : `(${changes.length} files)`}
                  </button>
                </div>
                
                {/* Staged files */}
                {stagedChanges.length > 0 && (
                  <div className="border-b border-ide-border">
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-ide-muted">
                      <span>Staged Changes</span>
                      <button onClick={handleUnstageAll} className="hover:text-ide-text">Unstage All</button>
                    </div>
                    {stagedChanges.map(change => (
                      <FileItem
                        key={change.name}
                        change={change}
                        selected={selectedFile === change.name}
                        staged
                        onSelect={() => setSelectedFile(change.name)}
                        onToggle={() => handleUnstage(change.name)}
                      />
                    ))}
                  </div>
                )}
                
                {/* Unstaged files */}
                <div className="flex-1 overflow-y-auto">
                  {unstagedChanges.length > 0 && (
                    <>
                      <div className="flex items-center justify-between px-3 py-2 text-xs text-ide-muted">
                        <span>Changes</span>
                        <button onClick={handleStageAll} className="hover:text-ide-text">Stage All</button>
                      </div>
                      {unstagedChanges.map(change => (
                        <FileItem
                          key={change.name}
                          change={change}
                          selected={selectedFile === change.name}
                          staged={false}
                          onSelect={() => setSelectedFile(change.name)}
                          onToggle={() => handleStage(change.name)}
                        />
                      ))}
                    </>
                  )}
                  
                  {changes.length === 0 && (
                    <div className="p-4 text-sm text-ide-muted text-center">
                      {vcs.commits.length === 0 ? (
                        <>No commits yet. Make a commit to start tracking changes.</>
                      ) : (
                        <>No changes since last commit</>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Diff view */}
              <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                {selectedDiff ? (
                  <DiffView diff={selectedDiff} />
                ) : (
                  <div className="text-ide-muted text-center mt-20">
                    Select a file to see changes
                  </div>
                )}
              </div>
            </>
          )}
          
          {activeTab === 'history' && (
            <>
              {/* Commit list */}
              <div className="w-80 border-r border-ide-border overflow-y-auto">
                {history.length === 0 ? (
                  <div className="p-4 text-sm text-ide-muted">No commits yet</div>
                ) : (
                  <div className="py-2">
                    {history.map((c) => (
                      <button
                        key={c.hash}
                        onClick={() => { setSelectedCommit(c.hash); setActiveTab('changes'); }}
                        className={`w-full text-left px-3 py-2.5 hover:bg-ide-border/50 transition border-l-2 ${
                          vcs.head === c.hash ? 'border-ide-accent bg-ide-accent/5' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-ide-accent">{c.hash}</code>
                          {vcs.head === c.hash && (
                            <span className="text-xs bg-ide-accent/20 text-ide-accent px-1.5 rounded">HEAD</span>
                          )}
                        </div>
                        <div className="text-sm font-medium mt-1 truncate">{c.message}</div>
                        <div className="text-xs text-ide-muted mt-0.5">
                          {new Date(c.timestamp).toLocaleString()} · {c.files.length} files
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Selected commit details */}
              <div className="flex-1 p-4">
                {selectedCommit ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Comparing with {selectedCommit}</h3>
                      <button
                        onClick={() => handleCheckout(selectedCommit)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-ide-border/50 hover:bg-ide-border rounded-lg transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore this version
                      </button>
                    </div>
                    <p className="text-sm text-ide-muted">
                      Click "Changes" tab to see diff with this commit
                    </p>
                  </div>
                ) : (
                  <div className="text-ide-muted text-center mt-20">
                    Select a commit to compare
                  </div>
                )}
              </div>
            </>
          )}
          
          {activeTab === 'github' && sourceRepo && (
            <div className="flex-1 p-6">
              <div className="max-w-md mx-auto space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Push to GitHub</h3>
                  <p className="text-sm text-ide-muted">
                    Fork {sourceRepo.owner}/{sourceRepo.repo} and create a pull request
                  </p>
                </div>
                
                {!user ? (
                  <div className="text-center p-4 bg-ide-bg rounded-lg border border-ide-border">
                    <p className="text-sm text-ide-muted mb-3">Login to GitHub to push changes</p>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=public_repo&description=HashIDE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ide-accent hover:underline text-sm"
                    >
                      Get a Personal Access Token
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-ide-bg rounded-lg border border-ide-border">
                      <div className="w-8 h-8 rounded-full bg-ide-accent/20 flex items-center justify-center">
                        {user.login[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.login}</div>
                        <div className="text-xs text-ide-muted">Authenticated</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-ide-muted mb-1.5">PR Title / Commit Message</label>
                      <input
                        type="text"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        placeholder="What did you change?"
                        className="w-full px-3 py-2 bg-ide-bg border border-ide-border rounded-lg text-sm focus:border-ide-accent focus:outline-none"
                      />
                    </div>
                    
                    <div className="p-3 bg-ide-bg/50 rounded-lg text-sm">
                      <div className="flex items-center gap-2 text-ide-muted mb-2">
                        <GitFork className="w-4 h-4" />
                        <span>Will fork to: {user.login}/{sourceRepo.repo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-ide-muted">
                        <GitPullRequest className="w-4 h-4" />
                        <span>Creates PR to: {sourceRepo.owner}/{sourceRepo.repo}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handlePushToGitHub}
                      disabled={loading || changes.length === 0}
                      className="w-full px-4 py-3 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>{pushStatus || 'Processing...'}</>
                      ) : (
                        <>
                          <GitPullRequest className="w-4 h-4" />
                          Fork & Create Pull Request
                        </>
                      )}
                    </button>
                    
                    {pushStatus && pushStatus.startsWith('Error') && (
                      <p className="text-sm text-red-400 text-center">{pushStatus}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FileItem({ 
  change, 
  selected, 
  staged, 
  onSelect, 
  onToggle 
}: { 
  change: VCSDiff
  selected: boolean
  staged: boolean
  onSelect: () => void
  onToggle: () => void
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-ide-border/30 ${
        selected ? 'bg-ide-accent/10' : ''
      }`}
      onClick={onSelect}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="p-0.5 hover:bg-ide-border rounded"
      >
        {staged ? (
          <Minus className="w-3.5 h-3.5 text-ide-muted" />
        ) : (
          <Plus className="w-3.5 h-3.5 text-ide-muted" />
        )}
      </button>
      <span className={`w-1.5 h-1.5 rounded-full ${
        change.status === 'added' ? 'bg-green-400' :
        change.status === 'modified' ? 'bg-yellow-400' :
        'bg-red-400'
      }`} />
      <span className="flex-1 text-sm truncate">{change.name}</span>
      <span className="text-xs text-ide-muted">
        {change.status === 'added' ? 'A' : change.status === 'modified' ? 'M' : 'D'}
      </span>
    </div>
  )
}

function DiffView({ diff }: { diff: VCSDiff }) {
  if (diff.status === 'added') {
    return (
      <div className="space-y-0.5">
        <div className="text-xs text-green-400 mb-2">+ New file</div>
        {(diff.newContent || '').split('\n').map((line, i) => (
          <div key={i} className="flex">
            <span className="w-12 text-right pr-3 text-ide-muted select-none text-xs">{i + 1}</span>
            <span className="flex-1 bg-green-500/10 text-green-400 px-2">+ {line}</span>
          </div>
        ))}
      </div>
    )
  }
  
  if (diff.status === 'deleted') {
    return (
      <div className="space-y-0.5">
        <div className="text-xs text-red-400 mb-2">- File deleted</div>
        {(diff.oldContent || '').split('\n').map((line, i) => (
          <div key={i} className="flex">
            <span className="w-12 text-right pr-3 text-ide-muted select-none text-xs">{i + 1}</span>
            <span className="flex-1 bg-red-500/10 text-red-400 px-2">- {line}</span>
          </div>
        ))}
      </div>
    )
  }
  
  // Modified - show unified diff
  const oldLines = (diff.oldContent || '').split('\n')
  const newLines = (diff.newContent || '').split('\n')
  
  const result: { type: 'ctx' | 'add' | 'del'; line: string; num?: number }[] = []
  
  // Simple LCS-based diff
  let oi = 0, ni = 0
  
  while (oi < oldLines.length || ni < newLines.length) {
    if (oi >= oldLines.length) {
      result.push({ type: 'add', line: newLines[ni], num: ni + 1 })
      ni++
    } else if (ni >= newLines.length) {
      result.push({ type: 'del', line: oldLines[oi], num: oi + 1 })
      oi++
    } else if (oldLines[oi] === newLines[ni]) {
      result.push({ type: 'ctx', line: oldLines[oi], num: ni + 1 })
      oi++
      ni++
    } else {
      // Find if this line exists later in the other
      const oldInNew = newLines.indexOf(oldLines[oi], ni)
      const newInOld = oldLines.indexOf(newLines[ni], oi)
      
      if (oldInNew === -1 && newInOld === -1) {
        result.push({ type: 'del', line: oldLines[oi], num: oi + 1 })
        result.push({ type: 'add', line: newLines[ni], num: ni + 1 })
        oi++
        ni++
      } else if (oldInNew !== -1 && (newInOld === -1 || oldInNew - ni < newInOld - oi)) {
        result.push({ type: 'add', line: newLines[ni], num: ni + 1 })
        ni++
      } else {
        result.push({ type: 'del', line: oldLines[oi], num: oi + 1 })
        oi++
      }
    }
  }
  
  return (
    <div className="space-y-0.5">
      {result.map((r, i) => (
        <div key={i} className="flex">
          <span className="w-12 text-right pr-3 text-ide-muted select-none text-xs">{r.num || ''}</span>
          <span className={`flex-1 px-2 ${
            r.type === 'add' ? 'bg-green-500/10 text-green-400' :
            r.type === 'del' ? 'bg-red-500/10 text-red-400' :
            ''
          }`}>
            {r.type === 'add' ? '+ ' : r.type === 'del' ? '- ' : '  '}{r.line}
          </span>
        </div>
      ))}
    </div>
  )
}
