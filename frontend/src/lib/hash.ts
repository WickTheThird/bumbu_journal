import LZString from 'lz-string'
import { Workspace, WorkspaceSchema, DEFAULT_WORKSPACE } from '../types/workspace'

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
    // Validate workspace before encoding
    const validated = WorkspaceSchema.parse(workspace)
    const json = JSON.stringify(validated)
    
    // Check size before compression
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
  // Treat hash as hostile input
  if (!hash || typeof hash !== 'string') {
    return DEFAULT_WORKSPACE
  }
  
  // Size check before any processing
  if (hash.length > MAX_HASH_SIZE) {
    throw new HashError('Hash exceeds maximum size', 'HASH_TOO_LARGE')
  }
  
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash)
    
    if (!decompressed) {
      throw new HashError('Failed to decompress hash', 'DECOMPRESS_FAILED')
    }
    
    // Size check after decompression (prevent zip bombs)
    if (decompressed.length > MAX_DECOMPRESSED_SIZE) {
      throw new HashError('Decompressed content too large', 'DECOMPRESS_SIZE_EXCEEDED')
    }
    
    const parsed = JSON.parse(decompressed)
    
    // Strict schema validation - rejects unknown fields
    const validated = WorkspaceSchema.strict().parse(parsed)
    
    return validated
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
