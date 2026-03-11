import { useRef, useEffect } from 'react'
import { X, Play, Loader2 } from 'lucide-react'
import type { ExecutionResult } from '../lib/sandbox'

interface TerminalProps {
  output: ExecutionResult | null
  isRunning: boolean
  onClose: () => void
  onRun: () => void
}

export default function Terminal({ output, isRunning, onClose, onRun }: TerminalProps) {
  const outputRef = useRef<HTMLPreElement>(null)
  
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])
  
  return (
    <div className="flex flex-col bg-ide-surface border-t border-ide-border h-48">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ide-border">
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-wide text-ide-muted font-semibold">
            Output
          </span>
          {output && (
            <span className={`text-xs ${output.success ? 'text-green-400' : 'text-red-400'}`}>
              {output.success ? '✓' : '✗'} {(output.duration / 1000).toFixed(2)}s
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isRunning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            Run
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-ide-border transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Terminal output */}
      <pre
        ref={outputRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed"
      >
        {isRunning && (
          <span className="text-ide-muted">Running...</span>
        )}
        {output && !isRunning && (
          <>
            {output.output && (
              <span className="text-ide-text whitespace-pre-wrap">{output.output}</span>
            )}
            {output.error && (
              <span className="text-red-400 whitespace-pre-wrap">
                {output.output ? '\n' : ''}Error: {output.error}
              </span>
            )}
            {!output.output && !output.error && output.success && (
              <span className="text-ide-muted">(no output)</span>
            )}
          </>
        )}
        {!output && !isRunning && (
          <span className="text-ide-muted">Press Run or Ctrl+Enter to execute</span>
        )}
      </pre>
    </div>
  )
}
