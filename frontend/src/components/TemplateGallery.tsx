import { Link } from 'react-router-dom'
import { templates, Template } from '../lib/templates'
import { encodeWorkspace } from '../lib/hash'
import { ArrowRight, FileCode, BarChart3, Sparkles, Plug, Briefcase, Dice5, File } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  canvas: <FileCode className="w-6 h-6" />,
  chart: <BarChart3 className="w-6 h-6" />,
  particle: <Sparkles className="w-6 h-6" />,
  api: <Plug className="w-6 h-6" />,
  portfolio: <Briefcase className="w-6 h-6" />,
  game: <Dice5 className="w-6 h-6" />,
  file: <File className="w-6 h-6" />,
}

interface TemplateCardProps {
  template: Template
}

function TemplateCard({ template }: TemplateCardProps) {
  const hash = encodeWorkspace(template.workspace)
  
  return (
    <Link
      to={`/ide#${hash}`}
      className="group p-6 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition"
    >
      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
        {iconMap[template.icon] || <FileCode className="w-5 h-5" />}
      </div>
      <h3 className="font-semibold text-white mb-2 group-hover:text-violet-400 transition">
        {template.name}
      </h3>
      <p className="text-sm text-slate-400 mb-4">{template.description}</p>
      <div className="flex items-center gap-2 text-sm text-violet-400 opacity-0 group-hover:opacity-100 transition">
        Open <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

export default function TemplateGallery() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}
