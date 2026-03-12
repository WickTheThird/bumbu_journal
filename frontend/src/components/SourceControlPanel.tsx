import { useState, useEffect, useMemo } from 'react'
import { X, GitCommit, FileDiff, ChevronDown, ChevronRight, Plus, Minus, File } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'
import { fetchFileContent, GitHubRepo } from '../lib/github'

interface SourceControlPanelProps {
  isOpen: boolean
  onClose: () => void
  sourceRepo: GitHubRepo | null
}

interface FileChange {
  name: string
  status: 'added' | 'modified' | 'deleted'
  originalContent?: string
  currentContent: string
}

interface Commit {
  sha: string
  message: string
  author: string
  date: string
  url: string
}

export default function SourceControlPanel({ isOpen, onClose, sourceRepo }: SourceControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'changes' | 'history'>('changes')
  const [changes, setChanges] = useState<FileChange[]>([])
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [originalFiles, setOriginalFiles] = useState<Map<string, string>>(new Map())
  
  const { workspace } = useWorkspaceStore()
  
  // Fetch original files and commits when repo changes
  useEffect(() => {
    if (!isOpen || !sourceRepo) return
    
    const fetchOriginals = async () => {
      setLoading(true)
      try {
        // Fetch original content for each file
        const originals = new Map<string, string>()
        for (const file of workspace.files) {
          try {
            const content = await fetchFileContent(sourceRepo, file.name)
            originals.set(file.name, content)
          } catch {
            // File doesn't exist in original repo (new file)
          }
        }
        setOriginalFiles(originals)
        
        // Fetch commit history
        const token = localStorage.getItem('github_token')
        const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        
        const commitsRes = await fetch(
          `https://api.github.com/repos/${sourceRepo.owner}/${sourceRepo.repo}/commits?per_page=20`,
          { headers }
        )
        if (commitsRes.ok) {
          const data = await commitsRes.json()
          setCommits(data.map((c: any) => ({
            sha: c.sha.substring(0, 7),
            message: c.commit.message.split('\n')[0],
            author: c.commit.author.name,
            date: new Date(c.commit.author.date).toLocaleDateString(),
            url: c.html_url,
          })))
        }
      } catch (e) {
        console.error('Failed to fetch source control data:', e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOriginals()
  }, [isOpen, sourceRepo, workspace.files])
  
  // Calculate changes
  const fileChanges = useMemo(() => {
    const changes: FileChange[] = []
    
    for (const file of workspace.files) {
      const original = originalFiles.get(file.name)
      
      if (original === undefined) {
        // New file
        changes.push({
          name: file.name,
          status: 'added',
          currentContent: file.content,
        })
      } else if (original !== file.content) {
        // Modified file
        changes.push({
          name: file.name,
          status: 'modified',
          originalContent: original,
          currentContent: file.content,
        })
      }
    }
    
    // Check for deleted files
    for (const [name] of originalFiles) {
      if (!workspace.files.find(f => f.name === name)) {
        changes.push({
          name,
          status: 'deleted',
          originalContent: originalFiles.get(name),
          currentContent: '',
        })
      }
    }
    
    return changes
  }, [workspace.files, originalFiles])
  
  const selectedChange = fileChanges.find(c => c.name === selectedFile)
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-ide-surface border border-ide-border rounded-xl w-full max-w-4xl h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ide-border">
          <div className="flex items-center gap-3">
            <GitCommit className="w-5 h-5" />
            <h2 className="font-semibold">Source Control</h2>
            {sourceRepo && (
              <span className="text-sm text-ide-muted">
                {sourceRepo.owner}/{sourceRepo.repo}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ide-border/50 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {!sourceRepo ? (
          <div className="flex-1 flex items-center justify-center text-ide-muted">
            <p>Import a GitHub repository first to see changes</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-ide-border">
              <button
                onClick={() => setActiveTab('changes')}
                className={`px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === 'changes' ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-muted hover:text-ide-text'
                }`}
              >
                <FileDiff className="w-4 h-4 inline mr-2" />
                Changes ({fileChanges.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === 'history' ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-muted hover:text-ide-text'
                }`}
              >
                <GitCommit className="w-4 h-4 inline mr-2" />
                History
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {activeTab === 'changes' && (
                <>
                  {/* File list */}
                  <div className="w-64 border-r border-ide-border overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-ide-muted text-sm">Loading...</div>
                    ) : fileChanges.length === 0 ? (
                      <div className="p-4 text-ide-muted text-sm">No changes</div>
                    ) : (
                      <div className="py-2">
                        {fileChanges.map(change => (
                          <button
                            key={change.name}
                            onClick={() => setSelectedFile(change.name)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-ide-border/50 transition ${
                              selectedFile === change.name ? 'bg-ide-accent/10 text-ide-accent' : ''
                            }`}
                          >
                            {change.status === 'added' && <Plus className="w-3 h-3 text-green-400" />}
                            {change.status === 'modified' && <FileDiff className="w-3 h-3 text-yellow-400" />}
                            {change.status === 'deleted' && <Minus className="w-3 h-3 text-red-400" />}
                            <span className="truncate">{change.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Diff view */}
                  <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                    {selectedChange ? (
                      <DiffView
                        original={selectedChange.originalContent || ''}
                        current={selectedChange.currentContent}
                        status={selectedChange.status}
                      />
                    ) : (
                      <div className="text-ide-muted text-center mt-20">
                        Select a file to see changes
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {activeTab === 'history' && (
                <div className="flex-1 overflow-y-auto p-4">
                  {commits.length === 0 ? (
                    <div className="text-ide-muted text-sm">No commits found</div>
                  ) : (
                    <div className="space-y-2">
                      {commits.map(commit => (
                        <a
                          key={commit.sha}
                          href={commit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg border border-ide-border hover:border-ide-accent/50 transition"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs text-ide-accent bg-ide-accent/10 px-1.5 py-0.5 rounded">
                              {commit.sha}
                            </code>
                            <span className="text-xs text-ide-muted">{commit.date}</span>
                          </div>
                          <div className="text-sm font-medium truncate">{commit.message}</div>
                          <div className="text-xs text-ide-muted mt-1">{commit.author}</div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function DiffView({ original, current, status }: { original: string; current: string; status: string }) {
  if (status === 'added') {
    return (
      <div className="space-y-1">
        {current.split('\n').map((line, i) => (
          <div key={i} className="flex">
            <span className="w-10 text-right pr-2 text-ide-muted select-none">{i + 1}</span>
            <span className="flex-1 bg-green-500/10 text-green-400 px-2">+ {line}</span>
          </div>
        ))}
      </div>
    )
  }
  
  if (status === 'deleted') {
    return (
      <div className="space-y-1">
        {original.split('\n').map((line, i) => (
          <div key={i} className="flex">
            <span className="w-10 text-right pr-2 text-ide-muted select-none">{i + 1}</span>
            <span className="flex-1 bg-red-500/10 text-red-400 px-2">- {line}</span>
          </div>
        ))}
      </div>
    )
  }
  
  // Simple line-by-line diff for modified files
  const originalLines = original.split('\n')
  const currentLines = current.split('\n')
  const maxLines = Math.max(originalLines.length, currentLines.length)
  
  const diffLines: { type: 'same' | 'add' | 'remove'; line: string; num: number }[] = []
  
  // Very simple diff - compare line by line
  for (let i = 0; i < maxLines; i++) {
    const orig = originalLines[i]
    const curr = currentLines[i]
    
    if (orig === curr) {
      if (orig !== undefined) {
        diffLines.push({ type: 'same', line: orig, num: i + 1 })
      }
    } else {
      if (orig !== undefined) {
        diffLines.push({ type: 'remove', line: orig, num: i + 1 })
      }
      if (curr !== undefined) {
        diffLines.push({ type: 'add', line: curr, num: i + 1 })
      }
    }
  }
  
  return (
    <div className="space-y-0.5">
      {diffLines.map((d, i) => (
        <div key={i} className="flex">
          <span className="w-10 text-right pr-2 text-ide-muted select-none">{d.num}</span>
          <span className={`flex-1 px-2 ${
            d.type === 'add' ? 'bg-green-500/10 text-green-400' :
            d.type === 'remove' ? 'bg-red-500/10 text-red-400' :
            ''
          }`}>
            {d.type === 'add' ? '+ ' : d.type === 'remove' ? '- ' : '  '}{d.line}
          </span>
        </div>
      ))}
    </div>
  )
}
