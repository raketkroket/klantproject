export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: Partial<ProjectInsert>;
      };
      challenges: {
        Row: Challenge;
        Insert: ChallengeInsert;
        Update: Partial<ChallengeInsert>;
      };
      news: {
        Row: NewsPost;
        Insert: NewsInsert;
        Update: Partial<NewsInsert>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at'>;
        Update: Partial<Omit<Company, 'id' | 'created_at'>>;
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Omit<ContactMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ContactMessage, 'id' | 'created_at'>>;
      };
    };
  };
}

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

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'status'>;

export interface Challenge {
  id: string;
  title: string;
  description: string;
  company_name: string;
  contact_email: string;
  deadline: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prize: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export type ChallengeInsert = Omit<Challenge, 'id' | 'created_at' | 'status'>;

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  author_id: string | null;
  created_at: string;
}

export type NewsInsert = Omit<NewsPost, 'id' | 'created_at' | 'author_id'>;

export interface Company {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}
