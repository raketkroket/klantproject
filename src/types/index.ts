export type Page = 'home' | 'projecten' | 'challenges' | 'nieuws' | 'contact' | 'admin-dashboard' | 'admin-login';

export interface Project {
  id: string;
  title: string;
  description: string;
  author_name: string;
  author_email: string;
  tech_stack: string[];
  github_url: string;
  demo_url: string;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  company_name: string;
  contact_email: string;
  deadline: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prize: string;
  image_url: string;
  category: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  author_id: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
  created_at: string;
}
