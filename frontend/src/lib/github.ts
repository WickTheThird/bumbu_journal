/**
 * GitHub API integration
 * Phase 1: Read-only public repo import (via ZIP download - no rate limits)
 * Phase 2: Device flow auth + fork/PR
 */

import JSZip from 'jszip'

const GITHUB_API = 'https://api.github.com'
const GITHUB_CLIENT_ID = 'Ov23liFlSKXnYuNkre0F'
const OAUTH_PROXY = 'https://hashide-oauth.bumbufilip22.workers.dev'

export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  content?: string
}

export interface GitHubRepo {
  owner: string
  repo: string
  branch: string
}

/**
 * Parse GitHub URL to extract owner/repo
 */
export function parseGitHubUrl(url: string): GitHubRepo | null {
  // Handle various formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo/tree/branch
  // github.com/owner/repo
  // owner/repo
  
  const cleaned = url.trim().replace(/\/$/, '')
  
  // Try full URL
  const urlMatch = cleaned.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/)
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].replace(/\.git$/, ''),
      branch: urlMatch[3] || 'main',
    }
  }
  
  // Try owner/repo format
  const shortMatch = cleaned.match(/^([^\/]+)\/([^\/]+)$/)
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2],
      branch: 'main',
    }
  }
  
  return null
}

/**
 * Get auth headers (if token exists)
 */
function getHeaders(): HeadersInit {
  const token = localStorage.getItem('github_token')
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Fetch repository file tree (recursive)
 */
export async function fetchRepoTree(repo: GitHubRepo): Promise<GitHubFile[]> {
  const url = `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/git/trees/${repo.branch}?recursive=1`
  
  const response = await fetch(url, { headers: getHeaders() })
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository not found: ${repo.owner}/${repo.repo}`)
    }
    if (response.status === 403) {
      throw new Error('Rate limited. Try again later or login with GitHub.')
    }
    throw new Error(`GitHub API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  return data.tree
    .filter((item: { type: string }) => item.type === 'blob')
    .map((item: { path: string; type: string }) => ({
      name: item.path.split('/').pop(),
      path: item.path,
      type: 'file' as const,
    }))
}

/**
 * Fetch file content
 */
export async function fetchFileContent(repo: GitHubRepo, path: string): Promise<string> {
  const url = `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/contents/${path}?ref=${repo.branch}`
  
  const response = await fetch(url, { headers: getHeaders() })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`)
  }
  
  const data = await response.json()
  
  // Content is base64 encoded
  return atob(data.content.replace(/\n/g, ''))
}

/**
 * Import entire repository via ZIP download (no API rate limits!)
 * Downloads the repo as a ZIP file and extracts in browser
 */
export async function importRepo(repo: GitHubRepo, maxFiles = 100): Promise<{ name: string; content: string }[]> {
  // Download repo as ZIP - this bypasses API rate limits
  const zipUrl = `https://codeload.github.com/${repo.owner}/${repo.repo}/zip/refs/heads/${repo.branch}`
  
  const response = await fetch(zipUrl)
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository not found: ${repo.owner}/${repo.repo}`)
    }
    throw new Error(`Failed to download repository: ${response.status}`)
  }
  
  const zipData = await response.arrayBuffer()
  const zip = await JSZip.loadAsync(zipData)
  
  // Filter to text-based code files (exclude binaries)
  const codeExtensions = [
    // Web
    '.html', '.htm', '.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
    // Config
    '.json', '.yml', '.yaml', '.toml', '.xml', '.env', '.ini', '.cfg',
    // Docs
    '.md', '.mdx', '.txt', '.rst',
    // Python
    '.py', '.pyi', '.pyw',
    // Other languages
    '.rb', '.php', '.go', '.rs', '.c', '.cpp', '.h', '.hpp', '.java', '.kt', '.swift', '.sh', '.bash', '.zsh',
    // Data
    '.sql', '.graphql', '.prisma',
    // Special
    '.gitignore', '.dockerignore', '.editorconfig', 'Makefile', 'Dockerfile', '.eslintrc', '.prettierrc',
  ]
  
  const specialFiles = ['Makefile', 'Dockerfile', 'Procfile', 'Gemfile', 'Rakefile', '.gitignore', '.env']
  
  const files: { name: string; content: string }[] = []
  
  // ZIP has a root folder like "repo-branch/" - we need to strip it
  const zipFiles = Object.keys(zip.files)
  const rootFolder = zipFiles[0]?.split('/')[0] + '/'
  
  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue
    if (files.length >= maxFiles) break
    
    // Strip root folder from path
    const relativePath = path.replace(rootFolder, '')
    if (!relativePath) continue
    
    const fileName = relativePath.split('/').pop() || ''
    const isCodeFile = codeExtensions.some(ext => relativePath.endsWith(ext)) || specialFiles.includes(fileName)
    
    if (!isCodeFile) continue
    
    try {
      const content = await file.async('string')
      // Skip binary/corrupted files (they'll have weird characters)
      if (content.includes('\0')) continue
      files.push({ name: relativePath, content })
    } catch {
      // Skip files that can't be read as text
    }
  }
  
  return files
}

// ============================================
// Phase 2: GitHub Device Flow Authentication
// ============================================

interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

interface TokenResponse {
  access_token?: string
  token_type?: string
  scope?: string
  error?: string
}

/**
 * Start device flow - get user code (via CORS proxy)
 */
export async function startDeviceFlow(): Promise<DeviceCodeResponse> {
  const response = await fetch(`${OAUTH_PROXY}/device/code`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: 'public_repo',
    }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to start device flow')
  }
  
  return response.json()
}

/**
 * Poll for access token (via CORS proxy)
 */
export async function pollForToken(deviceCode: string, interval: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await fetch(`${OAUTH_PROXY}/oauth/access_token`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        })
        
        const data: TokenResponse = await response.json()
        
        if (data.access_token) {
          localStorage.setItem('github_token', data.access_token)
          resolve(data.access_token)
        } else if (data.error === 'authorization_pending') {
          setTimeout(poll, interval * 1000)
        } else if (data.error === 'slow_down') {
          setTimeout(poll, (interval + 5) * 1000)
        } else {
          reject(new Error(data.error || 'Authentication failed'))
        }
      } catch (e) {
        reject(e)
      }
    }
    
    poll()
  })
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('github_token')
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<{ login: string; avatar_url: string } | null> {
  const token = localStorage.getItem('github_token')
  if (!token) return null
  
  try {
    const response = await fetch(`${GITHUB_API}/user`, { headers: getHeaders() })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

/**
 * Logout
 */
export function logout(): void {
  localStorage.removeItem('github_token')
}

// ============================================
// Phase 2: Fork and PR
// ============================================

/**
 * Fork a repository
 */
export async function forkRepo(owner: string, repoName: string): Promise<{ owner: string; repo: string }> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repoName}/forks`, {
    method: 'POST',
    headers: getHeaders(),
  })
  
  if (!response.ok) {
    throw new Error('Failed to fork repository')
  }
  
  const data = await response.json()
  return { owner: data.owner.login, repo: data.name }
}

/**
 * Create or update a file in a repo
 */
export async function createOrUpdateFile(
  repo: GitHubRepo,
  path: string,
  content: string,
  message: string,
  branch: string
): Promise<void> {
  // First, try to get existing file SHA
  let sha: string | undefined
  try {
    const existing = await fetch(
      `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/contents/${path}?ref=${branch}`,
      { headers: getHeaders() }
    )
    if (existing.ok) {
      const data = await existing.json()
      sha = data.sha
    }
  } catch {
    // File doesn't exist, that's fine
  }
  
  const response = await fetch(
    `${GITHUB_API}/repos/${repo.owner}/${repo.repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        message,
        content: btoa(content),
        branch,
        sha,
      }),
    }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to update ${path}`)
  }
}

/**
 * Create a new branch
 */
export async function createBranch(owner: string, repoName: string, newBranch: string, fromBranch: string = 'main'): Promise<void> {
  // Get SHA of source branch
  const refResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/git/ref/heads/${fromBranch}`,
    { headers: getHeaders() }
  )
  
  if (!refResponse.ok) {
    throw new Error('Failed to get branch reference')
  }
  
  const refData = await refResponse.json()
  const sha = refData.object.sha
  
  // Create new branch
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/git/refs`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ref: `refs/heads/${newBranch}`,
        sha,
      }),
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to create branch')
  }
}

/**
 * Push multiple files to a branch
 */
export async function pushFiles(
  owner: string,
  repoName: string,
  branch: string,
  files: { path: string; content: string }[],
  message: string
): Promise<void> {
  const repo: GitHubRepo = { owner, repo: repoName, branch }
  
  for (const file of files) {
    await createOrUpdateFile(repo, file.path, file.content, message, branch)
  }
}

/**
 * Create a pull request
 */
export async function createPullRequest(
  originalOwner: string,
  originalRepoName: string,
  head: string,
  base: string,
  title: string,
  body: string
): Promise<{ html_url: string }> {
  const response = await fetch(
    `${GITHUB_API}/repos/${originalOwner}/${originalRepoName}/pulls`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create PR')
  }
  
  const data = await response.json()
  return { html_url: data.html_url }
}
