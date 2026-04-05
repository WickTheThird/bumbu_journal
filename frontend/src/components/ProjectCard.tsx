import { Link } from 'react-router-dom'
import { Eye, GitFork } from 'lucide-react'
import { GalleryProject } from '../lib/api'

interface ProjectCardProps {
  project: GalleryProject
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/p/${project.id}`}
      className="group p-5 bg-ide-surface rounded-xl border border-ide-border hover:border-ide-accent/30 transition-all duration-300 hover:shadow-glow cursor-pointer flex flex-col"
    >
      {/* Title */}
      <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-ide-accent transition-colors truncate">
        {project.title}
      </h3>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
          {project.description}
        </p>
      )}
      {!project.description && <div className="flex-1" />}

      {/* Footer: owner + stats */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-ide-border/50">
        {/* Owner */}
        {project.owner ? (
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={project.owner.avatar_url || `https://github.com/${project.owner.username}.png?size=32`}
              alt={project.owner.username}
              className="w-5 h-5 rounded-full flex-shrink-0"
            />
            <span className="text-xs text-slate-400 truncate">{project.owner.username}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Anonymous</span>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
          <span className="flex items-center gap-1" title={`${project.view_count} views`}>
            <Eye className="w-3.5 h-3.5" />
            {project.view_count}
          </span>
          {project.fork_count > 0 && (
            <span className="flex items-center gap-1" title={`${project.fork_count} forks`}>
              <GitFork className="w-3.5 h-3.5" />
              {project.fork_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
