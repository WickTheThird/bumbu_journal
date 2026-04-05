import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Github, FileCode, Zap, Code2, Copy, Check, ExternalLink, Sparkles, Atom, Gamepad2, BarChart3, Layout, Plug, Type, Globe, Lock, Layers, Terminal, Rocket, MousePointer, Link2, Package, GitFork, Eye } from 'lucide-react'
import TemplateGallery from '../components/TemplateGallery'
import GitHubModal from '../components/GitHubModal'
import BackgroundAnimation from '../components/BackgroundAnimation'
import RecentProjects from '../components/RecentProjects'
import { TEMPLATES } from '../lib/templates'
import { encodeWorkspace } from '../lib/hash'

const DEMO_FILES = [
  { name: 'package.json', color: 'text-yellow-400', content: `{
  "name": "counter-app",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}` },
  { name: 'App.tsx', color: 'text-purple-400', content: null },
  { name: 'index.css', color: 'text-cyan-400', content: `body {
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

button {
  cursor: pointer;
}` },
  { name: 'index.html', color: 'text-orange-400', content: `<!DOCTYPE html>
<html>
  <head>
    <title>Counter App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>` },
]

const ICON_MAP: Record<string, typeof Atom> = {
  react: Atom, typescript: Type, game: Gamepad2, chart: BarChart3,
  animation: Sparkles, particle: Sparkles, timer: Atom, weather: Plug,
  api: Plug, portfolio: Layout,
}

export default function Landing() {
  const [showTemplates, setShowTemplates] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)
  const [demoCount, setDemoCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [activeFile, setActiveFile] = useState(1)

  const demoHash = encodeWorkspace(TEMPLATES[0].workspace)
  const demoUrl = `hashideea.com/#${demoHash.slice(0, 20)}...`
  const embedUrl = `/embed#${demoHash}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://hashideea.com/#${demoHash}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-ide-bg text-ide-text">
      <BackgroundAnimation />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-ide-border/50 bg-ide-bg/70 backdrop-blur-xl">
        <div className="section-container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-ide-accent to-purple-700 flex items-center justify-center rounded-lg shadow-neon-purple group-hover:shadow-glow transition-shadow duration-300">
              <span className="text-white font-bold text-sm">#</span>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">HashIDEA</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/explore" className="text-sm text-ide-muted hover:text-white transition-colors cursor-pointer">
              Explore
            </Link>
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

      {/* ═══════════════════════════════════════════
          HERO — The hook. 3 seconds to convince.
          ═══════════════════════════════════════════ */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-ide-accent/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-neon-cyan/8 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-ide-accent/10 border border-ide-accent/20 rounded-full text-ide-accent text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Now with React, Vue, Svelte, Solid & Preact</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08] animate-slide-up">
            <span className="text-white">Code it. Share it.</span>
            <br />
            <span className="heading-gradient text-glow">It's already live.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
            The browser IDE that turns ideas into shareable apps in seconds.
            No deploy. No servers. Your project <em>is</em> the URL.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/ide"
              className="group px-8 py-3.5 bg-ide-accent hover:bg-ide-accent-glow text-white font-medium rounded-lg flex items-center gap-2 transition-all duration-200 shadow-neon-purple hover:shadow-glow cursor-pointer text-lg"
            >
              Start building - it's free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <button
              onClick={() => setShowGitHub(true)}
              className="px-8 py-3.5 bg-ide-surface border border-ide-border hover:border-ide-accent/30 text-white font-medium rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-glow cursor-pointer"
            >
              <Github className="w-4 h-4" />
              Import from GitHub
            </button>
          </div>

          {/* Trust signals — not features, outcomes */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-neon-green" /> No account needed</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-neon-green" /> 5 frameworks supported</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-neon-green" /> Full npm ecosystem</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-neon-green" /> Python + TypeScript</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INTERACTIVE DEMO — Let the product sell itself
          ═══════════════════════════════════════════ */}
      <section className="pb-28 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Caption above demo */}
          <p className="text-center text-sm text-ide-muted mb-4 font-mono">
            <span className="text-neon-green">{'>'}</span> Try it - click the button in the preview
          </p>
          <div className="rounded-xl overflow-hidden border border-ide-border bg-ide-surface shadow-card animate-glow-pulse">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-3 bg-ide-surface-2 border-b border-ide-border">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-8">
                <button onClick={handleCopyUrl} className="max-w-sm mx-auto px-4 py-1.5 bg-ide-bg rounded-md text-sm text-ide-muted cursor-pointer hover:text-white transition-colors flex items-center justify-center gap-2" aria-label="Copy project URL">
                  <span className="truncate font-mono text-xs">{demoUrl}</span>
                  {copied ? <Check className="w-4 h-4 text-neon-green flex-shrink-0" /> : <Copy className="w-4 h-4 flex-shrink-0 opacity-50" />}
                </button>
              </div>
            </div>

            <div className="flex h-[420px]">
              <div className="hidden md:block w-52 bg-ide-bg border-r border-ide-border p-4">
                <div className="text-xs text-ide-muted uppercase tracking-wider mb-3 font-medium">Explorer</div>
                <div className="space-y-1">
                  {DEMO_FILES.map((file, i) => (
                    <button key={file.name} onClick={() => setActiveFile(i)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors cursor-pointer ${i === activeFile ? 'bg-ide-accent/15 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                      <FileCode className={`w-4 h-4 ${file.color}`} />
                      {file.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-ide-surface p-6 overflow-hidden font-mono text-sm">
                {activeFile === 1 ? (
                  <pre className="leading-relaxed"><code>
                    <span className="text-purple-400">import</span><span className="text-slate-300"> {'{ useState }'} </span><span className="text-purple-400">from</span><span className="text-green-400"> 'react'</span>{'\n\n'}
                    <span className="text-purple-400">export default function</span><span className="text-yellow-300"> App</span><span className="text-slate-300">() {'{'}</span>{'\n  '}
                    <span className="text-purple-400">const</span><span className="text-slate-300"> [count, setCount] = </span><span className="text-yellow-300">useState</span><span className="text-slate-300">(0)</span>{'\n\n  '}
                    <span className="text-purple-400">return</span><span className="text-slate-300"> (</span>{'\n    '}
                    <span className="text-slate-500">{'<'}</span><span className="text-cyan-400">div</span><span className="text-slate-500">{'>'}</span>{'\n      '}
                    <span className="text-slate-500">{'<'}</span><span className="text-cyan-400">h1</span><span className="text-slate-500">{'>'}</span><span className="text-slate-300">{'{'}{demoCount}{'}'}</span><span className="text-slate-500">{'</'}</span><span className="text-cyan-400">h1</span><span className="text-slate-500">{'>'}</span>{'\n      '}
                    <span className="text-slate-500">{'<'}</span><span className="text-cyan-400">button</span><span className="text-purple-400"> onClick</span><span className="text-slate-300">={'{() => setCount(c => c + 1)}'}</span><span className="text-slate-500">{'>'}</span>{'\n        '}
                    <span className="text-slate-300">Click me</span>{'\n      '}
                    <span className="text-slate-500">{'</'}</span><span className="text-cyan-400">button</span><span className="text-slate-500">{'>'}</span>{'\n    '}
                    <span className="text-slate-500">{'</'}</span><span className="text-cyan-400">div</span><span className="text-slate-500">{'>'}</span>{'\n  '}
                    <span className="text-slate-300">)</span>{'\n'}<span className="text-slate-300">{'}'}</span>
                  </code></pre>
                ) : (
                  <pre className="leading-relaxed text-slate-300 whitespace-pre-wrap">{DEMO_FILES[activeFile].content}</pre>
                )}
              </div>

              <div className="hidden lg:flex flex-col w-80 bg-white">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />Preview</div>
                  <Link to={embedUrl} target="_blank" className="hover:text-gray-700 transition-colors cursor-pointer" aria-label="Open preview in new tab"><ExternalLink className="w-3.5 h-3.5" /></Link>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-6xl font-bold text-gray-900 mb-8">{demoCount}</div>
                  <button onClick={() => setDemoCount(c => c + 1)} className="px-8 py-3 bg-ide-accent text-white rounded-lg hover:bg-ide-accent-glow transition-colors font-medium cursor-pointer">Click me</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — 3 steps, progressive reveal
          ═══════════════════════════════════════════ */}
      <section className="py-28 px-6 relative z-10">
        <div className="section-container">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Three steps. Zero config.
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              From empty file to live, shareable app. Without ever leaving your browser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: MousePointer,
                color: 'text-ide-accent',
                bg: 'from-ide-accent/20 to-ide-accent/5',
                title: 'Write',
                desc: 'Pick a framework. Write your code in a full VS Code editor with IntelliSense, syntax highlighting, and npm packages.',
              },
              {
                step: '02',
                icon: Eye,
                color: 'text-neon-cyan',
                bg: 'from-neon-cyan/20 to-neon-cyan/5',
                title: 'Preview',
                desc: 'See your app come alive instantly. esbuild compiles in milliseconds. Every keystroke updates the live preview.',
              },
              {
                step: '03',
                icon: Rocket,
                color: 'text-neon-green',
                bg: 'from-neon-green/20 to-neon-green/5',
                title: 'Share',
                desc: 'Copy the URL. That\'s it. Your recipient opens the link and sees your running app. No deploy, no account, no wait.',
              },
            ].map(({ step, icon: Icon, color, bg, title, desc }) => (
              <div key={step} className="relative group">
                <div className={`absolute -inset-px bg-gradient-to-b ${bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative p-8 bg-ide-surface rounded-2xl border border-ide-border group-hover:border-transparent transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-mono text-ide-muted">{step}</span>
                    <div className={`w-10 h-10 flex items-center justify-center bg-ide-bg rounded-xl`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY HASHIDEA — The "aha" moment
          ═══════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-ide-surface/50 relative z-10">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your project <em className="text-ide-accent not-italic">is</em> the URL
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              No deploy step. No hosting. No config files. Your entire codebase
              compresses into a shareable link that anyone can open and run.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Link2,
                color: 'text-ide-accent',
                bg: 'bg-ide-accent/10',
                title: 'Instant sharing',
                desc: 'Paste the URL in Slack, Twitter, email, or docs. Your recipient sees a running app, not a repo.',
              },
              {
                icon: Package,
                color: 'text-neon-cyan',
                bg: 'bg-neon-cyan/10',
                title: 'Any npm package',
                desc: 'Import React, Three.js, Framer Motion, Chart.js. Over 2M packages resolve automatically from esm.sh.',
              },
              {
                icon: GitFork,
                color: 'text-neon-green',
                bg: 'bg-neon-green/10',
                title: 'One-click remix',
                desc: 'Every project is forkable. Remix someone\'s work, make it yours, share a new URL. Ideas compound.',
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="group p-6 bg-ide-bg/60 rounded-xl border border-ide-border hover:border-ide-accent/30 transition-all duration-300 hover:shadow-glow">
                <div className={`w-12 h-12 flex items-center justify-center ${bg} rounded-xl mb-5`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CAPABILITIES — Technical credibility
          ═══════════════════════════════════════════ */}
      <section className="py-28 px-6 relative z-10">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Not a toy. A full dev environment.
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Built on the same Monaco editor that powers VS Code. Supports 5 frameworks,
              Python, TypeScript, and the entire npm ecosystem.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Terminal, title: 'Monaco Editor', desc: 'IntelliSense, multi-file tabs, split panes, themes' },
              { icon: Zap, title: 'Live Preview', desc: 'Hot reload in milliseconds via esbuild-wasm' },
              { icon: Layers, title: '5 Frameworks', desc: 'React, Vue, Svelte, Solid, Preact. Auto-detected from your code' },
              { icon: Globe, title: 'Python + JS', desc: 'Run Python via Pyodide or JS/TS in a sandboxed iframe' },
              { icon: Package, title: 'npm Packages', desc: '2M+ packages from esm.sh, resolved automatically' },
              { icon: Github, title: 'GitHub Import', desc: 'Clone any public repo into the IDE in one click' },
              { icon: Lock, title: 'Cloud Hosting', desc: 'Save to cloud, get short embed URLs, add custom domains' },
              { icon: Code2, title: '32 Templates', desc: 'Counters, games, dashboards, Python, charts, and more' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 bg-ide-surface rounded-lg border border-ide-border/50 hover:border-ide-accent/20 transition-all duration-300 group">
                <Icon className="w-5 h-5 text-ide-accent mb-3 group-hover:text-ide-accent-glow transition-colors" />
                <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FRAMEWORKS — Show breadth visually
          ═══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-ide-surface/50 relative z-10">
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500">
            {['React', 'Vue', 'Svelte', 'Solid', 'Preact', 'TypeScript', 'Python', 'Tailwind CSS'].map((fw) => (
              <span key={fw} className="text-lg font-medium hover:text-white transition-colors cursor-default">{fw}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="py-12 px-6 relative z-10">
        <div className="section-container">
          <RecentProjects />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TEMPLATES — Get them started
          ═══════════════════════════════════════════ */}
      <section className="py-28 px-6 bg-ide-surface/50 relative z-10">
        <div className="section-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Pick a starting point</h2>
              <p className="text-slate-400 text-sm mt-1">32 templates across 5 frameworks, Python, and vanilla JS</p>
            </div>
            <button onClick={() => setShowTemplates(true)} className="text-ide-accent hover:text-ide-accent-glow text-sm font-medium transition-colors cursor-pointer">
              View all {TEMPLATES.length} →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {TEMPLATES.filter(t => t.featured).map((template) => {
              const IconComponent = ICON_MAP[template.icon] || FileCode
              return (
                <Link key={template.id} to={`/ide#${encodeWorkspace(template.workspace)}`} className="group p-4 bg-ide-bg/60 rounded-lg border border-ide-border hover:border-ide-accent/30 transition-all duration-300 hover:shadow-glow cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="w-4 h-4 text-ide-accent" />
                    <span className="font-medium text-white text-sm group-hover:text-ide-accent transition-colors truncate">{template.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA — Close the deal
          ═══════════════════════════════════════════ */}
      <section className="py-32 px-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-ide-accent/8 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Your next idea is<br /><span className="heading-gradient text-glow">one click away</span>
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            No signup. No install. No deploy. Just open and start building.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/ide"
              className="group inline-flex items-center gap-2 px-10 py-4 bg-ide-accent hover:bg-ide-accent-glow text-white font-medium rounded-xl transition-all duration-200 shadow-neon-purple hover:shadow-glow cursor-pointer text-lg"
            >
              Open the playground
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-4 text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
            >
              View pricing →
            </Link>
          </div>
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
            <Link to="/explore" className="hover:text-white transition-colors cursor-pointer">Explore</Link>
            <Link to="/pricing" className="hover:text-white transition-colors cursor-pointer">Pricing</Link>
            <a href="https://github.com/WickTheThird/HashIDEA" target="_blank" rel="noopener" className="hover:text-white transition-colors cursor-pointer">GitHub</a>
            <span>Built by <a href="https://github.com/WickTheThird" target="_blank" rel="noopener" className="hover:text-white transition-colors cursor-pointer">WickTheThird</a></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TemplateGallery isOpen={showTemplates} onClose={() => setShowTemplates(false)} />
      <GitHubModal isOpen={showGitHub} onClose={() => setShowGitHub(false)} onImport={() => { window.location.href = '/ide' + window.location.hash }} />
    </div>
  )
}
