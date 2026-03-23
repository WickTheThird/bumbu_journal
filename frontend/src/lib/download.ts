/**
 * File download utilities for HashIDE
 */

import { Workspace } from '../types/workspace'
import JSZip from 'jszip'

/**
 * Download a single file
 */
export function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download entire workspace as ZIP
 */
export async function downloadWorkspaceAsZip(workspace: Workspace): Promise<void> {
  const zip = new JSZip()
  
  for (const file of workspace.files) {
    zip.file(file.name, file.content)
  }
  
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'hashide-workspace.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
