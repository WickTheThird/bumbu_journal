/**
 * UserProfile - public profile showing a user's cloud projects
 * Route: /u/:username
 */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Hash, Eye } from 'lucide-react'
import { getUserProjects, ProjectListItem } from '../lib/api'

export default function UserProfile() {
  const { username } = useParams<{ username: string }>()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    let cancelled = false

    getUserProjects(username)
      .then((data) => {
        if (!cancelled) { setProjects(data.projects); setLoading(false) }
      })
      .catch((e) => {
        if (!cancelled) { setError(e.message || 'User not found'); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-ide-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ide-accent" />
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
        <Link to="/ide" className="text-sm text-slate-400 hover:text-white transition-all duration-300">
          Open IDE
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src={`https://github.com/${username}.png?size=80`}
            alt={username}
            className="w-16 h-16 rounded-full bg-ide-surface"
          />
          <div>
            <h1 className="text-2xl font-bold">@{username}</h1>
            <p className="text-slate-400 text-sm">{projects.length} public project{projects.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {error && (
          <p className="text-slate-400 text-center py-8">{error}</p>
        )}

        {/* Projects grid */}
        {projects.length === 0 && !error ? (
          <p className="text-ide-muted text-center py-12">No public projects yet</p>
        ) : (
          <div className="grid gap-4">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/p/${p.id}`}
                className="block bg-ide-surface border border-ide-border rounded-xl p-5 hover:border-ide-accent/30 hover:bg-ide-surface-2 cursor-pointer transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-lg mb-1">{p.title}</h2>
                    {p.description && (
                      <p className="text-slate-400 text-sm">{p.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ide-muted">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {p.view_count}
                    </span>
                    <span>{new Date(p.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
