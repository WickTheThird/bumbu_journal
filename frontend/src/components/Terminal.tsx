import { X, Play, Loader2 } from 'lucide-react'
import type { ExecutionResult } from '../lib/sandbox'

interface TerminalProps {
  output: ExecutionResult | null
  isRunning: boolean
  onClose: () => void
  onRun: () => void
}

export default function Terminal({ output, isRunning, onClose, onRun }: TerminalProps) {
  // Determine what text to show
  let displayText = ''
  let textColor = '#e2e8f0'
  
  if (isRunning) {
    displayText = 'Running...'
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
    displayText = 'Press Run or Ctrl+Enter to execute'
    textColor = '#64748b'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#12121a',
      borderTop: '1px solid #1e1e2e',
      height: '200px',
      minHeight: '200px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px solid #1e1e2e',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Output
          </span>
          {output && (
            <span style={{ fontSize: '12px', color: output.success ? '#4ade80' : '#f87171' }}>
              {output.success ? '✓' : '✗'} {(output.duration / 1000).toFixed(2)}s
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onRun}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              fontSize: '12px',
              borderRadius: '4px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Run
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Output area */}
      <pre style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        margin: 0,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: '14px',
        lineHeight: '1.5',
        color: textColor,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {displayText}
      </pre>
    </div>
  )
}
