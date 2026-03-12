import { useState } from 'react'
import { FileCode, Folder, FolderOpen, ChevronRight, ChevronDown, Trash2, Pencil } from 'lucide-react'

interface FileTreeProps {
  files: { name: string; content: string }[]
  activeFile: string | null | undefined
  onSelectFile: (name: string) => void
  onDeleteFile: (name: string) => void
  onRenameFile: (oldName: string, newName: string) => void
}

interface TreeNode {
  name: string
  path: string
  isFolder: boolean
  children: TreeNode[]
}

function buildTree(files: { name: string }[]): TreeNode[] {
  const root: TreeNode[] = []
  
  for (const file of files) {
    const parts = file.name.split('/')
    let currentLevel = root
    let currentPath = ''
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isLast = i === parts.length - 1
      
      let existing = currentLevel.find(n => n.name === part)
      
      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          isFolder: !isLast,
          children: [],
        }
        currentLevel.push(existing)
      }
      
      if (!isLast) {
        currentLevel = existing.children
      }
    }
  }
  
  // Sort: folders first, then alphabetically
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .map(n => ({ ...n, children: sortNodes(n.children) }))
      .sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1
        if (!a.isFolder && b.isFolder) return 1
        return a.name.localeCompare(b.name)
      })
  }
  
  return sortNodes(root)
}

function TreeItem({ 
  node, 
  depth, 
  activeFile, 
  expandedFolders,
  onToggleFolder,
  onSelectFile, 
  onDeleteFile,
  onRenameFile,
  renamingFile,
  setRenamingFile,
  renameValue,
  setRenameValue,
}: { 
  node: TreeNode
  depth: number
  activeFile: string | null | undefined
  expandedFolders: Set<string>
  onToggleFolder: (path: string) => void
  onSelectFile: (name: string) => void
  onDeleteFile: (name: string) => void
  onRenameFile: (oldName: string, newName: string) => void
  renamingFile: string | null
  setRenamingFile: (name: string | null) => void
  renameValue: string
  setRenameValue: (value: string) => void
}) {
  const isActive = node.path === activeFile
  const isExpanded = expandedFolders.has(node.path)
  const isRenaming = renamingFile === node.path
  
  const handleRename = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      // For files in folders, keep the folder path
      const parts = node.path.split('/')
      parts[parts.length - 1] = renameValue.trim()
      onRenameFile(node.path, parts.join('/'))
    }
    setRenamingFile(null)
    setRenameValue('')
  }
  
  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRenamingFile(node.path)
    setRenameValue(node.name)
  }
  
  return (
    <>
      <div
        className={`group flex items-center gap-1 px-2 py-1 cursor-pointer transition text-sm ${
          isActive ? 'bg-ide-accent/10 text-ide-accent' : 'hover:bg-ide-border/50'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        draggable={!node.isFolder}
        onDragStart={(e) => {
          if (!node.isFolder) {
            e.dataTransfer.setData('text/plain', node.path)
            e.dataTransfer.effectAllowed = 'move'
          }
        }}
        onClick={() => node.isFolder ? onToggleFolder(node.path) : onSelectFile(node.path)}
      >
        {node.isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-ide-muted" />
            ) : (
              <ChevronRight className="w-3 h-3 text-ide-muted" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-ide-accent/70" />
            ) : (
              <Folder className="w-4 h-4 text-ide-muted" />
            )}
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileCode className={`w-4 h-4 ${isActive ? 'text-ide-accent' : 'text-ide-muted'}`} />
          </>
        )}
        
        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') { setRenamingFile(null); setRenameValue('') }
            }}
            onBlur={handleRename}
            className="flex-1 text-sm bg-ide-bg border border-ide-accent rounded px-1 outline-none ml-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1 ml-1">{node.name}</span>
        )}
        
        {!node.isFolder && !isRenaming && (
          <>
            <button 
              onClick={startRename} 
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-ide-accent transition"
              title="Rename"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteFile(node.path); }} 
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
      
      {node.isFolder && isExpanded && node.children.map(child => (
        <TreeItem
          key={child.path}
          node={child}
          depth={depth + 1}
          activeFile={activeFile}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          onSelectFile={onSelectFile}
          onDeleteFile={onDeleteFile}
          onRenameFile={onRenameFile}
          renamingFile={renamingFile}
          setRenamingFile={setRenamingFile}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
        />
      ))}
    </>
  )
}

export default function FileTree({ files, activeFile, onSelectFile, onDeleteFile, onRenameFile }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  
  const tree = buildTree(files)
  
  // Auto-expand folders containing active file
  useState(() => {
    if (activeFile && activeFile.includes('/')) {
      const parts = activeFile.split('/')
      const newExpanded = new Set(expandedFolders)
      let path = ''
      for (let i = 0; i < parts.length - 1; i++) {
        path = path ? `${path}/${parts[i]}` : parts[i]
        newExpanded.add(path)
      }
      setExpandedFolders(newExpanded)
    }
  })
  
  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }
  
  return (
    <div className="py-1">
      {tree.map(node => (
        <TreeItem
          key={node.path}
          node={node}
          depth={0}
          activeFile={activeFile}
          expandedFolders={expandedFolders}
          onToggleFolder={toggleFolder}
          onSelectFile={onSelectFile}
          onDeleteFile={onDeleteFile}
          onRenameFile={onRenameFile}
          renamingFile={renamingFile}
          setRenamingFile={setRenamingFile}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
        />
      ))}
    </div>
  )
}
