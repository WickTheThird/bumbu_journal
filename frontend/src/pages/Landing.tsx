import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Code2, Share2, Lock, Zap, Terminal, GitBranch, 
  ArrowRight, Hash, Layers, Shield, Sparkles, Menu, X, Linkedin, Mail 
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
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ide-accent/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ide-accent-glow/10 rounded-full blur-[128px]" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-ide-muted">No backend. No signup. Just code.</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The IDE that lives{' '}
            <span className="gradient-text">in a link</span>
          </h1>
          
          <p className="text-xl text-ide-muted max-w-2xl mx-auto mb-10 text-balance">
            A full development environment stored entirely in the URL hash. 
            Edit, run, and share your code — all without a server.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link to="/ide" className="btn-primary flex items-center gap-2 text-lg">
              Start Coding <Code2 className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="btn-secondary flex items-center gap-2 text-lg">
              Learn More
            </a>
          </div>
          
          {/* Code preview mockup */}
          <div className="mt-16 glass rounded-xl overflow-hidden shadow-2xl shadow-ide-accent/10 animate-float">
            <div className="flex items-center gap-2 px-4 py-3 bg-ide-surface border-b border-ide-border">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-sm text-ide-muted font-mono">main.py</span>
            </div>
            <pre className="p-6 text-left font-mono text-sm leading-relaxed">
              <code>
                <span className="text-purple-400">def</span>{' '}
                <span className="text-yellow-300">greet</span>
                <span className="text-ide-muted">(</span>
                <span className="text-orange-300">name</span>
                <span className="text-ide-muted">: </span>
                <span className="text-cyan-300">str</span>
                <span className="text-ide-muted">) -&gt; </span>
                <span className="text-cyan-300">str</span>
                <span className="text-ide-muted">:</span>
                {'\n'}
                {'    '}
                <span className="text-purple-400">return</span>{' '}
                <span className="text-green-400">f"Hello, </span>
                <span className="text-ide-muted">{'{'}</span>
                <span className="text-orange-300">name</span>
                <span className="text-ide-muted">{'}'}</span>
                <span className="text-green-400">!"</span>
                {'\n\n'}
                <span className="text-ide-muted"># Your entire workspace is in the URL</span>
                {'\n'}
                <span className="text-ide-muted"># Share it. Fork it. No server needed.</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything you need, <span className="gradient-text">nothing you don't</span>
          </h2>
          <p className="text-ide-muted text-center mb-12 max-w-2xl mx-auto">
            A powerful IDE without the overhead. No accounts, no deployments, no maintenance.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Hash className="w-6 h-6" />}
              title="Hash-Based Storage"
              description="Your entire workspace is encoded in the URL. Copy the link, share your code instantly."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Lightning Fast"
              description="No server roundtrips. Everything runs locally in your browser at native speed."
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6" />}
              title="Instant Sharing"
              description="Send a link. That's it. No sign up, no accounts, no friction."
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Sandboxed Execution"
              description="User code runs in isolated environments. Your browser stays safe."
            />
            <FeatureCard
              icon={<Terminal className="w-6 h-6" />}
              title="Monaco Editor"
              description="The same editor powering VS Code. IntelliSense, themes, and keybindings."
            />
            <FeatureCard
              icon={<Layers className="w-6 h-6" />}
              title="Multi-File Support"
              description="Create, rename, and organize multiple files in your workspace."
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
              modify it, share it again. No server required.
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
            <Sparkles className="w-10 h-10 text-ide-accent mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start with a template
            </h2>
            <p className="text-ide-muted max-w-2xl mx-auto">
              Jump into coding with pre-built examples. Each template opens with everything 
              you need to learn and experiment.
            </p>
          </div>
          <TemplateGallery />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to code?
          </h2>
          <p className="text-ide-muted mb-8">
            No signup. No download. Just click and start building.
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
                The IDE that lives in a link. Share code instantly, no server required.
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
            <p className="flex items-center gap-1">
              Made with <span className="text-red-500">♥</span> by{' '}
              <a 
                href="https://www.linkedin.com/in/filip-bumbu-410741262" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ide-accent hover:underline font-medium"
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
    <div className="glass rounded-xl p-6 hover:border-ide-accent/30 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-ide-accent/10 flex items-center justify-center text-ide-accent mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-ide-muted text-sm">{description}</p>
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
