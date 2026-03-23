import { useState } from 'react'
import { GitFork, Check, Loader2 } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspace'
import { createRemix, encodeWorkspace } from '../lib/hash'
import { getCurrentUser } from '../lib/github'

interface RemixButtonProps {
  className?: string
}

export default function RemixButton({ className = '' }: RemixButtonProps) {
  const { workspace } = useWorkspaceStore()
  const [isRemixing, setIsRemixing] = useState(false)
  const [remixed, setRemixed] = useState(false)

  const handleRemix = async () => {
    setIsRemixing(true)
    
    try {
      // Get current user if logged in
      let author: string | undefined
      try {
        const user = await getCurrentUser()
        author = user?.login
      } catch {
        // Not logged in, that's fine
      }
      
      // Create remixed workspace
      const remixedWorkspace = createRemix(workspace, author)
      
      // Encode and update URL
      const newHash = encodeWorkspace(remixedWorkspace)
      window.history.pushState(null, '', `/ide#${newHash}`)
      
      // Reload to pick up new workspace
      window.location.reload()
      
      setRemixed(true)
    } catch (e) {
      console.error('Failed to remix:', e)
    } finally {
      setIsRemixing(false)
    }
  }

  return (
    <button
      onClick={handleRemix}
      disabled={isRemixing}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ide-accent/10 hover:bg-ide-accent/20 text-ide-accent transition ${className}`}
      title="Create your own copy of this project"
    >
      {isRemixing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : remixed ? (
        <Check className="w-4 h-4" />
      ) : (
        <GitFork className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isRemixing ? 'Remixing...' : remixed ? 'Remixed!' : 'Remix'}
      </span>
    </button>
  )
}
