import { X, Loader2 } from 'lucide-react'
import type { ExecutionResult } from '../lib/sandbox'

interface TerminalProps {
  output: ExecutionResult | null
  isRunning: boolean
  loadingStatus?: string | null
  onClose: () => void
  onRun?: () => void
}

export default function Terminal({ output, isRunning, loadingStatus, onClose }: TerminalProps) {
  let displayText = ''
  let textColor = '#e2e8f0'
  
  if (isRunning) {
    displayText = loadingStatus || 'Running...'
    textColor = '#64748b'
  } else if (output) {
    if (output.output) {
      displayText = output.output
      textColor = '#e2e8f0'
    } else if (output.error) {
      displayText = 'Error: ' + output.error
      textColor = '#f87171'
    } else {
      displayText = '(no output)'
      textColor = '#64748b'
    }
  } else {
    displayText = 'Press Ctrl+Enter to execute'
    textColor = '#64748b'
  }

  return (
    <div className="flex flex-col bg-[#12121a] h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ide-border">
        <div className="flex items-center gap-4">
          <span className="text-xs text-ide-muted font-semibold uppercase">
            Output
          </span>
          {isRunning && (
            <Loader2 className="w-3 h-3 animate-spin text-ide-muted" />
          )}
          {output && !isRunning && (
            <span className={`text-xs ${output.success ? 'text-green-400' : 'text-red-400'}`}>
              {output.success ? '✓' : '✗'} {(output.duration / 1000).toFixed(2)}s
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-ide-border transition text-ide-muted hover:text-ide-text"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Output area */}
      <pre className="flex-1 overflow-auto p-4 m-0 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words"
        style={{ color: textColor }}
      >
        {displayText}
      </pre>
    </div>
  )
}
