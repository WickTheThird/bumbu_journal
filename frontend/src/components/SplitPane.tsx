import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'

interface SplitPaneProps {
  direction: 'horizontal' | 'vertical'
  children: [ReactNode, ReactNode]
  defaultRatio?: number // 0-1, default 0.5
}

export default function SplitPane({ direction, children, defaultRatio = 0.5 }: SplitPaneProps) {
  const [ratio, setRatio] = useState(defaultRatio)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }, [direction])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      let newRatio: number
      
      if (direction === 'horizontal') {
        newRatio = (e.clientX - rect.left) / rect.width
      } else {
        newRatio = (e.clientY - rect.top) / rect.height
      }
      
      // Clamp between 0.1 and 0.9
      setRatio(Math.max(0.1, Math.min(0.9, newRatio)))
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [direction])

  const isHorizontal = direction === 'horizontal'

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ 
        [isHorizontal ? 'width' : 'height']: `calc(${ratio * 100}% - 2px)`,
        [isHorizontal ? 'height' : 'width']: '100%',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {children[0]}
      </div>
      
      <div
        onMouseDown={handleMouseDown}
        style={{
          [isHorizontal ? 'width' : 'height']: '4px',
          [isHorizontal ? 'height' : 'width']: '100%',
          background: '#333',
          cursor: isHorizontal ? 'col-resize' : 'row-resize',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#a855f7'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
      />
      
      <div style={{ 
        flex: 1,
        overflow: 'hidden',
        minWidth: 0,
        minHeight: 0,
      }}>
        {children[1]}
      </div>
    </div>
  )
}
