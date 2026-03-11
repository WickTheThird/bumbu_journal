import { z } from 'zod'

export const FileSchema = z.object({
  name: z.string().min(1).max(255),
  content: z.string().max(1_000_000), // 1MB max per file
  language: z.string().optional(),
})

export const WorkspaceSchema = z.object({
  version: z.literal(1),
  files: z.array(FileSchema).max(50), // Max 50 files
  activeFile: z.string().optional(),
  settings: z.object({
    theme: z.enum(['dark', 'light']).default('dark'),
    fontSize: z.number().min(10).max(24).default(14),
    tabSize: z.number().min(2).max(8).default(2),
    wordWrap: z.boolean().default(true),
  }).optional(),
})

export type File = z.infer<typeof FileSchema>
export type Workspace = z.infer<typeof WorkspaceSchema>

export const DEFAULT_WORKSPACE: Workspace = {
  version: 1,
  files: [
    {
      name: 'main.py',
      content: `# Welcome to HashIDE!
# Your entire workspace lives in the URL hash.
# Edit, run, and share — all in one link.

def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to HashIDE."

if __name__ == "__main__":
    print(greet("World"))
`,
      language: 'python',
    },
  ],
  activeFile: 'main.py',
  settings: {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
  },
}
