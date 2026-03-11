/**
 * Version history management for HashIDE
 * Stores snapshots of workspace state for undo/comparison
 */

import { Workspace } from '../types/workspace'
import { encodeWorkspace, decodeWorkspace } from './hash'

export interface VersionSnapshot {
  timestamp: number
  hash: string
  label?: string
}

const MAX_HISTORY = 50
const STORAGE_KEY = 'hashide_history'

/**
 * Get version history from localStorage
 */
export function getHistory(): VersionSnapshot[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Save a workspace snapshot to history
 */
export function saveSnapshot(workspace: Workspace, label?: string): void {
  try {
    const hash = encodeWorkspace(workspace)
    const history = getHistory()
    
    // Don't save duplicate consecutive snapshots
    if (history.length > 0 && history[0].hash === hash) {
      return
    }
    
    const snapshot: VersionSnapshot = {
      timestamp: Date.now(),
      hash,
      label,
    }
    
    // Add to beginning, limit size
    const newHistory = [snapshot, ...history].slice(0, MAX_HISTORY)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

/**
 * Load a workspace from a historical snapshot
 */
export function loadSnapshot(hash: string): Workspace {
  return decodeWorkspace(hash)
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Get a readable time label for a timestamp
 */
export function getTimeLabel(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return new Date(timestamp).toLocaleDateString()
}

/**
 * Compare two workspace hashes and return differences
 */
export function compareWorkspaces(hash1: string, hash2: string): {
  filesAdded: string[]
  filesRemoved: string[]
  filesModified: string[]
} {
  const ws1 = decodeWorkspace(hash1)
  const ws2 = decodeWorkspace(hash2)
  
  const files1 = new Map(ws1.files.map(f => [f.name, f.content]))
  const files2 = new Map(ws2.files.map(f => [f.name, f.content]))
  
  const filesAdded: string[] = []
  const filesRemoved: string[] = []
  const filesModified: string[] = []
  
  // Check for removed and modified files
  for (const [name, content] of files1) {
    if (!files2.has(name)) {
      filesRemoved.push(name)
    } else if (files2.get(name) !== content) {
      filesModified.push(name)
    }
  }
  
  // Check for added files
  for (const name of files2.keys()) {
    if (!files1.has(name)) {
      filesAdded.push(name)
    }
  }
  
  return { filesAdded, filesRemoved, filesModified }
}
