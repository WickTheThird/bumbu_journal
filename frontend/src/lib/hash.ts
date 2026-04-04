import LZString from 'lz-string'
import { Workspace, WorkspaceSchema, WorkspaceSchemaV2, DEFAULT_WORKSPACE, migrateWorkspace } from '../types/workspace'

const MAX_HASH_SIZE = 500_000 // 500KB max hash size
const MAX_DECOMPRESSED_SIZE = 5_000_000 // 5MB max decompressed

export class HashError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'HashError'
  }
}

/**
 * Encode workspace to URL-safe hash string
 */
export function encodeWorkspace(workspace: Workspace): string {
  try {
    // Always encode as v2
    const validated = WorkspaceSchemaV2.parse(workspace)
    const json = JSON.stringify(validated)
    
    if (json.length > MAX_DECOMPRESSED_SIZE) {
      throw new HashError('Workspace too large', 'SIZE_EXCEEDED')
    }
    
    const compressed = LZString.compressToEncodedURIComponent(json)
    
    if (compressed.length > MAX_HASH_SIZE) {
      throw new HashError('Compressed workspace too large for URL', 'HASH_SIZE_EXCEEDED')
    }
    
    return compressed
  } catch (error) {
    if (error instanceof HashError) throw error
    throw new HashError('Failed to encode workspace', 'ENCODE_FAILED')
  }
}

/**
 * Decode URL hash to workspace with strict validation
 */
export function decodeWorkspace(hash: string): Workspace {
  if (!hash || typeof hash !== 'string') {
    return DEFAULT_WORKSPACE
  }
  
  if (hash.length > MAX_HASH_SIZE) {
    throw new HashError('Hash exceeds maximum size', 'HASH_TOO_LARGE')
  }
  
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash)
    
    if (!decompressed) {
      throw new HashError('Failed to decompress hash', 'DECOMPRESS_FAILED')
    }
    
    if (decompressed.length > MAX_DECOMPRESSED_SIZE) {
      throw new HashError('Decompressed content too large', 'DECOMPRESS_SIZE_EXCEEDED')
    }
    
    const parsed = JSON.parse(decompressed)
    
    // Parse with union schema (accepts v1 or v2)
    const validated = WorkspaceSchema.parse(parsed)
    
    // Migrate to v2 if needed
    return migrateWorkspace(validated)
  } catch (error) {
    if (error instanceof HashError) throw error
    if (error instanceof SyntaxError) {
      throw new HashError('Invalid JSON in hash', 'INVALID_JSON')
    }
    throw new HashError('Failed to decode workspace', 'DECODE_FAILED')
  }
}

/**
 * Get current workspace from URL hash
 */
export function getWorkspaceFromHash(): Workspace {
  const hash = window.location.hash.slice(1) // Remove #
  if (!hash) return DEFAULT_WORKSPACE
  return decodeWorkspace(hash)
}

/**
 * Update URL hash with workspace (without page reload)
 */
export function setWorkspaceHash(workspace: Workspace): void {
  const hash = encodeWorkspace(workspace)
  window.history.replaceState(null, '', `#${hash}`)
}

/**
 * Generate shareable URL for workspace
 */
export function getShareableURL(workspace: Workspace): string {
  const hash = encodeWorkspace(workspace)
  return `${window.location.origin}/ide#${hash}`
}

/**
 * Calculate workspace size info (for UI indicators)
 */
export function getWorkspaceSize(workspace: Workspace): {
  jsonBytes: number
  compressedBytes: number
  maxCompressed: number
  percent: number
  fileCount: number
} {
  try {
    const validated = WorkspaceSchemaV2.parse(workspace)
    const json = JSON.stringify(validated)
    const compressed = LZString.compressToEncodedURIComponent(json)
    return {
      jsonBytes: json.length,
      compressedBytes: compressed.length,
      maxCompressed: MAX_HASH_SIZE,
      percent: Math.round((compressed.length / MAX_HASH_SIZE) * 100),
      fileCount: workspace.files.length,
    }
  } catch {
    return {
      jsonBytes: 0,
      compressedBytes: 0,
      maxCompressed: MAX_HASH_SIZE,
      percent: 0,
      fileCount: workspace.files.length,
    }
  }
}

/**
 * Get short hash identifier (first 8 chars) for remix tracking
 */
export function getShortHash(): string {
  const hash = window.location.hash.slice(1)
  return hash.slice(0, 8)
}

/**
 * Create a remixed copy of the current workspace
 */
export function createRemix(workspace: Workspace, author?: string): Workspace {
  const originalHash = getShortHash()
  
  return {
    ...workspace,
    version: 2,
    remix: {
      from: originalHash || undefined,
      author: author || undefined,
      created: Date.now(),
      title: workspace.remix?.title || getProjectTitle(workspace),
    },
  }
}

/**
 * Get project title from workspace (uses first file name or remix title)
 */
export function getProjectTitle(workspace: Workspace): string {
  if (workspace.remix?.title) {
    return workspace.remix.title
  }
  // Use first file name without extension as title
  const firstFile = workspace.files[0]?.name
  if (firstFile) {
    return firstFile.replace(/\.[^.]+$/, '')
  }
  return 'Untitled Project'
}
