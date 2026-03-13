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
        // Account for handle width (4px)
        const availableWidth = rect.width - 4
        newSize = ((e.clientX - rect.left) / availableWidth) * 100
      } else {
        // Account for handle height (4px)
        const availableHeight = rect.height - 4
        newSize = ((e.clientY - rect.top) / availableHeight) * 100
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

  return (
    <div
      ref={containerRef}
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`}
      style={{ 
        height: '100%', 
        width: '100%',
        minHeight: 0,
        minWidth: 0,
      }}
    >
      {/* First pane - use flex with basis */}
      <div
        className="overflow-hidden"
        style={{
          flex: `${size} 1 0`,
          minWidth: isHorizontal ? 50 : undefined,
          minHeight: isHorizontal ? undefined : 30,
        }}
      >
        {children[0]}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`flex-shrink-0 bg-ide-border hover:bg-purple-500 active:bg-purple-600 transition-colors z-10 ${
          isHorizontal ? 'cursor-col-resize w-1 hover:w-1' : 'cursor-row-resize h-1 hover:h-1'
        }`}
      />

      {/* Second pane - use remaining flex */}
      <div
        className="overflow-hidden"
        style={{
          flex: `${100 - size} 1 0`,
          minWidth: isHorizontal ? 50 : undefined,
          minHeight: isHorizontal ? undefined : 30,
        }}
      >
        {children[1]}
      </div>
    </div>
  )
}
