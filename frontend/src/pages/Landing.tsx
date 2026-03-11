import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Share2, Lock, Zap, Terminal, GitBranch, ArrowRight,
  Hash, Layers, Shield, Menu, X, Linkedin, Mail, Play
} from 'lucide-react'
import TemplateGallery from '../components/TemplateGallery'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-7 h-7 text-violet-400" />
            <span className="text-lg font-semibold text-white">HashIDE</span>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition">How it works</a>
            <a href="#templates" className="text-sm text-slate-400 hover:text-white transition">Templates</a>
            <Link to="/ide" className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">
              Open Editor
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-slate-400 hover:text-white transition">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-slate-400 hover:text-white transition">How it works</a>
              <a href="#templates" onClick={() => setMobileMenuOpen(false)} className="block text-slate-400 hover:text-white transition">Templates</a>
              <Link to="/ide" onClick={() => setMobileMenuOpen(false)} className="block text-center font-medium text-white bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition">
                Open Editor
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-white">Code that lives </span>
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              in a URL
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A browser-based editor where your entire workspace is stored in the URL hash. 
            Copy the link to share your code with anyone.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/ide" className="w-full sm:w-auto px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition flex items-center justify-center gap-2">
              Open Editor <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto px-8 py-3 text-slate-400 hover:text-white transition flex items-center justify-center gap-2">
              See how it works
            </a>
          </div>
          
          {/* Code preview card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl -z-10" />
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <span className="ml-3 text-xs text-slate-500 font-mono">main.py</span>
                <div className="ml-auto flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition">
                    <Play className="w-3 h-3" /> Run
                  </button>
                </div>
              </div>
              <pre className="p-6 text-left font-mono text-sm leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-fuchsia-400">def</span>{' '}
                  <span className="text-amber-300">fibonacci</span>
                  <span className="text-slate-400">(</span>
                  <span className="text-orange-300">n</span>
                  <span className="text-slate-400">):</span>
                  {'\n'}
                  {'    '}
                  <span className="text-fuchsia-400">if</span>
                  <span className="text-slate-300"> n </span>
                  <span className="text-slate-400">&lt;=</span>
                  <span className="text-cyan-300"> 1</span>
                  <span className="text-slate-400">:</span>
                  {'\n'}
                  {'        '}
                  <span className="text-fuchsia-400">return</span>
                  <span className="text-slate-300"> n</span>
                  {'\n'}
                  {'    '}
                  <span className="text-fuchsia-400">return</span>
                  <span className="text-slate-300"> fibonacci</span>
                  <span className="text-slate-400">(</span>
                  <span className="text-slate-300">n </span>
                  <span className="text-slate-400">-</span>
                  <span className="text-cyan-300"> 1</span>
                  <span className="text-slate-400">)</span>
                  <span className="text-slate-300"> </span>
                  <span className="text-slate-400">+</span>
                  <span className="text-slate-300"> fibonacci</span>
                  <span className="text-slate-400">(</span>
                  <span className="text-slate-300">n </span>
                  <span className="text-slate-400">-</span>
                  <span className="text-cyan-300"> 2</span>
                  <span className="text-slate-400">)</span>
                  {'\n\n'}
                  <span className="text-slate-500"># Run this code and share the URL</span>
                  {'\n'}
                  <span className="text-amber-300">print</span>
                  <span className="text-slate-400">(</span>
                  <span className="text-emerald-400">"fib(10) ="</span>
                  <span className="text-slate-400">,</span>
                  <span className="text-slate-300"> fibonacci</span>
                  <span className="text-slate-400">(</span>
                  <span className="text-cyan-300">10</span>
                  <span className="text-slate-400">))</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for sharing
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Everything you need to write, run, and share code snippets.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Hash className="w-5 h-5" />}
              title="URL Storage"
              description="Workspace state is compressed and stored in the URL hash."
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Client-Side"
              description="Runs entirely in your browser with Pyodide for Python."
            />
            <FeatureCard
              icon={<Share2 className="w-5 h-5" />}
              title="Shareable"
              description="Anyone with the link sees your exact workspace."
            />
            <FeatureCard
              icon={<Lock className="w-5 h-5" />}
              title="Sandboxed"
              description="Code execution is isolated in secure iframes."
            />
            <FeatureCard
              icon={<Terminal className="w-5 h-5" />}
              title="Monaco Editor"
              description="VS Code's editor with syntax highlighting."
            />
            <FeatureCard
              icon={<Layers className="w-5 h-5" />}
              title="Multi-File"
              description="Organize code across multiple files."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/50 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              How it works
            </h2>
          </div>
          
          <div className="space-y-12">
            <Step number={1} title="Write your code">
              Open the editor and start coding. The Monaco editor gives you syntax highlighting, 
              autocomplete, and familiar keybindings.
            </Step>
            <Step number={2} title="State syncs to URL">
              Every change updates the URL hash. Your files are compressed with LZ-String 
              and encoded in base64.
            </Step>
            <Step number={3} title="Share the link">
              Copy the URL. Anyone who opens it sees your exact workspace — files, cursor 
              position, settings, everything.
            </Step>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-12">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Security model
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                URL hashes are treated as untrusted input. Content is validated against strict 
                schemas, code runs in sandboxed iframes, and payload size is limited to prevent abuse.
              </p>
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-white mb-1">Validation</h3>
                  <p className="text-sm text-slate-500">Schema validation on all decoded content</p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Isolation</h3>
                  <p className="text-sm text-slate-500">Sandboxed iframe execution</p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Limits</h3>
                  <p className="text-sm text-slate-500">Size caps prevent DoS attacks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-24 px-6 bg-slate-900/50 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Templates
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Start with a working example.
            </p>
          </div>
          <TemplateGallery />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start building
          </h2>
          <p className="text-slate-400 mb-8">
            Write some code and share the link.
          </p>
          <Link to="/ide" className="inline-flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition">
            Open Editor <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-violet-400" />
              <span className="font-medium text-white">HashIDE</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a 
                href="mailto:bumbufilip22@gmail.com"
                className="hover:text-white transition flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/in/filip-bumbu-410741262" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://github.com/WickTheThird/bumbu_journal" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <GitBranch className="w-4 h-4" />
              </a>
            </div>
            
            <p className="text-sm text-slate-500">
              Built by{' '}
              <a 
                href="https://www.linkedin.com/in/filip-bumbu-410741262" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition"
              >
                Filip Bumbu
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition">
      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ number, title, children }: { 
  number: number
  title: string
  children: React.ReactNode 
}) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-mono text-sm">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
