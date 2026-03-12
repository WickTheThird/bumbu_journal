import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'

interface SplitPaneProps {
  children: [ReactNode, ReactNode]
  direction?: 'horizontal' | 'vertical'
  defaultSize?: number // percentage (0-100)
  minSize?: number // percentage
  maxSize?: number // percentage
  className?: string
}

export default function SplitPane({
  children,
  direction = 'horizontal',
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  className = '',
}: SplitPaneProps) {
  const [size, setSize] = useState(defaultSize)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      let newSize: number

      if (direction === 'horizontal') {
        newSize = ((e.clientX - rect.left) / rect.width) * 100
      } else {
        newSize = ((e.clientY - rect.top) / rect.height) * 100
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize))
      setSize(newSize)
    },
    [isDragging, direction, minSize, maxSize]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp, direction])

  const isHorizontal = direction === 'horizontal'

  // Use CSS Grid for more predictable sizing
  const gridTemplate = isHorizontal 
    ? `${size}% 4px ${100 - size}%`
    : `${size}% 4px ${100 - size}%`

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ 
        display: 'grid',
        gridTemplateColumns: isHorizontal ? gridTemplate : '1fr',
        gridTemplateRows: isHorizontal ? '1fr' : gridTemplate,
        height: '100%', 
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* First pane */}
      <div style={{ overflow: 'hidden', minWidth: 0, minHeight: 0 }}>
        {children[0]}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`bg-ide-border hover:bg-purple-500 active:bg-purple-600 transition-colors z-10 ${
          isHorizontal ? 'cursor-col-resize' : 'cursor-row-resize'
        }`}
        style={{ minWidth: 0, minHeight: 0 }}
      />

      {/* Second pane */}
      <div style={{ overflow: 'hidden', minWidth: 0, minHeight: 0 }}>
        {children[1]}
      </div>
    </div>
  )
}
