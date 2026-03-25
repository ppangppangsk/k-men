import type { Post, LoginResponse, Organization, Media, FAQ, QnA } from '../types';

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
  getPosts(type?: Post['type']) {
    const query = type ? `?type=${type}` : '';
    return request<Post[]>(`/posts${query}`);
  },

  getPost(id: number) {
    return request<Post>(`/posts/${id}`);
  },

  createPost(data: Pick<Post, 'title' | 'content' | 'type' | 'event_date' | 'image_url'> & { summary?: string; file_url?: string }) {
    return request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePost(id: number, data: Partial<Pick<Post, 'title' | 'content' | 'event_date' | 'image_url'>> & { summary?: string; file_url?: string }) {
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

  async uploadPostFile(file: File, postType?: string): Promise<{ url: string; original_name: string }> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const query = postType ? `?type=${postType}` : '';
    const res = await fetch(`${BASE}/posts/upload${query}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
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

  // Media
  media: {
    getAll(category?: 'photo' | 'video' | 'document') {
      const query = category ? `?category=${category}` : '';
      return request<Media[]>(`/media${query}`);
    },

    async upload(file: File, data: { title?: string; description?: string; category: string }) {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', data.category);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);

      const res = await fetch(`${BASE}/media`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      return res.json();
    },

    update(id: number, data: { title?: string; description?: string }) {
      return request<Media>(`/media/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete(id: number) {
      return request<{ message: string }>(`/media/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // FAQ
  faq: {
    getAll() {
      return request<FAQ[]>('/faq');
    },
    create(data: { question: string; answer: string; sort_order?: number }) {
      return request<FAQ>('/faq', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: number, data: { question: string; answer: string; sort_order?: number }) {
      return request<FAQ>(`/faq/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete(id: number) {
      return request<{ message: string }>(`/faq/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Q&A
  qna: {
    getAll() {
      return request<QnA[]>('/qna');
    },
    getOne(id: number) {
      return request<QnA>(`/qna/${id}`);
    },
    verify(id: number, password: string) {
      return request<QnA>(`/qna/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
    },
    create(data: { author_name: string; author_email?: string; title: string; content: string; password: string; is_private: boolean }) {
      return request<QnA>('/qna', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: number, data: { title: string; content: string; password: string }) {
      return request<{ message: string }>(`/qna/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete(id: number, password?: string) {
      return request<{ message: string }>(`/qna/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
    },
    answer(id: number, answer: string) {
      return request<{ message: string }>(`/qna/${id}/answer`, {
        method: 'PATCH',
        body: JSON.stringify({ answer }),
      });
    },
  },
};
