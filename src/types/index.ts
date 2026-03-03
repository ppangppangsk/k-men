export interface Organization {
  id: number;
  name: string;
  email: string;
  role: 'org' | 'admin';
  approved: boolean;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  type: 'news' | 'event';
  org_id: number;
  org_name?: string;
  event_date?: string;
  image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  organization: Pick<Organization, 'id' | 'name' | 'email' | 'role'>;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  details: string[];
}

export interface Member {
  name: string;
  url?: string;
}

export interface Media {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  category: 'photo' | 'video' | 'document';
  title: string;
  description?: string;
  url: string;
  created_at: string;
}

export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}
