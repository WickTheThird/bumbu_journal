/**
 * Pricing page — value-framed tiers
 * Free (Play) → Starter (Keep) → Pro (Ship) → Team (Build together)
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { isAuthenticated } from '../lib/github'
import { createCheckout, createPortalSession, getBillingStatus, BillingStatus } from '../lib/api'
import { useEffect } from 'react'

const PRICE_IDS = {
  starter: 'price_1TGPPPIrHmPnoiiOWJrVPXGb',
  pro: 'price_1TGPPmIrHmPnoiiOAugd3a1E',
  team: 'price_1TGPQ7IrHmPnoiiOwzY8mG5y',
} as const

const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2, team: 3 }

interface Tier {
  id: 'free' | 'starter' | 'pro' | 'team'
  name: string
  verb: string
  price: number | null
  description: string
  features: string[]
  cta: string
  highlight?: boolean
}

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    verb: 'Play',
    price: null,
    description: 'Build and share apps instantly — no account needed',
    features: [
      'Unlimited apps in URL',
      'Public sharing & embedding',
      'Remix any project',
      'All templates & npm packages',
      'React, TypeScript, Python',
    ],
    cta: 'Start building',
  },
  {
    id: 'starter',
    name: 'Starter',
    verb: 'Keep',
    price: 7,
    description: 'Save your work, make it yours',
    features: [
      'Everything in Free',
      'Save apps to the cloud',
      'Short shareable URLs',
      'Private projects',
      'Version history',
      'Public profile page',
    ],
    cta: 'Upgrade to Starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    verb: 'Ship',
    price: 12,
    description: 'Deploy real apps to the edge',
    features: [
      'Everything in Starter',
      'Deploy apps live (edge hosting)',
      'Custom domains',
      'Persistent backend storage',
      'Priority support',
      'GitHub sync (coming soon)',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    id: 'team',
    name: 'Team',
    verb: 'Build together',
    price: 29,
    description: 'Collaborate with your team',
    features: [
      'Everything in Pro',
      'Shared workspaces',
      'Real-time collaboration',
      'Role-based access',
      'Team billing',
      'Dedicated support',
    ],
    cta: 'Upgrade to Team',
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const authed = isAuthenticated()

  useEffect(() => {
    if (!authed) return
    getBillingStatus()
      .then(setBilling)
      .catch(() => {})
  }, [authed])

  const handleUpgrade = async (tierId: 'starter' | 'pro' | 'team') => {
    if (!authed) {
      navigate('/ide')
      return
    }

    setLoading(tierId)
    try {
      const { url } = await createCheckout(PRICE_IDS[tierId])
      window.location.href = url
    } catch (e: any) {
      alert(e.message || 'Failed to start checkout')
      setLoading(null)
    }
  }

  const handleManage = async () => {
    setLoading('manage')
    try {
      const { url } = await createPortalSession()
      window.location.href = url
    } catch (e: any) {
      alert(e.message || 'Failed to open billing portal')
      setLoading(null)
    }
  }

  const currentPlan = billing?.plan || 'free'

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-500 flex items-center justify-center rounded">
              <span className="text-white font-bold text-sm">#</span>
            </div>
            <span className="text-lg font-semibold text-white">HashIDEA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/ide" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded transition-colors">
              Open IDE
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          From playground to production
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Start free. Upgrade when you need persistence, privacy, or deployment.
        </p>
      </section>

      {/* Tiers */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => {
            const isCurrent = currentPlan === tier.id
            const isUpgrade = !isCurrent && tier.id !== 'free' && (PLAN_RANK[tier.id] || 0) > (PLAN_RANK[currentPlan] || 0)

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition ${
                  tier.highlight
                    ? 'border-purple-500/50 bg-purple-500/[0.03] shadow-lg shadow-purple-500/10'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-500 text-white text-xs font-medium rounded-full">
                    Most popular
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {tier.verb}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-1">
                    {tier.price !== null ? (
                      <>
                        <span className="text-3xl font-bold">${tier.price}</span>
                        <span className="text-gray-500 text-sm">/month</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold">Free</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {tier.id === 'free' ? (
                  <Link
                    to="/ide"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm transition"
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : isCurrent ? (
                  <button
                    onClick={handleManage}
                    disabled={loading === 'manage'}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 text-gray-400 font-medium text-sm transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {loading === 'manage' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Manage subscription
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(tier.id as 'starter' | 'pro' | 'team')}
                    disabled={loading === tier.id}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-50 ${
                      tier.highlight
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    {loading === tier.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {tier.cta}
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ-style note */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-4">Enterprise?</h2>
          <p className="text-gray-400 mb-6">
            Need custom limits, SLAs, SSO, or on-premise deployment? Get in touch.
          </p>
          <a
            href="mailto:bumbufilip22@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition border border-white/10"
          >
            Contact us
          </a>
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
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/ide" className="hover:text-white transition-colors">IDE</Link>
            <a href="https://github.com/WickTheThird/HashIDEA" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
