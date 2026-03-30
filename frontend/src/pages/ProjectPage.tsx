/**
 * ProjectPage - loads a cloud project by ID, shows metadata, then opens in IDE
 * Route: /p/:id
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Hash, Eye, GitFork, Trash2, Pencil, ExternalLink, User } from 'lucide-react'
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
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Project not found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300 transition">
            &larr; Back to HashIDEA
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <Hash className="w-5 h-5 text-purple-500" />
          <span className="font-semibold">HashIDEA</span>
        </Link>
        {currentUser && (
          <div className="flex items-center gap-2">
            <img src={currentUser.avatar_url} alt={currentUser.login} className="w-6 h-6 rounded-full" />
            <span className="text-sm text-gray-400">{currentUser.login}</span>
          </div>
        )}
      </nav>

      {/* Project card */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">{project.title}</h1>
              {project.description && (
                <p className="text-gray-400">{project.description}</p>
              )}
            </div>
            {hasReact && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">React</span>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-8">
            {project.owner && (
              <Link to={`/u/${project.owner.username}`} className="flex items-center gap-1.5 hover:text-white transition">
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
          <div className="bg-white/[0.02] border border-white/5 rounded-xl mb-8 divide-y divide-white/5">
            {project.workspace.files.map((f) => (
              <div key={f.name} className="px-4 py-2.5 text-sm flex items-center gap-2">
                <span className="text-gray-500 font-mono text-xs w-16 text-right">{f.language}</span>
                <span className="text-gray-300">{f.name}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpen}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Editor
            </button>

            <button
              onClick={handleFork}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition"
            >
              <GitFork className="w-4 h-4" />
              Fork
            </button>

            {isOwner && (
              <>
                <button
                  onClick={handleOpen}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 font-medium transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
