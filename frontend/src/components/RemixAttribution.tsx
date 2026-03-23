import { GitFork, ExternalLink } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'
import { formatRelativeTime } from '../lib/recentProjects'

export default function RemixAttribution() {
  const { workspace } = useWorkspaceStore()
  
  // Don't show if not a remix
  if (!workspace.remix?.from) {
    return null
  }
  
  const { from, author, created } = workspace.remix
  
  const handleViewOriginal = () => {
    // Note: We only have the short hash, so we can't actually link back
    // In Phase 2 with cloud storage, we could resolve this
    // For now, just show the hash
    alert(`Original project hash: ${from}\n\nNote: Direct links to original projects will be available in a future update.`)
  }
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-ide-accent/10 border border-ide-accent/20 rounded-lg text-sm">
      <GitFork className="w-4 h-4 text-ide-accent flex-shrink-0" />
      <span className="text-ide-muted">
        Remixed from{' '}
        <button
          onClick={handleViewOriginal}
          className="text-ide-accent hover:underline font-mono"
        >
          {from}
        </button>
        {author && (
          <>
            {' '}by{' '}
            <span className="text-ide-text font-medium">@{author}</span>
          </>
        )}
        {created && (
          <span className="text-ide-muted/60">
            {' '}• {formatRelativeTime(created)}
          </span>
        )}
      </span>
      <button
        onClick={handleViewOriginal}
        className="ml-auto p-1 hover:bg-ide-border/50 rounded transition"
        title="View original project"
      >
        <ExternalLink className="w-3 h-3 text-ide-muted" />
      </button>
    </div>
  )
}
