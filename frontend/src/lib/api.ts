/**
 * HashIDEA Cloud API client
 * Communicates with hashidea-api Worker for cloud project storage
 */

const API_BASE = 'https://hashidea-api.bumbufilip22.workers.dev'

interface ProjectMeta {
  id: string
  title: string
  description: string | null
  is_public: number
  view_count: number
  remix_from: string | null
  created_at: string
  updated_at: string
  owner: { username: string; avatar_url: string } | null
}

export interface CloudProject extends ProjectMeta {
  workspace: import('../types/workspace').Workspace
}

export interface ProjectListItem {
  id: string
  title: string
  description: string | null
  is_public: number
  view_count: number
  created_at: string
  updated_at: string
}

export interface UserInfo {
  id: string
  github_id: number
  username: string
  avatar_url: string
  project_count: number
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('github_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export class ApiError extends Error {
  public code: string
  public feature?: string
  constructor(message: string, public status: number, code?: string, feature?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code || 'error'
    this.feature = feature
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  const data = await res.json() as any

  if (!res.ok) {
    throw new ApiError(
      data.message || data.error || 'Request failed',
      res.status,
      data.error,          // 'plan_limit' or other error code
      data.feature,        // 'private_projects' etc.
    )
  }

  return data as T
}

// ── Projects ────────────────────────────────────────

export async function saveProject(opts: {
  workspace: import('../types/workspace').Workspace
  title?: string
  description?: string
  is_public?: boolean
  remix_from?: string
}): Promise<{ id: string; url: string }> {
  return request('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      workspace: opts.workspace,
      title: opts.title || 'Untitled',
      description: opts.description,
      is_public: opts.is_public !== false,
      remix_from: opts.remix_from,
    }),
  })
}

export async function getProject(id: string): Promise<CloudProject> {
  return request(`/api/projects/${id}`)
}

export async function updateProject(id: string, opts: {
  workspace?: import('../types/workspace').Workspace
  title?: string
  description?: string
  is_public?: boolean
}): Promise<{ ok: boolean }> {
  return request(`/api/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(opts),
  })
}

export async function deleteProject(id: string): Promise<{ ok: boolean }> {
  return request(`/api/projects/${id}`, {
    method: 'DELETE',
  })
}

// ── Users ───────────────────────────────────────────

export async function getMe(): Promise<UserInfo> {
  return request('/api/me')
}

export async function getMyProjects(): Promise<{ projects: ProjectListItem[] }> {
  return request('/api/me/projects')
}

export async function getUserProjects(userId: string): Promise<{ projects: ProjectListItem[] }> {
  return request(`/api/users/${userId}/projects`)
}

// ── Billing ────────────────────────────────────────

export interface BillingStatus {
  plan: 'free' | 'starter' | 'pro' | 'team'
  status: 'active' | 'canceled' | 'past_due' | 'none'
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export async function getBillingStatus(): Promise<BillingStatus> {
  return request('/api/billing/status')
}

export async function createCheckout(priceId: string): Promise<{ url: string }> {
  return request('/api/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ price_id: priceId }),
  })
}

export async function createPortalSession(): Promise<{ url: string }> {
  return request('/api/billing/portal', {
    method: 'POST',
  })
}
