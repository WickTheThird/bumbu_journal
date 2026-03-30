/**
 * UpgradeModal - shown when user hits a plan limit
 * Nudges them to upgrade with context about what they tried to do
 */
import { Link } from 'react-router-dom'
import { X, Sparkles, ArrowRight } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: 'cloud_limit' | 'private_project' | 'generic'
  message?: string
}

const REASONS = {
  cloud_limit: {
    title: "You've hit your project limit",
    description: 'Free accounts can save up to 3 cloud projects. Upgrade to Starter to save unlimited projects with short URLs.',
    cta: 'Unlock unlimited projects',
  },
  private_project: {
    title: 'Private projects need Starter',
    description: 'Keep your work private with a Starter plan. You also get version history, short URLs, and a public profile.',
    cta: 'Go private',
  },
  generic: {
    title: 'Upgrade to do more',
    description: 'Get cloud storage, private projects, and more with a paid plan.',
    cta: 'See plans',
  },
}

export default function UpgradeModal({ isOpen, onClose, reason = 'generic', message }: UpgradeModalProps) {
  if (!isOpen) return null

  const content = REASONS[reason] || REASONS.generic

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f0f11] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-5">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold text-white mb-2">{content.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          {message || content.description}
        </p>

        {/* Free tier note */}
        <p className="text-gray-500 text-xs mb-6">
          Your existing URL-based projects are always free and unlimited.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to="/pricing"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition"
          >
            {content.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-sm transition"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
