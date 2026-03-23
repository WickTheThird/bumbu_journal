import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Github, FileCode, Package, Share2, Zap, Play, Code2, Globe, Copy, Check, ExternalLink } from 'lucide-react'
import TemplateGallery from '../components/TemplateGallery'
import GitHubModal from '../components/GitHubModal'
import RecentProjects from '../components/RecentProjects'
import { TEMPLATES } from '../lib/templates'
import { encodeWorkspace } from '../lib/hash'
import '../styles/cyberpunk.css'

export default function Landing() {
  const [showTemplates, setShowTemplates] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [demoCount, setDemoCount] = useState(0)
  const [copied, setCopied] = useState(false)
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

  const demoUrl = 'hashidea.com/#eJzT0yMAAGTvBe4'
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${demoUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#050508] text-gray-100 font-mono overflow-x-hidden">
      {/* Subtle scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] scanlines z-50" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_-1px_0_0_rgba(255,255,255,0.02)_inset]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 border border-purple-500/50 flex items-center justify-center bg-purple-500/10">
                <span className="text-purple-400 font-bold text-lg">#</span>
              </div>
              <span className="text-lg font-bold tracking-wide text-white">HashIDEA</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#templates" className="hover:text-white transition">Templates</a>
              <a href="https://github.com/WickTheThird/HashIDEA" target="_blank" rel="noopener" className="hover:text-white transition">GitHub</a>
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
            Code playground
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
            <span className="text-white">Code. Share.</span>
            <br />
            <span className="text-purple-400">Just the URL.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Build React apps in your browser. Your entire project lives in the URL—share it anywhere, run it instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setShowTemplates(true)}
              className="group px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white font-semibold text-lg flex items-center gap-3 transition-all hover:gap-4"
            >
              Start coding
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

          {/* Key Points */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              No account needed
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
              React + TypeScript
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              Full npm access
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
              Instant preview
            </span>
          </div>
        </div>

        {/* Product Demo */}
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
                <div 
                  onClick={handleCopyUrl}
                  className="group max-w-md mx-auto px-3 py-1 bg-[#1a1825] rounded text-xs text-gray-400 text-center cursor-pointer hover:bg-[#1f1a2a] transition flex items-center justify-center gap-2"
                >
                  <span>{demoUrl}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                  )}
                </div>
              </div>
            </div>
            
            {/* IDE Layout */}
            <div className="flex h-[400px] md:h-[500px]">
              {/* File Tree */}
              <div className="hidden md:block w-48 bg-[#0d0b12] border-r border-white/5 p-3">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Explorer</div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:bg-white/5 rounded cursor-pointer">
                    <FileCode className="w-4 h-4 text-yellow-400" />
                    package.json
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/20 text-white rounded">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    App.tsx
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:bg-white/5 rounded cursor-pointer">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    index.css
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:bg-white/5 rounded cursor-pointer">
                    <FileCode className="w-4 h-4 text-orange-400" />
                    index.html
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
                    <span className="text-purple-400"> className</span>
                    <span className="text-gray-300">=</span>
                    <span className="text-green-400">"container"</span>
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
                    <span className="text-gray-300">+1</span>
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
              
              {/* Live Preview */}
              <div className="hidden lg:flex flex-col w-72 bg-white border-l border-white/5">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3 text-green-500" />
                    <span>Live Preview</span>
                  </div>
                  <ExternalLink className="w-3 h-3" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Count: {demoCount}</h1>
                  <button 
                    onClick={() => setDemoCount(c => c + 1)}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition cursor-pointer font-medium"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-transparent to-cyan-500/20 blur-3xl -z-10" />
        </div>
      </section>
      
      {/* Recent Projects */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <RecentProjects />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-[#08080c]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything runs in the browser
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No servers. No builds. Just open and code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature cards */}
            <div className="p-8 bg-[#0a0a0f] border border-white/5 hover:border-purple-500/30 transition-all group">
              <div className="w-12 h-12 flex items-center justify-center bg-purple-500/10 border border-purple-500/20 mb-6">
                <Share2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                URL = Project
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your entire codebase encoded in the URL. Copy the link, share it anywhere—instant access for anyone.
              </p>
            </div>

            <div className="p-8 bg-[#0a0a0f] border border-white/5 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Live preview
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Changes reflect instantly as you type. esbuild-wasm bundles your code directly in the browser.
              </p>
            </div>

            <div className="p-8 bg-[#0a0a0f] border border-white/5 hover:border-pink-500/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-pink-500/10 border border-pink-500/20 mb-6">
                <Package className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                npm packages
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Import from the entire npm registry. Dependencies load automatically via esm.sh with smart caching.
              </p>
            </div>

            <div className="p-8 bg-[#0a0a0f] border border-white/5 hover:border-green-500/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-green-500/10 border border-green-500/20 mb-6">
                <Code2 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Monaco editor
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Full VS Code editing experience. Syntax highlighting, IntelliSense, and TypeScript support built in.
              </p>
            </div>

            <div className="p-8 bg-[#0a0a0f] border border-white/5 hover:border-orange-500/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-orange-500/10 border border-orange-500/20 mb-6">
                <Github className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                GitHub sync
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Import repos and gists. Export your work back. Built-in version control with commit history.
              </p>
            </div>

            <div className="p-8 bg-[#0a0a0f] border border-white/5 hover:border-yellow-500/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20 mb-6">
                <Globe className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Works offline
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Once loaded, everything runs locally. Dependencies cached in IndexedDB for instant reloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start from a template
            </h2>
            <p className="text-xl text-gray-400">
              Pre-built projects ready to hack on
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {TEMPLATES.slice(0, 8).map((template) => (
              <Link
                key={template.id}
                to={`/ide#${encodeWorkspace(template.workspace)}`}
                className="group p-5 bg-[#0a0a0f] border border-white/5 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-purple-500/10 border border-purple-500/30 text-lg">
                    {template.icon === 'react' ? '⚛️' : 
                     template.icon === 'typescript' ? '📘' :
                     template.icon === 'game' ? '🎮' :
                     template.icon === 'chart' ? '📊' :
                     template.icon === 'animation' ? '✨' :
                     template.icon === 'api' ? '🔌' : '📄'}
                  </div>
                  <h3 className="font-bold text-white group-hover:text-purple-400 transition">
                    {template.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500">{template.description}</p>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-6 py-3 border border-gray-700 hover:border-purple-500/50 text-gray-300 hover:text-white transition text-sm font-medium"
            >
              View all {TEMPLATES.length} templates →
            </button>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-32 px-6 bg-[#08080c]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Perfect for
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Tutorials & Documentation', desc: 'Embed live, editable examples in your blog posts or docs. Readers learn by doing.' },
              { title: 'Bug Reports', desc: 'Share a minimal reproduction with a single URL. No "works on my machine".' },
              { title: 'Quick Prototypes', desc: 'Sketch out an idea in minutes. Test it, share it, iterate—all from the browser.' },
              { title: 'Learning React', desc: 'No setup. No node_modules. Just open a template and start experimenting.' },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-white/5 bg-[#0a0a0f]">
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
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
            Pick a template and start coding. It's that simple.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-10 py-5 bg-purple-500 hover:bg-purple-400 text-white font-semibold text-lg transition"
            >
              Start coding →
            </button>
            <a
              href="https://github.com/WickTheThird/HashIDEA"
              target="_blank"
              rel="noopener"
              className="px-10 py-5 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium text-lg flex items-center gap-3 transition"
            >
              <Github className="w-5 h-5" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold">#</span>
            <span>HashIDEA</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-600">Code that lives in the URL</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/WickTheThird/HashIDEA" target="_blank" rel="noopener" className="hover:text-white transition">GitHub</a>
            <span>Built by <a href="https://github.com/WickTheThird" target="_blank" rel="noopener" className="hover:text-white transition">WickTheThird</a></span>
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
