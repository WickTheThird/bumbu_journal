import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Share2, Package, Github } from 'lucide-react'
import TemplateGallery from '../components/TemplateGallery'
import GitHubModal from '../components/GitHubModal'
import '../styles/cyberpunk.css'

export default function Landing() {
  const navigate = useNavigate()
  const [showTemplates, setShowTemplates] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-100 font-mono circuit-bg noise relative overflow-hidden">
      {/* Scanlines overlay */}
      <div className="scanlines" />
      
      {/* Animated grid lines */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 neon-border-purple chamfer-sm flex items-center justify-center bg-purple-500/10">
            <span className="text-purple-400 font-bold">#</span>
          </div>
          <span className="text-xl font-bold tracking-wider uppercase neon-text-purple">HashIDE</span>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/WickTheThird/HashIDE" 
            target="_blank" 
            rel="noopener"
            className="text-gray-400 hover:text-purple-400 transition"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        {/* Glitch headline */}
        <div className="text-center mb-8">
          <p className="text-purple-400 uppercase tracking-[0.3em] text-sm mb-4 terminal-prompt">
            Browser-based development environment
          </p>
          <h1 
            className="text-5xl md:text-7xl font-black uppercase tracking-tight glitch crt-flicker"
            data-text="HASH_IDE"
          >
            <span className="neon-text-purple">HASH</span>
            <span className="text-white">_</span>
            <span className="neon-text-cyan">IDE</span>
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
            <span className="typing cursor-blink">Code, preview, and share — all in one URL</span>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button
            onClick={() => setShowTemplates(true)}
            className="group px-8 py-4 bg-purple-500/10 neon-border-purple chamfer btn-cyber flex items-center gap-3 uppercase tracking-wider text-sm font-bold"
          >
            <Zap className="w-5 h-5 text-purple-400" />
            <span>Start Coding</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => setShowGitHub(true)}
            className="px-8 py-4 bg-transparent border border-gray-600 hover:border-cyan-400 hover:neon-border-cyan chamfer btn-cyber flex items-center gap-3 uppercase tracking-wider text-sm text-gray-400 hover:text-cyan-400 transition-all"
          >
            <Github className="w-5 h-5" />
            <span>Import from GitHub</span>
          </button>
        </div>

        {/* Terminal demo */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="terminal-window chamfer overflow-hidden">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-4 text-xs text-gray-500 uppercase tracking-wider">hashide.terminal</span>
            </div>
            <div className="p-6 text-sm">
              <div className="text-gray-500 mb-2"># Initialize new project</div>
              <div className="text-green-400 mb-4">
                <span className="text-purple-400">{'>'}</span> hashide init react-app
              </div>
              <div className="text-gray-500 mb-2"># Install dependencies (via esm.sh)</div>
              <div className="text-green-400 mb-4">
                <span className="text-purple-400">{'>'}</span> + react@18.2.0
                <br />
                <span className="text-purple-400">{'>'}</span> + react-dom@18.2.0
                <br />
                <span className="text-purple-400">{'>'}</span> + framer-motion@10.16.0
              </div>
              <div className="text-gray-500 mb-2"># Share your work</div>
              <div className="text-cyan-400">
                <span className="text-purple-400">{'>'}</span> URL hash generated — share link to collaborate
                <span className="cursor-blink" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-6">
          <div className="card-cyber chamfer p-6 hud-corner">
            <div className="w-12 h-12 flex items-center justify-center bg-green-500/10 border border-green-500/30 chamfer-sm mb-4">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-2 neon-text-green">Instant Preview</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              See your code run in real-time. React, HTML, CSS — bundled in the browser with esbuild.
            </p>
          </div>
          
          <div className="card-cyber chamfer p-6 hud-corner">
            <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 chamfer-sm mb-4">
              <Package className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-2 neon-text-cyan">NPM Packages</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Import any npm package. Dependencies load from esm.sh automatically. No install needed.
            </p>
          </div>
          
          <div className="card-cyber chamfer p-6 hud-corner">
            <div className="w-12 h-12 flex items-center justify-center bg-magenta-500/10 border border-pink-500/30 chamfer-sm mb-4">
              <Share2 className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-2" style={{ color: '#FF00FF', textShadow: '0 0 5px #FF00FF' }}>Share via URL</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your entire project lives in the URL hash. Share a link — no account needed.
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-32 text-center">
          <p className="text-gray-600 uppercase tracking-[0.2em] text-xs">
            [ System ready — awaiting input ]
          </p>
        </div>
      </main>

      {/* Template Gallery Modal */}
      <TemplateGallery 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)}
        onSelect={(workspace) => {
          navigate('/ide', { state: { workspace } })
        }}
      />

      {/* GitHub Import Modal */}
      <GitHubModal
        isOpen={showGitHub}
        onClose={() => setShowGitHub(false)}
        onImport={(workspace) => {
          navigate('/ide', { state: { workspace } })
        }}
      />
    </div>
  )
}
