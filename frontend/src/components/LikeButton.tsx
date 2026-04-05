import { useState } from 'react'
import { Heart } from 'lucide-react'
import { likeProject, unlikeProject } from '../lib/api'
import { isAuthenticated } from '../lib/github'

interface LikeButtonProps {
  projectId: string
  initialCount: number
  initialLiked?: boolean
  onAuthRequired?: () => void
}

export default function LikeButton({ projectId, initialCount, initialLiked = false, onAuthRequired }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
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

    // Optimistic update
    const wasLiked = liked
    const prevCount = count
    setLiked(!wasLiked)
    setCount(wasLiked ? Math.max(0, count - 1) : count + 1)

    try {
      const result = wasLiked
        ? await unlikeProject(projectId)
        : await likeProject(projectId)
      setLiked(result.liked)
      setCount(result.like_count)
    } catch {
      // Revert on error
      setLiked(wasLiked)
      setCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1 text-xs transition-all duration-200 cursor-pointer ${
        liked
          ? 'text-pink-400 hover:text-pink-300'
          : 'text-slate-500 hover:text-pink-400'
      }`}
      title={liked ? 'Unlike' : 'Like'}
      aria-label={liked ? 'Unlike project' : 'Like project'}
    >
      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
