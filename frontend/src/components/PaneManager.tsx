import { createContext, useContext, useCallback, useState, ReactNode, useRef, useEffect } from 'react'

export interface PaneNode {
  id: string
  type: 'editor' | 'split'
  // Editor state
  activeFile?: string | null
  openTabs?: string[]
  // Split state
  direction?: 'horizontal' | 'vertical'
  children?: [string, string] // IDs of child panes
}

interface PaneManagerState {
  panes: Record<string, PaneNode>
  rootId: string
}

interface PaneManagerContextType {
  state: PaneManagerState
  getPane: (id: string) => PaneNode | undefined
  updatePane: (id: string, updates: Partial<PaneNode>) => void
  splitPane: (id: string, direction: 'horizontal' | 'vertical', newFile: string, position: 'first' | 'second') => void
  closePane: (id: string) => void
  closeTab: (paneId: string, fileName: string) => void
  selectFile: (paneId: string, fileName: string) => void
  reorderTabs: (paneId: string, draggedFile: string, dropIndex: number) => void
  openFileExternal: (fileName: string) => void // Open file from outside (e.g., file explorer)
  syncWithFiles: (fileNames: string[]) => void // Remove tabs for files that no longer exist
}

const PaneManagerContext = createContext<PaneManagerContextType | null>(null)

let paneIdCounter = 0
const generatePaneId = () => `pane-${++paneIdCounter}`

export function PaneManagerProvider({ 
  children, 
  initialTabs,
  initialActiveFile,
  workspaceKey, // Use this to reset state when workspace changes
}: { 
  children: ReactNode
  initialTabs: string[]
  initialActiveFile: string | null
  workspaceKey?: string // Hash of workspace to detect changes
}) {
  const [state, setState] = useState<PaneManagerState>(() => {
    const rootId = generatePaneId()
    return {
      rootId,
      panes: {
        [rootId]: {
          id: rootId,
          type: 'editor',
          activeFile: initialActiveFile,
          openTabs: initialTabs,
        }
      }
    }
  })
  
  const prevWorkspaceKey = useRef(workspaceKey)
  useEffect(() => {
    if (workspaceKey && workspaceKey !== prevWorkspaceKey.current) {
      prevWorkspaceKey.current = workspaceKey
      const newRootId = generatePaneId()
      setState({
        rootId: newRootId,
        panes: {
          [newRootId]: {
            id: newRootId,
            type: 'editor',
            activeFile: initialActiveFile,
            openTabs: initialTabs,
          }
        }
      })
    }
  }, [workspaceKey, initialTabs, initialActiveFile])

  const getPane = useCallback((id: string) => state.panes[id], [state.panes])

  const updatePane = useCallback((id: string, updates: Partial<PaneNode>) => {
    setState(prev => ({
      ...prev,
      panes: {
        ...prev.panes,
        [id]: { ...prev.panes[id], ...updates }
      }
    }))
  }, [])

  const splitPane = useCallback((id: string, direction: 'horizontal' | 'vertical', newFile: string, position: 'first' | 'second') => {
    setState(prev => {
      const pane = prev.panes[id]
      if (!pane || pane.type !== 'editor') return prev

      const child1Id = generatePaneId()
      const child2Id = generatePaneId()

      const originalChild: PaneNode = {
        id: position === 'first' ? child2Id : child1Id,
        type: 'editor',
        activeFile: pane.activeFile,
        openTabs: pane.openTabs || [],
      }

      const newChild: PaneNode = {
        id: position === 'first' ? child1Id : child2Id,
        type: 'editor',
        activeFile: newFile,
        openTabs: [newFile],
      }

      const splitPaneNode: PaneNode = {
        id,
        type: 'split',
        direction,
        children: [child1Id, child2Id],
      }

      return {
        ...prev,
        panes: {
          ...prev.panes,
          [id]: splitPaneNode,
          [child1Id]: position === 'first' ? newChild : originalChild,
          [child2Id]: position === 'first' ? originalChild : newChild,
        }
      }
    })
  }, [])

  const closePane = useCallback((id: string) => {
    setState(prev => {
      let parentId: string | null = null
      let childIndex: 0 | 1 = 0

      for (const [pId, pane] of Object.entries(prev.panes)) {
        if (pane.type === 'split' && pane.children) {
          if (pane.children[0] === id) {
            parentId = pId
            childIndex = 0
            break
          }
          if (pane.children[1] === id) {
            parentId = pId
            childIndex = 1
            break
          }
        }
      }

      if (!parentId) {
        return prev
      }

      const parent = prev.panes[parentId]
      if (parent.type !== 'split' || !parent.children) return prev

      const siblingId = parent.children[childIndex === 0 ? 1 : 0]
      const sibling = prev.panes[siblingId]

      const newPanes = { ...prev.panes }
      
      delete newPanes[id]
      delete newPanes[siblingId]

      newPanes[parentId] = {
        ...sibling,
        id: parentId,
      }

      return { ...prev, panes: newPanes }
    })
  }, [])

  const closeTab = useCallback((paneId: string, fileName: string) => {
    setState(prev => {
      const pane = prev.panes[paneId]
      if (!pane || pane.type !== 'editor') return prev

      const newTabs = (pane.openTabs || []).filter(t => t !== fileName)
      
      if (newTabs.length === 0 && paneId !== prev.rootId) {
        setTimeout(() => closePane(paneId), 0)
        return prev
      }

      return {
        ...prev,
        panes: {
          ...prev.panes,
          [paneId]: {
            ...pane,
            openTabs: newTabs,
            activeFile: pane.activeFile === fileName ? (newTabs[0] || null) : pane.activeFile,
          }
        }
      }
    })
  }, [closePane])

  const selectFile = useCallback((paneId: string, fileName: string) => {
    setState(prev => {
      const pane = prev.panes[paneId]
      if (!pane || pane.type !== 'editor') return prev

      const tabs = pane.openTabs || []
      return {
        ...prev,
        panes: {
          ...prev.panes,
          [paneId]: {
            ...pane,
            activeFile: fileName,
            openTabs: tabs.includes(fileName) ? tabs : [...tabs, fileName],
          }
        }
      }
    })
  }, [])

  const reorderTabs = useCallback((paneId: string, draggedFile: string, dropIndex: number) => {
    setState(prev => {
      const pane = prev.panes[paneId]
      if (!pane || pane.type !== 'editor') return prev

      const tabs = pane.openTabs || []
      const currentIndex = tabs.indexOf(draggedFile)
      
      if (currentIndex === -1) {
        const newTabs = [...tabs]
        newTabs.splice(dropIndex, 0, draggedFile)
        return {
          ...prev,
          panes: {
            ...prev.panes,
            [paneId]: { ...pane, openTabs: newTabs, activeFile: draggedFile }
          }
        }
      }

      if (currentIndex === dropIndex) return prev

      const newTabs = tabs.filter(t => t !== draggedFile)
      const adjustedIndex = dropIndex > currentIndex ? dropIndex - 1 : dropIndex
      newTabs.splice(adjustedIndex, 0, draggedFile)

      return {
        ...prev,
        panes: {
          ...prev.panes,
          [paneId]: { ...pane, openTabs: newTabs }
        }
      }
    })
  }, [])

  const openFileExternal = useCallback((fileName: string) => {
    setState(prev => {
      const findFirstEditor = (paneId: string): string | null => {
        const pane = prev.panes[paneId]
        if (!pane) return null
        if (pane.type === 'editor') return paneId
        if (pane.type === 'split' && pane.children) {
          return findFirstEditor(pane.children[0]) || findFirstEditor(pane.children[1])
        }
        return null
      }

      const targetPaneId = findFirstEditor(prev.rootId)
      if (!targetPaneId) return prev

      const pane = prev.panes[targetPaneId]
      if (!pane || pane.type !== 'editor') return prev

      const tabs = pane.openTabs || []
      return {
        ...prev,
        panes: {
          ...prev.panes,
          [targetPaneId]: {
            ...pane,
            activeFile: fileName,
            openTabs: tabs.includes(fileName) ? tabs : [...tabs, fileName],
          }
        }
      }
    })
  }, [])

  const syncWithFiles = useCallback((fileNames: string[]) => {
    const fileSet = new Set(fileNames)
    setState(prev => {
      const newPanes: Record<string, PaneNode> = {}
      let changed = false

      for (const [id, pane] of Object.entries(prev.panes)) {
        if (pane.type === 'editor') {
          const validTabs = (pane.openTabs || []).filter(t => fileSet.has(t))
          const activeStillValid = pane.activeFile && fileSet.has(pane.activeFile)
          
          if (validTabs.length !== (pane.openTabs || []).length || !activeStillValid) {
            changed = true
            newPanes[id] = {
              ...pane,
              openTabs: validTabs,
              activeFile: activeStillValid ? pane.activeFile : (validTabs[0] || null),
            }
          } else {
            newPanes[id] = pane
          }
        } else {
          newPanes[id] = pane
        }
      }

      return changed ? { ...prev, panes: newPanes } : prev
    })
  }, [])

  return (
    <PaneManagerContext.Provider value={{
      state,
      getPane,
      updatePane,
      splitPane,
      closePane,
      closeTab,
      selectFile,
      reorderTabs,
      openFileExternal,
      syncWithFiles,
    }}>
      {children}
    </PaneManagerContext.Provider>
  )
}

export function usePaneManager() {
  const ctx = useContext(PaneManagerContext)
  if (!ctx) throw new Error('usePaneManager must be used within PaneManagerProvider')
  return ctx
}

export function usePane(id: string) {
  const { getPane } = usePaneManager()
  return getPane(id)
}
