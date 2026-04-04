/**
 * Pricing page - value-framed tiers
 * Free (Play) -> Starter (Keep) -> Pro (Ship) -> Team (Build together)
 */
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, ArrowRight, Sparkles, Loader2, Github, CheckCircle, XCircle } from 'lucide-react'
import { isAuthenticated } from '../lib/github'
import { createCheckout, createPortalSession, getBillingStatus, BillingStatus } from '../lib/api'
import GitHubModal from '../components/GitHubModal'

const PRICE_IDS = {
  starter: 'price_1TGQH1Isg0HKgiZiwoJS8dsL',
  pro: 'price_1TGQH1Isg0HKgiZilKpkTzhH',
  team: 'price_1TGQH1Isg0HKgiZiVYwMcaks',
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
    description: 'Build and share apps instantly - no account needed',
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [pendingTier, setPendingTier] = useState<'starter' | 'pro' | 'team' | null>(null)
  const [authed, setAuthed] = useState(isAuthenticated())

  const success = searchParams.get('success') === 'true'
  const canceled = searchParams.get('canceled') === 'true'

  // Fetch billing status when authenticated
  useEffect(() => {
    if (!authed) return
    getBillingStatus()
      .then(setBilling)
      .catch(() => {})
  }, [authed])

  // After GitHub login completes, proceed with pending checkout
  useEffect(() => {
    if (authed && pendingTier) {
      const tier = pendingTier
      setPendingTier(null)
      handleUpgrade(tier)
    }
  }, [authed])

  // Dismiss success/cancel banners after 10s
  useEffect(() => {
    if (success || canceled) {
      const timer = setTimeout(() => {
        setSearchParams({}, { replace: true })
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [success, canceled])

  const handleUpgrade = async (tierId: 'starter' | 'pro' | 'team') => {
    if (!isAuthenticated()) {
      // Save which tier they wanted, then show login
      setPendingTier(tierId)
      setShowLogin(true)
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

  const handleLoginClose = () => {
    setShowLogin(false)
    // Re-check auth in case they logged in
    const nowAuthed = isAuthenticated()
    if (nowAuthed) {
      setAuthed(true)
    } else {
      setPendingTier(null)
    }
  }

  const currentPlan = billing?.plan || 'free'

  return (
    <div className="min-h-screen bg-ide-bg text-gray-100">
      {/* Nav */}
      <nav className="relative z-10 border-b border-ide-border bg-ide-bg/80 backdrop-blur-md">
        <div className="section-container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 bg-ide-accent flex items-center justify-center rounded">
              <span className="text-white font-bold text-sm">#</span>
            </div>
            <span className="text-lg font-semibold text-white">HashIDEA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/ide" className="cursor-pointer px-4 py-2 bg-ide-accent hover:bg-ide-accent-glow text-white text-sm font-medium rounded transition-colors">
              Open IDE
            </Link>
          </div>
        </div>
      </nav>

      {/* Success/Cancel banners */}
      {success && (
        <div className="relative z-10 bg-emerald-500/10 border-b border-emerald-500/20">
          <div className="section-container py-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 font-medium">Subscription activated!</p>
              <p className="text-emerald-400/70 text-sm">Your plan has been upgraded. Enjoy your new features.</p>
            </div>
            <button
              onClick={() => setSearchParams({}, { replace: true })}
              className="ml-auto text-emerald-400/50 hover:text-emerald-400 text-sm cursor-pointer"
              aria-label="Dismiss success banner"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {canceled && (
        <div className="relative z-10 bg-amber-500/10 border-b border-amber-500/20">
          <div className="section-container py-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-medium">Checkout canceled</p>
              <p className="text-amber-400/70 text-sm">No charges were made. You can upgrade anytime.</p>
            </div>
            <button
              onClick={() => setSearchParams({}, { replace: true })}
              className="ml-auto text-amber-400/50 hover:text-amber-400 text-sm cursor-pointer"
              aria-label="Dismiss cancel banner"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="relative z-10 pt-20 pb-12 text-center">
        <div className="section-container">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ide-accent/10 border border-ide-accent/20 rounded-full text-ide-accent text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            From playground to production
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Start free. Upgrade when you need persistence, privacy, or deployment.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="relative z-10 pb-24">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => {
              const isCurrent = currentPlan === tier.id
              const isUpgrade = !isCurrent && tier.id !== 'free' && (PLAN_RANK[tier.id] || 0) > (PLAN_RANK[currentPlan] || 0)

              return (
                <div
                  key={tier.id}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                    tier.highlight
                      ? 'border-ide-accent/50 bg-ide-accent/[0.03] shadow-lg shadow-ide-accent/10'
                      : 'border-ide-border bg-white/[0.02]'
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-ide-accent text-white text-xs font-medium rounded-full">
                      Most popular
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{tier.name}</h3>
                      <span className="text-xs text-ide-muted bg-ide-surface px-2 py-0.5 rounded-full">
                        {tier.verb}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{tier.description}</p>
                    <div className="flex items-baseline gap-1">
                      {tier.price !== null ? (
                        <>
                          <span className="text-3xl font-bold">${tier.price}</span>
                          <span className="text-slate-500 text-sm">/month</span>
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
                        <Check className="w-4 h-4 text-ide-accent mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {tier.id === 'free' ? (
                    <Link
                      to="/ide"
                      className="cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-ide-surface hover:bg-ide-surface-2 text-slate-300 font-medium text-sm transition-colors"
                    >
                      {tier.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : isCurrent ? (
                    <button
                      onClick={handleManage}
                      disabled={loading === 'manage'}
                      className="cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-ide-surface text-slate-400 font-medium text-sm transition-colors hover:bg-ide-surface-2 disabled:opacity-50"
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
                      className={`cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
                        tier.highlight
                          ? 'bg-ide-accent hover:bg-ide-accent-glow text-white'
                          : 'bg-ide-surface hover:bg-ide-surface-2 text-slate-300'
                      }`}
                    >
                      {loading === tier.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : !authed ? (
                        <Github className="w-4 h-4" />
                      ) : null}
                      {!authed ? `Log in to upgrade` : tier.cta}
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ-style note */}
      <section className="relative z-10 pb-24">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-bold mb-4">Enterprise?</h2>
            <p className="text-slate-400 mb-6">
              Need custom limits, SLAs, SSO, or on-premise deployment? Get in touch.
            </p>
            <a
              href="mailto:bumbufilip22@gmail.com"
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-ide-surface hover:bg-ide-surface-2 text-slate-300 font-medium rounded-xl transition-colors border border-ide-border"
            >
              Contact us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-ide-border py-8">
        <div className="section-container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-ide-accent rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">#</span>
            </div>
            <span className="text-slate-400">HashIDEA</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="cursor-pointer hover:text-white transition-colors">Home</Link>
            <Link to="/ide" className="cursor-pointer hover:text-white transition-colors">IDE</Link>
            <a href="https://github.com/WickTheThird/HashIDEA" target="_blank" rel="noopener" className="cursor-pointer hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      {/* GitHub Login Modal */}
      <GitHubModal
        isOpen={showLogin}
        onClose={handleLoginClose}
        onImport={() => {}}
      />
    </div>
  )
}
