/**
 * Local Version Control System
 * Git-like functionality stored in localStorage
 */

export interface VCSFile {
  name: string
  content: string
}

export interface VCSCommit {
  hash: string
  message: string
  timestamp: number
  files: VCSFile[]
  parent?: string // hash of parent commit
}

export interface VCSState {
  commits: VCSCommit[]
  head: string | null // current commit hash
  staged: string[] // file names staged for commit
  remoteUrl?: string // GitHub repo if connected
}

const STORAGE_KEY = 'hashide_vcs'

function generateHash(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function loadVCS(): VCSState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load VCS state:', e)
  }
  return { commits: [], head: null, staged: [] }
}

export function saveVCS(state: VCSState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function stageFile(state: VCSState, filename: string): VCSState {
  if (state.staged.includes(filename)) return state
  return { ...state, staged: [...state.staged, filename] }
}

export function unstageFile(state: VCSState, filename: string): VCSState {
  return { ...state, staged: state.staged.filter(f => f !== filename) }
}

export function stageAll(state: VCSState, files: VCSFile[]): VCSState {
  return { ...state, staged: files.map(f => f.name) }
}

export function unstageAll(state: VCSState): VCSState {
  return { ...state, staged: [] }
}

export function commit(state: VCSState, message: string, files: VCSFile[]): VCSState {
  // Only include staged files (or all if none staged)
  const filesToCommit = state.staged.length > 0
    ? files.filter(f => state.staged.includes(f.name))
    : files

  const newCommit: VCSCommit = {
    hash: generateHash(),
    message,
    timestamp: Date.now(),
    files: filesToCommit.map(f => ({ name: f.name, content: f.content })),
    parent: state.head || undefined,
  }

  return {
    ...state,
    commits: [...state.commits, newCommit],
    head: newCommit.hash,
    staged: [],
  }
}

export function getCommit(state: VCSState, hash: string): VCSCommit | undefined {
  return state.commits.find(c => c.hash === hash)
}

export function getHeadCommit(state: VCSState): VCSCommit | undefined {
  if (!state.head) return undefined
  return getCommit(state, state.head)
}

export function getCommitHistory(state: VCSState): VCSCommit[] {
  // Return commits in reverse chronological order
  return [...state.commits].reverse()
}

export interface FileDiff {
  name: string
  status: 'added' | 'modified' | 'deleted' | 'unchanged'
  oldContent?: string
  newContent?: string
}

export function diffFiles(oldFiles: VCSFile[], newFiles: VCSFile[]): FileDiff[] {
  const diffs: FileDiff[] = []
  const oldMap = new Map(oldFiles.map(f => [f.name, f.content]))
  const newMap = new Map(newFiles.map(f => [f.name, f.content]))

  // Check new and modified files
  for (const [name, content] of newMap) {
    const oldContent = oldMap.get(name)
    if (oldContent === undefined) {
      diffs.push({ name, status: 'added', newContent: content })
    } else if (oldContent !== content) {
      diffs.push({ name, status: 'modified', oldContent, newContent: content })
    }
  }

  // Check deleted files
  for (const [name, content] of oldMap) {
    if (!newMap.has(name)) {
      diffs.push({ name, status: 'deleted', oldContent: content })
    }
  }

  return diffs.sort((a, b) => a.name.localeCompare(b.name))
}

export function diffWithHead(state: VCSState, currentFiles: VCSFile[]): FileDiff[] {
  const headCommit = getHeadCommit(state)
  const oldFiles = headCommit?.files || []
  return diffFiles(oldFiles, currentFiles)
}

export function diffWithCommit(state: VCSState, commitHash: string, currentFiles: VCSFile[]): FileDiff[] {
  const commit = getCommit(state, commitHash)
  const oldFiles = commit?.files || []
  return diffFiles(oldFiles, currentFiles)
}

export function checkout(state: VCSState, commitHash: string): { state: VCSState; files: VCSFile[] } | null {
  const commit = getCommit(state, commitHash)
  if (!commit) return null
  
  return {
    state: { ...state, head: commitHash },
    files: commit.files,
  }
}

export function resetVCS(): VCSState {
  const newState: VCSState = { commits: [], head: null, staged: [] }
  saveVCS(newState)
  return newState
}

// Initialize with first commit from current files
export function initializeVCS(files: VCSFile[], message: string = 'Initial commit'): VCSState {
  const state = loadVCS()
  if (state.commits.length === 0 && files.length > 0) {
    const newState = commit(state, message, files)
    saveVCS(newState)
    return newState
  }
  return state
}

export function setRemoteUrl(state: VCSState, url: string | undefined): VCSState {
  return { ...state, remoteUrl: url }
}
