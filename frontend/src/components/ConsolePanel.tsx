import { useState, useEffect, useRef } from 'react'
import { X, Trash2, AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface ConsoleMessage {
  type: 'log' | 'warn' | 'error' | 'info'
  content: string
  timestamp: Date
}

interface ConsolePanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConsolePanel({ isOpen, onClose }: ConsolePanelProps) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        setMessages(prev => [...prev, {
          type: event.data.level || 'log',
          content: event.data.message,
          timestamp: new Date(),
        }])
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const clearConsole = () => setMessages([])
  
  const getIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'warn': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
      case 'error': return <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      case 'info': return <Info className="w-3.5 h-3.5 text-blue-400" />
      default: return null
    }
  }
  
  const getColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'warn': return 'text-yellow-300'
      case 'error': return 'text-red-300'
      case 'info': return 'text-blue-300'
      default: return 'text-ide-text'
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="border-t border-ide-border bg-ide-surface">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-ide-border">
        <span className="text-xs font-medium text-ide-muted">Console</span>
        <div className="flex items-center gap-1">
          <button
            onClick={clearConsole}
            className="p-1 rounded hover:bg-ide-border transition"
            title="Clear console"
          >
            <Trash2 className="w-3.5 h-3.5 text-ide-muted" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-ide-border transition"
          >
            <X className="w-3.5 h-3.5 text-ide-muted" />
          </button>
        </div>
      </div>
      
      <div className="h-32 overflow-y-auto font-mono text-xs">
        {messages.length === 0 ? (
          <div className="p-3 text-ide-muted">Console output will appear here...</div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 px-3 py-1 hover:bg-ide-border/30 ${getColor(msg.type)}`}
            >
              {getIcon(msg.type)}
              <span className="flex-1">{msg.content}</span>
              <span className="text-ide-muted text-[10px]">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
