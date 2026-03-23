/**
 * Recent Projects - localStorage-based project history
 * Enables "your work waiting for you" return visits
 */

const STORAGE_KEY = 'hashidea-recent-projects'
const MAX_PROJECTS = 20

export interface RecentProject {
  hash: string          // Full hash (for loading)
  shortHash: string     // First 8 chars (for display)
  title: string         // Project title
  files: string[]       // List of file names
  lastOpened: number    // Timestamp
  thumbnail?: string    // Optional base64 preview
}

/**
 * Get all recent projects from localStorage
 */
export function getRecentProjects(): RecentProject[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const projects = JSON.parse(stored) as RecentProject[]
    // Sort by lastOpened descending
    return projects.sort((a, b) => b.lastOpened - a.lastOpened)
  } catch {
    return []
  }
}

/**
 * Add or update a project in recent history
 */
export function saveToRecentProjects(project: Omit<RecentProject, 'lastOpened'>): void {
  try {
    const projects = getRecentProjects()
    
    // Remove existing entry with same shortHash (we'll re-add it)
    const filtered = projects.filter(p => p.shortHash !== project.shortHash)
    
    // Add new entry at the beginning
    const updated: RecentProject = {
      ...project,
      lastOpened: Date.now(),
    }
    
    filtered.unshift(updated)
    
    // Keep only MAX_PROJECTS
    const trimmed = filtered.slice(0, MAX_PROJECTS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (e) {
    console.warn('Failed to save to recent projects:', e)
  }
}

/**
 * Remove a project from recent history
 */
export function removeFromRecentProjects(shortHash: string): void {
  try {
    const projects = getRecentProjects()
    const filtered = projects.filter(p => p.shortHash !== shortHash)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (e) {
    console.warn('Failed to remove from recent projects:', e)
  }
}

/**
 * Clear all recent projects
 */
export function clearRecentProjects(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('Failed to clear recent projects:', e)
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  }
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  }
  return 'Just now'
}
