import { create } from 'zustand'
import { File, Workspace, DEFAULT_WORKSPACE } from '../types/workspace'
import { getWorkspaceFromHash, setWorkspaceHash, HashError } from '../lib/hash'
import * as api from '../lib/api'

interface WorkspaceState {
  workspace: Workspace
  isLoading: boolean
  error: string | null

  // Cloud project state
  cloudProjectId: string | null
  isSaving: boolean

  loadFromHash: () => void
  saveToHash: () => void

  // Cloud operations
  loadFromCloud: (id: string) => Promise<void>
  saveToCloud: (opts?: { title?: string; description?: string }) => Promise<string | null>
  updateCloud: () => Promise<void>

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
  cloudProjectId: null,
  isSaving: false,

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
      set({ error: null })
    } catch (error) {
      console.error('Failed to save workspace to hash:', error)
      if (error instanceof HashError && (error.code === 'SIZE_EXCEEDED' || error.code === 'HASH_SIZE_EXCEEDED')) {
        set({ error: 'hash_size_exceeded' })
      } else {
        set({ error: error instanceof Error ? error.message : 'Failed to save workspace' })
      }
    }
  },

  loadFromCloud: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const project = await api.getProject(id)
      set({
        workspace: project.workspace,
        cloudProjectId: id,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Failed to load from cloud:', error)
      set({
        workspace: DEFAULT_WORKSPACE,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load project',
      })
    }
  },

  saveToCloud: async (opts) => {
    const { workspace } = get()
    set({ isSaving: true, error: null })
    try {
      const title = opts?.title || workspace.remix?.title || 'Untitled'
      const result = await api.saveProject({
        workspace,
        title,
        description: opts?.description,
        remix_from: workspace.remix?.from,
      })
      set({ cloudProjectId: result.id, isSaving: false })
      return result.id
    } catch (error: any) {
      console.error('Failed to save to cloud:', error)
      set({ isSaving: false })
      // Re-throw plan_limit errors so the UI can show the upgrade modal
      throw error
    }
  },

  updateCloud: async () => {
    const { workspace, cloudProjectId } = get()
    if (!cloudProjectId) return
    set({ isSaving: true, error: null })
    try {
      await api.updateProject(cloudProjectId, { workspace })
      set({ isSaving: false })
    } catch (error) {
      console.error('Failed to update cloud project:', error)
      set({ isSaving: false })
      throw error
    }
  },

  updateFile: (name: string, content: string) => {
    set((state) => {
      const files = state.workspace.files.map((file) =>
        file.name === name ? { ...file, content } : file
      )
      const workspace = { ...state.workspace, files }
      return { workspace }
    })
  },
  
  createFile: (name: string, language?: string) => {
    set((state) => {
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
    svelte: 'html',
    vue: 'html',
  }
  return map[ext || ''] || 'plaintext'
}
