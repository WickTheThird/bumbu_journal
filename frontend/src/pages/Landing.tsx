import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Share2, Lock, Zap, Terminal, GitBranch, ArrowRight,
  Hash, Layers, Menu, X, Linkedin, Mail, ExternalLink,
  Code2, Globe, Cpu
} from 'lucide-react'
import TemplateGallery from '../components/TemplateGallery'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#050508]/80 backdrop-blur-xl border-b border-white/5' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Hash className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">HashIDE</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition">How it works</a>
            <a href="#templates" className="text-sm text-zinc-400 hover:text-white transition">Templates</a>
            <Link 
              to="/ide" 
              className="text-sm font-medium px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 transition"
            >
              Open Editor
            </Link>
          </div>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#050508]/95 backdrop-blur-xl">
            <div className="px-6 py-6 space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-white transition">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-white transition">How it works</a>
              <a href="#templates" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-white transition">Templates</a>
              <Link to="/ide" onClick={() => setMobileMenuOpen(false)} className="block text-center font-medium px-4 py-3 rounded-full bg-white text-black">
                Open Editor
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400">Now with Python execution via Pyodide</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Code that lives
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              in a URL
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A browser-based editor where your entire workspace is compressed into the URL. 
            Share code by sharing a link.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/ide" 
              className="group w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-medium transition-all flex items-center justify-center gap-2"
            >
              Start coding
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a 
              href="https://github.com/WickTheThird/bumbu_journal"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 font-medium transition flex items-center justify-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              View source
            </a>
          </div>
        </div>
        
        {/* Hero visual */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0f] shadow-2xl shadow-violet-500/10">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0a0a0f]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-red-500/80 transition cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-yellow-500/80 transition cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-zinc-700 hover:bg-green-500/80 transition cursor-pointer" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 text-xs text-zinc-500">
                  <Globe className="w-3 h-3" />
                  hashide.dev/#eyJmaWxlcyI6W3sibmFtZSI6Im1...
                </div>
              </div>
            </div>
            
            {/* IDE mockup */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-48 border-r border-white/5 bg-[#08080c] p-3 hidden sm:block">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2 px-2">Explorer</div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-violet-500/10 text-violet-400 text-xs">
                    <Code2 className="w-3.5 h-3.5" />
                    main.py
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded text-zinc-500 hover:bg-white/5 text-xs cursor-pointer">
                    <Code2 className="w-3.5 h-3.5" />
                    utils.py
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded text-zinc-500 hover:bg-white/5 text-xs cursor-pointer">
                    <Code2 className="w-3.5 h-3.5" />
                    README.md
                  </div>
                </div>
              </div>
              
              {/* Editor */}
              <div className="flex-1 p-6 font-mono text-sm">
                <pre className="leading-relaxed">
                  <code>
                    <span className="text-zinc-600">1  </span>
                    <span className="text-fuchsia-400">def</span>
                    <span className="text-amber-300"> fibonacci</span>
                    <span className="text-zinc-400">(n):</span>
                    {'\n'}
                    <span className="text-zinc-600">2  </span>
                    <span className="text-zinc-400">    </span>
                    <span className="text-zinc-500">"""Calculate the nth Fibonacci number."""</span>
                    {'\n'}
                    <span className="text-zinc-600">3  </span>
                    <span className="text-zinc-400">    </span>
                    <span className="text-fuchsia-400">if</span>
                    <span className="text-zinc-300"> n </span>
                    <span className="text-zinc-400">&lt;=</span>
                    <span className="text-cyan-400"> 1</span>
                    <span className="text-zinc-400">:</span>
                    {'\n'}
                    <span className="text-zinc-600">4  </span>
                    <span className="text-zinc-400">        </span>
                    <span className="text-fuchsia-400">return</span>
                    <span className="text-zinc-300"> n</span>
                    {'\n'}
                    <span className="text-zinc-600">5  </span>
                    <span className="text-zinc-400">    </span>
                    <span className="text-fuchsia-400">return</span>
                    <span className="text-zinc-300"> fibonacci(n-</span>
                    <span className="text-cyan-400">1</span>
                    <span className="text-zinc-300">) + fibonacci(n-</span>
                    <span className="text-cyan-400">2</span>
                    <span className="text-zinc-300">)</span>
                    {'\n'}
                    <span className="text-zinc-600">6  </span>
                    {'\n'}
                    <span className="text-zinc-600">7  </span>
                    <span className="text-amber-300">print</span>
                    <span className="text-zinc-400">(</span>
                    <span className="text-emerald-400">"Result:"</span>
                    <span className="text-zinc-400">, </span>
                    <span className="text-zinc-300">fibonacci(</span>
                    <span className="text-cyan-400">10</span>
                    <span className="text-zinc-300">))</span>
                  </code>
                </pre>
              </div>
            </div>
            
            {/* Terminal */}
            <div className="border-t border-white/5 bg-[#08080c] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Output</span>
              </div>
              <div className="font-mono text-sm text-emerald-400">
                Result: 55
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos/Social proof */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-8">Built with modern technologies</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-zinc-600">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              <span className="text-sm font-medium">Pyodide</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              <span className="text-sm font-medium">Monaco Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Vite</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span className="text-sm font-medium">React</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">LZ-String</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything in the URL
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Your files, settings, and cursor position — all encoded in the hash.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Hash className="w-5 h-5" />}
              title="URL-based state"
              description="Workspace is compressed with LZ-String and stored in the URL hash. No database, no accounts."
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Instant execution"
              description="Python runs client-side via Pyodide. JavaScript and HTML execute in sandboxed iframes."
            />
            <FeatureCard
              icon={<Share2 className="w-5 h-5" />}
              title="Share by link"
              description="Copy the URL to share your code. Recipients see your exact workspace state."
            />
            <FeatureCard
              icon={<Lock className="w-5 h-5" />}
              title="Sandboxed"
              description="Code execution is isolated. Strict CSP headers and iframe sandboxing protect the host."
            />
            <FeatureCard
              icon={<Terminal className="w-5 h-5" />}
              title="Monaco Editor"
              description="The same editor that powers VS Code. Syntax highlighting, IntelliSense, keybindings."
            />
            <FeatureCard
              icon={<Layers className="w-5 h-5" />}
              title="Multi-file"
              description="Create multiple files in your workspace. Organize code, add tests, include documentation."
            />
          </div>
        </div>
      </section>

      {/* How it works - Bento style */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Write code in the browser</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Open the editor and start coding. Full Monaco editor with syntax highlighting, 
                    autocomplete, and the keybindings you know from VS Code. Create multiple files, 
                    organize your workspace, and run your code instantly.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-zinc-400 flex-shrink-0">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">State syncs to URL</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Every keystroke updates the URL hash. Your workspace is compressed 
                    and encoded in real-time.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-zinc-400 flex-shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Share the link</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Copy the URL and send it. Anyone who opens it sees exactly 
                    what you see — files, cursor, settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start with a template
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Pick a starting point and make it yours.
            </p>
          </div>
          <TemplateGallery />
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to build
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              something?
            </span>
          </h2>
          <p className="text-zinc-400 mb-10 text-lg">
            No signup. No install. Just code.
          </p>
          <Link 
            to="/ide" 
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition"
          >
            Open Editor
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030305]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Hash className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-medium">HashIDE</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="mailto:bumbufilip22@gmail.com"
                className="text-zinc-600 hover:text-white transition"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/filip-bumbu-410741262" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-white transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/WickTheThird/bumbu_journal" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-white transition"
              >
                <GitBranch className="w-5 h-5" />
              </a>
            </div>
            
            <p className="text-sm text-zinc-600">
              Built by{' '}
              <a 
                href="https://www.linkedin.com/in/filip-bumbu-410741262" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition"
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
    <div className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 mb-4 group-hover:text-violet-400 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    </div>
  )
}
