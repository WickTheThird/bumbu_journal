import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'

interface SplitPaneProps {
  children: [ReactNode, ReactNode]
  direction?: 'horizontal' | 'vertical'
  defaultSize?: number // percentage
  minSize?: number // percentage
  maxSize?: number // percentage
  className?: string
}

export default function SplitPane({
  children,
  direction = 'horizontal',
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  className = '',
}: SplitPaneProps) {
  const [size, setSize] = useState(defaultSize)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
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

  return (
    <div
      ref={containerRef}
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`}
      style={{ height: '100%', width: '100%' }}
    >
      {/* First pane */}
      <div
        style={{
          [isHorizontal ? 'width' : 'height']: `${size}%`,
          overflow: 'hidden',
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {children[0]}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`resize-handle ${isHorizontal ? 'resize-handle-h' : 'resize-handle-v'} bg-ide-border hover:bg-purple-500/50 transition-colors flex-shrink-0`}
        style={{
          [isHorizontal ? 'width' : 'height']: '4px',
        }}
      />

      {/* Second pane */}
      <div
        style={{
          [isHorizontal ? 'width' : 'height']: `${100 - size}%`,
          overflow: 'hidden',
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {children[1]}
      </div>
    </div>
  )
}
