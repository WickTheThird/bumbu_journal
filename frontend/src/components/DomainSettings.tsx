import { useState, useEffect } from 'react'
import { Globe, Copy, Check, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { getDomain, addDomain, removeDomain, DomainInfo } from '../lib/api'

interface DomainSettingsProps {
  projectId: string
  onAuthRequired?: () => void
}

export default function DomainSettings({ projectId, onAuthRequired }: DomainSettingsProps) {
  const [domain, setDomain] = useState<DomainInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [instructions, setInstructions] = useState<string | null>(null)

  useEffect(() => {
    getDomain(projectId)
      .then((res) => { setDomain(res.domain ?? (res as any)); setLoading(false) })
      .catch((e) => {
        if (e.status === 401) onAuthRequired?.()
        setLoading(false)
      })
  }, [projectId])

  const handleAdd = async () => {
    if (!input.trim()) return
    setSaving(true)
    setError(null)
    try {
      const result = await addDomain(projectId, input.trim())
      setDomain({ id: result.id, domain: result.domain, verified: result.verified, cname_target: result.cname_target, created_at: '' })
      setInstructions(result.instructions)
      setInput('')
    } catch (e: any) {
      if (e.code === 'plan_limit') {
        setError(e.message || 'Upgrade your plan to add custom domains')
      } else {
        setError(e.message || 'Failed to add domain')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      await removeDomain(projectId)
      setDomain(null)
      setInstructions(null)
    } catch (e: any) {
      setError(e.message || 'Failed to remove domain')
    } finally {
      setRemoving(false)
    }
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-ide-muted text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading domain settings...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4 text-ide-accent" />
        <h3 className="text-sm font-semibold text-white">Custom Domain</h3>
      </div>

      {domain ? (
        <div className="space-y-3">
          {/* Active domain */}
          <div className="flex items-center justify-between p-3 bg-ide-bg rounded-lg border border-ide-border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${domain.verified ? 'bg-neon-green' : 'bg-amber-400 animate-pulse'}`} />
              <a href={`https://${domain.domain}`} target="_blank" rel="noopener" className="text-sm text-white hover:text-ide-accent transition-colors cursor-pointer">
                {domain.domain}
              </a>
              {!domain.verified && (
                <span className="text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Pending DNS</span>
              )}
            </div>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Remove domain"
              aria-label="Remove custom domain"
            >
              {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>

          {/* DNS instructions */}
          {(instructions || !domain.verified) && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-sm">
              <p className="text-amber-400 font-medium mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Configure your DNS
              </p>
              <p className="text-slate-400 text-xs mb-2">
                Add a CNAME record at your domain registrar:
              </p>
              <div className="flex items-center gap-2 p-2 bg-ide-bg rounded font-mono text-xs">
                <span className="text-slate-500">CNAME</span>
                <span className="text-white">{domain.domain}</span>
                <span className="text-slate-500">-&gt;</span>
                <span className="text-neon-green">{domain.cname_target}</span>
                <button onClick={() => copyText(domain.cname_target)} className="ml-auto text-slate-500 hover:text-white cursor-pointer" aria-label="Copy CNAME target">
                  {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Add domain form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="myapp.com"
              className="flex-1 px-3 py-2 bg-ide-bg border border-ide-border rounded-lg text-sm text-white placeholder:text-ide-muted focus:outline-none focus:border-ide-accent/50 focus:ring-1 focus:ring-ide-accent/30 transition-all"
            />
            <button
              onClick={handleAdd}
              disabled={saving || !input.trim()}
              className="px-4 py-2 bg-ide-accent hover:bg-ide-accent-glow text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </button>
          </div>
          <p className="text-xs text-ide-muted">
            Point your domain to HashIDEA and visitors will see your project as a standalone app.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  )
}
