import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, Lock, Globe, Trash2, Code, Check, Loader2, Search, ExternalLink } from 'lucide-react'
import BackgroundAnimation from '../components/BackgroundAnimation'
import GitHubModal from '../components/GitHubModal'
import { getMe, getMyProjects, deleteProject, ProjectListItem, UserInfo } from '../lib/api'
import { isAuthenticated } from '../lib/github'

export default function Dashboard() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      setShowLogin(true)
      setLoading(false)
      return
    }
    Promise.all([getMe(), getMyProjects()])
      .then(([me, proj]) => {
        setUser(me)
        setProjects(proj.projects)
        setLoading(false)
      })
      .catch(() => {
        setShowLogin(true)
        setLoading(false)
      })
  }, [])

  const handleLoginClose = () => {
    setShowLogin(false)
    if (isAuthenticated()) {
      setLoading(true)
      Promise.all([getMe(), getMyProjects()])
        .then(([me, proj]) => { setUser(me); setProjects(proj.projects); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }

  const handleCopyEmbed = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/embed/${id}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    setDeletingId(id)
    try {
      await deleteProject(id)
      setProjects(projects.filter(p => p.id !== id))
    } catch {}
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  const filtered = search
    ? projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
    : projects

  const planBadgeColor: Record<string, string> = {
    free: 'bg-slate-500/20 text-slate-400',
    starter: 'bg-emerald-500/20 text-emerald-400',
    pro: 'bg-ide-accent/20 text-ide-accent',
    team: 'bg-amber-500/20 text-amber-400',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ide-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-ide-accent" />
      </div>
    )
  }

  if (!isAuthenticated() || !user) {
    return (
      <div className="min-h-screen bg-ide-bg flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Sign in to access your dashboard</p>
          <button onClick={() => setShowLogin(true)} className="px-6 py-3 bg-ide-accent hover:bg-ide-accent-glow text-white rounded-lg cursor-pointer transition-all">
            Sign in with GitHub
          </button>
        </div>
        <GitHubModal isOpen={showLogin} onClose={handleLoginClose} onImport={handleLoginClose} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ide-bg text-ide-text relative flex flex-col">
      <BackgroundAnimation />

      {/* Nav */}
      <nav className="relative z-10 border-b border-ide-border/50 bg-ide-bg/70 backdrop-blur-xl">
        <div className="section-container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-ide-accent to-purple-700 flex items-center justify-center rounded-lg shadow-neon-purple group-hover:shadow-glow transition-shadow duration-300">
              <span className="text-white font-bold text-sm">#</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">HashIDEA</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/explore" className="text-sm text-ide-muted hover:text-white transition-colors cursor-pointer">Explore</Link>
            <Link to="/pricing" className="text-sm text-ide-muted hover:text-white transition-colors cursor-pointer">Pricing</Link>
            <Link to="/ide" className="px-4 py-2 bg-ide-accent hover:bg-ide-accent-glow text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-neon-purple hover:shadow-glow cursor-pointer">
              Open IDE
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1">
        <div className="section-container py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <img src={user.avatar_url} alt={user.username} className="w-12 h-12 rounded-xl bg-ide-surface" />
                  <div>
                    <div className="font-semibold text-white">@{user.username}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planBadgeColor[user.plan] || planBadgeColor.free}`}>
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-ide-surface rounded-lg border border-ide-border text-center">
                    <div className="text-lg font-bold text-white">{projects.length}</div>
                    <div className="text-xs text-ide-muted">Projects</div>
                  </div>
                  <div className="p-3 bg-ide-surface rounded-lg border border-ide-border text-center">
                    <div className="text-lg font-bold text-white">{projects.reduce((s, p) => s + p.view_count, 0)}</div>
                    <div className="text-xs text-ide-muted">Total Views</div>
                  </div>
                </div>

                {/* Nav links */}
                <nav className="space-y-1">
                  <Link to={`/u/${user.username}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-ide-surface transition-all cursor-pointer">
                    <Globe className="w-4 h-4" /> Public Profile
                  </Link>
                  <Link to="/pricing" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-ide-surface transition-all cursor-pointer">
                    <ExternalLink className="w-4 h-4" /> Manage Plan
                  </Link>
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Your Projects</h1>
                <Link
                  to="/ide"
                  className="flex items-center gap-2 px-4 py-2 bg-neon-green/10 text-neon-green text-sm font-medium rounded-lg hover:bg-neon-green/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> New Project
                </Link>
              </div>

              {/* Search */}
              {projects.length > 3 && (
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ide-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Find a project..."
                    className="w-full pl-10 pr-4 py-2 bg-ide-surface border border-ide-border rounded-lg text-sm text-white placeholder:text-ide-muted focus:outline-none focus:border-ide-accent/50 transition-all"
                  />
                </div>
              )}

              {/* Project list */}
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-400 mb-4">{search ? 'No matching projects' : 'No projects yet'}</p>
                  {!search && (
                    <Link to="/ide" className="inline-flex items-center gap-2 px-6 py-2.5 bg-ide-accent hover:bg-ide-accent-glow text-white text-sm rounded-lg transition-all cursor-pointer">
                      <Plus className="w-4 h-4" /> Create your first project
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((p) => (
                    <div
                      key={p.id}
                      className="group flex items-center gap-4 p-4 bg-ide-surface rounded-xl border border-ide-border hover:border-ide-accent/20 transition-all duration-200"
                    >
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/p/${p.id}`} className="text-white font-medium hover:text-ide-accent transition-colors cursor-pointer truncate">
                            {p.title}
                          </Link>
                          {p.is_public ? (
                            <span className="text-xs text-neon-green bg-neon-green/10 px-1.5 py-0.5 rounded flex-shrink-0">Public</span>
                          ) : (
                            <span className="text-xs text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                              <Lock className="w-3 h-3" /> Private
                            </span>
                          )}
                        </div>
                        {p.description && (
                          <p className="text-xs text-slate-500 truncate">{p.description}</p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 text-xs text-ide-muted flex-shrink-0">
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="w-3.5 h-3.5" /> {p.view_count}
                        </span>
                        <span title="Updated">
                          {new Date(p.updated_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => handleCopyEmbed(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-ide-border/50 transition-all cursor-pointer"
                          title="Copy embed URL"
                          aria-label="Copy embed URL"
                        >
                          {copiedId === p.id ? <Check className="w-4 h-4 text-neon-green" /> : <Code className="w-4 h-4" />}
                        </button>
                        <Link
                          to={`/p/${p.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-ide-border/50 transition-all cursor-pointer"
                          title="View project"
                          aria-label="View project"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            confirmDeleteId === p.id
                              ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                              : 'text-slate-500 hover:text-red-400 hover:bg-ide-border/50'
                          }`}
                          title={confirmDeleteId === p.id ? 'Click again to confirm' : 'Delete project'}
                          aria-label="Delete project"
                        >
                          {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-ide-border py-8 px-6 relative z-10">
        <div className="section-container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ide-muted">
          <span className="text-slate-400">HashIDEA</span>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-white transition-colors cursor-pointer">Home</Link>
            <Link to="/explore" className="hover:text-white transition-colors cursor-pointer">Explore</Link>
            <Link to="/pricing" className="hover:text-white transition-colors cursor-pointer">Pricing</Link>
          </div>
        </div>
      </footer>

      <GitHubModal isOpen={showLogin} onClose={handleLoginClose} onImport={handleLoginClose} />
    </div>
  )
}
