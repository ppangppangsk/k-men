import type { Post, LoginResponse, Organization } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register(name: string, email: string, password: string) {
    return request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login(email: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Posts
  getPosts(type?: 'news' | 'event') {
    const query = type ? `?type=${type}` : '';
    return request<Post[]>(`/posts${query}`);
  },

  getPost(id: number) {
    return request<Post>(`/posts/${id}`);
  },

  createPost(data: Pick<Post, 'title' | 'content' | 'type' | 'event_date' | 'image_url'>) {
    return request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePost(id: number, data: Partial<Pick<Post, 'title' | 'content' | 'event_date' | 'image_url'>>) {
    return request<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePost(id: number) {
    return request<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    });
  },

  getMyPosts() {
    return request<Post[]>('/posts/my');
  },

  // Admin
  admin: {
    getOrganizations() {
      return request<Organization[]>('/admin/organizations');
    },

    approveOrg(id: number) {
      return request<{ message: string }>(`/admin/organizations/${id}/approve`, {
        method: 'PATCH',
      });
    },

    revokeOrg(id: number) {
      return request<{ message: string }>(`/admin/organizations/${id}/revoke`, {
        method: 'PATCH',
      });
    },

    deleteOrg(id: number) {
      return request<{ message: string }>(`/admin/organizations/${id}`, {
        method: 'DELETE',
      });
    },

    getPosts() {
      return request<Post[]>('/admin/posts');
    },

    deletePost(id: number) {
      return request<{ message: string }>(`/admin/posts/${id}`, {
        method: 'DELETE',
      });
    },
  },
};
