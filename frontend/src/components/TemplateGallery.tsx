import { Link } from 'react-router-dom'
import { TEMPLATES } from '../lib/templates'
import { encodeWorkspace } from '../lib/hash'
import { ArrowRight, FileCode, BarChart3, Sparkles, Plug, File, Atom, X, Palette, Timer, Type, Layout, Cloud, Gamepad2 } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  canvas: <Palette className="w-5 h-5" />,
  chart: <BarChart3 className="w-5 h-5" />,
  particle: <Sparkles className="w-5 h-5" />,
  animation: <Sparkles className="w-5 h-5" />,
  api: <Plug className="w-5 h-5" />,
  portfolio: <Layout className="w-5 h-5" />,
  game: <Gamepad2 className="w-5 h-5" />,
  file: <File className="w-5 h-5" />,
  react: <Atom className="w-5 h-5" />,
  typescript: <Type className="w-5 h-5" />,
  timer: <Timer className="w-5 h-5" />,
  weather: <Cloud className="w-5 h-5" />,
}

interface TemplateGalleryProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (workspace: unknown) => void
}

export default function TemplateGallery({ isOpen, onClose }: TemplateGalleryProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.1s_ease-out]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden bg-[#0A0A0F] border border-purple-500/30 chamfer">
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-30 scanlines" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider neon-text-purple">
              Select Template
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              {'>'} Choose a starting point for your project
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-purple-500/20 transition chamfer-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh] grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((template) => (
            <Link
              key={template.id}
              to={`/ide#${encodeWorkspace(template.workspace)}`}
              onClick={onClose}
              className="group p-5 bg-[#12101A] border border-[#1E1A2E] hover:border-purple-500/50 hover:shadow-neon-purple transition-all chamfer"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-purple-500/10 border border-purple-500/30 chamfer-sm mb-4 group-hover:border-purple-400 transition">
                <span className="text-purple-400">
                  {iconMap[template.icon] || <FileCode className="w-5 h-5" />}
                </span>
              </div>
              <h3 className="font-bold uppercase tracking-wider text-white mb-2 group-hover:neon-text-purple transition">
                {template.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 font-mono">{template.description}</p>
              <div className="flex items-center gap-2 text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition font-mono">
                <span>{'>'}</span> LOAD <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
