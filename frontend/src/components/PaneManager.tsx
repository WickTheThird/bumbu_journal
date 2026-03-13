import { createContext, useContext, useCallback, useState, ReactNode } from 'react'

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
}

const PaneManagerContext = createContext<PaneManagerContextType | null>(null)

let paneIdCounter = 0
const generatePaneId = () => `pane-${++paneIdCounter}`

export function PaneManagerProvider({ 
  children, 
  initialTabs,
  initialActiveFile 
}: { 
  children: ReactNode
  initialTabs: string[]
  initialActiveFile: string | null
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

      // Original pane content goes to one child, new file to other
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

      // Convert original pane to split
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
    console.log(`[PaneManager] closePane called for:`, id)
    setState(prev => {
      // Find parent of this pane
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
        console.log(`[PaneManager] No parent found for ${id}, cannot close root`)
        return prev // Can't close root pane
      }

      const parent = prev.panes[parentId]
      if (parent.type !== 'split' || !parent.children) return prev

      // Get surviving sibling
      const siblingId = parent.children[childIndex === 0 ? 1 : 0]
      const sibling = prev.panes[siblingId]

      console.log(`[PaneManager] Collapsing ${parentId}, keeping sibling ${siblingId}`)

      // Replace parent with sibling's content
      const newPanes = { ...prev.panes }
      
      // Delete the closed pane and the sibling (sibling's content moves to parent)
      delete newPanes[id]
      delete newPanes[siblingId]

      // Parent takes on sibling's role
      newPanes[parentId] = {
        ...sibling,
        id: parentId, // Keep parent's ID
      }

      // If sibling was a split, update its children to point to new parent
      if (sibling.type === 'split' && sibling.children) {
        // Children already exist in newPanes, no need to update their references
      }

      return { ...prev, panes: newPanes }
    })
  }, [])

  const closeTab = useCallback((paneId: string, fileName: string) => {
    console.log(`[PaneManager] closeTab called: pane=${paneId}, file=${fileName}`)
    setState(prev => {
      const pane = prev.panes[paneId]
      if (!pane || pane.type !== 'editor') return prev

      const newTabs = (pane.openTabs || []).filter(t => t !== fileName)
      
      // If no tabs left and not root, close the pane
      if (newTabs.length === 0 && paneId !== prev.rootId) {
        console.log(`[PaneManager] No tabs left in ${paneId}, scheduling close`)
        // Use setTimeout to avoid state update during setState
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
        // File not in tabs, insert it
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

  // Open file from external source (file explorer) - finds first editor pane
  const openFileExternal = useCallback((fileName: string) => {
    setState(prev => {
      // Find first editor pane (depth-first search)
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
