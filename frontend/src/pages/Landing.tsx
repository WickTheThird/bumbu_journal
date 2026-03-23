import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Github, FileCode, Package, Share2, Zap, Play } from 'lucide-react'
import TemplateGallery from '../components/TemplateGallery'
import GitHubModal from '../components/GitHubModal'
import '../styles/cyberpunk.css'

export default function Landing() {
  const [showTemplates, setShowTemplates] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [demoCount, setDemoCount] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-[#050508] text-gray-100 font-mono overflow-x-hidden">
      {/* Subtle scanlines - reduced opacity */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] scanlines z-50" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 border border-purple-500/50 flex items-center justify-center bg-purple-500/10">
                <span className="text-purple-400 font-bold text-lg">#</span>
              </div>
              <span className="text-lg font-bold tracking-wide text-white">HashIDE</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#how-it-works" className="hover:text-white transition">How it works</a>
              <a href="https://github.com/WickTheThird/HashIDE" target="_blank" rel="noopener" className="hover:text-white transition">GitHub</a>
            </div>
          </div>
          <Link 
            to="/ide"
            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-medium transition"
          >
            Open IDE
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.06), transparent 40%)`
        }}
      >
        {/* Grid with mouse highlight */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-purple-400 text-sm font-medium tracking-[0.2em] uppercase mb-6">
            Browser IDE
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
            <span className="text-white">Build full apps</span>
            <br />
            <span className="text-purple-400">from a link.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            A browser-based development environment with live preview, npm packages, and projects that live entirely in the URL.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => setShowTemplates(true)}
              className="group px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white font-semibold text-lg flex items-center gap-3 transition-all hover:gap-4"
            >
              Start building
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowGitHub(true)}
              className="px-8 py-4 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium text-lg flex items-center gap-3 transition-all"
            >
              <Github className="w-5 h-5" />
              Import from GitHub
            </button>
          </div>

          {/* Proof Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              No install
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
              React-ready
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              URL-native
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
              Instant preview
            </span>
          </div>
        </div>

        {/* Product Hero Frame - The Centerpiece */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-16 mb-8">
          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#0a0a0f] shadow-2xl shadow-purple-500/10">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#12101a] border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-md mx-auto px-3 py-1 bg-[#1a1825] rounded text-xs text-gray-400 text-center">
                  hashide.dev/#eJzT0yMAAGTvBe4
                </div>
              </div>
            </div>
            
            {/* IDE Layout */}
            <div className="flex h-[400px] md:h-[500px]">
              {/* File Tree */}
              <div className="hidden md:block w-48 bg-[#0d0b12] border-r border-white/5 p-3">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Files</div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:bg-white/5 rounded cursor-pointer">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    package.json
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:bg-white/5 rounded cursor-pointer">
                    <FileCode className="w-4 h-4 text-yellow-400" />
                    vite.config.ts
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/20 text-white rounded">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    App.tsx
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:bg-white/5 rounded cursor-pointer">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    index.css
                  </div>
                </div>
              </div>
              
              {/* Editor */}
              <div className="flex-1 bg-[#0a0a0f] p-4 overflow-hidden">
                <pre className="text-sm leading-relaxed">
                  <code>
                    <span className="text-purple-400">import</span>
                    <span className="text-gray-300"> {'{ useState }'} </span>
                    <span className="text-purple-400">from</span>
                    <span className="text-green-400"> 'react'</span>
                    {'\n\n'}
                    <span className="text-purple-400">export default function</span>
                    <span className="text-yellow-400"> App</span>
                    <span className="text-gray-300">() {'{'}</span>
                    {'\n  '}
                    <span className="text-purple-400">const</span>
                    <span className="text-gray-300"> [count, setCount] = </span>
                    <span className="text-yellow-400">useState</span>
                    <span className="text-gray-300">(0)</span>
                    {'\n\n  '}
                    <span className="text-purple-400">return</span>
                    <span className="text-gray-300"> (</span>
                    {'\n    '}
                    <span className="text-gray-500">{'<'}</span>
                    <span className="text-cyan-400">div</span>
                    <span className="text-gray-500">{'>'}</span>
                    {'\n      '}
                    <span className="text-gray-500">{'<'}</span>
                    <span className="text-cyan-400">h1</span>
                    <span className="text-gray-500">{'>'}</span>
                    <span className="text-gray-300">Count: {'{'}{demoCount}{'}'}</span>
                    <span className="text-gray-500">{'</'}</span>
                    <span className="text-cyan-400">h1</span>
                    <span className="text-gray-500">{'>'}</span>
                    {'\n      '}
                    <span className="text-gray-500">{'<'}</span>
                    <span className="text-cyan-400">button</span>
                    <span className="text-purple-400"> onClick</span>
                    <span className="text-gray-300">={'{() => setCount(c => c + 1)}'}</span>
                    <span className="text-gray-500">{'>'}</span>
                    {'\n        '}
                    <span className="text-gray-300">Increment</span>
                    {'\n      '}
                    <span className="text-gray-500">{'</'}</span>
                    <span className="text-cyan-400">button</span>
                    <span className="text-gray-500">{'>'}</span>
                    {'\n    '}
                    <span className="text-gray-500">{'</'}</span>
                    <span className="text-cyan-400">div</span>
                    <span className="text-gray-500">{'>'}</span>
                    {'\n  '}
                    <span className="text-gray-300">)</span>
                    {'\n'}
                    <span className="text-gray-300">{'}'}</span>
                  </code>
                </pre>
              </div>
              
              {/* Preview - Interactive! */}
              <div className="hidden lg:block w-72 bg-white border-l border-white/5">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-500">
                  <Play className="w-3 h-3" />
                  Preview
                </div>
                <div className="p-6 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Count: {demoCount}</h1>
                  <button 
                    onClick={() => setDemoCount(c => c + 1)}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition cursor-pointer"
                  >
                    Increment
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-transparent to-cyan-500/20 blur-3xl -z-10" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why HashIDE
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A new mental model for building and sharing web projects
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-[#0a0a0f] border border-white/5 hover:border-purple-500/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-purple-500/10 border border-purple-500/20 mb-6">
                <Share2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                URL-native projects
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Every file, dependency, and state encoded into a shareable link. No accounts, no sync, no friction.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-[#0a0a0f] border border-white/5 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Instant runtime
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Preview changes immediately in the browser. React, TypeScript, and npm packages — no local setup required.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-[#0a0a0f] border border-white/5 hover:border-pink-500/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-pink-500/10 border border-pink-500/20 mb-6">
                <Package className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Full npm ecosystem
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Import any package from npm. Dependencies load from esm.sh automatically. The entire registry at your fingertips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 px-6 bg-[#08080c]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How it works
            </h2>
            <p className="text-xl text-gray-400">
              From idea to shareable app in seconds
            </p>
          </div>

          <div className="space-y-16">
            {[
              { step: '01', title: 'Write code', desc: 'Open the IDE and start coding. Create React components, add styles, build your app.' },
              { step: '02', title: 'Import packages', desc: 'Add any npm package. Just import it — dependencies resolve automatically via esm.sh.' },
              { step: '03', title: 'Preview instantly', desc: 'See your changes in real-time. The bundler runs in the browser with esbuild-wasm.' },
              { step: '04', title: 'Share the link', desc: 'Your entire project lives in the URL hash. Share it anywhere — anyone can run or fork it.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-8 items-start">
                <div className="text-5xl font-black text-purple-500/20">{item.step}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to build?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Start coding in your browser. No setup, no install, no account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-10 py-5 bg-purple-500 hover:bg-purple-400 text-white font-semibold text-lg transition"
            >
              Open the playground
            </button>
            <a
              href="https://github.com/WickTheThird/HashIDE"
              target="_blank"
              rel="noopener"
              className="px-10 py-5 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium text-lg flex items-center gap-3 transition"
            >
              <Github className="w-5 h-5" />
              View source
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">#</span>
            <span>HashIDE</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/WickTheThird/HashIDE" target="_blank" rel="noopener" className="hover:text-white transition">GitHub</a>
            <span>Built by WickTheThird</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TemplateGallery 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)}
      />
      <GitHubModal
        isOpen={showGitHub}
        onClose={() => setShowGitHub(false)}
        onImport={() => {
          window.location.href = '/ide' + window.location.hash
        }}
      />
    </div>
  )
}
