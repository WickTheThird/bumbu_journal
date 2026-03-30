import { z } from 'zod'

export const FileSchema = z.object({
  name: z.string().min(1).max(255),
  content: z.string().max(1_000_000), // 1MB max per file
  language: z.string().optional(),
})

// Remix metadata for tracking project lineage
export const RemixSchema = z.object({
  from: z.string().optional(),       // Original hash (first 8 chars)
  author: z.string().optional(),     // GitHub username if logged in
  created: z.number().optional(),    // Timestamp when remixed
  title: z.string().optional(),      // Project title
})

// Version 1 schema (legacy, for backwards compatibility)
export const WorkspaceSchemaV1 = z.object({
  version: z.literal(1),
  files: z.array(FileSchema).max(50),
  activeFile: z.string().optional(),
  settings: z.object({
    theme: z.enum(['dark', 'light']).default('dark'),
    fontSize: z.number().min(10).max(24).default(14),
    tabSize: z.number().min(2).max(8).default(2),
    wordWrap: z.boolean().default(true),
    minimap: z.boolean().default(true),
    lineNumbers: z.boolean().default(true),
  }).optional(),
})

// Version 2 schema (current, with remix support)
export const WorkspaceSchemaV2 = z.object({
  version: z.literal(2),
  files: z.array(FileSchema).max(50),
  activeFile: z.string().optional(),
  settings: z.object({
    theme: z.enum(['dark', 'light']).default('dark'),
    fontSize: z.number().min(10).max(24).default(14),
    tabSize: z.number().min(2).max(8).default(2),
    wordWrap: z.boolean().default(true),
    minimap: z.boolean().default(true),
    lineNumbers: z.boolean().default(true),
  }).optional(),
  remix: RemixSchema.optional(),
})

// Union schema that accepts both versions
export const WorkspaceSchema = z.union([WorkspaceSchemaV1, WorkspaceSchemaV2])

export type File = z.infer<typeof FileSchema>
export type Remix = z.infer<typeof RemixSchema>
export type Workspace = z.infer<typeof WorkspaceSchemaV2> // Always use v2 internally

export const DEFAULT_WORKSPACE: Workspace = {
  version: 2,
  files: [
    {
      name: 'main.py',
      content: `# Welcome to HashIDEA!
# Your entire workspace lives in the URL hash.
# Edit, run, and share - all in one link.

def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to HashIDEA."

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
    minimap: true,
    lineNumbers: true,
  },
}

// Migrate v1 workspace to v2
export function migrateWorkspace(workspace: z.infer<typeof WorkspaceSchema>): Workspace {
  if (workspace.version === 2) {
    return workspace as Workspace
  }
  // Migrate v1 to v2
  return {
    ...workspace,
    version: 2,
    remix: undefined,
  }
}
