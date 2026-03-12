import { create } from 'zustand'
import { File, Workspace, DEFAULT_WORKSPACE } from '../types/workspace'
import { getWorkspaceFromHash, setWorkspaceHash } from '../lib/hash'

interface WorkspaceState {
  workspace: Workspace
  isLoading: boolean
  error: string | null
  
  // Actions
  loadFromHash: () => void
  saveToHash: () => void
  
  updateFile: (name: string, content: string) => void
  createFile: (name: string, language?: string) => void
  deleteFile: (name: string) => void
  renameFile: (oldName: string, newName: string) => void
  setActiveFile: (name: string) => void
  
  updateSettings: (settings: Partial<NonNullable<Workspace['settings']>>) => void
  setWorkspace: (workspace: Workspace) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspace: DEFAULT_WORKSPACE,
  isLoading: true,
  error: null,
  
  loadFromHash: () => {
    try {
      const workspace = getWorkspaceFromHash()
      set({ workspace, isLoading: false, error: null })
    } catch (error) {
      console.error('Failed to load workspace from hash:', error)
      set({ 
        workspace: DEFAULT_WORKSPACE, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load workspace'
      })
    }
  },
  
  saveToHash: () => {
    const { workspace } = get()
    try {
      setWorkspaceHash(workspace)
    } catch (error) {
      console.error('Failed to save workspace to hash:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to save workspace' })
    }
  },
  
  updateFile: (name: string, content: string) => {
    set((state) => {
      const files = state.workspace.files.map((file) =>
        file.name === name ? { ...file, content } : file
      )
      const workspace = { ...state.workspace, files }
      // Auto-save to hash on every change (debounce in component)
      return { workspace }
    })
  },
  
  createFile: (name: string, language?: string) => {
    set((state) => {
      // Check if file exists
      if (state.workspace.files.some((f) => f.name === name)) {
        return { error: `File "${name}" already exists` }
      }
      
      const newFile: File = {
        name,
        content: '',
        language: language || detectLanguage(name),
      }
      
      const files = [...state.workspace.files, newFile]
      const workspace = { ...state.workspace, files, activeFile: name }
      return { workspace, error: null }
    })
  },
  
  deleteFile: (name: string) => {
    set((state) => {
      const files = state.workspace.files.filter((f) => f.name !== name)
      if (files.length === 0) {
        return { error: 'Cannot delete the last file' }
      }
      
      let activeFile = state.workspace.activeFile
      if (activeFile === name) {
        activeFile = files[0].name
      }
      
      const workspace = { ...state.workspace, files, activeFile }
      return { workspace, error: null }
    })
  },
  
  renameFile: (oldName: string, newName: string) => {
    set((state) => {
      if (state.workspace.files.some((f) => f.name === newName)) {
        return { error: `File "${newName}" already exists` }
      }
      
      const files = state.workspace.files.map((file) =>
        file.name === oldName 
          ? { ...file, name: newName, language: detectLanguage(newName) } 
          : file
      )
      
      let activeFile = state.workspace.activeFile
      if (activeFile === oldName) {
        activeFile = newName
      }
      
      const workspace = { ...state.workspace, files, activeFile }
      return { workspace, error: null }
    })
  },
  
  setActiveFile: (name: string) => {
    set((state) => ({
      workspace: { ...state.workspace, activeFile: name }
    }))
  },
  
  updateSettings: (newSettings: Partial<NonNullable<Workspace['settings']>>) => {
    set((state) => {
      const currentSettings = state.workspace.settings ?? {
        theme: 'dark' as const,
        fontSize: 14,
        tabSize: 2,
        wordWrap: true,
        minimap: true,
        lineNumbers: true,
      }
      return {
        workspace: {
          ...state.workspace,
          settings: { ...currentSettings, ...newSettings }
        }
      }
    })
  },
  
  setWorkspace: (workspace: Workspace) => {
    set({ workspace, error: null })
  },
}))

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rs: 'rust',
    go: 'go',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    java: 'java',
    rb: 'ruby',
    php: 'php',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    sh: 'shell',
    bash: 'shell',
    sql: 'sql',
  }
  return map[ext || ''] || 'plaintext'
}
