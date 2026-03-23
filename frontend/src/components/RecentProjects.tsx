import { useState, useEffect } from 'react'
import { Clock, FileCode, X } from 'lucide-react'
import { 
  getRecentProjects, 
  removeFromRecentProjects, 
  clearRecentProjects,
  formatRelativeTime,
  RecentProject 
} from '../lib/recentProjects'

interface RecentProjectsProps {
  maxDisplay?: number
  showClearButton?: boolean
}

export default function RecentProjects({ 
  maxDisplay = 6,
  showClearButton = true 
}: RecentProjectsProps) {
  const [projects, setProjects] = useState<RecentProject[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setProjects(getRecentProjects())
  }, [])

  if (projects.length === 0) {
    return null
  }

  const displayProjects = showAll ? projects : projects.slice(0, maxDisplay)

  const handleRemove = (shortHash: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeFromRecentProjects(shortHash)
    setProjects(getRecentProjects())
  }

  const handleClearAll = () => {
    if (confirm('Clear all recent projects? This cannot be undone.')) {
      clearRecentProjects()
      setProjects([])
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          Continue where you left off
        </h2>
        {showClearButton && projects.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-gray-400 transition"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayProjects.map((project) => (
          <a
            key={project.shortHash}
            href={`/ide#${project.hash}`}
            className="group relative bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-lg p-3 transition"
          >
            {/* Remove button */}
            <button
              onClick={(e) => handleRemove(project.shortHash, e)}
              className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition"
              title="Remove from recent"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>

            {/* Project icon */}
            <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center mb-2">
              <FileCode className="w-5 h-5 text-gray-400" />
            </div>

            {/* Title */}
            <h3 className="font-medium text-white text-sm truncate mb-1">
              {project.title}
            </h3>

            {/* Time */}
            <p className="text-xs text-gray-500">
              {formatRelativeTime(project.lastOpened)}
            </p>

            {/* File count */}
            <p className="text-xs text-gray-600 mt-1">
              {project.files.length} file{project.files.length !== 1 ? 's' : ''}
            </p>
          </a>
        ))}
      </div>

      {projects.length > maxDisplay && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm text-ide-accent hover:text-ide-accent-glow transition"
        >
          View all {projects.length} projects →
        </button>
      )}
    </div>
  )
}
