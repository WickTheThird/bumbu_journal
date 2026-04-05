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
  plan: 'free' | 'starter' | 'pro' | 'team'
  project_count: number
  limits: { cloud_projects: number; private_projects: number; custom_domains: number }
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

// ── Gallery ────────────────────────────────────────

export interface GalleryProject {
  id: string
  title: string
  description: string | null
  view_count: number
  fork_count: number
  like_count: number
  tags: string
  created_at: string
  updated_at: string
  owner: { username: string; avatar_url: string } | null
}

export interface GalleryResponse {
  projects: GalleryProject[]
  total: number
  page: number
  pages: number
}

export async function getGallery(opts: {
  sort?: 'trending' | 'latest' | 'most_viewed' | 'most_forked'
  q?: string
  tag?: string
  page?: number
  limit?: number
} = {}): Promise<GalleryResponse> {
  const params = new URLSearchParams()
  if (opts.sort) params.set('sort', opts.sort)
  if (opts.q) params.set('q', opts.q)
  if (opts.tag) params.set('tag', opts.tag)
  if (opts.page) params.set('page', String(opts.page))
  if (opts.limit) params.set('limit', String(opts.limit))
  const qs = params.toString()
  return request(`/api/gallery${qs ? `?${qs}` : ''}`)
}

// ── Likes ──────────────────────────────────────────

export async function likeProject(id: string): Promise<{ liked: boolean; like_count: number }> {
  return request(`/api/projects/${id}/like`, { method: 'POST' })
}

export async function unlikeProject(id: string): Promise<{ liked: boolean; like_count: number }> {
  return request(`/api/projects/${id}/like`, { method: 'DELETE' })
}

// ── Bookmarks ──────────────────────────────────────

export async function bookmarkProject(id: string): Promise<{ bookmarked: boolean }> {
  return request(`/api/projects/${id}/bookmark`, { method: 'POST' })
}

export async function unbookmarkProject(id: string): Promise<{ bookmarked: boolean }> {
  return request(`/api/projects/${id}/bookmark`, { method: 'DELETE' })
}

export async function getMyBookmarks(opts: { page?: number; limit?: number } = {}): Promise<GalleryResponse> {
  const params = new URLSearchParams()
  if (opts.page) params.set('page', String(opts.page))
  if (opts.limit) params.set('limit', String(opts.limit))
  const qs = params.toString()
  return request(`/api/me/bookmarks${qs ? `?${qs}` : ''}`)
}

// ── Follows ────────────────────────────────────────

export interface UserProfile {
  username: string
  avatar_url: string
  bio: string
  website: string
  created_at: string
  project_count: number
  total_views: number
  follower_count: number
  following_count: number
  is_following: boolean
}

export async function getUserProfile(username: string): Promise<UserProfile> {
  return request(`/api/users/${username}`)
}

export async function followUser(username: string): Promise<{ following: boolean }> {
  return request(`/api/users/${username}/follow`, { method: 'POST' })
}

export async function unfollowUser(username: string): Promise<{ following: boolean }> {
  return request(`/api/users/${username}/follow`, { method: 'DELETE' })
}

export async function updateMyProfile(data: { bio?: string; website?: string }): Promise<{ ok: boolean }> {
  return request('/api/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function getMyFeed(opts: { page?: number; limit?: number } = {}): Promise<GalleryResponse> {
  const params = new URLSearchParams()
  if (opts.page) params.set('page', String(opts.page))
  if (opts.limit) params.set('limit', String(opts.limit))
  const qs = params.toString()
  return request(`/api/me/feed${qs ? `?${qs}` : ''}`)
}

// ── Custom Domains ─────────────────────────────────

export interface DomainInfo {
  id: string
  domain: string
  verified: boolean
  cname_target: string
  created_at: string
}

export interface DomainAddResult {
  id: string
  domain: string
  project_id: string
  verified: boolean
  cname_target: string
  instructions: string
}

export async function addDomain(projectId: string, domain: string): Promise<DomainAddResult> {
  return request(`/api/projects/${projectId}/domain`, {
    method: 'POST',
    body: JSON.stringify({ domain }),
  })
}

export async function removeDomain(projectId: string): Promise<{ ok: boolean }> {
  return request(`/api/projects/${projectId}/domain`, { method: 'DELETE' })
}

export async function getDomain(projectId: string): Promise<{ domain: DomainInfo | null }> {
  return request(`/api/projects/${projectId}/domain`)
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
