import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Share2, Lock, Zap, Terminal, GitBranch, ArrowRight,
  Hash, Layers, Shield, Menu, X, Linkedin, Mail 
} from 'lucide-react'
import TemplateGallery from '../components/TemplateGallery'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-8 h-8 text-ide-accent" />
            <span className="text-xl font-bold">HashIDE</span>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-ide-muted hover:text-ide-text transition">Features</a>
            <a href="#how-it-works" className="text-ide-muted hover:text-ide-text transition">How it works</a>
            <a href="#templates" className="text-ide-muted hover:text-ide-text transition">Templates</a>
            <a href="#security" className="text-ide-muted hover:text-ide-text transition">Security</a>
            <Link to="/ide" className="btn-primary flex items-center gap-2">
              Open IDE <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-ide-border/50 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-ide-border bg-ide-surface/95 backdrop-blur-xl">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-ide-muted hover:text-ide-text transition">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-ide-muted hover:text-ide-text transition">How it works</a>
              <a href="#templates" onClick={() => setMobileMenuOpen(false)} className="block text-ide-muted hover:text-ide-text transition">Templates</a>
              <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block text-ide-muted hover:text-ide-text transition">Security</a>
              <Link to="/ide" onClick={() => setMobileMenuOpen(false)} className="btn-primary flex items-center justify-center gap-2 w-full">
                Open IDE <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            The IDE that lives in a link
          </h1>
          
          <p className="text-lg text-ide-muted max-w-2xl mx-auto mb-10">
            Your workspace is compressed into the URL hash. Share it by copying the link.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link to="/ide" className="px-6 py-3 bg-ide-accent text-white font-medium rounded-lg hover:bg-ide-accent-glow transition">
              Open Editor
            </Link>
            <a href="#how-it-works" className="px-6 py-3 text-ide-muted hover:text-ide-text transition">
              How it works →
            </a>
          </div>
          
          {/* Code preview */}
          <div className="rounded-lg overflow-hidden border border-ide-border bg-ide-surface">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-ide-border bg-ide-bg">
              <div className="w-3 h-3 rounded-full bg-ide-border" />
              <div className="w-3 h-3 rounded-full bg-ide-border" />
              <div className="w-3 h-3 rounded-full bg-ide-border" />
              <span className="ml-4 text-sm text-ide-muted font-mono">main.py</span>
            </div>
            <pre className="p-6 text-left font-mono text-sm leading-relaxed overflow-x-auto">
              <code>
                <span className="text-purple-400">def</span>{' '}
                <span className="text-yellow-300">greet</span>
                <span className="text-ide-muted">(</span>
                <span className="text-orange-300">name</span>
                <span className="text-ide-muted">):</span>
                {'\n'}
                {'    '}
                <span className="text-purple-400">return</span>{' '}
                <span className="text-green-400">f"Hello, </span>
                <span className="text-ide-muted">{'{'}</span>
                <span className="text-orange-300">name</span>
                <span className="text-ide-muted">{'}'}</span>
                <span className="text-green-400">!"</span>
                {'\n\n'}
                <span className="text-ide-muted"># Workspace state is in the URL hash</span>
                {'\n'}
                <span className="text-ide-muted"># Copy the link to share</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Features
          </h2>
          <p className="text-ide-muted text-center mb-12 max-w-2xl mx-auto">
            A lightweight IDE that runs entirely in your browser.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Hash className="w-6 h-6" />}
              title="URL Storage"
              description="Workspace state is compressed into the URL hash. Share by copying the link."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Client-Side"
              description="Runs entirely in your browser."
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6" />}
              title="Shareable"
              description="Anyone with the link sees your exact workspace."
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Sandboxed"
              description="Code execution is isolated in iframes."
            />
            <FeatureCard
              icon={<Terminal className="w-6 h-6" />}
              title="Monaco Editor"
              description="VS Code's editor with syntax highlighting and autocomplete."
            />
            <FeatureCard
              icon={<Layers className="w-6 h-6" />}
              title="Multi-File"
              description="Organize code across multiple files."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 bg-ide-surface/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How it works
          </h2>
          
          <div className="space-y-8">
            <Step number={1} title="Write your code">
              Open the IDE and start coding. Multiple files, syntax highlighting, 
              autocomplete — all the features you expect.
            </Step>
            <Step number={2} title="Changes save to the URL">
              Every edit updates the URL hash. Your workspace is compressed and 
              encoded right there in the address bar.
            </Step>
            <Step number={3} title="Share the link">
              Copy the URL and send it anywhere. Slack, email, Twitter — anyone 
              with the link gets your exact workspace.
            </Step>
            <Step number={4} title="They open, you're synced">
              When they open the link, they see exactly what you see. Fork it, 
              modify it, share it again.
            </Step>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-12 h-12 text-ide-accent mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Security First
          </h2>
          <p className="text-ide-muted max-w-2xl mx-auto mb-8">
            We treat every URL hash as potentially hostile input. Strict validation, 
            sandboxed execution, and size limits protect you from malicious payloads.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="glass rounded-lg p-6">
              <h3 className="font-semibold mb-2">Strict Validation</h3>
              <p className="text-sm text-ide-muted">
                All decoded content is validated against strict schemas before use.
              </p>
            </div>
            <div className="glass rounded-lg p-6">
              <h3 className="font-semibold mb-2">Sandboxed Runtime</h3>
              <p className="text-sm text-ide-muted">
                User code runs in isolated iframes with no access to the IDE.
              </p>
            </div>
            <div className="glass rounded-lg p-6">
              <h3 className="font-semibold mb-2">Size Limits</h3>
              <p className="text-sm text-ide-muted">
                Payload limits prevent denial-of-service from oversized hashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-20 px-6 bg-ide-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Templates
            </h2>
            <p className="text-ide-muted max-w-2xl mx-auto">
              Start with a working example.
            </p>
          </div>
          <TemplateGallery />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Try it out
          </h2>
          <p className="text-ide-muted mb-8">
            Start building something.
          </p>
          <Link to="/ide" className="btn-primary inline-flex items-center gap-2 text-lg">
            Open HashIDE <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ide-border bg-ide-surface/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Hash className="w-6 h-6 text-ide-accent" />
                <span className="text-xl font-bold">HashIDE</span>
              </div>
              <p className="text-sm text-ide-muted">
                A browser-based code editor with URL-based state.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="text-center">
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-ide-muted">
                <Link to="/ide" className="hover:text-ide-accent transition">Open IDE</Link>
                <a href="#features" className="hover:text-ide-accent transition">Features</a>
                <a href="#security" className="hover:text-ide-accent transition">Security</a>
              </div>
            </div>
            
            {/* Contact */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-3">Get in Touch</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a 
                  href="mailto:bumbufilip22@gmail.com"
                  className="text-ide-muted hover:text-ide-accent transition flex items-center justify-center md:justify-end gap-2"
                >
                  <Mail className="w-4 h-4" /> bumbufilip22@gmail.com
                </a>
                <a 
                  href="https://www.linkedin.com/in/filip-bumbu-410741262" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ide-muted hover:text-ide-accent transition flex items-center justify-center md:justify-end gap-2"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
                <a 
                  href="https://github.com/WickTheThird/bumbu_journal" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ide-muted hover:text-ide-accent transition flex items-center justify-center md:justify-end gap-2"
                >
                  <GitBranch className="w-4 h-4" /> GitHub
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom bar */}
          <div className="pt-8 border-t border-ide-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ide-muted">
            <p>© {new Date().getFullYear()} HashIDE. All rights reserved.</p>
            <p>
              Built by{' '}
              <a 
                href="https://www.linkedin.com/in/filip-bumbu-410741262" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ide-text hover:text-ide-accent transition font-medium"
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
    <div className="p-6">
      <div className="text-ide-accent mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-ide-muted text-sm leading-relaxed">{description}</p>
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
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ide-accent flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-ide-muted">{children}</p>
      </div>
    </div>
  )
}
