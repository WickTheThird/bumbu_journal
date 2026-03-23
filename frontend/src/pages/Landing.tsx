import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Github, FileCode, Share2, Zap, Code2, Copy, Check, ExternalLink, Sparkles, Users, Briefcase, GraduationCap } from 'lucide-react'
import TemplateGallery from '../components/TemplateGallery'
import GitHubModal from '../components/GitHubModal'
import RecentProjects from '../components/RecentProjects'
import { TEMPLATES } from '../lib/templates'
import { encodeWorkspace } from '../lib/hash'

export default function Landing() {
  const [showTemplates, setShowTemplates] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)
  const [demoCount, setDemoCount] = useState(0)
  const [copied, setCopied] = useState(false)

  const demoUrl = 'hashidea.com/#eJzT0yMAAGTvBe4'
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${demoUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-500 flex items-center justify-center rounded">
              <span className="text-white font-bold text-sm">#</span>
            </div>
            <span className="text-lg font-semibold text-white">HashIDEA</span>
          </Link>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/WickTheThird/HashIDEA" 
              target="_blank" 
              rel="noopener"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link 
              to="/ide"
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded transition-colors"
            >
              Open IDE
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Instant Application Platform
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            From idea to deployed app
            <br />
            <span className="text-purple-400">in seconds</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Build, preview, and share complete web applications directly in your browser. 
            Your entire project lives in the URL—no accounts, no servers, no setup.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              to="/ide"
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded flex items-center gap-2 transition-colors"
            >
              Start building
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={() => setShowGitHub(true)}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded flex items-center gap-2 transition-colors border border-white/10"
            >
              <Github className="w-4 h-4" />
              Import from GitHub
            </button>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              No signup required
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              React + TypeScript
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Full npm access
            </span>
          </div>
        </div>
      </section>

      {/* Product Demo */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0f0f11] shadow-2xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#18181b] border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-8">
                <div 
                  onClick={handleCopyUrl}
                  className="max-w-sm mx-auto px-4 py-1.5 bg-[#0f0f11] rounded-md text-sm text-gray-400 cursor-pointer hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <span className="truncate">{demoUrl}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 flex-shrink-0 opacity-50" />
                  )}
                </div>
              </div>
            </div>
            
            {/* IDE Layout */}
            <div className="flex h-[420px]">
              {/* Sidebar */}
              <div className="hidden md:block w-52 bg-[#0c0c0e] border-r border-white/5 p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Explorer</div>
                <div className="space-y-1">
                  {['package.json', 'App.tsx', 'index.css', 'index.html'].map((file, i) => (
                    <div 
                      key={file}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                        i === 1 ? 'bg-purple-500/20 text-white' : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <FileCode className={`w-4 h-4 ${
                        i === 0 ? 'text-yellow-400' : 
                        i === 1 ? 'text-purple-400' : 
                        i === 2 ? 'text-cyan-400' : 'text-orange-400'
                      }`} />
                      {file}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Editor */}
              <div className="flex-1 bg-[#0f0f11] p-6 overflow-hidden font-mono text-sm">
                <pre className="leading-relaxed">
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
                    <span className="text-gray-300">{'{'}{demoCount}{'}'}</span>
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
                    <span className="text-gray-300">Click me</span>
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
              
              {/* Preview */}
              <div className="hidden lg:flex flex-col w-80 bg-white">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Preview
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-6xl font-bold text-gray-900 mb-8">{demoCount}</div>
                  <button 
                    onClick={() => setDemoCount(c => c + 1)}
                    className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                  >
                    Click me
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 px-6 bg-[#0c0c0e]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Projects as links
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Your entire codebase compressed into a shareable URL. 
              Anyone can view, run, and remix your code instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#09090b] rounded-lg border border-white/5">
              <div className="w-10 h-10 flex items-center justify-center bg-purple-500/10 rounded-lg mb-4">
                <Share2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Share instantly</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Copy the URL, paste it anywhere. Recipients see your running app immediately—no downloads, no setup.
              </p>
            </div>

            <div className="p-6 bg-[#09090b] rounded-lg border border-white/5">
              <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-lg mb-4">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Live bundling</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                esbuild runs in your browser. Changes preview instantly. Import any npm package—dependencies resolve automatically.
              </p>
            </div>

            <div className="p-6 bg-[#09090b] rounded-lg border border-white/5">
              <div className="w-10 h-10 flex items-center justify-center bg-green-500/10 rounded-lg mb-4">
                <Code2 className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Remix anything</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Fork any project with one click. Make your changes, share your own URL. Every project spawns new creations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for builders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto flex items-center justify-center bg-purple-500/10 rounded-full mb-4">
                <GraduationCap className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Students & Learners</h3>
              <p className="text-gray-400 text-sm">
                Zero-friction environment to experiment with code. No local setup, no configuration headaches.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto flex items-center justify-center bg-cyan-500/10 rounded-full mb-4">
                <Users className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Hobbyist Developers</h3>
              <p className="text-gray-400 text-sm">
                Quickly prototype ideas without infrastructure overhead. Ship weekend projects in minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto flex items-center justify-center bg-green-500/10 rounded-full mb-4">
                <Briefcase className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Professional Developers</h3>
              <p className="text-gray-400 text-sm">
                Share reproducible examples, demos, and proof-of-concepts with colleagues and clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="py-12 px-6 bg-[#0c0c0e]">
        <div className="max-w-5xl mx-auto">
          <RecentProjects />
        </div>
      </section>

      {/* Templates */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Start from a template</h2>
              <p className="text-gray-400 text-sm mt-1">Pre-built projects ready to remix</p>
            </div>
            <button
              onClick={() => setShowTemplates(true)}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              View all {TEMPLATES.length} →
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {TEMPLATES.map((template) => (
              <Link
                key={template.id}
                to={`/ide#${encodeWorkspace(template.workspace)}`}
                className="group p-4 bg-[#0c0c0e] rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {template.icon === 'react' ? '⚛️' : 
                     template.icon === 'typescript' ? '📘' :
                     template.icon === 'game' ? '🎮' :
                     template.icon === 'chart' ? '📊' :
                     template.icon === 'animation' ? '✨' :
                     template.icon === 'particle' ? '🎆' :
                     template.icon === 'api' ? '🔌' :
                     template.icon === 'portfolio' ? '💼' : '📄'}
                  </span>
                  <span className="font-medium text-white text-sm group-hover:text-purple-400 transition-colors truncate">
                    {template.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#0c0c0e]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start building now
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            No signup. No install. Just start coding.
          </p>
          <Link
            to="/ide"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
          >
            Open the playground
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">#</span>
            </div>
            <span className="text-gray-400">HashIDEA</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/WickTheThird/HashIDEA" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
            <span>Built by <a href="https://github.com/WickTheThird" target="_blank" rel="noopener" className="hover:text-white transition-colors">WickTheThird</a></span>
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
