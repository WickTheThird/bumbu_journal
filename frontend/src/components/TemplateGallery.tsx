import { Link } from 'react-router-dom'
import { templates, Template } from '../lib/templates'
import { encodeWorkspace } from '../lib/hash'
import { ArrowRight } from 'lucide-react'

interface TemplateCardProps {
  template: Template
}

function TemplateCard({ template }: TemplateCardProps) {
  const hash = encodeWorkspace(template.workspace)
  
  return (
    <Link
      to={`/ide#${hash}`}
      className="group glass rounded-xl p-6 hover:border-ide-accent/30 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="text-4xl mb-4">{template.icon}</div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-ide-accent transition">
        {template.name}
      </h3>
      <p className="text-sm text-ide-muted mb-4">{template.description}</p>
      <div className="flex items-center gap-2 text-sm text-ide-accent opacity-0 group-hover:opacity-100 transition">
        Open template <ArrowRight className="w-4 h-4" />
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
