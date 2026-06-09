export interface Profile {
  id: string;
  user_id: string;
  custom_slug: string;
  full_name: string;
  title?: string;
  company_name?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  theme_preset: 'light' | 'dark' | 'glassmorphism';
  accent_color: string;
  background_style: string;
  font_family: string;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: string;
  profile_id: string;
  link_type: 'linkedin' | 'github' | 'twitter' | 'website' | 'custom' | string;
  label: string;
  url: string;
  display_order: number;
  created_at: string;
}
