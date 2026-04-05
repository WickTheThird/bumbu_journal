/**
 * ProjectPage - loads a cloud project by ID, shows metadata, then opens in IDE
 * Route: /p/:id
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Hash, Eye, GitFork, Trash2, Pencil, ExternalLink, User, Code } from 'lucide-react'
import DomainSettings from '../components/DomainSettings'
import { useWorkspaceStore } from '../store/workspace'
import { getProject, deleteProject, CloudProject } from '../lib/api'
import { isAuthenticated, getCurrentUser } from '../lib/github'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loadFromCloud, saveToCloud, setWorkspace } = useWorkspaceStore()

  const [project, setProject] = useState<CloudProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ login: string; avatar_url: string; id: number } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/', { replace: true })
      return
    }

    let cancelled = false

    getProject(id)
      .then((p) => {
        if (!cancelled) { setProject(p); setLoading(false) }
      })
      .catch((e) => {
        if (!cancelled) { setError(e.message || 'Project not found'); setLoading(false) }
      })

    if (isAuthenticated()) {
      getCurrentUser().then((u) => {
        if (!cancelled) setCurrentUser(u as { login: string; avatar_url: string; id: number } | null)
      }).catch(() => {})
    }

    return () => { cancelled = true }
  }, [id, navigate])

  const handleOpen = () => {
    if (!project || !id) return
    loadFromCloud(id).then(() => navigate('/ide', { replace: true }))
  }

  const handleFork = async () => {
    if (!project || !isAuthenticated()) return
    try {
      const forkedWorkspace = {
        ...project.workspace,
        remix: {
          from: id,
          author: project.owner?.username,
          created: Date.now(),
          title: project.title,
        },
      }
      setWorkspace(forkedWorkspace)
      const newId = await saveToCloud({ title: `${project.title} (fork)` })
      if (newId) {
        navigate(`/p/${newId}`, { replace: true })
      } else {
        navigate('/ide', { replace: true })
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fork project')
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteProject(id)
      navigate('/', { replace: true })
    } catch (e: any) {
      setError(e.message || 'Failed to delete')
      setDeleting(false)
    }
  }

  const isOwner = currentUser && project?.owner?.username === currentUser.login
  const fileCount = project?.workspace.files.length || 0
  const hasReact = project?.workspace.files.some(f => f.name.endsWith('.tsx') || f.name.endsWith('.jsx'))

  if (loading) {
    return (
      <div className="min-h-screen bg-ide-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ide-accent mx-auto mb-4" />
          <p className="text-slate-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-ide-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Project not found</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link to="/" className="text-ide-accent hover:text-ide-accent-glow transition-all duration-300">
            &larr; Back to HashIDEA
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-screen bg-ide-bg text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-ide-border">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300">
          <Hash className="w-5 h-5 text-ide-accent" />
          <span className="font-semibold">HashIDEA</span>
        </Link>
        {currentUser && (
          <div className="flex items-center gap-2">
            <img src={currentUser.avatar_url} alt={currentUser.login} className="w-6 h-6 rounded-full" />
            <span className="text-sm text-slate-400">{currentUser.login}</span>
          </div>
        )}
      </nav>

      {/* Project card */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-8 transition-all duration-300">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">{project.title}</h1>
              {project.description && (
                <p className="text-slate-400">{project.description}</p>
              )}
            </div>
            {hasReact && (
              <span className="text-xs bg-ide-accent/20 text-ide-accent px-2 py-1 rounded-full">React</span>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-8">
            {project.owner && (
              <Link to={`/u/${project.owner.username}`} className="flex items-center gap-1.5 hover:text-white transition-all duration-300">
                <User className="w-4 h-4" />
                {project.owner.username}
              </Link>
            )}
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {project.view_count} views
            </span>
            <span>{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>

          {/* File list */}
          <div className="bg-ide-surface border border-ide-border rounded-xl mb-8 divide-y divide-ide-border">
            {project.workspace.files.map((f) => (
              <div key={f.name} className="px-4 py-2.5 text-sm flex items-center gap-2">
                <span className="text-ide-muted font-mono text-xs w-16 text-right">{f.language}</span>
                <span className="text-slate-300">{f.name}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpen}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ide-accent hover:bg-ide-accent-glow text-white font-medium cursor-pointer transition-all duration-300"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Editor
            </button>

            <button
              onClick={handleFork}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ide-surface hover:bg-ide-surface-2 text-slate-300 font-medium cursor-pointer transition-all duration-300"
            >
              <GitFork className="w-4 h-4" />
              Fork
            </button>

            <button
              onClick={() => {
                const url = `${window.location.origin}/embed/${id}`
                navigator.clipboard.writeText(url)
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ide-surface hover:bg-ide-surface-2 text-slate-300 font-medium cursor-pointer transition-all duration-300"
              title="Copy embed URL for this project"
            >
              <Code className="w-4 h-4" />
              Embed
            </button>

            {isOwner && (
              <>
                <button
                  onClick={handleOpen}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ide-surface hover:bg-ide-surface-2 text-slate-300 font-medium cursor-pointer transition-all duration-300"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium cursor-pointer transition-all duration-300 disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-2.5 rounded-xl bg-ide-surface hover:bg-ide-surface-2 text-slate-400 text-sm cursor-pointer transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ide-surface hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-medium cursor-pointer transition-all duration-300"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>

          {/* Domain settings for owners */}
          {isOwner && (
            <div className="mt-8 pt-6 border-t border-ide-border/50">
              <DomainSettings projectId={id!} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
