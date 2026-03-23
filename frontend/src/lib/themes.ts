/**
 * Editor themes for Monaco
 */

export interface EditorTheme {
  id: string
  name: string
  monaco: string // Monaco theme name
}

export const editorThemes: EditorTheme[] = [
  { id: 'vs-dark', name: 'Dark (Default)', monaco: 'vs-dark' },
  { id: 'vs-light', name: 'Light', monaco: 'vs' },
  { id: 'hc-black', name: 'High Contrast', monaco: 'hc-black' },
]

