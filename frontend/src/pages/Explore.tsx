import { Link } from 'react-router-dom'
import { Compass, ArrowRight, Github, Sparkles } from 'lucide-react'
import BackgroundAnimation from '../components/BackgroundAnimation'

export default function Explore() {
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
            <a
              href="https://github.com/WickTheThird/HashIDEA"
              target="_blank"
              rel="noopener"
              className="text-ide-muted hover:text-white transition-colors cursor-pointer"
              aria-label="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link
              to="/ide"
              className="px-4 py-2 bg-ide-accent hover:bg-ide-accent-glow text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-neon-purple hover:shadow-glow cursor-pointer"
            >
              Open IDE
            </Link>
          </div>
        </div>
      </nav>

      {/* Coming Soon */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        {/* Gradient orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-ide-accent/10 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative text-center max-w-lg">
          <div className="w-20 h-20 mx-auto bg-ide-accent/10 rounded-2xl flex items-center justify-center mb-8">
            <Compass className="w-10 h-10 text-ide-accent" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ide-accent/10 border border-ide-accent/20 rounded-full text-ide-accent text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Coming soon
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore
          </h1>

          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Discover projects from the community. Browse trending apps, find inspiration, and remix anything with one click.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/ide"
              className="group px-8 py-3.5 bg-ide-accent hover:bg-ide-accent-glow text-white font-medium rounded-lg flex items-center gap-2 transition-all duration-200 shadow-neon-purple hover:shadow-glow cursor-pointer"
            >
              Start building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/"
              className="px-8 py-3.5 bg-ide-surface border border-ide-border hover:border-ide-accent/30 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
