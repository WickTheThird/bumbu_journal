import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Github, Search, TrendingUp, Clock, Eye, GitFork, Loader2, Compass } from 'lucide-react'
import BackgroundAnimation from '../components/BackgroundAnimation'
import ProjectCard from '../components/ProjectCard'
import { getGallery, GalleryProject } from '../lib/api'

type SortMode = 'trending' | 'latest' | 'most_viewed' | 'most_forked'

const SORT_OPTIONS: { id: SortMode; label: string; icon: typeof TrendingUp }[] = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'most_viewed', label: 'Most Viewed', icon: Eye },
  { id: 'most_forked', label: 'Most Forked', icon: GitFork },
]

export default function Explore() {
  const [projects, setProjects] = useState<GalleryProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortMode>('trending')
  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getGallery({ sort, q: query || undefined, page, limit: 20 })
      setProjects(res.projects)
      setTotalPages(res.pages)
      setTotal(res.total)
    } catch (e: any) {
      setError(e.message || 'Failed to load projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [sort, query, page])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleSortChange = (newSort: SortMode) => {
    setSort(newSort)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-ide-bg text-ide-text relative">
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
            <Link to="/pricing" className="text-sm text-ide-muted hover:text-white transition-colors cursor-pointer">
              Pricing
            </Link>
            <a href="https://github.com/WickTheThird/HashIDEA" target="_blank" rel="noopener" className="text-ide-muted hover:text-white transition-colors cursor-pointer" aria-label="View on GitHub">
              <Github className="w-5 h-5" />
            </a>
            <Link to="/ide" className="px-4 py-2 bg-ide-accent hover:bg-ide-accent-glow text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-neon-purple hover:shadow-glow cursor-pointer">
              Open IDE
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative z-10 pt-16 pb-8 px-6">
        <div className="section-container">
          <div className="flex items-center gap-3 mb-2">
            <Compass className="w-7 h-7 text-ide-accent" />
            <h1 className="text-3xl font-bold text-white">Explore</h1>
          </div>
          <p className="text-slate-400 mb-8">Discover projects from the community</p>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ide-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 bg-ide-surface border border-ide-border rounded-lg text-sm text-white placeholder:text-ide-muted focus:outline-none focus:border-ide-accent/50 focus:ring-1 focus:ring-ide-accent/30 transition-all"
            />
          </div>

          {/* Sort tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleSortChange(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  sort === id
                    ? 'bg-ide-accent/15 text-ide-accent border border-ide-accent/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-ide-surface border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
            {total > 0 && (
              <span className="text-xs text-ide-muted ml-auto pl-4">
                {total} project{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative z-10 pb-20 px-6">
        <div className="section-container">
          {loading && projects.length === 0 ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-6 h-6 animate-spin text-ide-accent" />
              <span className="ml-3 text-slate-400">Loading projects...</span>
            </div>
          ) : error ? (
            <div className="text-center py-32">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={fetchProjects} className="text-sm text-ide-accent hover:text-ide-accent-glow transition-colors cursor-pointer">
                Try again
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-32">
              <Compass className="w-12 h-12 text-ide-muted mx-auto mb-4" />
              <p className="text-slate-400 mb-2">
                {query ? `No projects found for "${query}"` : 'No projects yet'}
              </p>
              <p className="text-sm text-ide-muted mb-6">
                {query ? 'Try a different search term' : 'Be the first to share a project!'}
              </p>
              <Link
                to="/ide"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-ide-accent hover:bg-ide-accent-glow text-white text-sm font-medium rounded-lg transition-all cursor-pointer"
              >
                Create a project
              </Link>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg bg-ide-surface border border-ide-border text-sm text-slate-400 hover:text-white hover:border-ide-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-ide-muted px-3">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-lg bg-ide-surface border border-ide-border text-sm text-slate-400 hover:text-white hover:border-ide-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
            <Link to="/pricing" className="hover:text-white transition-colors cursor-pointer">Pricing</Link>
            <a href="https://github.com/WickTheThird/HashIDEA" target="_blank" rel="noopener" className="hover:text-white transition-colors cursor-pointer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
