/**
 * UserProfile - enhanced public profile with bio, stats, follow, and projects
 * Route: /u/:username
 */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Github, ExternalLink, Calendar, Loader2 } from 'lucide-react'
import BackgroundAnimation from '../components/BackgroundAnimation'
import ProjectCard from '../components/ProjectCard'
import GitHubModal from '../components/GitHubModal'
import { getUserProfile, getUserProjects, followUser, unfollowUser, UserProfile as UserProfileType, GalleryProject } from '../lib/api'
import { isAuthenticated } from '../lib/github'

export default function UserProfile() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [projects, setProjects] = useState<GalleryProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [followLoading, setFollowLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (!username) return
    let cancelled = false

    Promise.all([
      getUserProfile(username),
      getUserProjects(username),
    ]).then(([prof, proj]) => {
      if (cancelled) return
      setProfile(prof)
      setProjects(proj.projects.map(p => ({
        ...p,
        like_count: (p as any).like_count || 0,
        fork_count: (p as any).fork_count || 0,
        tags: (p as any).tags || '',
        owner: { username: prof.username, avatar_url: prof.avatar_url },
      })) as GalleryProject[])
      setLoading(false)
    }).catch((e) => {
      if (!cancelled) { setError(e.message || 'User not found'); setLoading(false) }
    })

    return () => { cancelled = true }
  }, [username])

  const handleFollow = async () => {
    if (!username || !profile) return
    if (!isAuthenticated()) { setShowLogin(true); return }

    setFollowLoading(true)
    try {
      if (profile.is_following) {
        await unfollowUser(username)
        setProfile({ ...profile, is_following: false, follower_count: profile.follower_count - 1 })
      } else {
        await followUser(username)
        setProfile({ ...profile, is_following: true, follower_count: profile.follower_count + 1 })
      }
    } catch {}
    setFollowLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ide-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-ide-accent" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-ide-bg flex flex-col items-center justify-center text-white">
        <p className="text-slate-400 mb-4">{error || 'User not found'}</p>
        <Link to="/" className="text-ide-accent hover:text-ide-accent-glow transition-colors cursor-pointer">Back to home</Link>
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
            <a href="https://github.com/WickTheThird/HashIDEA" target="_blank" rel="noopener" className="text-ide-muted hover:text-white transition-colors cursor-pointer" aria-label="View on GitHub">
              <Github className="w-5 h-5" />
            </a>
            <Link to="/ide" className="px-4 py-2 bg-ide-accent hover:bg-ide-accent-glow text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-neon-purple hover:shadow-glow cursor-pointer">
              Open IDE
            </Link>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <section className="relative z-10 pt-12 pb-8 px-6">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={profile.avatar_url || `https://github.com/${username}.png?size=120`}
              alt={username}
              className="w-20 h-20 rounded-2xl bg-ide-surface border border-ide-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold text-white">@{profile.username}</h1>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    profile.is_following
                      ? 'bg-ide-surface border border-ide-border text-slate-400 hover:border-red-500/30 hover:text-red-400'
                      : 'bg-ide-accent hover:bg-ide-accent-glow text-white shadow-neon-purple'
                  }`}
                >
                  {followLoading ? '...' : profile.is_following ? 'Following' : 'Follow'}
                </button>
              </div>

              {profile.bio && (
                <p className="text-slate-400 text-sm mb-2 max-w-lg">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-ide-muted">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-ide-accent hover:text-ide-accent-glow transition-colors cursor-pointer">
                    <ExternalLink className="w-3 h-3" />
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-ide-border/50">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{profile.project_count}</div>
              <div className="text-xs text-ide-muted">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{profile.total_views}</div>
              <div className="text-xs text-ide-muted">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{profile.follower_count}</div>
              <div className="text-xs text-ide-muted">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{profile.following_count}</div>
              <div className="text-xs text-ide-muted">Following</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="relative z-10 pb-20 px-6 flex-1">
        <div className="section-container">
          <h2 className="text-lg font-semibold text-white mb-4">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-ide-muted text-center py-16">No public projects yet</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} onAuthRequired={() => setShowLogin(true)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ide-border py-8 px-6 relative z-10">
        <div className="section-container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ide-muted">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-gradient-to-br from-ide-accent to-purple-700 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">#</span>
            </div>
            <span className="text-slate-400">HashIDEA</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-white transition-colors cursor-pointer">Home</Link>
            <Link to="/explore" className="hover:text-white transition-colors cursor-pointer">Explore</Link>
            <Link to="/pricing" className="hover:text-white transition-colors cursor-pointer">Pricing</Link>
          </div>
        </div>
      </footer>

      <GitHubModal isOpen={showLogin} onClose={() => setShowLogin(false)} onImport={() => setShowLogin(false)} />
    </div>
  )
}
