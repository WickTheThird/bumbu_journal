import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { bookmarkProject, unbookmarkProject } from '../lib/api'
import { isAuthenticated } from '../lib/github'

interface BookmarkButtonProps {
  projectId: string
  initialBookmarked?: boolean
  onAuthRequired?: () => void
}

export default function BookmarkButton({ projectId, initialBookmarked = false, onAuthRequired }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated()) {
      onAuthRequired?.()
      return
    }

    if (loading) return
    setLoading(true)

    const was = bookmarked
    setBookmarked(!was)

    try {
      const result = was
        ? await unbookmarkProject(projectId)
        : await bookmarkProject(projectId)
      setBookmarked(result.bookmarked)
    } catch {
      setBookmarked(was)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center text-xs transition-all duration-200 cursor-pointer ${
        bookmarked
          ? 'text-amber-400 hover:text-amber-300'
          : 'text-slate-500 hover:text-amber-400'
      }`}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark project'}
    >
      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
    </button>
  )
}
